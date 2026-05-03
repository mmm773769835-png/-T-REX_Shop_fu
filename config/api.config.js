/**
 * إعدادات API - رابط السيرفر
 * 
 * حدّث هذا الملف لتغيير عنوان السيرفر في كل التطبيق
 */

// ⚠️ مهم: حدّث هذه القيم حسب سيرفرك

// إذا كان السيرفر يعمل محلياً (على نفس الجهاز)
const USE_LOCAL_SERVER = true; // ✅ سيرفر محلي على نفس الشبكة

// إذا كان السيرفر على سيرفر خارجي (مثلاً: https://api.example.com)
const PRODUCTION_API_URL = "https://your-server.example.com";

// إذا كان السيرفر محلياً - اختر أحد الخيارات:

// الخيار 1: استخدم IP address (للهاتف الحقيقي أو Android Emulator)
const LOCAL_IP = '172.20.44.8'; // ✅ IP address من شبكة WiFi (محدث من ipconfig)
const USE_IP = true; // ✅ مفعّل لاستخدام IP address

// الخيار 2: استخدم localhost (للـ iOS Simulator أو إذا كان التطبيق على نفس الجهاز)
const USE_LOCALHOST = false; // معطّل

// المنفذ (Port)
const PORT = 3000; // ✅ سيرفر rrst يعمل على المنفذ 3000

// ========================================
// لا تعدّل ما بعد هذا السطر
// ========================================

let API_URL;

if (typeof __DEV__ !== 'undefined' && __DEV__) {
  // وضع التطوير
  if (!USE_LOCAL_SERVER) {
    API_URL = PRODUCTION_API_URL;
  } else if (USE_IP && LOCAL_IP !== 'YOUR_IP_HERE') {
    API_URL = `http://${LOCAL_IP}:${PORT}`;
  } else {
    API_URL = `http://localhost:${PORT}`;
  }
} else {
  // وضع الإنتاج
  API_URL = PRODUCTION_API_URL;
}

// Export for React Native (ES6)
const apiUrl = API_URL;
export default apiUrl;

// طباعة عنوان السيرفر المستخدم (للتأكد)
if (typeof __DEV__ !== 'undefined' && __DEV__) {
  console.log('🔗 API Server URL:', API_URL);
}