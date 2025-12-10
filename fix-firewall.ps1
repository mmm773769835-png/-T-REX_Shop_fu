# PowerShell script to fix firewall issues for T-REX Shop server
Write-Host "🔧 Checking firewall settings for T-REX Shop server..." -ForegroundColor Cyan

# Check if port 4001 is blocked
Write-Host "🔍 Checking if port 4001 is accessible..." -ForegroundColor Yellow
$firewallRule = Get-NetFirewallRule -DisplayName "T-REX Shop Server" -ErrorAction SilentlyContinue

if ($firewallRule) {
    Write-Host "✅ Firewall rule already exists" -ForegroundColor Green
} else {
    Write-Host "⚠️ Creating firewall exception for port 4001..." -ForegroundColor Yellow
    try {
        New-NetFirewallRule -DisplayName "T-REX Shop Server" -Direction Inbound -Protocol TCP -LocalPort 4001 -Action Allow
        Write-Host "✅ Firewall rule created successfully!" -ForegroundColor Green
    } catch {
        Write-Host "❌ Failed to create firewall rule. You may need to run this script as Administrator." -ForegroundColor Red
        Write-Host '💡 Try running PowerShell as Administrator and execute this command:' -ForegroundColor Gray
        Write-Host '   New-NetFirewallRule -DisplayName "T-REX Shop Server" -Direction Inbound -Protocol TCP -LocalPort 4001 -Action Allow' -ForegroundColor Gray
    }
}

# Check if server is running
Write-Host '`n🔍 Checking if server is running on port 4001...' -ForegroundColor Yellow
$netstatOutput = netstat -an | Select-String '4001'
if ($netstatOutput -match 'LISTENING') {
    Write-Host '✅ Server is running and listening on port 4001' -ForegroundColor Green
} else {
    Write-Host '⚠️ Server is not running on port 4001' -ForegroundColor Yellow
    Write-Host '💡 Start the server with: npm start (in the server directory)' -ForegroundColor Gray
}