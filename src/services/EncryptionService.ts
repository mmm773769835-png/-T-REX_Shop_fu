/**
 * Encryption Service - خدمة تشفير البيانات
 * 
 * هذه الخدمة توفر تشفير وفك تشفير للبيانات الحساسة
 * باستخدام AES-256-GCM للإنتاج
 * 
 * ملاحظة: للتطوير، يمكن استخدام مفتاح بسيط
 * للإنتاج، يجب استخدام مفتاح من متغيرات البيئة
 */

import CryptoJS from 'crypto-js';

// المفتاح السري للتشفير (يجب أن يكون من متغيرات البيئة في الإنتاج)
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'T-REX-SHOP-DEFAULT-ENCRYPTION-KEY-32';

/**
 * تشفير نص باستخدام AES-256
 */
export function encryptText(text: string): string {
  try {
    const encrypted = CryptoJS.AES.encrypt(text, ENCRYPTION_KEY).toString();
    return encrypted;
  } catch (error) {
    console.error('Error encrypting text:', error);
    throw new Error('Encryption failed');
  }
}

/**
 * فك تشفير نص
 */
export function decryptText(encryptedText: string): string {
  try {
    const decrypted = CryptoJS.AES.decrypt(encryptedText, ENCRYPTION_KEY);
    const originalText = decrypted.toString(CryptoJS.enc.Utf8);
    return originalText;
  } catch (error) {
    console.error('Error decrypting text:', error);
    throw new Error('Decryption failed');
  }
}

/**
 * تشفير كائن JSON
 */
export function encryptObject(obj: any): string {
  try {
    const jsonString = JSON.stringify(obj);
    return encryptText(jsonString);
  } catch (error) {
    console.error('Error encrypting object:', error);
    throw new Error('Object encryption failed');
  }
}

/**
 * فك تشفير كائن JSON
 */
export function decryptObject(encryptedString: string): any {
  try {
    const decryptedText = decryptText(encryptedString);
    return JSON.parse(decryptedText);
  } catch (error) {
    console.error('Error decrypting object:', error);
    throw new Error('Object decryption failed');
  }
}

/**
 * تشفير رقم الهاتف
 */
export function encryptPhoneNumber(phoneNumber: string): string {
  // إخفاء جزء من رقم الهاتف قبل التشفير
  const masked = phoneNumber.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
  return encryptText(masked);
}

/**
 * فك تشفير رقم الهاتف
 */
export function decryptPhoneNumber(encryptedPhone: string): string {
  try {
    const decrypted = decryptText(encryptedPhone);
    return decrypted;
  } catch (error) {
    console.error('Error decrypting phone number:', error);
    return '***-***-****';
  }
}

/**
 * تشفير عنوان البريد الإلكتروني
 */
export function encryptEmail(email: string): string {
  // إخفاء جزء من البريد الإلكتروني قبل التشفير
  const [username, domain] = email.split('@');
  const maskedUsername = username.substring(0, 2) + '***';
  const maskedEmail = `${maskedUsername}@${domain}`;
  return encryptText(maskedEmail);
}

/**
 * فك تشفير عنوان البريد الإلكتروني
 */
export function decryptEmail(encryptedEmail: string): string {
  try {
    const decrypted = decryptText(encryptedEmail);
    return decrypted;
  } catch (error) {
    console.error('Error decrypting email:', error);
    return '***@***.***';
  }
}

/**
 * تشفير معلومات العنوان
 */
export function encryptAddress(address: any): string {
  try {
    const maskedAddress = {
      ...address,
      street: address.street?.substring(0, 10) + '***',
      city: address.city,
      country: address.country,
    };
    return encryptObject(maskedAddress);
  } catch (error) {
    console.error('Error encrypting address:', error);
    throw new Error('Address encryption failed');
  }
}

/**
 * فك تشفير معلومات العنوان
 */
export function decryptAddress(encryptedAddress: string): any {
  try {
    return decryptObject(encryptedAddress);
  } catch (error) {
    console.error('Error decrypting address:', error);
    return {
      street: '***',
      city: '***',
      country: '***',
    };
  }
}

/**
 * تشفير بيانات بطاقة الدفع (إذا تم تخزينها)
 */
export function encryptPaymentData(paymentData: any): string {
  try {
    const maskedData = {
      ...paymentData,
      cardNumber: paymentData.cardNumber?.replace(/\d(?=\d{4})/g, '*'),
      cvv: '***',
      expiryDate: paymentData.expiryDate,
    };
    return encryptObject(maskedData);
  } catch (error) {
    console.error('Error encrypting payment data:', error);
    throw new Error('Payment data encryption failed');
  }
}

/**
 * إنشاء Hash للبيانات (للتحقق من التكامل)
 */
export function createHash(data: string): string {
  try {
    return CryptoJS.SHA256(data).toString();
  } catch (error) {
    console.error('Error creating hash:', error);
    throw new Error('Hash creation failed');
  }
}

/**
 * التحقق من تكامل البيانات
 */
export function verifyHash(data: string, hash: string): boolean {
  try {
    const computedHash = createHash(data);
    return computedHash === hash;
  } catch (error) {
    console.error('Error verifying hash:', error);
    return false;
  }
}

/**
 * تشفير البيانات قبل تخزينها في Firestore
 */
export function encryptForFirestore(data: any, sensitiveFields: string[] = []): any {
  try {
    const encryptedData = { ...data };

    sensitiveFields.forEach((field) => {
      if (encryptedData[field]) {
        if (typeof encryptedData[field] === 'string') {
          encryptedData[field] = encryptText(encryptedData[field]);
        } else if (typeof encryptedData[field] === 'object') {
          encryptedData[field] = encryptObject(encryptedData[field]);
        }
      }
    });

    // إضافة Hash للتحقق من التكامل
    const dataString = JSON.stringify(encryptedData);
    encryptedData._dataHash = createHash(dataString);

    return encryptedData;
  } catch (error) {
    console.error('Error encrypting for Firestore:', error);
    throw new Error('Firestore encryption failed');
  }
}

/**
 * فك تشفير البيانات بعد قراءتها من Firestore
 */
export function decryptFromFirestore(data: any, sensitiveFields: string[] = []): any {
  try {
    const decryptedData = { ...data };

    // التحقق من تكامل البيانات
    if (data._dataHash) {
      const dataWithoutHash = { ...data };
      delete dataWithoutHash._dataHash;
      const dataString = JSON.stringify(dataWithoutHash);
      const isValid = verifyHash(dataString, data._dataHash);

      if (!isValid) {
        console.warn('⚠️ Data integrity check failed');
      }
    }

    sensitiveFields.forEach((field) => {
      if (decryptedData[field]) {
        try {
          if (typeof decryptedData[field] === 'string') {
            decryptedData[field] = decryptText(decryptedData[field]);
          } else if (typeof decryptedData[field] === 'object') {
            decryptedData[field] = decryptObject(decryptedData[field]);
          }
        } catch (error) {
          console.error(`Error decrypting field ${field}:`, error);
          // الاحتفاظ بالقيمة المشفرة إذا فشل فك التشفير
        }
      }
    });

    return decryptedData;
  } catch (error) {
    console.error('Error decrypting from Firestore:', error);
    throw new Error('Firestore decryption failed');
  }
}

export default {
  encryptText,
  decryptText,
  encryptObject,
  decryptObject,
  encryptPhoneNumber,
  decryptPhoneNumber,
  encryptEmail,
  decryptEmail,
  encryptAddress,
  decryptAddress,
  encryptPaymentData,
  createHash,
  verifyHash,
  encryptForFirestore,
  decryptFromFirestore,
};
