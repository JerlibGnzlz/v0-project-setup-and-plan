#!/bin/bash

# Script para verificar sincronización entre Firebase y Google Cloud Console
# Uso: ./scripts/verificar-sincronizacion-firebase-gcp.sh

echo "🔍 Verificación de Sincronización: Firebase vs Google Cloud Console"
echo ""

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# SHA-1 que deberían estar en ambos lugares
SHA1_DEFAULT="4B:24:0F:1B:6A:E6:3D:71:38:77:D1:E7:69:40:D2:1D:5D:30:7C:40"
SHA1_NUEVO="BC:0C:2C:C3:68:D1:50:C3:7E:07:17:EE:49:8F:D0:35:7D:0F:1E:E3"

echo "📋 SHA-1 que deberían estar en AMBOS lugares:"
echo "  1. $SHA1_DEFAULT (ZeEnL0LIUD - Default)"
echo "  2. $SHA1_NUEVO (AXSye1dRA5 - Nuevo)"
echo ""

echo "✅ Verificación en google-services.json (Firebase):"
if [ -f "android/app/google-services.json" ]; then
    echo "  ✅ Archivo encontrado"
    
    # Verificar SHA-1 default
    if grep -q "$SHA1_DEFAULT" android/app/google-services.json; then
        echo "  ✅ SHA-1 $SHA1_DEFAULT encontrado en google-services.json"
    else
        echo "  ❌ SHA-1 $SHA1_DEFAULT NO encontrado en google-services.json"
    fi
    
    # Verificar SHA-1 nuevo
    if grep -q "$SHA1_NUEVO" android/app/google-services.json; then
        echo "  ✅ SHA-1 $SHA1_NUEVO encontrado en google-services.json"
    else
        echo "  ❌ SHA-1 $SHA1_NUEVO NO encontrado en google-services.json"
    fi
else
    echo "  ❌ Archivo google-services.json no encontrado"
fi

echo ""
echo "⚠️  Verificación Manual Requerida en Google Cloud Console:"
echo ""
echo "  1. Ve a: https://console.cloud.google.com/apis/credentials"
echo "  2. Busca el cliente Android: 378853205278-c2e1gcjn06mg857rcvprns01fu8pduat"
echo "  3. Haz clic para editarlo"
echo "  4. Verifica que aparezcan estos SHA-1:"
echo "     - $SHA1_DEFAULT"
echo "     - $SHA1_NUEVO"
echo ""

echo "⚠️  Verificación Manual Requerida en Firebase Console:"
echo ""
echo "  1. Ve a: https://console.firebase.google.com/project/amva-auth/settings/general"
echo "  2. Ve a 'Tus aplicaciones' → Selecciona app Android"
echo "  3. Busca 'Huellas digitales del certificado SHA'"
echo "  4. Verifica que aparezcan estos SHA-1:"
echo "     - $SHA1_DEFAULT"
echo "     - $SHA1_NUEVO"
echo ""

echo "🎯 Comparación:"
echo ""
echo "  Firebase (google-services.json):"
echo "    ✅ SHA-1 $SHA1_DEFAULT: Verificado arriba"
echo "    ✅ SHA-1 $SHA1_NUEVO: Verificado arriba"
echo ""
echo "  Google Cloud Console:"
echo "    ❓ SHA-1 $SHA1_DEFAULT: Verificar manualmente"
echo "    ❓ SHA-1 $SHA1_NUEVO: Verificar manualmente"
echo ""

echo "📝 Si los SHA-1 NO están en Google Cloud Console:"
echo "  1. Agrégalos manualmente en Google Cloud Console"
echo "  2. Espera 30 minutos para propagación"
echo "  3. Prueba Google OAuth nuevamente"
echo ""

echo "📝 Si los SHA-1 NO están en Firebase Console:"
echo "  1. Agrégalos en Firebase Console"
echo "  2. Descarga el nuevo google-services.json"
echo "  3. Reemplaza el archivo en tu proyecto"
echo ""

echo "✅ Checklist de Sincronización:"
echo "  [ ] SHA-1 $SHA1_DEFAULT en Firebase Console"
echo "  [ ] SHA-1 $SHA1_DEFAULT en Google Cloud Console"
echo "  [ ] SHA-1 $SHA1_NUEVO en Firebase Console"
echo "  [ ] SHA-1 $SHA1_NUEVO en Google Cloud Console"
echo "  [ ] Proyectos Firebase y Google Cloud vinculados"
echo "  [ ] OAuth Consent Screen publicado"
echo "  [ ] Google Sign-In API habilitada"
echo ""

