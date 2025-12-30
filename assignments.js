import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getFirestore,
  collection,
  doc,
  onSnapshot,
  setDoc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyA4rFUf7-avxLsSuarrh1fZn8Pd91Q2oic",
  authDomain: "fmd-dfod-portal-ca1da.firebaseapp.com",
  projectId: "fmd-dfod-portal-ca1da",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

const missionsContainer = document.getElementById("missions-container");
const chatBtn = document.getElementById("chat-btn");
const logoutBtn = document.getElementById("logout-btn");

let currentUser = null;

onAuthStateChanged(auth, user => {
  if (!user) {
    window.location.href = "index.html";
  } else {
    currentUser = user;
    loadMissions();
  }
});

logoutBtn.addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "index.html";
});

chatBtn.addEventListener("click", () => {
  window.location.href = "chat.html";
});

function loadMissions() {
  const missionsCol = collection(db, "missions");

  onSnapshot(missionsCol, async snapshot => {
    missionsContainer.innerHTML = "";

    for (const docSnap of snapshot.docs) {
      const data = docSnap.data();
      const missionId = docSnap.id;

      const responseRef = doc(db, "missions", missionId, "responses", currentUser.uid);
      const responseSnap = await getDoc(responseRef);
      const response = responseSnap.exists() ? responseSnap.data() : null;

      const missionEl = document.createElement("div");
      missionEl.className = "single-mission";

      const title = document.createElement("h3");
      title.textContent = data.title;
      missionEl.appendChild(title);

      const desc = document.createElement("p");
      desc.textContent = data.description;
      missionEl.appendChild(desc);

      const statusEl = document.createElement("p");
      statusEl.className = "status";
      statusEl.textContent = `Status: ${response ? response.status.toUpperCase() : "PENDING"}`;
      missionEl.appendChild(statusEl);

      // Buttons
      const buttonsRow = document.createElement("div");
      buttonsRow.className = "buttons-row";

      const acceptBtn = document.createElement("button");
      acceptBtn.textContent = "Accept";
      acceptBtn.className = "accept-btn";

      const rejectBtn = document.createElement("button");
      rejectBtn.textContent = "Reject";
      rejectBtn.className = "reject-btn";

      const uploadBtn = document.createElement("button");
      uploadBtn.textContent = "Upload";
      uploadBtn.className = "upload-btn";
      uploadBtn.disabled = true;

      const fileInput = document.createElement("input");
      fileInput.type = "file";
      fileInput.accept = ".txt,.pdf";
      fileInput.style.display = "none";

      if (response) {
        acceptBtn.disabled = true;
        rejectBtn.disabled = true;
        if (response.status === "accepted") uploadBtn.disabled = false;
      } else {
        acceptBtn.onclick = async () => {
          await updateMissionStatus(missionId, "accepted");
          uploadBtn.disabled = false; // Nur den Upload aktivieren
          statusEl.textContent = "Status: ACCEPTED"; // Status sofort updaten
          acceptBtn.disabled = true;
          rejectBtn.disabled = true;
        };
        rejectBtn.onclick = async () => {
          await updateMissionStatus(missionId, "rejected");
          statusEl.textContent = "Status: REJECTED";
          acceptBtn.disabled = true;
          rejectBtn.disabled = true;
        };
      }

      uploadBtn.addEventListener("click", () => fileInput.click());
      fileInput.addEventListener("change", async e => {
        if (!e.target.files.length) return;
        const file = e.target.files[0];
        const fileRef = storageRef(storage, `mission_uploads/${missionId}/${currentUser.uid}/${file.name}`);
        await uploadBytes(fileRef, file);
        const url = await getDownloadURL(fileRef);
        await setDoc(responseRef, { fileUrl: url }, { merge: true });
        alert(`File uploaded: ${file.name}`);
      });

      buttonsRow.appendChild(acceptBtn);
      buttonsRow.appendChild(rejectBtn);
      buttonsRow.appendChild(uploadBtn);
      buttonsRow.appendChild(fileInput);

      missionEl.appendChild(buttonsRow);
      missionsContainer.appendChild(missionEl);
    }
  });
}

async function updateMissionStatus(missionId, status) {
  const ref = doc(db, "missions", missionId, "responses", currentUser.uid);
  await setDoc(ref, { status, user: currentUser.email, timestamp: Date.now() });
}