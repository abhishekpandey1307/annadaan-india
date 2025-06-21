import { firebaseConfig } from './config.js';

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Handle Donor Signup Form
document.getElementById('signup-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const errorMsg = document.getElementById('error-msg');
  errorMsg.textContent = '';

  // Basic Validation
  if (!name || !email || !password) {
    errorMsg.textContent = 'Please fill in all fields.';
    return;
  }

  if (password.length < 6) {
    errorMsg.textContent = 'Password must be at least 6 characters.';
    return;
  }

  try {
    // Create user
    const userCredential = await auth.createUserWithEmailAndPassword(email, password);
    const user = userCredential.user;

    // Save donor to Firestore
    await db.collection('donors').doc(user.uid).set({
      name,
      email,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    alert('✅ Signup successful!');
    window.location.href = 'donor-login.html';
  } catch (error) {
    console.error("Signup Error:", error);
    if (error.code === 'auth/email-already-in-use') {
      errorMsg.textContent = 'This email is already registered.';
    } else {
      errorMsg.textContent = error.message;
    }
  }
});
