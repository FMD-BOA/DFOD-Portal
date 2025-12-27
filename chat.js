import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy
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

const app  = initializeApp(firebaseConfig);
const db   = getFirestore(app);
const auth = getAuth(app);

/* DOM */
const logDiv     = document.getElementById("log");
const msgIn      = document.getElementById("msg");
const sendBtn    = document.getElementById("send-btn");
const missionBtn = document.getElementById("mission-btn");

let currentUserEmail = null;

/* Email → Username */
function emailToUsername(email) {
  if (email === "topazdawn@fmd.gov") return "A";
  if (email === "dfod@fmd.gov") return "B";
  return "UNKNOWN";
}

/* Auth check */
onAuthStateChanged(auth, user => {
  if (!user) {
    window.location.href = "index.html";
    return;
  }

  currentUserEmail = user.email;

  // Kein persistenter Login
  signOut(auth);
});

/* Send message */
sendBtn.addEventListener("click", async () => {
  if (!msgIn.value.trim() || !currentUserEmail) return;

  await addDoc(collection(db, "messages"), {
    user: currentUserEmail,
    text: msgIn.value,
    time: Date.now()
  });

  msgIn.value = "";
});

/* Mission Portal */
missionBtn.addEventListener("click", () => {
  window.location.href = "mission.html";
});

/* Listen to messages */
onSnapshot(
  query(collection(db, "messages"), orderBy("time")),
  snap => {
    logDiv.innerHTML = "";

    snap.forEach(doc => {
      const m = doc.data();
      const line = document.createElement("div");

      line.textContent =
        `${emailToUsername(m.user)}: ${m.text} (GMT ${new Date(m.time).toUTCString()})`;

      logDiv.appendChild(line);
    });

    logDiv.scrollTop = logDiv.scrollHeight;
  }
);