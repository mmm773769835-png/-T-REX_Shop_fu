# بناء T-REX Shop - Preview
Write-Host "========================================" -ForegroundColor Green
Write-Host "   بناء T-REX Shop - Preview" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

Write-Host "جاري بدء عملية البناء..." -ForegroundColor Yellow
Write-Host ""

# تشغيل أمر البناء
eas build --platform android --profile preview

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "   اكتمل البناء (أو فشل)" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "اضغط أي مفتاح للمتابعة..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
