import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getFirestore,
  collection,
  onSnapshot,
  doc,
  updateDoc
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
const supabaseUrl = "https://YOUR_SUPABASE_URL.supabase.co"; // <-- replace
const supabaseKey = "sb_publishable_qXmKdTRLInQdw5sX1TF-yg_oV_Tcjpo";
const supabase = createClient(supabaseUrl, supabaseKey);

/* ---------- DOM ---------- */
const assignmentsList = document.getElementById("assignments-list");
const logoutBtn = document.getElementById("logout-btn");
const chatBtn = document.getElementById("chat-btn");

/* ---------- Logout ---------- */
if (logoutBtn) {
  logoutBtn.onclick = async () => {
    try {
      await signOut(auth);
      window.location.href = "index.html";
    } catch (err) {
      console.error("Logout failed:", err);
    }
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

    container.innerHTML = `
      <div class="assignment-row">
    
        <div class="assignment-title">
          Assignment Name: <strong>${assignment.title}</strong>
        </div>
        
        <div class="assignment-id">
          ID: ${assignment.ID || "—"}
        </div>

        <div class="assignment-status">
          Status: <strong>${assignment.status}</strong>
        </div>

        <div class="assignment-deadline">
          Deadline: ${
            assignment.deadline
              ? assignment.deadline.toDate().toLocaleDateString()
              : "N/A"
          }
        </div>

        <div class="buttons-row">
          <button class="accept-btn">Accept</button>
          <button class="reject-btn">Reject</button>
          <input type="file" class="upload-input" accept=".pdf,.txt">
        </div>

      </div>

      <div class="upload-status"></div>
    `;

    /* ---------- Status coloring ---------- */
    const statusEl = container.querySelector(".assignment-status strong");
    if (assignment.status === "Accepted") {
      statusEl.classList.add("status-accepted");
    } else if (assignment.status === "Rejected") {
      statusEl.classList.add("status-rejected");
    }

    /* ---------- Accept / Reject ---------- */
    container.querySelector(".accept-btn").onclick = async () => {
      await updateDoc(doc(db, "assignments", assignmentId), {
        status: "Accepted",
      });
    };

    container.querySelector(".reject-btn").onclick = async () => {
      await updateDoc(doc(db, "assignments", assignmentId), {
        status: "Rejected",
      });
    };

    /* ---------- Upload ---------- */
    container.querySelector(".upload-input").onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const statusDiv = container.querySelector(".upload-status");

      const { error } = await supabase.storage
        .from("uploads")
        .upload(`${assignmentId}/${file.name}`, file, { upsert: true });

      if (error) {
        statusDiv.textContent = "Upload failed: " + error.message;
        return;
      }

      const { publicUrl } = supabase.storage
        .from("uploads")
        .getPublicUrl(`${assignmentId}/${file.name}`);

      await updateDoc(doc(db, "assignments", assignmentId), {
        fileUrl: publicUrl,
      });

      statusDiv.textContent = "File uploaded successfully!";
    };

    assignmentsList.appendChild(container);
  });
});
