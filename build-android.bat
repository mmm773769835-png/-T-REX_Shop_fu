@echo off
title Building T-REX Shop Android App

echo Building T-REX Shop Android App...
echo.

REM Check if npm is available
echo Checking npm installation...
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ✗ npm is not installed or not in PATH
    pause
    exit /b 1
) else (
    echo ✓ npm is available
)

REM Install dependencies
echo.
echo Installing dependencies...
npm install
if %errorlevel% neq 0 (
    echo ✗ Failed to install dependencies
    pause
    exit /b 1
) else (
    echo ✓ Dependencies installed successfully
)

REM Check if Expo is available
echo.
echo Checking Expo installation...
npx expo --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ✗ Expo is not available
    pause
    exit /b 1
) else (
    echo ✓ Expo is available
)

REM Check if EAS CLI is available
echo.
echo Checking EAS CLI installation...
npx eas-cli --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ✗ EAS CLI is not available
    pause
    exit /b 1
) else (
    echo ✓ EAS CLI is available
)

REM Show build options
echo.
echo Select build type:
echo 1. Development Build (for testing with Expo Go)
echo 2. Preview Build (standalone APK for internal testing)
echo 3. Production Build (signed APK/AAB for store)
echo.

set /p choice="Enter your choice (1, 2, or 3): "

if "%choice%"=="1" (
    echo.
    echo Creating Development Build...
    npx eas build --platform android --profile development
) else if "%choice%"=="2" (
    echo.
    echo Creating Preview Build...
    npx eas build --platform android --profile preview
) else if "%choice%"=="3" (
    echo.
    echo Creating Production Build...
    npx eas build --platform android --profile production
) else (
    echo Invalid choice. Exiting...
    pause
    exit /b 1
)

if %errorlevel% equ 0 (
    echo.
    echo ✓ Build completed successfully!
    echo Check your Expo dashboard for the build artifacts.
) else (
    echo.
    echo ✗ Build failed!
    pause
    exit /b 1
)

echo.
echo Android build process completed!
pause