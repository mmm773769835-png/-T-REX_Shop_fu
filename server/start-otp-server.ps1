# PowerShell script to setup and start OTP server
Write-Host "🔧 Setting up OTP Server..." -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found! Please install Node.js first." -ForegroundColor Red
    exit 1
}

# Change to server directory
Set-Location $PSScriptRoot

# Generate hash
Write-Host "🔐 Generating password hash..." -ForegroundColor Yellow
$hashOutput = node -e "const bcrypt = require('bcrypt'); bcrypt.hash('773769835As', 10).then(h => console.log(h));" 2>&1
Start-Sleep -Seconds 2

# If hash generation failed, create .env manually
$hash = $hashOutput | Select-String -Pattern '^\$2[aby]' | ForEach-Object { $_.Line }

if (-not $hash) {
    Write-Host "⚠️  Could not generate hash automatically." -ForegroundColor Yellow
    Write-Host "Creating .env file manually..." -ForegroundColor Yellow
    
    $envContent = @"
# Server Configuration
PORT=3000

# Admin Credentials
ADMIN_USER=owner
ADMIN_HASH=
# Run: node create-hash.js and copy the output to ADMIN_HASH

# JWT Secret
JWT_SECRET=trex_shop_secret_key_change_in_production_2024

# Twilio Configuration (Optional - Server works in dev mode without it)
# TWILIO_SID=
# TWILIO_AUTH_TOKEN=
# TWILIO_PHONE_NUMBER=
# TWILIO_WHATSAPP_FROM=
"@
    
    $envContent | Out-File -FilePath ".env" -Encoding utf8 -NoNewline
    Write-Host "✅ Created .env file (you need to add ADMIN_HASH manually)" -ForegroundColor Green
    Write-Host ""
    Write-Host "To generate hash, run:" -ForegroundColor Yellow
    Write-Host "  node create-hash.js" -ForegroundColor White
} else {
    Write-Host "✅ Hash generated: $hash" -ForegroundColor Green
    
    $envContent = @"
# Server Configuration
PORT=3000

# Admin Credentials
ADMIN_USER=owner
ADMIN_HASH=$hash

# JWT Secret
JWT_SECRET=trex_shop_secret_key_change_in_production_2024

# Twilio Configuration (Optional - Server works in dev mode without it)
# TWILIO_SID=
# TWILIO_AUTH_TOKEN=
# TWILIO_PHONE_NUMBER=
# TWILIO_WHATSAPP_FROM=
"@
    
    $envContent | Out-File -FilePath ".env" -Encoding utf8 -NoNewline
    Write-Host "✅ Created .env file with hash" -ForegroundColor Green
}

Write-Host ""
Write-Host "🚀 Starting OTP server on port 3000..." -ForegroundColor Cyan
Write-Host "   Server will run in dev mode (OTP codes shown in console)" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Gray
Write-Host ""

# Start server
node index.js


