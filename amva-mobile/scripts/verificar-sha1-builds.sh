#!/bin/bash

# Script para verificar SHA-1 de builds de EAS
# Uso: ./scripts/verificar-sha1-builds.sh

echo "🔍 Verificando SHA-1 de builds de EAS..."
echo ""

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# SHA-1 configurados en google-services.json
SHA1_DEFAULT="4B:24:0F:1B:6A:E6:3D:71:38:77:D1:E7:69:40:D2:1D:5D:30:7C:40"
SHA1_NUEVO="BC:0C:2C:C3:68:D1:50:C3:7E:07:17:EE:49:8F:D0:35:7D:0F:1E:E3"

echo "📋 SHA-1 configurados en google-services.json:"
echo "  ✅ Default: $SHA1_DEFAULT"
echo "  ✅ Nuevo:   $SHA1_NUEVO"
echo ""

echo "📱 Para verificar qué SHA-1 se usó en cada build:"
echo ""
echo "1️⃣  Método 1: EAS Dashboard (Más fácil)"
echo "   - Abre: https://expo.dev/accounts/[tu-cuenta]/projects/[tu-proyecto]/builds"
echo "   - Haz clic en cada build"
echo "   - Busca 'Signing Key', 'Certificate', o 'SHA-1'"
echo "   - Compara con los SHA-1 arriba"
echo ""

echo "2️⃣  Método 2: EAS CLI"
echo "   cd amva-mobile"
echo "   eas credentials"
echo "   - Selecciona: Android"
echo "   - Selecciona: production (o el profile que usaste)"
echo "   - Selecciona: View credentials"
echo ""

echo "3️⃣  Método 3: Probar directamente"
echo "   - Descarga el APK del build"
echo "   - Instálalo en un dispositivo"
echo "   - Prueba Google OAuth"
echo "   - Si funciona → SHA-1 correcto ✅"
echo "   - Si no funciona → SHA-1 incorrecto ❌"
echo ""

echo "🎯 Análisis de tus builds:"
echo ""
echo "✅ Builds de PRODUCCIÓN (hace 5 días):"
echo "   - Probable SHA-1: $SHA1_DEFAULT"
echo "   - Deberían funcionar si este SHA-1 está en Google Cloud Console"
echo ""

echo "⚠️  Builds de PREVIEW (hace 5 días):"
echo "   - Verificar SHA-1 en detalles del build"
echo "   - Pueden usar keystore diferente"
echo ""

echo "⚠️  Builds ANTIGUOS (hace 7 días):"
echo "   - Verificar SHA-1 en detalles del build"
echo "   - Pueden usar keystore anterior"
echo ""

echo "✅ Verificación en Google Cloud Console:"
echo "   1. Ve a: https://console.cloud.google.com/apis/credentials"
echo "   2. Busca: 378853205278-c2e1gcjn06mg857rcvprns01fu8pduat"
echo "   3. Verifica que ambos SHA-1 estén configurados:"
echo "      - $SHA1_DEFAULT"
echo "      - $SHA1_NUEVO"
echo ""

echo "🎉 Si ambos SHA-1 están configurados:"
echo "   - ✅ Cualquier build que use estos SHA-1 debería funcionar"
echo "   - ✅ No necesitas esperar propagación"
echo "   - ✅ Puedes probar Google OAuth inmediatamente"
echo ""

