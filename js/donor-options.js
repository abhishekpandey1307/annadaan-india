import { firebaseConfig } from "./js/config.js";

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// Auth Check
auth.onAuthStateChanged(user => {
  if (!user) {
    window.location.href = "donor-login.html";
  }
});

// Logout Function
function logout() {
  auth.signOut().then(() => {
    window.location.href = "donor-login.html";
  });
}

// Expose logout to global scope since it's called inline from HTML
window.logout = logout;
