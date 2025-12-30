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
const chatBtn = document.getElementById("chat-btn");
const logoutBtn = document.getElementById("logout-btn");

let currentUser = null;

/* Auth Check */
onAuthStateChanged(auth, user => {
  if (!user) {
    window.location.href = "index.html";
  } else {
    currentUser = user;
    loadMissions();
  }
});

/* Logout */
logoutBtn.addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "index.html";
});

/* Zurück zum Chat */
chatBtn.addEventListener("click", () => {
  window.location.href = "chat.html";
});

/* Missionen laden */
function loadMissions() {
  const missionsCol = collection(db, "missions");

  onSnapshot(missionsCol, async snapshot => {
    missionsContainer.innerHTML = "";

    for (const docSnap of snapshot.docs) {
      const data = docSnap.data();
      const missionId = docSnap.id;

      const responseRef = doc(
        db,
        "missions",
        missionId,
        "responses",
        currentUser.uid
      );

      const responseSnap = await getDoc(responseRef);
      const response = responseSnap.exists() ? responseSnap.data() : null;

      const missionEl = document.createElement("div");
      missionEl.className = "single-mission";

      // Zeilenlayout: Titel links, Buttons rechts
      missionEl.innerHTML = `
        <h3>${data.title}</h3>
        <p>${data.description}</p>
        <p class="status">
          Status: ${response ? response.status.toUpperCase() : "PENDING"}
        </p>
      `;

      const buttonsRow = document.createElement("div");
      buttonsRow.className = "buttons-row";

      const acceptBtn = document.createElement("button");
      acceptBtn.textContent = "Accept";
      acceptBtn.className = "accept-btn";

      const rejectBtn = document.createElement("button");
      rejectBtn.textContent = "Reject";
      rejectBtn.className = "reject-btn";

      if (response) {
        acceptBtn.disabled = true;
        rejectBtn.disabled = true;
      } else {
        acceptBtn.onclick = () => updateMissionStatus(missionId, "accepted");
        rejectBtn.onclick = () => updateMissionStatus(missionId, "rejected");
      }

      buttonsRow.appendChild(acceptBtn);
      buttonsRow.appendChild(rejectBtn);
      missionEl.appendChild(buttonsRow);

      missionsContainer.appendChild(missionEl);
    }
  });
}

/* Status speichern (pro User, irreversibel) */
async function updateMissionStatus(missionId, status) {
  const ref = doc(
    db,
    "missions",
    missionId,
    "responses",
    currentUser.uid
  );

  await setDoc(ref, {
    status,
    user: currentUser.email,
    timestamp: Date.now()
  });
}