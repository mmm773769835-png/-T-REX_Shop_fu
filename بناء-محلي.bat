@echo off
chcp 65001 >nul
echo ========================================
echo    بناء T-REX Shop محلياً (Local Build)
echo ========================================
echo.
echo هذا الأمر سيبني التطبيق على جهازك المحلي
echo بدون استخدام خوادم EAS (مجاني تماماً)
echo.
echo ⚠️  المتطلبات:
echo    - Android Studio مثبت
echo    - Android SDK مثبت
echo    - متغيرات البيئة ANDROID_HOME معدّة
echo.

cd /d "%~dp0"

echo جاري بدء البناء المحلي...
echo.

eas build --platform android --profile preview --local

echo.
echo ========================================
echo    اكتمل البناء (أو فشل)
echo ========================================
pause
