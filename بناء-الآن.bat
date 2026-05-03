@echo off
chcp 65001 >nul
echo ========================================
echo    بناء T-REX Shop - Preview
echo ========================================
echo.
echo جاري بدء عملية البناء...
echo.

cd /d "%~dp0"
eas build --platform android --profile preview

echo.
echo ========================================
echo    اكتمل البناء (أو فشل)
echo ========================================
pause
