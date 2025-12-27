import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getFirestore,
  collection,
  doc,
  getDocs,
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
const missionSelect = document.getElementById("mission-select");
const titleEl = document.getElementById("mission-title");
const descEl = document.getElementById("mission-desc");
const acceptBtn = document.getElementById("accept-btn");
const rejectBtn = document.getElementById("reject-btn");
const statusEl = document.getElementById("mission-status");

let currentUser = null;
let missionRef = null;

/* Auth check */
onAuthStateChanged(auth, user => {
  if (!user) {
    window.location.href = "index.html";
  } else {
    currentUser = user.email;
  }
});

/* Alle Missionen abrufen */
const missionsCol = collection(db, "missions");
getDocs(missionsCol).then(snapshot => {
  missionSelect.innerHTML = ""; // alte Option entfernen
  snapshot.forEach(docSnap => {
    const option = document.createElement("option");
    option.value = docSnap.id;
    option.textContent = docSnap.data().title;
    missionSelect.appendChild(option);
  });

  // direkt erste Mission auswählen
  if (missionSelect.options.length > 0) {
    missionSelect.value = missionSelect.options[0].value;
    loadMission(missionSelect.value);
  }
});

/* Mission wechseln */
missionSelect.addEventListener("change", e => {
  loadMission(e.target.value);
});

/* Funktion, um eine Mission zu laden und live zu beobachten */
function loadMission(id) {
  if (!id) return;

  missionRef = doc(db, "missions", id);

  onSnapshot(missionRef, docSnap => {
    if (!docSnap.exists()) {
      titleEl.textContent = "MISSION UNKNOWN";
      descEl.textContent = "";
      statusEl.textContent = "Status: pending";
      return;
    }

    const data = docSnap.data();
    titleEl.textContent = data.title;
    descEl.textContent = data.description;
    statusEl.textContent = `Mission status: ${data.status ? data.status.toUpperCase() : "PENDING"}`;
  });
}

/* Accept / Reject */
acceptBtn.addEventListener("click", async () => {
  if (!currentUser || !missionRef) return;
  await setDoc(missionRef, {
    status: "accepted",
    user: currentUser,
    timestamp: Date.now()
  }, { merge: true });
});

rejectBtn.addEventListener("click", async () => {
  if (!currentUser || !missionRef) return;
  await setDoc(missionRef, {
    status: "rejected",
    user: currentUser,
    timestamp: Date.now()
  }, { merge: true });
});