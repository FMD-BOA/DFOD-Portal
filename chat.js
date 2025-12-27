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
const logDiv   = document.getElementById("log");
const msgIn    = document.getElementById("msg");
const sendBtn  = document.getElementById("send-btn");
const missionBtn = document.getElementById("mission-btn");

let currentUser = null;

/* Auth check */
onAuthStateChanged(auth, user => {
  if (!user) {
    window.location.href = "index.html"; // nicht eingeloggt
  } else {
    currentUser = user.email; // oder user.uid
  }
});

/* Send message */
sendBtn.addEventListener("click", async () => {
  if (!msgIn.value.trim() || !currentUser) return;

  await addDoc(collection(db, "messages"), {
    user: currentUser,
    text: msgIn.value,
    time: Date.now()
  });

  msgIn.value = "";
});

/* Open Mission Portal */
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
      line.textContent = `${m.user}: ${m.text}\n(GMT ${new Date(m.time).toUTCString()})`;
      logDiv.appendChild(line);
    });
    logDiv.scrollTop = logDiv.scrollHeight;
  }
);