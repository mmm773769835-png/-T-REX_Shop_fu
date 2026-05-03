@echo off
chcp 65001 >nul
echo ========================================
echo    بناء APK - T-REX Shop
echo ========================================
echo.

cd /d "%~dp0"

echo جاري التحقق من المتطلبات...
echo.

if not exist "android" (
    echo ❌ مجلد android غير موجود!
    echo.
    echo جاري إنشاء مجلد android...
    npx expo prebuild --platform android
    echo.
)

echo ✅ مجلد android موجود
echo.
echo ⚠️  المتطلبات:
echo    - Android Studio مثبت
echo    - Android SDK مثبت
echo    - JAVA_HOME معدّ
echo.

echo جاري بدء البناء باستخدام Gradle...
echo ⏳ قد يستغرق هذا 5-10 دقائق...
echo.

cd android
call gradlew.bat assembleRelease

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo    ✅ البناء نجح!
    echo ========================================
    echo.
    echo 📦 ملف APK موجود في:
    echo    android\app\build\outputs\apk\release\app-release.apk
    echo.
    echo يمكنك نسخه وتثبيته على أي جهاز Android
    echo.
) else (
    echo.
    echo ========================================
    echo    ❌ البناء فشل
    echo ========================================
    echo.
    echo تحقق من الأخطاء أعلاه
    echo.
)

cd ..
pause
