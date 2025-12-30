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

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

/* DOM Elemente */
const chatDiv = document.getElementById("chat");
const logDiv  = document.getElementById("log");
const msgIn   = document.getElementById("msg");
const sendBtn = document.getElementById("send-btn");
const missionBtn = document.getElementById("mission-btn");
const logoutBtn = document.getElementById("logout-btn");

/* Aktueller User */
let currentUser = null;

/* Auth-Check */
onAuthStateChanged(auth, user => {
  if (user) {
    currentUser = user.email.split("@")[0]; // nur Username
    chatDiv.style.display = "block";

    // Firestore Listener starten
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

  } else {
    currentUser = null;
    chatDiv.style.display = "none";
    window.location.href = "index.html"; // zurück zum Login, falls nicht angemeldet
  }
});

/* Logout */
logoutBtn.addEventListener("click", async () => {
  try {
    await signOut(auth);
    currentUser = null;
  } catch (err) {
    console.error("Logout failed:", err);
  }
});

/* Nachricht senden */
sendBtn.addEventListener("click", async () => {
  if (!msgIn.value.trim() || !currentUser) return;

  try {
    await addDoc(collection(db, "messages"), {
      user: currentUser,
      text: msgIn.value,
      time: Date.now()
    });
    msgIn.value = "";
  } catch (err) {
    console.error("Error sending message:", err);
  }
});

/* Mission Portal */
missionBtn.addEventListener("click", () => {
  window.location.href = "assignments.html";
});