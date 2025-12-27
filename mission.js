import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, doc, setDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

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
const missionTitle = document.getElementById("mission-title");
const missionStatus = document.getElementById("mission-status");
const missionUser = document.getElementById("mission-user");
const acceptBtn = document.getElementById("accept-btn");
const rejectBtn = document.getElementById("reject-btn");
const backBtn = document.getElementById("back-btn");

let currentUser = null;

/* Auth check */
onAuthStateChanged(auth, user => {
  if (!user) window.location.href = "index.html";
  else currentUser = user.email;
});

/* Mission doc reference */
const missionRef = doc(db, "missions", "mission1");

/* Initialize mission if not exists */
setDoc(missionRef, {
  title: "Retrieve Package",
  status: "Pending",
  responseBy: "",
  responseTime: null
}, { merge: true });

/* Real-time updates */
onSnapshot(missionRef, snap => {
  const data = snap.data();
  if (!data) return;
  missionTitle.textContent = data.title;
  missionStatus.textContent = data.status;
  missionUser.textContent = data.responseBy || "-";
});

/* Accept / Reject */
acceptBtn.addEventListener("click", async () => {
  if (!currentUser) return;
  await setDoc(missionRef, {
    status: "Accepted",
    responseBy: currentUser,
    responseTime: Date.now()
  }, { merge: true });
});

rejectBtn.addEventListener("click", async () => {
  if (!currentUser) return;
  await setDoc(missionRef, {
    status: "Rejected",
    responseBy: currentUser,
    responseTime: Date.now()
  }, { merge: true });
});

/* Back button */
backBtn.addEventListener("click", () => {
  window.location.href = "chat.html";
});