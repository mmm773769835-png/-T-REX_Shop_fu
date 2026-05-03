// Utility to ensure Firebase is properly initialized before use
import { getApp } from 'firebase/app';
import { Platform } from 'react-native';

// Detect platform (web or native)
const isWeb = Platform.OS === 'web' || typeof window !== 'undefined';

// Firebase will be initialized in FirebaseAuthService.js only
// This file now only exports the existing app if it exists
let app;
try {
  app = getApp();
  console.log('[DEBUG] Using existing Firebase app');
} catch (error) {
  console.warn('[DEBUG] Firebase app not initialized yet, will be initialized in FirebaseAuthService.js');
  app = null;
}

export default app;
export { isWeb };