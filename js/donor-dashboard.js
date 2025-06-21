// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Initialize EmailJS
emailjs.init(EMAILJS_DONOR_PUBLIC_KEY);

// Check auth state
auth.onAuthStateChanged(user => {
  if (user) {
    document.getElementById("donorEmail").textContent = user.email;

    db.collection("donations")
      .where("donorId", "==", user.uid)
      .orderBy("createdAt", "desc")
      .get()
      .then(snapshot => {
        const list = document.getElementById("donationsList");
        list.innerHTML = "";

        if (snapshot.empty) {
          list.innerHTML = "<p>No donations made yet.</p>";
          return;
        }

        snapshot.forEach(doc => {
          const data = doc.data();
          const card = document.createElement("div");
          card.className = "donation-card";
          card.innerHTML = `
            <h3>${data.foodType}</h3>
            <p><strong>Quantity:</strong> ${data.quantity}</p>
            <p><strong>Pickup Time:</strong> ${data.pickupTime}</p>
            <p><strong>Location:</strong> ${data.address}, ${data.area}, ${data.city}, ${data.state} - ${data.pincode}</p>
            <p><strong>Status:</strong> <span class="status-${data.status === "claimed" ? "claimed" : "unclaimed"}">${data.status}</span></p>
          `;
          list.appendChild(card);
        });
      })
      .catch(error => {
        console.error("Error fetching donations:", error);
      });

  } else {
    alert("Please login to view your dashboard.");
    window.location.href = "donor-login.html";
  }
});

// Logout function
function logout() {
  auth.signOut().then(() => {
    window.location.href = "index.html";
  });
}
