# PowerShell script to build Android app for T-REX Shop
Write-Host "Building T-REX Shop Android App..." -ForegroundColor Green

# Check if npm is available
Write-Host "Checking npm installation..." -ForegroundColor Yellow
try {
    npm --version
    Write-Host "✓ npm is available" -ForegroundColor Green
} catch {
    Write-Host "✗ npm is not installed or not in PATH" -ForegroundColor Red
    exit 1
}

# Install dependencies
Write-Host "Installing dependencies..." -ForegroundColor Yellow
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Failed to install dependencies" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Dependencies installed successfully" -ForegroundColor Green

# Check if Expo is available
Write-Host "Checking Expo installation..." -ForegroundColor Yellow
try {
    npx expo --version
    Write-Host "✓ Expo is available" -ForegroundColor Green
} catch {
    Write-Host "✗ Expo is not available" -ForegroundColor Red
    exit 1
}

# Check if EAS CLI is available
Write-Host "Checking EAS CLI installation..." -ForegroundColor Yellow
try {
    npx eas-cli --version
    Write-Host "✓ EAS CLI is available" -ForegroundColor Green
} catch {
    Write-Host "✗ EAS CLI is not available" -ForegroundColor Red
    exit 1
}

# Show build options
Write-Host "`nSelect build type:" -ForegroundColor Cyan
Write-Host "1. Development Build (for testing with Expo Go)"
Write-Host "2. Preview Build (standalone APK for internal testing)"
Write-Host "3. Production Build (signed APK/AAB for store)"

$choice = Read-Host "Enter your choice (1, 2, or 3)"

switch ($choice) {
    1 {
        Write-Host "`nCreating Development Build..." -ForegroundColor Yellow
        npx eas build --platform android --profile development
    }
    2 {
        Write-Host "`nCreating Preview Build..." -ForegroundColor Yellow
        npx eas build --platform android --profile preview
    }
    3 {
        Write-Host "`nCreating Production Build..." -ForegroundColor Yellow
        npx eas build --platform android --profile production
    }
    default {
        Write-Host "Invalid choice. Exiting..." -ForegroundColor Red
        exit 1
    }
}

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✓ Build completed successfully!" -ForegroundColor Green
    Write-Host "Check your Expo dashboard for the build artifacts." -ForegroundColor Cyan
} else {
    Write-Host "`n✗ Build failed!" -ForegroundColor Red
    exit 1
}

Write-Host "`nAndroid build process completed!" -ForegroundColor Green