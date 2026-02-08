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

/* ---------- Top buttons ---------- */
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
        <th>Actions</th>
        <th>File Status</th>
      </tr>
    </thead>
    <tbody></tbody>
  `;

  const tbody = table.querySelector("tbody");

  snapshot.forEach((docSnap) => {
    const a = docSnap.data();
    const id = docSnap.id;

    const statusText = a.status ?? "Pending";

    // --- Status Flags ---
    const isUnderAllocation = statusText === "Under Allocation";
    const isRejected = statusText === "Rejected";
    const isComplete = statusText === "Complete";
    const isAccepted = statusText === "Accepted";

    const isFinalised = isRejected || isComplete;

    const statusClass = isAccepted || isComplete
      ? "status-accepted"
      : isRejected
      ? "status-rejected"
      : isUnderAllocation
      ? "status-pending-allocation"
      : "status-pending";

    const acceptedDate = a["acceptance-date"]
      ? a["acceptance-date"].toDate().toLocaleDateString("en-GB").toUpperCase()
      : "";

    const deadlineDate = a.deadline
      ? a.deadline.toDate().toLocaleDateString("en-GB").toUpperCase()
      : "N/A";

    // --- Row ---
    const row = document.createElement("tr");

    row.innerHTML = `
      <td class="title"><strong>${a.title}</strong></td>
      <td>${a.ID || "—"}</td>
      <td>${a.type || "—"}</td>
      <td>${a.department || "—"}</td>

      <td class="status ${statusClass}">
        ${statusText}
      </td>

      <td class="dates">
        ${acceptedDate ? `ACCEPTED: ${acceptedDate}<br>` : ""}
        DEADLINE: ${deadlineDate}
      </td>

      <td class="actions">
        <button class="accept-btn">Accept</button>
        <button class="reject-btn">Reject</button>
        <label class="upload-btn">
          Upload
          <input type="file" class="upload-input" accept=".pdf,.txt">
        </label>
      </td>

      <td class="file-status ${a.fileUrl ? "uploaded" : ""}">
        ${a.fileUrl ? "File uploaded" : "No file uploaded"}
      </td>
    `;

    const acceptBtn = row.querySelector(".accept-btn");
    const rejectBtn = row.querySelector(".reject-btn");
    const uploadInput = row.querySelector(".upload-input");
    const uploadLabel = row.querySelector(".upload-btn");
    const fileStatus = row.querySelector(".file-status");

// --- Button Locks ---
if (isAccepted || isComplete || isRejected || isUnderAllocation) {
  // Nach Annahme / Ablehnung / Completion / Under Allocation: Buttons gesperrt
  acceptBtn.disabled = true;
  rejectBtn.disabled = true;
} else {
  // Pending: Buttons aktiv
  acceptBtn.disabled = false;
  rejectBtn.disabled = false;
}

// --- Upload Only If Accepted and Not Complete ---
const canUpload = isAccepted && !isComplete;
uploadInput.disabled = !canUpload;
if (canUpload) uploadLabel.classList.remove("upload-disabled");
else uploadLabel.classList.add("upload-disabled");

    // --- Accept ---
    acceptBtn.onclick = async () => {
      if (isFinalised || isUnderAllocation || isAccepted) return;
      await updateDoc(doc(db, "assignments", id), {
        status: "Accepted",
        "acceptance-date": serverTimestamp(),
      });
    };

    // --- Reject ---
    rejectBtn.onclick = async () => {
      if (isFinalised || isUnderAllocation) return;
      await updateDoc(doc(db, "assignments", id), {
        status: "Rejected",
      });
    };

    // --- Upload ---
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
        status: "Complete", // Upload = Complete
      });

      fileStatus.textContent = "File uploaded";
      fileStatus.classList.add("uploaded");
    };

    tbody.appendChild(row);
  });

  assignmentsList.appendChild(table);
});
