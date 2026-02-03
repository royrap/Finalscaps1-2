# Fix DNS for Supabase connectivity
# Run this as Administrator

Write-Host "🔧 Changing DNS to Google DNS (8.8.8.8, 8.8.4.4)..." -ForegroundColor Cyan

# Get active network adapter
$adapter = Get-NetAdapter | Where-Object {$_.Status -eq "Up"} | Select-Object -First 1

if ($adapter) {
    Write-Host "Found network adapter: $($adapter.Name)" -ForegroundColor Green
    
    # Set DNS servers
    Set-DnsClientServerAddress -InterfaceIndex $adapter.ifIndex -ServerAddresses ("8.8.8.8","8.8.4.4")
    
    # Flush DNS cache
    ipconfig /flushdns | Out-Null
    
    Write-Host "✅ DNS changed successfully!" -ForegroundColor Green
    Write-Host "Testing Supabase connectivity..." -ForegroundColor Yellow
    
    # Test connection
    $test = Test-NetConnection -ComputerName olxquclxgtrbyxfxxscj.supabase.co -Port 443 -WarningAction SilentlyContinue
    
    if ($test.TcpTestSucceeded) {
        Write-Host "✅ SUCCESS! Can now connect to Supabase" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Still cannot connect. Try restarting your browser/app." -ForegroundColor Yellow
    }
} else {
    Write-Host "❌ No active network adapter found" -ForegroundColor Red
}

Write-Host "`n📝 To revert to automatic DNS later, run:" -ForegroundColor Cyan
Write-Host "Set-DnsClientServerAddress -InterfaceIndex $($adapter.ifIndex) -ResetServerAddresses" -ForegroundColor White
