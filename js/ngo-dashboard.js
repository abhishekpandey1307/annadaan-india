import { donorNotifyEmailJS } from './config.js';

const db = firebase.firestore();

function log(msg) {
  const box = document.getElementById("logBox");
  const now = new Date().toLocaleTimeString();
  const line = `<div>[${now}] ${msg}</div>`;
  if (box) {
    box.innerHTML += line;
    box.scrollTop = box.scrollHeight;
  } else {
    console.log(`[${now}] ${msg}`);
  }
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function getNgoPhoneByEmail(email) {
  try {
    const ngoQuery = await db.collection("ngos")
      .where("email", "==", email)
      .limit(1)
      .get();

    if (!ngoQuery.empty) {
      const ngoDoc = ngoQuery.docs[0];
      const ngoData = ngoDoc.data();
      return ngoData.phone || "NGO Contact Not Provided";
    }
  } catch (err) {
    console.error("Error fetching NGO phone:", err);
  }
  return "NGO Contact Not Provided";
}

function createDonationCard(doc) {
  const d = doc.data();
  const donorEmail = d.donorEmail?.trim();

  const card = document.createElement("div");
  card.className = "donation-card";
  card.innerHTML = `
    <h3>${d.foodType} (${d.quantity})</h3>
    <p>Pickup Time: ${d.pickupTime}</p>
    <p>Address: ${d.address}, ${d.area}, ${d.city}, ${d.state} - ${d.pincode}</p>
    <p>Donor Email: ${donorEmail || "Not provided"}</p>
    <button class="claim-btn">Claim</button>
  `;

  const btn = card.querySelector(".claim-btn");

  if (d.status === "claimed") {
    card.classList.add("claimed");
    btn.disabled = true;
    btn.textContent = "Claimed";
    btn.style.cursor = "not-allowed";
  }

  btn.addEventListener("click", async () => {
    log("Claiming donation " + doc.id);
    const ngoEmail = firebase.auth().currentUser?.email || "unknown@ngo.com";

    if (!donorEmail || !isValidEmail(donorEmail)) {
      log("Invalid or missing donor email. Cannot send claim email.");
      return;
    }

    const ngoContact = await getNgoPhoneByEmail(ngoEmail);

    try {
      await db.collection("donations").doc(doc.id).update({
        status: "claimed",
        claimedBy: ngoEmail,
        claimedAt: new Date()
      });

      await emailjs.send(donorNotifyEmailJS.serviceID, donorNotifyEmailJS.templateID, {
        to_email: donorEmail,
        ngo_email: ngoEmail,
        ngo_name: firebase.auth().currentUser.displayName || "NGO",
        ngo_contact: ngoContact,
        food: d.foodType,
        quantity: d.quantity,
        time: d.pickupTime,
        address: d.address
      });

      log("Claimed & Email sent to donor.");

      showModal({
        phone: d.donorPhone || "Not Provided",
        address: `${d.address}, ${d.area}, ${d.city}, ${d.state} - ${d.pincode}`,
        food: `${d.foodType} (${d.quantity})`
      });

      card.classList.add("claimed");
      btn.disabled = true;
      btn.textContent = "Claimed";
      btn.style.cursor = "not-allowed";
    } catch (err) {
      log("Claim Error: " + (err.message || err));
      console.error("Claim Error:", err);
    }
  });

  return card;
}

function loadDonations() {
  db.collection("donations").onSnapshot(snapshot => {
    const list = document.getElementById("donationsList");
    list.innerHTML = "";

    if (snapshot.empty) {
      log("No donations found.");
      return;
    }

    const docs = snapshot.docs.sort((a, b) => {
      const aClaimed = a.data().status === "claimed";
      const bClaimed = b.data().status === "claimed";
      return aClaimed - bClaimed;
    });

    docs.forEach(doc => {
      const card = createDonationCard(doc);
      list.appendChild(card);
    });
  });
}

function loadClaimedDonationsForNGO() {
  const ngoEmail = firebase.auth().currentUser?.email;
  if (!ngoEmail) return;

  db.collection("donations")
    .where("status", "==", "claimed")
    .where("claimedBy", "==", ngoEmail)
    .onSnapshot(snapshot => {
      const list = document.getElementById("claimedList");
      list.innerHTML = "";

      if (snapshot.empty) {
        log("You haven’t claimed any donations yet.");
        return;
      }

      snapshot.forEach(doc => {
        const d = doc.data();
        const card = document.createElement("div");
        card.className = "donation-card claimed";
        card.innerHTML = `
          <h3>${d.foodType} (${d.quantity})</h3>
          <p>Pickup Time: ${d.pickupTime}</p>
          <p>Address: ${d.address}, ${d.area}, ${d.city}, ${d.state} - ${d.pincode}</p>
          <p><b>Status:</b> Claimed</p>
        `;
        list.appendChild(card);
      });
    });
}

export function initializeDashboard() {
  firebase.auth().onAuthStateChanged(user => {
    if (user) {
      log("Logged in as: " + user.email);
      document.getElementById("ngoEmail").innerText = user.email;
      loadDonations();
      loadClaimedDonationsForNGO();
    } else {
      log("Not logged in.");
    }
  });
}

function showModal({ phone, address, food }) {
  document.getElementById("modalPhone").textContent = phone;
  document.getElementById("modalAddress").textContent = address;
  document.getElementById("modalFood").textContent = food;
  document.getElementById("claimModal").style.display = "block";
}

function closeModal() {
  document.getElementById("claimModal").style.display = "none";
}

window.closeModal = closeModal;

window.onclick = function (event) {
  const modal = document.getElementById("claimModal");
  if (event.target === modal) {
    closeModal();
  }
};
