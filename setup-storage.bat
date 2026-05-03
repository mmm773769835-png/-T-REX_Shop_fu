@echo off
cls
title Firebase Storage Setup - T-REX Shop
color 0A

echo =====================================================
echo        FIREBASE STORAGE SETUP FOR T-REX SHOP       
echo =====================================================
echo.

echo [INFO] Checking prerequisites...
echo.

REM Check if Firebase CLI is installed
firebase --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Firebase CLI is not installed.
    echo Please install it by running:
    echo npm install -g firebase-tools
    echo.
    pause
    exit /b 1
)

echo [OK] Firebase CLI is installed.
echo.

REM Check if user is logged in
firebase projects:list | findstr "t-rex-5b17f" >nul 2>&1
if %errorlevel% neq 0 (
    echo [WARNING] You are not logged in to Firebase or project not found.
    echo Please run:
    echo firebase login
    echo.
    echo Then make sure your project "t-rex-5b17f" exists.
    echo.
    pause
    exit /b 1
)

echo [OK] Firebase authentication verified.
echo.

echo =====================================================
echo INSTRUCTIONS TO ACTIVATE FIREBASE STORAGE
echo =====================================================
echo.
echo 1. Open your browser and navigate to:
echo    https://console.firebase.google.com/project/t-rex-5b17f/storage
echo.
echo 2. Click the "Get Started" button
echo 3. Select your preferred Cloud Storage location/region
echo 4. Click "Next" then "Done"
echo 5. Your Storage bucket will be created
echo.
echo 6. After activation, run this command to deploy rules:
echo    firebase deploy --only storage
echo.
echo =====================================================
echo STORAGE RULES (storage.rules)
echo =====================================================
type storage.rules
echo.
echo =====================================================
echo TIPS
echo =====================================================
echo - Make sure you have proper permissions on the Firebase project
echo - Check your internet connection
echo - Ensure Firebase billing is set up (free tier suffices)
echo.
echo Press any key to open the Firebase Console in your browser...
pause >nul

REM Open Firebase Console in default browser
start "" "https://console.firebase.google.com/project/t-rex-5b17f/storage"

echo.
echo [SUCCESS] Browser opened. Please follow the instructions above.
echo.
pause