#!/bin/bash

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  🔍 VERIFICACIÓN DE CREDENCIALES GOOGLE OAUTH               ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Verificar si existe .env
if [ ! -f .env ]; then
    echo "❌ Archivo .env no existe"
    echo "📝 Creando desde env.example.txt..."
    cp env.example.txt .env
    echo "✅ Archivo .env creado"
    echo ""
    echo "⚠️  IMPORTANTE: Agrega tus credenciales de Google OAuth en .env"
    exit 1
fi

echo "✅ Archivo .env existe"
echo ""

# Verificar variables
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 Verificando variables de Google OAuth:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

GOOGLE_CLIENT_ID=$(grep "^GOOGLE_CLIENT_ID=" .env 2>/dev/null | cut -d '=' -f2 | tr -d '"' | tr -d "'")
GOOGLE_CLIENT_SECRET=$(grep "^GOOGLE_CLIENT_SECRET=" .env 2>/dev/null | cut -d '=' -f2 | tr -d '"' | tr -d "'")
GOOGLE_CALLBACK_URL=$(grep "^GOOGLE_CALLBACK_URL=" .env 2>/dev/null | cut -d '=' -f2 | tr -d '"' | tr -d "'")
FRONTEND_URL=$(grep "^FRONTEND_URL=" .env 2>/dev/null | cut -d '=' -f2 | tr -d '"' | tr -d "'")

# Verificar GOOGLE_CLIENT_ID
if [ -z "$GOOGLE_CLIENT_ID" ] || [ "$GOOGLE_CLIENT_ID" = "tu-client-id.apps.googleusercontent.com" ]; then
    echo "❌ GOOGLE_CLIENT_ID: No configurado o valor por defecto"
else
    echo "✅ GOOGLE_CLIENT_ID: Configurado (${GOOGLE_CLIENT_ID:0:20}...)"
fi

# Verificar GOOGLE_CLIENT_SECRET
if [ -z "$GOOGLE_CLIENT_SECRET" ] || [ "$GOOGLE_CLIENT_SECRET" = "tu-client-secret" ]; then
    echo "❌ GOOGLE_CLIENT_SECRET: No configurado o valor por defecto"
else
    SECRET_LENGTH=${#GOOGLE_CLIENT_SECRET}
    echo "✅ GOOGLE_CLIENT_SECRET: Configurado (${SECRET_LENGTH} caracteres)"
fi

# Verificar GOOGLE_CALLBACK_URL
if [ -z "$GOOGLE_CALLBACK_URL" ]; then
    echo "⚠️  GOOGLE_CALLBACK_URL: No configurado (usará valor por defecto)"
else
    echo "✅ GOOGLE_CALLBACK_URL: $GOOGLE_CALLBACK_URL"
fi

# Verificar FRONTEND_URL
if [ -z "$FRONTEND_URL" ]; then
    echo "⚠️  FRONTEND_URL: No configurado (usará http://localhost:3000)"
else
    echo "✅ FRONTEND_URL: $FRONTEND_URL"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Verificar si todas las variables críticas están configuradas
if [ -n "$GOOGLE_CLIENT_ID" ] && [ "$GOOGLE_CLIENT_ID" != "tu-client-id.apps.googleusercontent.com" ] && \
   [ -n "$GOOGLE_CLIENT_SECRET" ] && [ "$GOOGLE_CLIENT_SECRET" != "tu-client-secret" ]; then
    echo ""
    echo "✅ ¡Todas las credenciales están configuradas!"
    echo ""
    echo "🚀 Próximos pasos:"
    echo "   1. Reinicia el servidor backend: pnpm start:dev"
    echo "   2. Ve a: ${FRONTEND_URL:-http://localhost:3000}/convencion/inscripcion"
    echo "   3. Haz clic en 'Continuar con Google'"
    echo ""
else
    echo ""
    echo "⚠️  Faltan credenciales por configurar"
    echo ""
    echo "📝 Agrega estas variables en backend/.env:"
    echo ""
    echo "GOOGLE_CLIENT_ID=\"tu-client-id.apps.googleusercontent.com\""
    echo "GOOGLE_CLIENT_SECRET=\"tu-client-secret\""
    echo "GOOGLE_CALLBACK_URL=\"/api/auth/invitado/google/callback\""
    echo "FRONTEND_URL=\"http://localhost:3000\""
    echo ""
fi



