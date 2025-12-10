import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, sendSignInLinkToEmail, isSignInWithEmailLink, updatePassword, sendPasswordResetEmail, signInWithPhoneNumber, RecaptchaVerifier, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { initializeApp, getApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc, connectFirestoreEmulator, collection, addDoc } from 'firebase/firestore';
import { connectStorageEmulator, getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

// Firebase configuration (same as in HomeV2.tsx)
const firebaseConfig = {
  apiKey: "AIzaSyBvak56MOiHl2hr_ix36gsDU6u5dFdIEkw",
  authDomain: "t-rex-5b17f.firebaseapp.com",
  projectId: "t-rex-5b17f",
  storageBucket: "t-rex-5b17f.firebasestorage.app",
  messagingSenderId: "37814615065",
  appId: "1:37814615065:android:3b39b3622c8fbc0358fe88",
};

// Initialize Firebase with AsyncStorage persistence
const app = initializeApp(firebaseConfig);
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});
const db = getFirestore(app);
const storage = getStorage(app);

// Connect to emulators in development mode with updated ports
if (typeof __DEV__ !== 'undefined' && __DEV__) {
  // Connect to Firestore emulator with new port
  connectFirestoreEmulator(db, '127.0.0.1', 8081);
  
  // Connect to Storage emulator with new port
  connectStorageEmulator(storage, '127.0.0.1', 9200);
  
  console.log('🔌 Connected to Firebase emulators');
  console.log('📚 Firestore Emulator: 127.0.0.1:8081');
  console.log('💾 Storage Emulator: 127.0.0.1:9200');
}

/**
 * Sign in with email and password
 * @param {string} email - User's email
 * @param {string} password - User's password
 */
export const signInWithEmail = async (email, password) => {
  try {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { success: false, message: '❌ عنوان البريد الإلكتروني غير صحيح' };
    }
    
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Get additional user data from Firestore
    const userDoc = await getDoc(doc(db, "users", user.uid));
    const userData = userDoc.exists() ? userDoc.data() : {};
    
    return { 
      success: true, 
      user: {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        phoneNumber: user.phoneNumber,
        ...userData
      },
      message: '✅ تم تسجيل الدخول بنجاح'
    };
  } catch (error) {
    console.error('❌ خطأ أثناء تسجيل الدخول:', error.code, error.message);
    let errorMessage = 'حدث خطأ أثناء تسجيل الدخول';
    
    switch (error.code) {
      case 'auth/user-not-found':
        errorMessage = 'لم يتم العثور على مستخدم بهذا البريد الإلكتروني';
        break;
      case 'auth/wrong-password':
        errorMessage = 'كلمة المرور غير صحيحة';
        break;
      case 'auth/invalid-email':
        errorMessage = 'عنوان البريد الإلكتروني غير صالح';
        break;
      case 'auth/user-disabled':
        errorMessage = 'تم تعطيل هذا الحساب';
        break;
      default:
        errorMessage = 'فشل تسجيل الدخول. يرجى المحاولة مرة أخرى';
    }
    
    return { success: false, message: errorMessage };
  }
};

/**
 * Sign up with email and password
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @param {Object} additionalData - Additional user data (name, phone, etc.)
 */
export const signUpWithEmail = async (email, password, additionalData = {}) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Save additional user data to Firestore
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      email: user.email,
      createdAt: new Date(),
      ...additionalData
    });
    
    return { 
      success: true, 
      user: {
        uid: user.uid,
        email: user.email,
        ...additionalData
      },
      message: '✅ تم إنشاء الحساب بنجاح'
    };
  } catch (error) {
    console.error('❌ خطأ أثناء إنشاء الحساب:', error.code, error.message);
    let errorMessage = 'حدث خطأ أثناء إنشاء الحساب';
    
    switch (error.code) {
      case 'auth/email-already-in-use':
        errorMessage = 'هذا البريد الإلكتروني مستخدم بالفعل';
        break;
      case 'auth/invalid-email':
        errorMessage = 'عنوان البريد الإلكتروني غير صالح';
        break;
      case 'auth/operation-not-allowed':
        errorMessage = 'تسجيل الحساب معطل حالياً';
        break;
      case 'auth/weak-password':
        errorMessage = 'كلمة المرور ضعيفة جداً';
        break;
      default:
        errorMessage = 'فشل إنشاء الحساب. يرجى المحاولة مرة أخرى';
    }
    
    return { success: false, message: errorMessage };
  }
};

/**
 * Sign in with phone number (OTP)
 * @param {string} phoneNumber - User's phone number
 * @param {RecaptchaVerifier} recaptchaVerifier - Recaptcha verifier
 */
