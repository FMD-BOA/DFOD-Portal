import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

/* Firebase Config */
const firebaseConfig = {
  apiKey: "AIzaSyA4rFUf7-avxLsSuarrh1fZn8Pd91Q2oic",
  authDomain: "fmd-dfod-portal-ca1da.firebaseapp.com",
  projectId: "fmd-dfod-portal-ca1da",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/* DOM */
const loginDiv = document.getElementById("login");
const chatDiv  = document.getElementById("chat");
const logDiv   = document.getElementById("log");
const msgIn    = document.getElementById("msg");
const sendBtn  = document.getElementById("send-btn");
const loginBtn = document.getElementById("login-btn");
const missionBtn = document.getElementById("mission-btn");
const errDiv   = document.getElementById("err");

let currentUser = null;

/* Lokaler Login */
const userMap = {
  "topazdawn": "password1",
  "dfod": "password2"
};

loginBtn.addEventListener("click", () => {
  const username = document.getElementById("user").value.trim();
  const password = document.getElementById("pw").value;

  if (username in userMap && userMap[username] === password) {
    currentUser = username;
    loginDiv.style.display = "none";
    chatDiv.style.display = "block";
    errDiv.textContent = "";
  } else {
    errDiv.textContent = "Invalid login.";
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

/* Mission Portal Button */
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
      line.textContent = `${m.user}: ${m.text} (GMT ${new Date(m.time).toUTCString()})`;
      logDiv.appendChild(line);
    });
    logDiv.scrollTop = logDiv.scrollHeight;
  }
);