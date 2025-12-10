// إعداد رابط السيرفر
// ✅ يتم تحميل العنوان من ملف الإعدادات المركزي: config/api.config.js
import API_URL from '../../config/api.config.js';
const API = API_URL;

// Timeout function for fetch requests
const fetchWithTimeout = (url: string, options: RequestInit, timeout = 10000): Promise<Response> => {
  return Promise.race([
    fetch(url, options),
    new Promise<Response>((_, reject) =>
      setTimeout(() => reject(new Error('timeout')), timeout)
    )
  ]) as Promise<Response>;
};

export async function requestOtp(username: string, password: string, phone: string, via: string = 'both') {
  try {
    const res = await fetchWithTimeout(API + '/api/auth/request-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, phone, via })
    }, 15000); // 15 seconds timeout
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${res.status}`);
    }
    
    return res.json();
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'timeout') {
        throw new Error('انتهت مدة الطلب. يرجى التحقق من الاتصال بالإنترنت والمحاولة مرة أخرى.');
      }
      throw error;
    }
    throw new Error('فشل في إرسال الطلب. يرجى المحاولة مرة أخرى.');
  }
}

export async function verifyOtp(phone: string, code: string) {
  try {
    const res = await fetchWithTimeout(API + '/api/auth/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, code })
    }, 15000); // 15 seconds timeout
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${res.status}`);
    }
    
    return res.json();
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'timeout') {
        throw new Error('انتهت مدة الطلب. يرجى التحقق من الاتصال بالإنترنت والمحاولة مرة أخرى.');
      }
      throw error;
    }
    throw new Error('فشل في التحقق من الرمز. يرجى المحاولة مرة أخرى.');
  }
}
