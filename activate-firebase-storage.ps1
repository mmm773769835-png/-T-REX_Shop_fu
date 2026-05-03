# Script to activate Firebase Storage for T-REX Shop project
# Author: Assistant
# Date: $(Get-Date -Format "yyyy-MM-dd")

Write-Host "🚀 Starting Firebase Storage Activation Script..." -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Yellow

# Check if Firebase CLI is installed
Write-Host "🔍 Checking Firebase CLI installation..." -ForegroundColor Cyan
try {
    $firebaseVersion = firebase --version
    Write-Host "✅ Firebase CLI version $firebaseVersion found" -ForegroundColor Green
} catch {
    Write-Host "❌ Firebase CLI not found. Please install it first:" -ForegroundColor Red
    Write-Host "   Run: npm install -g firebase-tools" -ForegroundColor Yellow
    exit 1
}

# Check if user is logged in to Firebase
Write-Host "👤 Checking Firebase authentication..." -ForegroundColor Cyan
try {
    $user = firebase projects:list | Select-String -Pattern "t-rex-5b17f"
    if ($user) {
        Write-Host "✅ Already logged in to Firebase" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Not logged in. Please run 'firebase login' first" -ForegroundColor Yellow
        exit 1
    }
} catch {
    Write-Host "⚠️  Unable to verify Firebase login status" -ForegroundColor Yellow
}

# Display project information
Write-Host "📋 Project Information:" -ForegroundColor Cyan
Write-Host "   Project ID: t-rex-5b17f" -ForegroundColor White
Write-Host "   Project Name: T-REX Shop" -ForegroundColor White

# Instructions for manual activation
Write-Host "`n📋 MANUAL ACTIVATION INSTRUCTIONS:" -ForegroundColor Magenta
Write-Host "================================" -ForegroundColor Magenta
Write-Host "1. Open your web browser and go to:" -ForegroundColor Yellow
Write-Host "   https://console.firebase.google.com/project/t-rex-5b17f/storage" -ForegroundColor White
Write-Host "`n2. Click on 'Get Started' button" -ForegroundColor Yellow
Write-Host "3. Select your preferred Cloud Storage location/region" -ForegroundColor Yellow
Write-Host "4. Click 'Next' then 'Done'" -ForegroundColor Yellow
Write-Host "5. Your Storage bucket will be created automatically" -ForegroundColor Yellow

# Show current storage rules
Write-Host "`n📄 CURRENT STORAGE RULES:" -ForegroundColor Cyan
Write-Host "========================" -ForegroundColor Cyan
Get-Content "storage.rules" | ForEach-Object { Write-Host "   $_" -ForegroundColor White }

Write-Host "`n🔧 DEPLOYMENT COMMAND:" -ForegroundColor Cyan
Write-Host "=====================" -ForegroundColor Cyan
Write-Host "After activating Storage in Firebase Console, run:" -ForegroundColor Yellow
Write-Host "   firebase deploy --only storage" -ForegroundColor White

Write-Host "`n💡 TIPS:" -ForegroundColor Cyan
Write-Host "=========" -ForegroundColor Cyan
Write-Host "• Make sure you have proper permissions on the Firebase project" -ForegroundColor White
Write-Host "• Check your internet connection before proceeding" -ForegroundColor White
Write-Host "• Ensure your Firebase billing is set up (free tier is sufficient)" -ForegroundColor White

Write-Host "`n✅ Script completed successfully!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host "Please follow the manual instructions above to complete the setup." -ForegroundColor Yellow