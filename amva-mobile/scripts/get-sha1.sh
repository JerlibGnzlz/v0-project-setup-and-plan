#!/bin/bash
# Script para obtener el SHA-1 del keystore de debug
# Necesario para configurar Google Sign-In en Google Cloud Console

echo "🔍 Obteniendo SHA-1 del keystore de debug..."
echo ""

cd android

# Obtener SHA-1 del keystore de debug
./gradlew signingReport 2>/dev/null | grep -A 2 "Variant: debug" | grep "SHA1:" | head -1 | awk '{print $2}'

echo ""
echo "✅ Copia este SHA-1 y agrégalo en Google Cloud Console:"
echo "   1. Ve a Google Cloud Console → APIs & Services → Credentials"
echo "   2. Selecciona tu Android OAuth 2.0 Client ID"
echo "   3. Agrega el SHA-1 en 'SHA-1 certificate fingerprint'"
echo ""

