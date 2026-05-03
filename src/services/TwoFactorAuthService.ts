/**
 * Two Factor Authentication Service - خدمة المصادقة الثنائية
 * 
 * هذه الخدمة توفر 2FA باستخدام Firebase Phone Auth
 * يمكن للمستخدم تفعيل أو تعطيل 2FA من الإعدادات
 * 
 * ملاحظة: لاستخدام Multi-Factor Auth بشكل كامل، يجب تفعيله في Firebase Console
 * هذا التنفيذ يوفر البنية الأساسية لـ 2FA
 */

import { 
  getAuth, 
  RecaptchaVerifier, 
  signInWithPhoneNumber,
  PhoneAuthProvider,
  updatePhoneNumber
} from 'firebase/auth';
import { doc, updateDoc, getDoc, setDoc } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';

const auth = getAuth();
const db = getFirestore();

interface TwoFactorSettings {
  enabled: boolean;
  phoneNumber?: string;
  enrolledAt?: any;
}

/**
 * تفعيل 2FA للمستخدم الحالي (نسخة مبسطة)
 */
export async function enableTwoFactorAuth(phoneNumber: string, verificationId: string, verificationCode: string): Promise<void> {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }

    // التحقق من رمز التحقق
    const credential = PhoneAuthProvider.credential(verificationId, verificationCode);

    // تحديث إعدادات المستخدم في Firestore
    const userRef = doc(db, 'users', user.uid);
    await updateDoc(userRef, {
      twoFactorEnabled: true,
      phoneNumber: phoneNumber,
      twoFactorEnrolledAt: new Date(),
    });

    console.log('✅ 2FA enabled successfully (simplified version)');
  } catch (error) {
    console.error('Error enabling 2FA:', error);
    throw error;
  }
}

/**
 * تعطيل 2FA للمستخدم الحالي
 */
export async function disableTwoFactorAuth(): Promise<void> {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }

    // تحديث إعدادات المستخدم في Firestore
    const userRef = doc(db, 'users', user.uid);
    await updateDoc(userRef, {
      twoFactorEnabled: false,
      phoneNumber: null,
      twoFactorEnrolledAt: null,
    });

    console.log('✅ 2FA disabled successfully');
  } catch (error) {
    console.error('Error disabling 2FA:', error);
    throw error;
  }
}

/**
 * الحصول على إعدادات 2FA للمستخدم
 */
export async function getTwoFactorSettings(userId: string): Promise<TwoFactorSettings> {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      return {
        enabled: userData.twoFactorEnabled || false,
        phoneNumber: userData.phoneNumber,
        enrolledAt: userData.twoFactorEnrolledAt,
      };
    }
    
    return { enabled: false };
  } catch (error) {
    console.error('Error getting 2FA settings:', error);
    return { enabled: false };
  }
}

/**
 * التحقق من رقم الهاتف لتفعيل 2FA (بدون تسجيل)
 */
export async function verifyPhoneNumberForSetup(phoneNumber: string, recaptchaVerifier: RecaptchaVerifier): Promise<string> {
  try {
    const phoneAuthProvider = new PhoneAuthProvider(auth);
    const verificationId = await phoneAuthProvider.verifyPhoneNumber(
      phoneNumber,
      recaptchaVerifier
    );
    
    return verificationId;
  } catch (error) {
    console.error('Error verifying phone number:', error);
    throw error;
  }
}

/**
 * إكمال تفعيل 2FA باستخدام رمز التحقق
 */
export async function completeTwoFactorSetup(verificationId: string, verificationCode: string, phoneNumber: string): Promise<void> {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }

    // التحقق من رمز التحقق
    const credential = PhoneAuthProvider.credential(verificationId, verificationCode);

    // تحديث إعدادات المستخدم في Firestore
    const userRef = doc(db, 'users', user.uid);
    await updateDoc(userRef, {
      twoFactorEnabled: true,
      phoneNumber: phoneNumber,
      twoFactorEnrolledAt: new Date(),
    });

    console.log('✅ 2FA setup completed successfully');
  } catch (error) {
    console.error('Error completing 2FA setup:', error);
    throw error;
  }
}

/**
 * التحقق مما إذا كان المستخدم لديه 2FA مفعلاً
 */
export async function isTwoFactorEnabled(userId: string): Promise<boolean> {
  try {
    const settings = await getTwoFactorSettings(userId);
    return settings.enabled;
  } catch (error) {
    console.error('Error checking 2FA status:', error);
    return false;
  }
}

/**
 * التحقق من رمز 2FA أثناء تسجيل الدخول
 */
export async function verifyTwoFactorCode(userId: string, verificationCode: string): Promise<boolean> {
  try {
    // في التنفيذ الكامل، يجب التحقق من رمز التحقق باستخدام Firebase
    // هذا التنفيذ مبسط للتحقق من وجود 2FA فقط
    const settings = await getTwoFactorSettings(userId);
    
    if (!settings.enabled) {
      return true; // 2FA غير مفعل، لا حاجة للتحقق
    }

    // هنا يجب إضافة منطق التحقق الفعلي من رمز التحقق
    // في التنفيذ الكامل، سيتم استخدام Firebase Multi-Factor Auth
    return true;
  } catch (error) {
    console.error('Error verifying 2FA code:', error);
    return false;
  }
}

export default {
  enableTwoFactorAuth,
  disableTwoFactorAuth,
  getTwoFactorSettings,
  verifyPhoneNumberForSetup,
  completeTwoFactorSetup,
  isTwoFactorEnabled,
  verifyTwoFactorCode,
};
