/**
 * Firebase Configuration - Centralized Configuration File
 * 
 * This file contains the Firebase configuration for the entire application.
 * All Firebase initialization should import from this file to ensure consistency.
 * 
 * SECURITY NOTE: Firebase config values are loaded from app.json (extra.firebase section).
 * In production, these should be properly secured through EAS environment variables.
 */

import Constants from 'expo-constants';

// Firebase configuration - loaded from app.json
const firebaseConfig = Constants.expoConfig?.extra?.firebase || {
  apiKey: "AIzaSyBvak56MOiHl2hr_ix36gsDU6u5dFdIEkw",
  authDomain: "t-rex-5b17f.firebaseapp.com",
  projectId: "t-rex-5b17f",
  storageBucket: "t-rex-5b17f.firebasestorage.app",
  messagingSenderId: "37814615065",
  appId: "1:37814615065:android:3b39b3622c8fbc0358fe88",
};

export default firebaseConfig;