export const signInWithPhone = async (phoneNumber, recaptchaVerifier) => {
  try {
    // @ts-ignore
    const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
    return { 
      success: true, 
      confirmationResult,
      message: '✅ تم إرسال رمز التحقق إلى هاتفك'
    };
  } catch (error) {
    console.error('❌ خطأ أثناء إرسال رمز التحقق:', error.code, error.message);
    let errorMessage = 'حدث خطأ أثناء إرسال رمز التحقق';
    
    switch (error.code) {
      case 'auth/invalid-phone-number':
        errorMessage = 'رقم الهاتف غير صالح';
        break;
      case 'auth/too-many-requests':
        errorMessage = 'تم إرسال العديد من الطلبات. يرجى المحاولة لاحقاً';
        break;
      case 'auth/quota-exceeded':
        errorMessage = 'تم تجاوز الحد الأقصى لعدد الطلبات';
        break;
      case 'auth/operation-not-allowed':
        errorMessage = 'خدمة المصادقة عبر الهاتف غير مفعلة في النظام. يرجى التواصل مع المسؤول.';
        break;
      case 'ERR_FIREBASE_RECAPTCHA_CANCEL':
        errorMessage = 'تم إلغاء عملية التحقق. يرجى المحاولة مرة أخرى والانتهاء من التحقق الأمني.';
        break;
      default:
        errorMessage = 'فشل إرسال رمز التحقق. يرجى المحاولة مرة أخرى';
    }
    
    return { success: false, message: errorMessage };
  }
};

/**
 * Confirm phone sign in with OTP code
 * @param {Object} confirmationResult - Confirmation result from signInWithPhone
 * @param {string} code - OTP code
 */
export const confirmPhoneSignIn = async (confirmationResult, code) => {
  try {
    // @ts-ignore
    const userCredential = await confirmationResult.confirm(code);
    const user = userCredential.user;
    
    // Get additional user data from Firestore
    const userDoc = await getDoc(doc(db, "users", user.uid));
    const userData = userDoc.exists() ? userDoc.data() : {};
    
    return { 
      success: true, 
      user: {
        uid: user.uid,
        email: user.email,
        phoneNumber: user.phoneNumber,
        ...userData
      },
      message: '✅ تم التحقق بنجاح'
    };
  } catch (error) {
    console.error('❌ خطأ أثناء التحقق من الرمز:', error.code, error.message);
    let errorMessage = 'رمز التحقق غير صحيح';
    
    switch (error.code) {
      case 'auth/invalid-verification-code':
        errorMessage = 'رمز التحقق غير صحيح';
        break;
      case 'auth/session-expired':
        errorMessage = 'انتهت صلاحية جلسة التحقق';
        break;
      default:
        errorMessage = 'فشل التحقق من الرمز. يرجى المحاولة مرة أخرى';
    }
    
    return { success: false, message: errorMessage };
  }
};

/**
 * Sign out the current user
 */
export const signOutUser = async () => {
  try {
    await signOut(auth);
    return { success: true, message: '✅ تم تسجيل الخروج بنجاح' };
  } catch (error) {
    console.error('❌ خطأ أثناء تسجيل الخروج:', error.message);
    return { success: false, message: 'فشل تسجيل الخروج. يرجى المحاولة مرة أخرى' };
  }
};

/**
 * Send password reset email
 * @param {string} email - User's email
 */
export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true, message: '✅ تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني' };
  } catch (error) {
    console.error('❌ خطأ أثناء إعادة تعيين كلمة المرور:', error.code, error.message);
    let errorMessage = 'حدث خطأ أثناء إعادة تعيين كلمة المرور';
    
    switch (error.code) {
      case 'auth/user-not-found':
        errorMessage = 'لم يتم العثور على مستخدم بهذا البريد الإلكتروني';
        break;
      case 'auth/invalid-email':
        errorMessage = 'عنوان البريد الإلكتروني غير صالح';
        break;
      default:
        errorMessage = 'فشل إعادة تعيين كلمة المرور. يرجى المحاولة مرة أخرى';
    }
    
    return { success: false, message: errorMessage };
  }
};

/**
 * Get current authenticated user
 */
export const getCurrentUser = () => {
  return auth.currentUser;
};

/**
 * Listen for authentication state changes
 * @param {Function} callback - Callback function to handle auth state changes
 */
export const onAuthStateChanged = (callback) => {
  return auth.onAuthStateChanged(callback);
};

export default {
  signInWithEmail,
  signUpWithEmail,
  signInWithPhone,
  confirmPhoneSignIn,
  signOutUser,
  resetPassword,
  getCurrentUser,
  onAuthStateChanged
};

// Export Firebase instances and functions for use in other components
export { 
  auth, 
  db, 
  storage,
  // Firestore functions
  collection,
  addDoc,
  doc,
  setDoc,
  getDoc,
  // Storage functions
  ref,
  uploadBytes,
  getDownloadURL
};
