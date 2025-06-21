import { firebaseConfig } from "./config.js";

// ✅ Initialize Firebase
firebase.initializeApp(firebaseConfig);

// ✅ Donor Login Logic
const loginForm = document.getElementById("ngoLoginForm");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const errorMsg = document.getElementById("error");

loginForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const email = emailInput.value.trim();
  const password = passwordInput.value;

  errorMsg.textContent = "";

  firebase.auth().signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
      // ✅ Successful login
      console.log("Logged in:", userCredential.user);
      alert("Login successful!");
      window.location.href = "donor-options.html"; 
    })
    .catch((error) => {
      // ❌ Login error
      console.error("Login error:", error.message);
      errorMsg.textContent = error.message;
    });
});
