import { firebaseConfig } from './config.js';

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

let locationData = {};
let pincode = "";

fetch('data/india-states-city-pincode.json')
  .then(res => res.json())
  .then(data => {
    locationData = data;
    const stateSelect = document.getElementById('state');
    for (const st in data) {
      stateSelect.innerHTML += `<option value="${st}">${st}</option>`;
    }
  });

document.getElementById('state').addEventListener('change', function () {
  const cities = Object.keys(locationData[this.value] || {});
  const citySelect = document.getElementById('city');
  const areaSelect = document.getElementById('area');
  citySelect.innerHTML = '<option value="">-- Select City --</option>';
  areaSelect.innerHTML = '<option value="">-- Select Area --</option>';
  for (const city of cities) {
    citySelect.innerHTML += `<option value="${city}">${city}</option>`;
  }
});

document.getElementById('city').addEventListener('change', function () {
  const state = document.getElementById('state').value;
  const areas = Object.keys(locationData[state]?.[this.value] || {});
  const areaSelect = document.getElementById('area');
  areaSelect.innerHTML = '<option value="">-- Select Area --</option>';
  for (const area of areas) {
    areaSelect.innerHTML += `<option value="${area}">${area}</option>`;
  }
});

document.getElementById('area').addEventListener('change', function () {
  const state = document.getElementById('state').value;
  const city = document.getElementById('city').value;
  const area = this.value;
  pincode = locationData[state]?.[city]?.[area] || "";
});

document.getElementById('ngoSignupForm').addEventListener('submit', function (e) {
  e.preventDefault();

  const name = document.getElementById('ngoName').value.trim();
  const email = document.getElementById('email').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const state = document.getElementById('state').value;
  const city = document.getElementById('city').value;
  const area = document.getElementById('area').value;
  const password = document.getElementById('password').value;

  if (!pincode) {
    alert("⚠️ Please select a valid area to fetch pincode.");
    return;
  }

  auth.createUserWithEmailAndPassword(email, password)
    .then(userCredential => {
      const uid = userCredential.user.uid;
      return db.collection('ngos').doc(uid).set({
        name, email, phone, state, city, area, pincode
      });
    })
    .then(() => {
      alert('✅ Signup successful! Please login.');
      window.location.href = 'ngo-login.html';
    })
    .catch(err => {
      console.error('❌ Error:', err);
      alert('❌ Error: ' + err.message);
    });
});
