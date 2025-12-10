# Script to update Firebase rules
Write-Host "Updating Firebase Firestore rules..." -ForegroundColor Yellow

# Navigate to project directory
Set-Location -Path "c:\Users\Abo Hamza\Desktop\T-REX_Shop_fu"

# Try to deploy rules using Firebase CLI
try {
    firebase deploy --only firestore:rules
    Write-Host "✅ Firebase rules updated successfully!" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to update Firebase rules via CLI. Please update manually through Firebase Console:" -ForegroundColor Red
    Write-Host "   1. Go to Firebase Console" -ForegroundColor Gray
    Write-Host "   2. Select your project" -ForegroundColor Gray
    Write-Host "   3. Go to Firestore Database" -ForegroundColor Gray
    Write-Host "   4. Click on 'Rules' tab" -ForegroundColor Gray
    Write-Host "   5. Copy the content of firestore.rules file" -ForegroundColor Gray
    Write-Host "   6. Paste it in the editor and publish" -ForegroundColor Gray
}

Write-Host "Current rules content:" -ForegroundColor Cyan
Get-Content "firestore.rules" | Write-Host