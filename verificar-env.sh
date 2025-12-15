#!/bin/bash

# Script para verificar configuración de Google OAuth en .env

ENV_FILE="backend/.env"

if [ ! -f "$ENV_FILE" ]; then
    echo "❌ Archivo $ENV_FILE no encontrado"
    echo ""
    echo "📝 Creando desde env.example.txt..."
    cp backend/env.example.txt "$ENV_FILE"
    echo "✅ Archivo creado. Agrega tus credenciales ahora."
    exit 1
fi

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  🔍 VERIFICACIÓN DE CONFIGURACIÓN .env                      ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""
echo "Archivo: $ENV_FILE"
echo ""

# Leer variables
GOOGLE_CLIENT_ID=$(grep "^GOOGLE_CLIENT_ID=" "$ENV_FILE" 2>/dev/null | cut -d '=' -f2 | tr -d '"' | tr -d "'" | xargs)
GOOGLE_CLIENT_SECRET=$(grep "^GOOGLE_CLIENT_SECRET=" "$ENV_FILE" 2>/dev/null | cut -d '=' -f2 | tr -d '"' | tr -d "'" | xargs)
GOOGLE_CALLBACK_URL=$(grep "^GOOGLE_CALLBACK_URL=" "$ENV_FILE" 2>/dev/null | cut -d '=' -f2 | tr -d '"' | tr -d "'" | xargs)
FRONTEND_URL=$(grep "^FRONTEND_URL=" "$ENV_FILE" 2>/dev/null | cut -d '=' -f2 | tr -d '"' | tr -d "'" | xargs)

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 Estado de las variables:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Verificar GOOGLE_CLIENT_ID
if [ -z "$GOOGLE_CLIENT_ID" ]; then
    echo "❌ GOOGLE_CLIENT_ID: No configurado"
elif [[ "$GOOGLE_CLIENT_ID" == *"tu-client-id"* ]] || [[ "$GOOGLE_CLIENT_ID" == *"example"* ]]; then
    echo "⚠️  GOOGLE_CLIENT_ID: Valor de ejemplo detectado"
    echo "   Valor actual: $GOOGLE_CLIENT_ID"
else
    CLIENT_ID_PREVIEW=$(echo "$GOOGLE_CLIENT_ID" | cut -c1-30)
    echo "✅ GOOGLE_CLIENT_ID: Configurado"
    echo "   Valor: ${CLIENT_ID_PREVIEW}..."
fi

echo ""

# Verificar GOOGLE_CLIENT_SECRET
if [ -z "$GOOGLE_CLIENT_SECRET" ]; then
    echo "❌ GOOGLE_CLIENT_SECRET: No configurado"
elif [[ "$GOOGLE_CLIENT_SECRET" == *"tu-client-secret"* ]] || [[ "$GOOGLE_CLIENT_SECRET" == *"example"* ]]; then
    echo "⚠️  GOOGLE_CLIENT_SECRET: Valor de ejemplo detectado"
    echo "   Valor actual: $GOOGLE_CLIENT_SECRET"
else
    SECRET_LEN=${#GOOGLE_CLIENT_SECRET}
    echo "✅ GOOGLE_CLIENT_SECRET: Configurado"
    echo "   Longitud: $SECRET_LEN caracteres"
fi

echo ""

# Verificar GOOGLE_CALLBACK_URL
if [ -z "$GOOGLE_CALLBACK_URL" ]; then
    echo "⚠️  GOOGLE_CALLBACK_URL: No configurado (usará valor por defecto)"
else
    echo "✅ GOOGLE_CALLBACK_URL: $GOOGLE_CALLBACK_URL"
fi

echo ""

# Verificar FRONTEND_URL
if [ -z "$FRONTEND_URL" ]; then
    echo "⚠️  FRONTEND_URL: No configurado"
else
    echo "✅ FRONTEND_URL: $FRONTEND_URL"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Verificación final
if [ -n "$GOOGLE_CLIENT_ID" ] && [[ ! "$GOOGLE_CLIENT_ID" == *"tu-client-id"* ]] && \
   [ -n "$GOOGLE_CLIENT_SECRET" ] && [[ ! "$GOOGLE_CLIENT_SECRET" == *"tu-client-secret"* ]]; then
    echo "✅ ¡Configuración completa! Todas las credenciales están listas."
    echo ""
    echo "🚀 Próximos pasos:"
    echo "   1. Reinicia el backend: cd backend && pnpm start:dev"
    echo "   2. Ve a: ${FRONTEND_URL:-http://localhost:3000}/convencion/inscripcion"
    echo "   3. Haz clic en 'Continuar con Google'"
    echo ""
    echo "🔧 Verifica también en Google Cloud Console que tengas:"
    echo "   Authorized redirect URI: http://localhost:4000/api/auth/invitado/google/callback"
else
    echo "⚠️  Configuración incompleta"
    echo ""
    echo "📝 Asegúrate de tener en backend/.env:"
    echo ""
    echo "GOOGLE_CLIENT_ID=\"tu-client-id-real.apps.googleusercontent.com\""
    echo "GOOGLE_CLIENT_SECRET=\"tu-client-secret-real\""
    echo "GOOGLE_CALLBACK_URL=\"/api/auth/invitado/google/callback\""
    echo "FRONTEND_URL=\"http://localhost:3000\""
    echo ""
fi








