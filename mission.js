import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getFirestore,
  collection,
  doc,
  onSnapshot,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

/* Firebase Config */
const firebaseConfig = {
  apiKey: "AIzaSyA4rFUf7-avxLsSuarrh1fZn8Pd91Q2oic",
  authDomain: "fmd-dfod-portal-ca1da.firebaseapp.com",
  projectId: "fmd-dfod-portal-ca1da",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

/* DOM */
const missionsContainer = document.getElementById("missions-container");

let currentUser = null;

/* Auth check */
onAuthStateChanged(auth, user => {
  if (!user) {
    window.location.href = "index.html";
  } else {
    currentUser = user.email;
    loadMissions();
  }
});

/* Chat-Button */
const chatBtn = document.getElementById("chat-btn");
chatBtn.addEventListener("click", () => {
  window.location.href = "chat.html"; // Link zu deiner Chat-Seite
});

/* Alle Missionen anzeigen */
function loadMissions() {
  const missionsCol = collection(db, "missions");

  onSnapshot(missionsCol, snapshot => {
    missionsContainer.innerHTML = ""; // vorherige löschen

    snapshot.forEach(docSnap => {
      const data = docSnap.data();
      const missionId = docSnap.id;

      const missionEl = document.createElement("div");
      missionEl.classList.add("single-mission");

      // Titel
      const title = document.createElement("h3");
      title.textContent = data.title;
      missionEl.appendChild(title);

      // Beschreibung
      const desc = document.createElement("p");
      desc.textContent = data.description;
      missionEl.appendChild(desc);

      // Status
      const status = document.createElement("p");
      if (data.status === "accepted") {
        status.textContent = "Status: ACCEPTED";
        status.classList.add("status-accepted");
      } else if (data.status === "rejected") {
        status.textContent = "Status: REJECTED";
        status.classList.add("status-rejected");
      } else {
        status.textContent = "Status: PENDING";
      }
      missionEl.appendChild(status);

      // Buttons Container
      const buttonsRow = document.createElement("div");
      buttonsRow.classList.add("buttons-row");

      const acceptBtn = document.createElement("button");
      acceptBtn.textContent = "Accept";
      acceptBtn.classList.add("accept-btn");

      const rejectBtn = document.createElement("button");
      rejectBtn.textContent = "Reject";
      rejectBtn.classList.add("reject-btn");

      // Irreversible Buttons
      if (data.status) {
        acceptBtn.disabled = true;
        rejectBtn.disabled = true;
      } else {
        acceptBtn.addEventListener("click", () => updateMissionStatus(missionId, "accepted"));
        rejectBtn.addEventListener("click", () => updateMissionStatus(missionId, "rejected"));
      }

      buttonsRow.appendChild(acceptBtn);
      buttonsRow.appendChild(rejectBtn);
      missionEl.appendChild(buttonsRow);

      missionsContainer.appendChild(missionEl);
    });
  });
}

/* Status ändern */
async function updateMissionStatus(missionId, newStatus) {
  if (!currentUser) return;

  const missionRef = doc(db, "missions", missionId);
  await setDoc(missionRef, {
    status: newStatus,
    user: currentUser,
    timestamp: Date.now()
  }, { merge: true });
}