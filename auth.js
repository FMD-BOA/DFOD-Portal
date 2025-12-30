import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

/* Firebase Config */
const firebaseConfig = {
  apiKey: "AIzaSyA4rFUf7-avxLsSuarrh1fZn8Pd91Q2oic",
  authDomain: "fmd-dfod-portal-ca1da.firebaseapp.com",
  projectId: "fmd-dfod-portal-ca1da",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

/* Username → Email Mapping */
function usernameToEmail(username) {
  const u = username.toLowerCase();
  if (u === "topazdawn") return "topazdawn@fmd.gov";
  if (u === "DFOD-support") return "dfod@fmd.gov";
  return null;
}

/* DOM */
const userInput = document.getElementById("user");
const pwInput = document.getElementById("pw");
const loginBtn = document.getElementById("login-btn");
const errDiv = document.getElementById("err");

/* Login */
loginBtn.addEventListener("click", async () => {
  const username = userInput.value.trim();
  const password = pwInput.value;

  const email = usernameToEmail(username);
  if (!email) {
    errDiv.textContent = "Invalid username.";
    return;
  }

  if (!password) {
    errDiv.textContent = "Password required.";
    return;
  }

  try {
    await signInWithEmailAndPassword(auth, email, password);
    window.location.href = "chat.html";
  } catch (err) {
    console.error(err);
    errDiv.textContent = "Login failed.";
  }
});