# Stop any existing server processes on port 4001
Write-Host "Stopping any existing server processes on port 4001..." -ForegroundColor Yellow
$connections = Get-NetTCPConnection -LocalPort 4001 -ErrorAction SilentlyContinue
if ($connections) {
    foreach ($connection in $connections) {
        $processId = $connection.OwningProcess
        if ($processId -ne 0) {
            Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
            Write-Host "Stopped process with PID: $processId" -ForegroundColor Green
        }
    }
} else {
    Write-Host "No processes found on port 4001" -ForegroundColor Green
}

# Wait a moment for processes to stop
Start-Sleep -Seconds 2

# Start the server
Write-Host "Starting the OTP server..." -ForegroundColor Yellow
Set-Location -Path "c:\Users\Abo Hamza\Desktop\T-REX_Shop_fu\server"
node index.js