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

/* ---------- Firebase ---------- */
const firebaseConfig = {
  apiKey: "AIzaSyA4rFUf7-avxLsSuarrh1fZn8Pd91Q2oic",
  authDomain: "fmd-dfod-portal-ca1da.firebaseapp.com",
  projectId: "fmd-dfod-portal-ca1da",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

/* ---------- Supabase ---------- */
const supabase = createClient(
  "https://liftipqbdbtmkymdfnxi.supabase.co",
  "sb_publishable_qXmKdTRLInQdw5sX1TF-yg_oV_Tcjpo"
);

const logoutBtn = document.getElementById("logout-btn");
const chatBtn = document.getElementById("chat-btn");

if (logoutBtn) {
  logoutBtn.onclick = async () => {
    await signOut(auth);
    window.location.href = "index.html";
  };
}

if (chatBtn) {
  chatBtn.onclick = () => {
    window.location.href = "chat.html";
  };
}

/* ---------- DOM ---------- */
const assignmentsList = document.getElementById("assignments-list");

/* ---------- Live Assignments ---------- */
onSnapshot(collection(db, "assignments"), (snapshot) => {
  assignmentsList.innerHTML = "";

  /* ---------- TABLE ---------- */
  const table = document.createElement("table");
  table.className = "assignments-table";

  table.innerHTML = `
    <thead>
      <tr>
        <th>Title</th>
        <th>ID</th>
        <th>Type</th>
        <th>Department</th>
        <th>Status</th>
        <th>Dates</th>
        <th>File</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody></tbody>
  `;

  const tbody = table.querySelector("tbody");

  snapshot.forEach((docSnap) => {
    const a = docSnap.data();
    const id = docSnap.id;

    const acceptedDate = a["acceptance-date"]
      ? a["acceptance-date"].toDate().toLocaleDateString("en-GB").toUpperCase()
      : "";

    const deadlineDate = a.deadline
      ? a.deadline.toDate().toLocaleDateString("en-GB").toUpperCase()
      : "N/A";

    const row = document.createElement("tr");

    row.innerHTML = `
      <td class="title"><strong>${a.title}</strong></td>

      <td>${a.ID || "—"}</td>
      
      <td>${a.type || "—"}</td>
      
      <td>${a.department || "—"}</td>
      
      <td class="status ${a.status === "Accepted" ? "status-accepted" : a.status === "Rejected" ? "status-rejected" : ""}">
        ${a.status || "Pending"}
      </td>

      <td class="dates">
        ${acceptedDate ? `ACCEPTED: ${acceptedDate}<br>` : ""}
        DEADLINE: ${deadlineDate}
      </td>

      <td class="file-status ${a.fileUrl ? "uploaded" : ""}">
        ${a.fileUrl ? "File uploaded" : "No file uploaded"}
      </td>

      <td class="actions">
        <button class="accept-btn">Accept</button>
        <button class="reject-btn">Reject</button>
        <label class="upload-btn">
          Upload
          <input type="file" class="upload-input" accept=".pdf,.txt">
        </label>
      </td>
    `;

    /* ---------- Elements ---------- */
    const acceptBtn = row.querySelector(".accept-btn");
    const rejectBtn = row.querySelector(".reject-btn");
    const uploadInput = row.querySelector(".upload-input");
    const uploadLabel = row.querySelector(".upload-btn");
    const fileStatus = row.querySelector(".file-status");

    /* ---------- Lock decisions ---------- */
    if (a.status) {
      acceptBtn.disabled = true;
      rejectBtn.disabled = true;
    }

    /* ---------- Upload lock ---------- */
    if (a.status === "Accepted") {
      uploadInput.disabled = false;
      uploadLabel.classList.remove("upload-disabled");
    } else {
      uploadInput.disabled = true;
      uploadLabel.classList.add("upload-disabled");
    }

    /* ---------- Accept ---------- */
    acceptBtn.onclick = async () => {
      if (a.status) return;
      await updateDoc(doc(db, "assignments", id), {
        status: "Accepted",
        "acceptance-date": serverTimestamp(),
      });
    };

    /* ---------- Reject ---------- */
    rejectBtn.onclick = async () => {
      if (a.status) return;
      await updateDoc(doc(db, "assignments", id), {
        status: "Rejected",
      });
    };

    /* ---------- Upload ---------- */
    uploadInput.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      fileStatus.textContent = "Uploading…";

      const { error } = await supabase.storage
        .from("uploads")
        .upload(`${id}/${file.name}`, file, { upsert: true });

      if (error) {
        fileStatus.textContent = "Upload failed";
        return;
      }

      const { data } = supabase.storage
        .from("uploads")
        .getPublicUrl(`${id}/${file.name}`);

      await updateDoc(doc(db, "assignments", id), {
        fileUrl: data.publicUrl,
      });

      fileStatus.textContent = "File uploaded";
      fileStatus.classList.add("uploaded");
    };

    tbody.appendChild(row);
  });

  assignmentsList.appendChild(table);
});
