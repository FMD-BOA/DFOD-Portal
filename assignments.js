import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, onSnapshot, doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";
import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// --- Firebase Setup ---
const firebaseConfig = {
  apiKey: "AIzaSyA4rFUf7-avxLsSuarrh1fZn8Pd91Q2oic",
  authDomain: "fmd-dfod-portal-ca1da.firebaseapp.com",
  projectId: "fmd-dfod-portal-ca1da",
  storageBucket: "fmd-dfod-portal-ca1da.firebasestorage.app",
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// --- Supabase Setup ---
const supabaseUrl = 'https://YOUR_SUPABASE_URL.supabase.co'; // <--- ersetzen
const supabaseKey = 'sb_publishable_qXmKdTRLInQdw5sX1TF-yg_oV_Tcjpo';
const supabase = createClient(supabaseUrl, supabaseKey);

const assignmentsList = document.getElementById("assignments-list");

// --- Auth & Logout ---
const logoutBtn = document.getElementById("logout-btn");
if (logoutBtn) {
  logoutBtn.onclick = async () => {
    try {
      await signOut(auth);
      window.location.href = "index.html"; // Login-Seite
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };
}

// --- Navigation zum Chat ---
const chatBtn = document.getElementById("chat-btn");
if (chatBtn) {
  chatBtn.onclick = () => {
    window.location.href = "chat.html";
  };
}

// --- Live-Abfrage der Assignments ---
const assignmentsCol = collection(db, "assignments");
onSnapshot(assignmentsCol, (snapshot) => {
  assignmentsList.innerHTML = '';
  snapshot.forEach(docSnap => {
    const assignment = docSnap.data();
    const assignmentId = docSnap.id;

    const container = document.createElement('div');
    container.className = 'assignment';

    container.innerHTML = `
      <strong>${assignment.title}</strong> - ${assignment.status} - Deadline: ${assignment.deadline?.toDate().toLocaleDateString() || 'N/A'}
      <div class="buttons-row">
        <button class="accept-btn">Accept</button>
        <button class="reject-btn">Reject</button>
        <input type="file" class="upload-input" accept=".pdf,.txt">
      </div>
      <div class="upload-status"></div>
      <hr>
    `;

    // --- Accept/Reject ---
    container.querySelector(".accept-btn").onclick = async () => {
      await updateDoc(doc(db, "assignments", assignmentId), { status: "Accepted" });
    };
    container.querySelector(".reject-btn").onclick = async () => {
      await updateDoc(doc(db, "assignments", assignmentId), { status: "Rejected" });
    };

    // --- Upload ---
    container.querySelector(".upload-input").onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const statusDiv = container.querySelector(".upload-status");

      const { data, error } = await supabase.storage
        .from('uploads')
        .upload(`${assignmentId}/${file.name}`, file, { upsert: true });

      if (error) statusDiv.textContent = "Upload failed: " + error.message;
      else {
        statusDiv.textContent = "File uploaded successfully!";
        const { publicUrl } = supabase.storage.from('uploads').getPublicUrl(`${assignmentId}/${file.name}`);
        await updateDoc(doc(db, "assignments", assignmentId), { fileUrl: publicUrl });
      }
    };

    assignmentsList.appendChild(container);
  });
});