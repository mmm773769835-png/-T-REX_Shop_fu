const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

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

// Test connection
async function testConnection() {
  try {
    console.log('Testing Firebase connection...');
    const querySnapshot = await getDocs(collection(db, "products"));
    console.log(`Successfully connected! Found ${querySnapshot.size} products.`);
  } catch (error) {
    console.error('Firebase connection error:', error);
  }
}

testConnection();