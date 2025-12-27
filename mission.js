import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getFirestore,
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

const app  = initializeApp(firebaseConfig);
const db   = getFirestore(app);
const auth = getAuth(app);

/* DOM Elemente */
const titleEl = document.getElementById("mission-title");
const descEl = document.getElementById("mission-desc");
const acceptBtn = document.getElementById("accept-btn");
const rejectBtn = document.getElementById("reject-btn");
const statusEl = document.getElementById("mission-status");

let currentUser = null;

/* Auth check */
onAuthStateChanged(auth, user => {
  if (!user) {
    window.location.href = "index.html";
  } else {
    currentUser = user.email;
  }
});

/* Aktuelle Mission auswählen */
const missionId = "mission_001";  // ID kann beliebig sein
const missionRef = doc(db, "missions", missionId);

/* Live-Daten abrufen */
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

/* Accept / Reject Buttons */
acceptBtn.addEventListener("click", async () => {
  if (!currentUser) return;
  await setDoc(missionRef, {
    status: "accepted",
    user: currentUser,
    timestamp: Date.now()
  }, { merge: true });
});

rejectBtn.addEventListener("click", async () => {
  if (!currentUser) return;
  await setDoc(missionRef, {
    status: "rejected",
    user: currentUser,
    timestamp: Date.now()
  }, { merge: true });
});