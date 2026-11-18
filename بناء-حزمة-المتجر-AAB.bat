@echo off
chcp 65001 >nul
echo ===================================================
echo     بناء حزمة Google Play الرسمية (App Bundle - AAB)
echo     T-REX SHOP - v2.5.0 (versionCode: 2)
echo ===================================================
echo.

set JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-17.0.13.11-hotspot
cd /d "%~dp0\android"

echo جاري بناء ملف الحزمة AAB للإنتاج...
call gradlew bundleRelease

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ===================================================
    echo  [نجاح] تم بناء ملف الحزمة AAB بنجاح!
    echo  المسار: android\app\build\outputs\bundle\release\app-release.aab
    echo  يمكنك الآن رفع هذا الملف مباشرة إلى Google Play Console
    echo ===================================================
) else (
    echo.
    echo ===================================================
    echo  [خطأ] فشل البناء! يرجى مراجعة تفاصيل الخطأ أعلاه.
    echo ===================================================
)

pause
