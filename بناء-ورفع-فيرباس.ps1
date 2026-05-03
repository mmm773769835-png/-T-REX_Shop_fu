# Script to build APK and upload to Firebase App Distribution
# T-REX Shop

param(
    [string]$ReleaseNotes = "New Release - " + (Get-Date -Format "yyyy-MM-dd HH:mm")
)

$ErrorActionPreference = "Stop"

# Set output encoding to UTF-8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "========================================" -ForegroundColor Green
Write-Host "   Build and Upload to Firebase App Distribution" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# Navigate to project directory
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

# Project information
$appId = "1:37814615065:android:3b39b3622c8fbc0358fe88"
$apkPath = "android\app\build\outputs\apk\release\app-release.apk"
$testerGroup = "testers"

Write-Host "Project Info:" -ForegroundColor Yellow
Write-Host "  App ID: $appId" -ForegroundColor Cyan
Write-Host "  Release Notes: $ReleaseNotes" -ForegroundColor Cyan
Write-Host ""

# Check Firebase CLI
Write-Host "Checking Firebase CLI..." -ForegroundColor Yellow
try {
    $firebaseVersion = firebase --version 2>&1
    Write-Host "Firebase CLI installed: $firebaseVersion" -ForegroundColor Green
} catch {
    Write-Host "Firebase CLI not installed!" -ForegroundColor Red
    Write-Host "Install it via: npm install -g firebase-tools" -ForegroundColor Yellow
    exit 1
}

# Check Firebase login
Write-Host ""
Write-Host "Checking Firebase login..." -ForegroundColor Yellow
try {
    $null = firebase projects:list 2>&1 | Out-Null
    Write-Host "Logged in to Firebase" -ForegroundColor Green
} catch {
    Write-Host "Could not verify login status" -ForegroundColor Yellow
    Write-Host "If upload fails, run: firebase login" -ForegroundColor Yellow
}

# Build APK
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "   Step 1: Building APK" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

if (-not (Test-Path "android")) {
    Write-Host "Android folder not found!" -ForegroundColor Red
    Write-Host "Creating android folder..." -ForegroundColor Yellow
    npx expo prebuild --platform android
}

if (-not (Test-Path $apkPath)) {
    Write-Host "Building APK..." -ForegroundColor Yellow
    Write-Host "This may take 5-10 minutes..." -ForegroundColor Cyan
    Write-Host ""
    
    Set-Location android
    & .\gradlew.bat assembleRelease
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "APK build failed!" -ForegroundColor Red
        Set-Location ..
        exit 1
    }
    
    Set-Location ..
    Write-Host ""
    Write-Host "APK built successfully!" -ForegroundColor Green
} else {
    Write-Host "APK file already exists" -ForegroundColor Green
}

Write-Host ""
Write-Host "APK File: $apkPath" -ForegroundColor Cyan
$apkSize = (Get-Item $apkPath).Length / 1MB
Write-Host "  Size: $([math]::Round($apkSize, 2)) MB" -ForegroundColor Cyan
Write-Host ""

# Upload to Firebase App Distribution
Write-Host "========================================" -ForegroundColor Green
Write-Host "   Step 2: Uploading to Firebase" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

Write-Host "Uploading APK to Firebase App Distribution..." -ForegroundColor Yellow
Write-Host ""

try {
    firebase appdistribution:distribute $apkPath `
        --app $appId `
        --groups $testerGroup `
        --release-notes "$ReleaseNotes"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Green
        Write-Host "   Upload Successful!" -ForegroundColor Green
        Write-Host "========================================" -ForegroundColor Green
        Write-Host ""
        Write-Host "App uploaded to Firebase App Distribution" -ForegroundColor Green
        Write-Host "Testers in group '$testerGroup' will receive download link" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Manage testers at:" -ForegroundColor Yellow
        Write-Host "https://console.firebase.google.com/project/t-rex-5b17f/appdistribution" -ForegroundColor Cyan
    } else {
        Write-Host "Upload failed!" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "Error during upload: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Make sure:" -ForegroundColor Yellow
    Write-Host "  1. Firebase App Distribution is enabled in Console" -ForegroundColor Cyan
    Write-Host "  2. Group '$testerGroup' exists" -ForegroundColor Cyan
    Write-Host "  3. You are logged in to Firebase" -ForegroundColor Cyan
    exit 1
}

Write-Host ""
Write-Host "Completed successfully!" -ForegroundColor Green
