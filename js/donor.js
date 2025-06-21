import { firebaseConfig, ngoNotifyEmailJS } from '../config.js';

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

function log(msg) {
  const box = document.getElementById('logBox');
  const now = new Date().toLocaleTimeString();
  const line = `<div>[${now}] ${msg}</div>`;
  if (box) {
    if (box.children.length > 100) box.innerHTML = '';
    box.innerHTML += line;
    box.scrollTop = box.scrollHeight;
  } else {
    console.log(line);
  }
}

let locationData = {};
fetch('data/india-states-city-pincode.json')
  .then(res => res.json())
  .then(data => {
    locationData = data;
    const stateSel = document.getElementById('state');
    const frag = document.createDocumentFragment();
    for (const s in data) {
      const o = document.createElement('option');
      o.value = s;
      o.textContent = s;
      frag.appendChild(o);
    }
    stateSel.appendChild(frag);
  })
  .catch(err => log("Location load error: " + err.message));

function populateOptions(selectEl, items) {
  const frag = document.createDocumentFragment();
  for (const it of items) {
    const o = document.createElement('option');
    o.value = it;
    o.textContent = it;
    frag.appendChild(o);
  }
  selectEl.appendChild(frag);
}

document.getElementById('state').addEventListener('change', function () {
  const cSel = document.getElementById('city');
  const aSel = document.getElementById('area');
  cSel.innerHTML = '<option value="">-- Select City --</option>';
  aSel.innerHTML = '<option value="">-- Select Area --</option>';
  const cities = Object.keys(locationData[this.value] || {});
  populateOptions(cSel, cities);
});

document.getElementById('city').addEventListener('change', function () {
  const aSel = document.getElementById('area');
  aSel.innerHTML = '<option value="">-- Select Area --</option>';
  const st = document.getElementById('state').value;
  const areas = Object.keys(locationData[st]?.[this.value] || {});
  populateOptions(aSel, areas);
});

document.getElementById('area').addEventListener('change', () => {
  const st = document.getElementById('state').value;
  const ct = document.getElementById('city').value;
  const ar = document.getElementById('area').value;
  const pin = locationData[st]?.[ct]?.[ar] || '';
  document.getElementById('pincode').value = pin.trim();
});

document.getElementById('donationForm').addEventListener('submit', async function (e) {
  e.preventDefault();
  log("Submitting donation...");

  const foodType = this.foodType.value.trim(),
        quantity = this.quantity.value.trim(),
        pickupTime = this.pickupTime.value,
        address = this.address.value.trim(),
        donorPhone = this.donorPhone.value.trim(),
        state = this.state.value,
        city = this.city.value,
        area = this.area.value,
        pincode = this.pincode.value.trim(),
        donorEmail = firebase.auth().currentUser?.email?.trim() || "anonymous@donor.com";

  if (!foodType || !quantity || !pickupTime || !address || !state || !city || !area || !pincode || !donorPhone) {
    alert("Please fill all fields.");
    return;
  }

  try {
    const docRef = await db.collection('donations').add({
      foodType, quantity, pickupTime, address,
      state, city, area, pincode, donorEmail, donorPhone,
      status: "unclaimed",
      timestamp: new Date()
    });
    log("Donation saved: " + docRef.id);

    const ngoSnap = await db.collection('ngos').where('pincode', '==', pincode).get();
    const ngos = ngoSnap.docs.map(d => d.data());

    if (!ngos.length) {
      log("No NGOs found for this area.");
    }

    await Promise.all(ngos.map(ngo => {
      const data = {
        to_email: ngo.email,
        donor_email: donorEmail,
        food_type: foodType,
        quantity,
        pickup_time: pickupTime,
        address,
        state,
        city,
        area,
        pincode,
        contact_number: donorPhone
      };
      return emailjs.send(
        ngoNotifyEmailJS.serviceID,
        ngoNotifyEmailJS.templateID,
        data
      )
      .then(() => log("Email sent: " + ngo.email))
      .catch(err => log("Email failed: " + ngo.email + " | " + (err.statusText || err)));
    }));

    log("Redirecting to thank-you in 5 sec...");
    setTimeout(() => location.href = "thank-you.html", 1000);
  } catch (err) {
    console.error(err);
    log("Error during submission: " + err.message);
    alert("Something went wrong. Please try again.");
  }
});
