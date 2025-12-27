#!/bin/bash

# Script para verificar configuración completa después de eliminar cliente duplicado
# Uso: ./scripts/verificar-configuracion-completa.sh

echo "🔍 Verificación Completa de Configuración"
echo ""

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

SHA1_DEFAULT="4B:24:0F:1B:6A:E6:3D:71:38:77:D1:E7:69:40:D2:1D:5D:30:7C:40"
SHA1_NUEVO="BC:0C:2C:C3:68:D1:50:C3:7E:07:17:EE:49:8F:D0:35:7D:0F:1E:E3"
PACKAGE_NAME="org.vidaabundante.app"
CLIENT_ID="378853205278-c2e1gcjn06mg857rcvprns01fu8pduat"
PROYECTO_CORRECTO="amva-digital"

echo "✅ Verificación 1: Archivo google-services.json Local"
echo ""

if [ -f "android/app/google-services.json" ]; then
    echo "  ✅ Archivo encontrado"
    
    # Verificar package name
    if grep -q "$PACKAGE_NAME" android/app/google-services.json; then
        echo "  ✅ Package name correcto: $PACKAGE_NAME"
    else
        echo "  ❌ Package name NO encontrado"
    fi
    
    # Verificar SHA-1 default
    if grep -q "$SHA1_DEFAULT" android/app/google-services.json; then
        echo "  ✅ SHA-1 default configurado: $SHA1_DEFAULT"
    else
        echo "  ❌ SHA-1 default NO encontrado"
    fi
    
    # Verificar SHA-1 nuevo
    if grep -q "$SHA1_NUEVO" android/app/google-services.json; then
        echo "  ✅ SHA-1 nuevo configurado: $SHA1_NUEVO"
    else
        echo "  ⚠️  SHA-1 nuevo NO encontrado (opcional)"
    fi
    
    # Verificar client ID
    if grep -q "$CLIENT_ID" android/app/google-services.json; then
        echo "  ✅ Client ID correcto: $CLIENT_ID"
    else
        echo "  ❌ Client ID NO encontrado"
    fi
else
    echo "  ❌ Archivo google-services.json NO encontrado"
fi

echo ""
echo "⚠️  Verificación 2: Google Cloud Console (Manual)"
echo ""
echo "  1. Ve a: https://console.cloud.google.com/apis/credentials?project=$PROYECTO_CORRECTO"
echo "  2. Busca el cliente Android: $CLIENT_ID"
echo "  3. Verifica que tenga:"
echo "     - Package name: $PACKAGE_NAME"
echo "     - SHA-1: $SHA1_DEFAULT"
echo "     - (Y posiblemente: $SHA1_NUEVO)"
echo ""

echo "⚠️  Verificación 3: Firebase Console (Manual - MÁS IMPORTANTE)"
echo ""
echo "  1. Ve a: https://console.firebase.google.com/project/$PROYECTO_CORRECTO/settings/general"
echo "  2. Ve a 'Your apps' → Selecciona app Android"
echo "  3. Busca 'SHA certificate fingerprints'"
echo "  4. Intenta agregar el SHA-1: $SHA1_DEFAULT"
echo "  5. Si NO aparece el error de cliente duplicado: ✅ ÉXITO"
echo "  6. Si aún aparece el error: ⚠️  Espera 30 minutos y vuelve a intentar"
echo ""

echo "📋 Checklist de Verificación:"
echo ""
echo "  [ ] Archivo google-services.json tiene configuración correcta (verificado arriba)"
echo "  [ ] Google Cloud Console - Proyecto $PROYECTO_CORRECTO tiene el cliente configurado"
echo "  [ ] Firebase Console - Puedo agregar SHA-1 sin error de duplicado"
echo "  [ ] Otros proyectos NO tienen cliente con esa combinación"
echo ""

echo "🎯 Próximos Pasos:"
echo ""
echo "  1. Verifica en Firebase Console que puedes agregar el SHA-1 sin error"
echo "  2. Si funciona: ✅ Todo está correcto"
echo "  3. Descarga el APK: https://expo.dev/artifacts/eas/aXpxxM3bqffGfC1wgryc1D.apk"
echo "  4. Instálalo en tu teléfono"
echo "  5. Prueba Google OAuth"
echo ""

echo "✅ Si todas las verificaciones pasan, tu configuración está lista para funcionar!"
echo ""

