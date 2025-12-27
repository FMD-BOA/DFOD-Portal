import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyA4rFUf7-avxLsSuarrh1fZn8Pd91Q2oic",
  authDomain: "fmd-dfod-portal-ca1da.firebaseapp.com",
  projectId: "fmd-dfod-portal-ca1da",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const emailInput = document.getElementById("user");
const pwInput = document.getElementById("pw");
const loginBtn = document.getElementById("login-btn");
const errDiv   = document.getElementById("err");

loginBtn.addEventListener("click", async () => {
  const email = emailInput.value.trim();
  const pw = pwInput.value;

  if (!email || !pw) {
    errDiv.textContent = "Please fill in both fields.";
    return;
  }

  try {
    await signInWithEmailAndPassword(auth, email, pw);
    window.location.href = "chat.html";
  } catch (error) {
    console.error(error);
    errDiv.textContent = "Login failed: " + error.message;
  }
});