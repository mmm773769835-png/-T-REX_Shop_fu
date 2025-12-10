import axios from 'axios';
import API_URL from '../config/api.config.js';

// ✅ رابط السيرفر يتم تحميله من ملف الإعدادات المركزي
// حدّث config/api.config.js لتغيير عنوان السيرفر

/**
 * إرسال رمز OTP للمستخدم
 * @param {string} username - اسم المستخدم (يجب أن يكون 'owner' للأدمن)
 * @param {string} password - كلمة المرور
 * @param {string} phone - رقم الهاتف
 * @param {string} via - طريقة الإرسال: 'sms', 'whatsapp', أو 'both'
 */
export const sendOTP = async (username, password, phone, via = 'both') => {
  try {
    console.log(`📤 إرسال طلب OTP إلى: ${API_URL}/send-otp`);
    console.log(`📱 الهاتف: ${phone}`);
    
    const response = await axios.post(`${API_URL}/send-otp`, {
      phone,
    });
    
    if (response.data.success || response.data.status === 'pending') {
      return { 
        success: true, 
        message: '✅ تم إرسال رمز التحقق بنجاح'
      };
    } else {
      return { success: false, message: '❌ فشل في إرسال رمز التحقق' };
    }
  } catch (error) {
    console.error('❌ خطأ أثناء إرسال OTP:', error.response?.data || error.message);
    const errorMsg = error.response?.data?.error || 'حدث خطأ في الاتصال بالسيرفر';
    return { success: false, message: errorMsg };
  }
};

/**
 * التحقق من رمز OTP
 * @param {string} phone - رقم الهاتف
 * @param {string} code - رمز التحقق
 */
export const verifyOTP = async (phone, code) => {
  try {
    const response = await axios.post(`${API_URL}/verify-otp`, {
      phone,
      code,
    });
    
    if (response.data.success || response.data.status === 'approved') {
      return {
        success: true,
        message: '🎉 تم التحقق بنجاح',
        token: response.data.token || 'verified', // JWT token
      };
    } else {
      return { success: false, message: '❌ رمز غير صحيح' };
    }
  } catch (error) {
    console.error('❌ خطأ أثناء التحقق من OTP:', error.response?.data || error.message);
    const errorMsg = error.response?.data?.error || 'حدث خطأ في الاتصال بالسيرفر';
    return { success: false, message: errorMsg };
  }
};

/**
 * التحقق من حالة المصادقة (JWT token)
 * @param {string} token - JWT token
 */
export const checkAuth = async (token) => {
  try {
    const response = await axios.get(`${API_URL}/api/auth/check`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    
    if (response.data.ok) {
      return {
        success: true,
        user: response.data.user,
        role: response.data.role,
      };
    } else {
      return { success: false };
    }
  } catch (error) {
    console.error('❌ خطأ أثناء التحقق من المصادقة:', error.response?.data || error.message);
    return { success: false };
  }
};
