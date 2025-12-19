# Script PowerShell para obtener el SHA-1 del keystore de debug
# Necesario para configurar Google Sign-In en Google Cloud Console

Write-Host "🔍 Obteniendo SHA-1 del keystore de debug..." -ForegroundColor Cyan
Write-Host ""

Set-Location android

# Obtener SHA-1 del keystore de debug
.\gradlew.bat signingReport 2>$null | Select-String -Pattern "SHA1:" | Select-Object -First 1

Write-Host ""
Write-Host "✅ Copia este SHA-1 y agrégalo en Google Cloud Console:" -ForegroundColor Green
Write-Host "   1. Ve a Google Cloud Console → APIs & Services → Credentials"
Write-Host "   2. Selecciona tu Android OAuth 2.0 Client ID"
Write-Host "   3. Agrega el SHA-1 en 'SHA-1 certificate fingerprint'"
Write-Host ""

Set-Location ..

