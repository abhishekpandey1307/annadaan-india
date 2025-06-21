export function initLogin() {
  const auth = firebase.auth();

  document.getElementById('ngoLoginForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const errorMsg = document.getElementById('error');

    errorMsg.textContent = "";

    if (!email || !password) {
      errorMsg.textContent = "Please fill in all fields.";
      return;
    }

    try {
      await auth.signInWithEmailAndPassword(email, password);
      window.location.href = "ngo-dashboard.html";
    } catch (error) {
      console.error("Login Error:", error);
      switch (error.code) {
        case 'auth/user-not-found':
          errorMsg.textContent = "No user found with this email.";
          break;
        case 'auth/wrong-password':
          errorMsg.textContent = "Incorrect password.";
          break;
        case 'auth/invalid-email':
          errorMsg.textContent = "Invalid email address.";
          break;
        default:
          errorMsg.textContent = error.message;
      }
    }
  });
}
