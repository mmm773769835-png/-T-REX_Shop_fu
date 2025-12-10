// إعداد رابط السيرفر المحلي
// ✅ يتم تحميل العنوان من ملف الإعدادات المركزي: config/api.config.js
import API_URL from '../../config/api.config.js';
const BASE_URL = API_URL;

export const API = {
  REQUEST_OTP: `${BASE_URL}/api/auth/request-otp`,
  VERIFY_OTP: `${BASE_URL}/api/auth/verify-otp`,
  CHECK_AUTH: `${BASE_URL}/api/auth/check`,
  STATUS: `${BASE_URL}/api/status`
};
