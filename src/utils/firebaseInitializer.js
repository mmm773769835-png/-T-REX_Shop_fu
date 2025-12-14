// Utility to ensure Firebase is properly initialized before use
import { initializeApp, getApp } from 'firebase/app';
import { Platform } from 'react-native';

// Firebase configuration - using environment variables
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || "AIzaSyBvak56MOiHl2hr_ix36gsDU6u5dFdIEkw",
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || "t-rex-5b17f.firebaseapp.com",
  projectId: process.env.FIREBASE_PROJECT_ID || "t-rex-5b17f",
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "t-rex-5b17f.firebasestorage.app",
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "37814615065",
  appId: process.env.FIREBASE_APP_ID || "1:37814615065:android:3b39b3622c8fbc0358fe88",
};

// Detect platform (web or native)
const isWeb = Platform.OS === 'web' || typeof window !== 'undefined';

// Initialize Firebase app immediately
let app;
try {
  app = initializeApp(firebaseConfig);
  console.log('[DEBUG] Firebase app initialized successfully');
} catch (error) {
  console.warn('[DEBUG] Firebase app may already be initialized:', error.message);
  // If app already exists, use the existing one
  try {
    app = getApp();
    console.log('[DEBUG] Using existing Firebase app');
  } catch (getAppError) {
    console.error('[DEBUG] Error getting existing Firebase app:', getAppError);
  }
}

export default app;
export { isWeb };