#!/bin/bash

# Script de diagnóstico para Google Login
# Verifica todos los puntos críticos de configuración

echo "🔍 Diagnóstico de Google Login"
echo "================================"
echo ""

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
APP_JSON="$PROJECT_ROOT/app.json"

echo "📋 Verificando configuración..."
echo ""

# 1. Verificar app.json existe
if [ ! -f "$APP_JSON" ]; then
    echo "❌ app.json no encontrado en: $APP_JSON"
    exit 1
fi

echo "✅ app.json encontrado"
echo ""

# 2. Verificar googleAndroidClientId en app.json
echo "🔍 Verificando googleAndroidClientId en app.json..."
GOOGLE_CLIENT_ID=$(grep -o '"googleAndroidClientId": "[^"]*"' "$APP_JSON" | cut -d'"' -f4)

if [ -z "$GOOGLE_CLIENT_ID" ]; then
    echo "❌ googleAndroidClientId no encontrado en app.json"
    exit 1
fi

echo "✅ googleAndroidClientId encontrado:"
echo "   $GOOGLE_CLIENT_ID"
echo ""

# 3. Verificar formato del Client ID
if [[ ! "$GOOGLE_CLIENT_ID" == *".apps.googleusercontent.com" ]]; then
    echo "⚠️  ADVERTENCIA: El Client ID no tiene el formato correcto"
    echo "   Debe terminar en .apps.googleusercontent.com"
else
    echo "✅ Formato del Client ID es correcto"
fi
echo ""

# 4. Extraer Client ID sin el sufijo
CLIENT_ID_SHORT=$(echo "$GOOGLE_CLIENT_ID" | cut -d'.' -f1)
echo "📝 Client ID (sin sufijo): $CLIENT_ID_SHORT"
echo ""

# 5. Instrucciones para verificar SHA-1
echo "🔑 VERIFICACIÓN DE SHA-1"
echo "========================"
echo ""
echo "1. Obtén el SHA-1 de producción desde EAS:"
echo "   cd $PROJECT_ROOT"
echo "   eas credentials"
echo "   → Selecciona: Android"
echo "   → Selecciona: View credentials"
echo "   → Copia el SHA-1 que aparece"
echo ""
echo "2. Verifica en Google Cloud Console:"
echo "   https://console.cloud.google.com/apis/credentials"
echo ""
echo "3. Busca el cliente Android con este ID:"
echo "   $CLIENT_ID_SHORT"
echo ""
echo "4. Verifica que tengas AMBOS SHA-1 configurados:"
echo "   ✅ SHA-1 de Debug (para emulador)"
echo "   ✅ SHA-1 de Producción (para teléfono físico)"
echo ""
echo "5. Compara el SHA-1 de EAS con el de Google Cloud Console"
echo "   Deben ser EXACTAMENTE iguales"
echo ""

# 6. Verificar OAuth Consent Screen
echo "🔐 VERIFICACIÓN DE OAUTH CONSENT SCREEN"
echo "======================================="
echo ""
echo "1. Ve a: https://console.cloud.google.com/apis/credentials/consent"
echo ""
echo "2. Verifica:"
echo "   ✅ Tipo de aplicación: 'Externo' o 'External'"
echo "   ✅ Estado de publicación: 'En producción' o 'In production'"
echo "   ✅ Si está en 'En prueba', asegúrate de tener usuarios de prueba agregados"
echo "   ✅ Scopes configurados: al menos 'email' y 'profile'"
echo ""

# 7. Tiempo de propagación
echo "⏱️  TIEMPO DE PROPAGACIÓN"
echo "========================="
echo ""
echo "⚠️  IMPORTANTE: Después de agregar SHA-1 en Google Cloud Console:"
echo "   ⏱️  Espera mínimo 15-30 minutos"
echo "   🔄 Puede tardar hasta 1 hora en algunos casos"
echo "   ❌ NO pruebes inmediatamente después de agregar SHA-1"
echo ""

# 8. Checklist final
echo "✅ CHECKLIST FINAL"
echo "=================="
echo ""
echo "Antes de probar de nuevo, verifica:"
echo ""
echo "[ ] SHA-1 de producción agregado en Google Cloud Console"
echo "[ ] SHA-1 coincide exactamente con el de EAS credentials"
echo "[ ] OAuth consent screen está publicado o en modo prueba con usuarios"
echo "[ ] Client ID en app.json es correcto: $GOOGLE_CLIENT_ID"
echo "[ ] Esperaste al menos 30 minutos después de agregar SHA-1"
echo "[ ] Estás usando el APK compilado con EAS Build (no desarrollo)"
echo "[ ] Desinstalaste y reinstalaste la app en el teléfono"
echo "[ ] Cerraste completamente la app antes de probar de nuevo"
echo ""

# 9. Próximos pasos
echo "🚀 PRÓXIMOS PASOS"
echo "================="
echo ""
echo "1. Ejecuta 'eas credentials' y obtén el SHA-1 de producción"
echo "2. Compara con el SHA-1 en Google Cloud Console"
echo "3. Si no coincide, agrégalo o corrígelo"
echo "4. Espera 30 minutos"
echo "5. Desinstala y reinstala la app"
echo "6. Prueba de nuevo"
echo ""

echo "📚 Para más información, consulta:"
echo "   - amva-mobile/docs/DIAGNOSTICO_GOOGLE_LOGIN.md"
echo "   - amva-mobile/docs/RESOLVER_DEVELOPER_ERROR_DEFINITIVO.md"
echo ""

