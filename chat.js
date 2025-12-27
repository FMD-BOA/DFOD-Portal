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
  signInWithEmailAndPassword,
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
const loginDiv = document.getElementById("login");
const chatDiv = document.getElementById("chat");
const logDiv   = document.getElementById("log");
const msgIn    = document.getElementById("msg");
const sendBtn  = document.getElementById("send-btn");
const loginBtn = document.getElementById("login-btn");
const missionBtn = document.getElementById("mission-btn");
const errDiv = document.getElementById("err");

let currentUser = null;

/* Login */
loginBtn.addEventListener("click", async () => {
  const emailMap = {
    "topazdawn": "topazdawn@fmd.gov",
    "dfod": "dfod@fmd.gov"
  };

  const username = document.getElementById("user").value.trim();
  const password = document.getElementById("pw").value;

  if (!username || !password) {
    errDiv.textContent = "Fill in both fields.";
    return;
  }

  const email = emailMap[username];
  if (!email) {
    errDiv.textContent = "Unknown user.";
    return;
  }

  try {
    await signInWithEmailAndPassword(auth, email, password);
    loginDiv.style.display = "none";
    chatDiv.style.display = "block";
    errDiv.textContent = "";
  } catch (e) {
    errDiv.textContent = "Login failed.";
    console.error(e);
  }
});

/* Auth check */
onAuthStateChanged(auth, user => {
  if (user) {
    currentUser = user.email.split("@")[0]; // nur Username anzeigen
    loginDiv.style.display = "none";
    chatDiv.style.display = "block";
  } else {
    loginDiv.style.display = "block";
    chatDiv.style.display = "none";
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