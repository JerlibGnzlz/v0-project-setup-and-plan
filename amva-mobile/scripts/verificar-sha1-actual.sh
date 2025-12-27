#!/bin/bash

# Script para verificar el SHA-1 actual del keystore de producción
# y compararlo con el que está configurado

echo "🔍 VERIFICACIÓN DE SHA-1 PARA GOOGLE OAUTH"
echo "=========================================="
echo ""

# SHA-1 que el usuario tiene
SHA1_USUARIO="BC:0C:2C:C3:68:D1:50:C3:7E:07:17:EE:49:8F:D0:35:7D:0F:1E:E3"

echo "📋 SHA-1 que tienes actualmente:"
echo "   $SHA1_USUARIO"
echo ""

echo "📋 SHA-1 documentados anteriormente:"
echo "   1. Keystore anterior (prioritario): 4B:24:0F:1B:6A:E6:3D:71:38:77:D1:E7:69:40:D2:1D:5D:30:7C:40"
echo "   2. Keystore nuevo: 9B:AF:07:1F:4A:A2:70:9C:E6:AB:79:E4:EC:ED:AE:22:CE:F6:DB:8A"
echo ""

echo "🔍 Para obtener el SHA-1 correcto del keystore de producción actual:"
echo ""
echo "Opción 1: Desde EAS (Recomendado)"
echo "-----------------------------------"
echo "cd amva-mobile"
echo "eas credentials"
echo "# Selecciona: Android → View credentials → Busca SHA-1"
echo ""
echo "Opción 2: Si tienes el keystore local"
echo "-------------------------------------"
echo "keytool -list -v -keystore android/app/amva-release-key.keystore -alias amva-key-alias"
echo ""
echo "Opción 3: Desde el APK instalado (si tienes acceso)"
echo "----------------------------------------------------"
echo "keytool -list -printcert -jarfile tu-app.apk"
echo ""

echo "📝 Pasos para verificar en Google Cloud Console:"
echo "   1. Ve a: https://console.cloud.google.com/apis/credentials"
echo "   2. Busca el cliente Android: 378853205278-c2e1gcjn06mg857rcvprns01fu8pduat"
echo "   3. Verifica qué SHA-1 están configurados actualmente"
echo "   4. Compara con el SHA-1 que tienes: $SHA1_USUARIO"
echo ""

echo "✅ Recomendación:"
echo "   - Si el SHA-1 que tienes ($SHA1_USUARIO) NO está en Google Cloud Console, agrégalo"
echo "   - Si ya está agregado, espera 30 minutos y prueba de nuevo"
echo "   - Puedes tener MÚLTIPLES SHA-1 configurados (no elimines los existentes)"
echo ""
