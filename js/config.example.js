// config.example.js

const firebaseConfig = {
  apiKey: "YOUR_FIREBASE_API_KEY",
  authDomain: "YOUR_FIREBASE_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const donorNotifyEmailJS = {
  serviceID: "YOUR_SERVICE_ID",
  templateID: "YOUR_TEMPLATE_ID",
  publicKey: "YOUR_PUBLIC_KEY"
};

const ngoNotifyEmailJS = {
  serviceID: "YOUR_SERVICE_ID",
  templateID: "YOUR_TEMPLATE_ID",
  publicKey: "YOUR_PUBLIC_KEY"
};

export { firebaseConfig, donorNotifyEmailJS, ngoNotifyEmailJS };
