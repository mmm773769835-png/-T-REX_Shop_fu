@echo off
chcp 65001 >nul
echo ========================================
echo    Build and Upload to Firebase App Distribution
echo ========================================
echo.

cd /d "%~dp0"

powershell.exe -ExecutionPolicy Bypass -File "%~dp0بناء-ورفع-فيرباس.ps1" %*

pause
