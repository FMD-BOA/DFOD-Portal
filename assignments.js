import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getFirestore,
  collection,
  onSnapshot,
  doc,
  updateDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";
import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

/* ---------- Firebase Setup ---------- */
const firebaseConfig = {
  apiKey: "AIzaSyA4rFUf7-avxLsSuarrh1fZn8Pd91Q2oic",
  authDomain: "fmd-dfod-portal-ca1da.firebaseapp.com",
  projectId: "fmd-dfod-portal-ca1da",
  storageBucket: "fmd-dfod-portal-ca1da.firebasestorage.app",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

/* ---------- Supabase Setup ---------- */
const supabaseUrl = "https://liftipqbdbtmkymdfnxi.supabase.co";
const supabaseKey = "sb_publishable_qXmKdTRLInQdw5sX1TF-yg_oV_Tcjpo";
const supabase = createClient(supabaseUrl, supabaseKey);

/* ---------- DOM ---------- */
const assignmentsList = document.getElementById("assignments-list");
const logoutBtn = document.getElementById("logout-btn");
const chatBtn = document.getElementById("chat-btn");

/* ---------- Logout ---------- */
if (logoutBtn) {
  logoutBtn.onclick = async () => {
    await signOut(auth);
    window.location.href = "index.html";
  };
}

/* ---------- Chat Navigation ---------- */
if (chatBtn) {
  chatBtn.onclick = () => {
    window.location.href = "chat.html";
  };
}

/* ---------- Live Assignments ---------- */
const assignmentsCol = collection(db, "assignments");

onSnapshot(assignmentsCol, (snapshot) => {
  assignmentsList.innerHTML = "";

  snapshot.forEach((docSnap) => {
    const assignment = docSnap.data();
    const assignmentId = docSnap.id;

    const container = document.createElement("div");
    container.className = "assignment";

    const acceptedDateHtml = assignment["acceptance-date"]
      ? `<div class="acceptance-date">
           ACCEPTED: ${assignment["acceptance-date"]
             .toDate()
             .toLocaleDateString("en-GB", {
               day: "2-digit",
               month: "short",
               year: "numeric",
             })
             .toUpperCase()}
         </div>`
      : assignment.status === "Rejected"
      ? `<div class="rejected-date">REJECTED</div>`
      : "";

    const deadlineHtml = assignment.deadline
      ? assignment.deadline
          .toDate()
          .toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })
          .toUpperCase()
      : "N/A";

    const fileLinkHtml = assignment.fileUrl
      ? `<div class="file-link">
           <a href="${assignment.fileUrl}" target="_blank">View uploaded file</a>
         </div>`
      : "";

    container.innerHTML = `
      <div class="assignment-row">

        <div class="assignment-title">${assignment.title}</div>

        <div class="assignment-id">ID: ${assignment.ID || "—"}</div>

        <div class="assignment-status">
          Status: <strong>${assignment.status || "Pending"}</strong>
        </div>

        <div class="assignment-dates">
          ${acceptedDateHtml}
          <div class="assignment-deadline">DEADLINE: ${deadlineHtml}</div>
        </div>

        <div class="buttons-row">
          <div class="decision-buttons">
            <button class="accept-btn">Accept</button>
            <button class="reject-btn">Reject</button>
          </div>

          <div class="upload-area">
            <label class="upload-btn">
              Upload Results
              <input type="file" class="upload-input" accept=".pdf,.txt" hidden>
            </label>
          </div>
        </div>
      </div>

      <div class="upload-status"></div>
      ${fileLinkHtml}
    `;

    /* ---------- Elements ---------- */
    const acceptBtn = container.querySelector(".accept-btn");
    const rejectBtn = container.querySelector(".reject-btn");
    const uploadInput = container.querySelector(".upload-input");
    const statusEl = container.querySelector(".assignment-status strong");
    const statusDiv = container.querySelector(".upload-status");

    /* ---------- Status colouring ---------- */
    if (assignment.status === "Accepted") statusEl.classList.add("status-accepted");
    if (assignment.status === "Rejected") statusEl.classList.add("status-rejected");

    /* ---------- Decision locking ---------- */
    if (assignment.status === "Accepted" || assignment.status === "Rejected") {
      acceptBtn.disabled = true;
      rejectBtn.disabled = true;
    }

    /* ---------- Upload lock ---------- */
    const deadlinePassed =
      assignment.deadline && new Date() > assignment.deadline.toDate();

    if (assignment.status === "Accepted" && !deadlinePassed && !assignment.fileUrl) {
      uploadInput.disabled = false;
    } else {
      uploadInput.disabled = true;
      uploadInput.classList.add("upload-disabled");
    }

    /* ---------- Accept ---------- */
    acceptBtn.onclick = async () => {
      if (assignment.status) return;

      await updateDoc(doc(db, "assignments", assignmentId), {
        status: "Accepted",
        "acceptance-date": serverTimestamp(),
      });
    };

    /* ---------- Reject ---------- */
    rejectBtn.onclick = async () => {
      if (assignment.status) return;

      await updateDoc(doc(db, "assignments", assignmentId), {
        status: "Rejected",
      });
    };

    /* ---------- Upload ---------- */
    uploadInput.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      if (deadlinePassed) {
        statusDiv.textContent = "Deadline passed. Upload disabled.";
        return;
      }

      statusDiv.textContent = "Uploading…";

      const safeName = `${Date.now()}_${file.name}`;
      const path = `${assignmentId}/${safeName}`;

      const { error } = await supabase.storage
        .from("uploads")
        .upload(path, file);

      if (error) {
        statusDiv.textContent = "Upload failed: " + error.message;
        return;
      }

      const { publicUrl } = supabase.storage
        .from("uploads")
        .getPublicUrl(path);

      await updateDoc(doc(db, "assignments", assignmentId), {
        fileUrl: publicUrl,
        uploadComplete: true,
      });

      statusDiv.textContent = "File uploaded successfully.";
      uploadInput.disabled = true;
    };

    assignmentsList.appendChild(container);
  });
});
