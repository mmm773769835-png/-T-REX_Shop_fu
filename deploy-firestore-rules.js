// Script to deploy Firebase Firestore rules
const { initializeApp } = require('firebase/app');
const { getFirestore } = require('firebase/firestore');

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBvak56MOiHl2hr_ix36gsDU6u5dFdIEkw",
  authDomain: "t-rex-5b17f.firebaseapp.com",
  projectId: "t-rex-5b17f",
  storageBucket: "t-rex-5b17f.firebasestorage.app",
  messagingSenderId: "37814615065",
  appId: "1:37814615065:android:3b39b3622c8fbc0358fe88",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

console.log("Firebase initialized successfully!");
console.log("Project ID:", firebaseConfig.projectId);

// Instructions for deploying rules
console.log("\nTo deploy Firestore rules:");
console.log("1. Install Firebase CLI: npm install -g firebase-tools");
console.log("2. Login to Firebase: firebase login");
console.log("3. Deploy rules: firebase deploy --only firestore");

// Check if we're in development mode
if (process.env.NODE_ENV === 'development') {
  console.log("\n🔧 Development mode detected");
  console.log("✅ Firestore rules should allow read/write for all in development");
}