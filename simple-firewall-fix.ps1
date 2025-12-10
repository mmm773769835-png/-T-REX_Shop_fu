# Fix firewall for T-REX Shop server
Write-Host "Creating firewall rule for T-REX Shop server on port 4001..."
New-NetFirewallRule -DisplayName "T-REX Shop Server" -Direction Inbound -Protocol TCP -LocalPort 4001 -Action Allow
Write-Host "Firewall rule created successfully!"