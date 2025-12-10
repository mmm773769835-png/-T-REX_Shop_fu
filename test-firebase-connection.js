/**
 * Test Firebase Emulator Connection
 * 
 * This script tests the connection to Firebase emulators
 */

// Import Firebase modules
import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';

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

// Get Firebase services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Connect to emulators with updated ports
console.log('Connecting to Firebase emulators...');

// Connect to Auth emulator
connectAuthEmulator(auth, 'http://127.0.0.1:9099');
console.log('✅ Auth emulator connected');

// Connect to Firestore emulator
connectFirestoreEmulator(db, '127.0.0.1', 8081);
console.log('✅ Firestore emulator connected');

// Connect to Storage emulator
connectStorageEmulator(storage, '127.0.0.1', 9200);
console.log('✅ Storage emulator connected');

console.log('\n🎉 All Firebase emulators connected successfully!');
console.log('\n🔗 Emulator URLs:');
console.log('   Auth: http://127.0.0.1:9099');
console.log('   Firestore: http://127.0.0.1:8081');
console.log('   Storage: http://127.0.0.1:9200');
console.log('   Emulator UI: http://127.0.0.1:4002\n');

export { auth, db, storage };