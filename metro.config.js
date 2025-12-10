const { getDefaultConfig } = require('expo/metro-config');

const defaultConfig = getDefaultConfig(__dirname);

// إضافة دعم لملفات cjs
defaultConfig.resolver.sourceExts.push('cjs');

// تعطيل تصدير الحزم غير المستقرة لحل مشكلة Firebase
defaultConfig.resolver.unstable_enablePackageExports = false;

module.exports = defaultConfig;