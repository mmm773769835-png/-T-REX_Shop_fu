/**
 * Firebase Configuration for Emulator Connection
 * 
 * This configuration connects the app to local Firebase emulators
 * during development for testing purposes.
 */

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBvak56MOiHl2hr_ix36gsDU6u5dFdIEkw",
  authDomain: "t-rex-5b17f.firebaseapp.com",
  projectId: "t-rex-5b17f",
  storageBucket: "t-rex-5b17f.firebasestorage.app",
  messagingSenderId: "37814615065",
  appId: "1:37814615065:android:3b39b3622c8fbc0358fe88",
};

export default firebaseConfig;

// Emulator configuration with updated ports
export const emulatorConfig = {
  firestore: {
    host: '127.0.0.1',
    port: 8082
  },
  storage: {
    host: '127.0.0.1',
    port: 9200
  },
  functions: {
    host: '127.0.0.1',
    port: 5001
  }
};

// Check if we're in development mode
export const isDevelopment = typeof __DEV__ !== 'undefined' && __DEV__;