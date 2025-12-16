#!/bin/bash

# Script para configurar Google OAuth
# Este script te guiará paso a paso para obtener las credenciales

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  🔐 CONFIGURACIÓN DE GOOGLE OAUTH                            ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""
echo "Este script te ayudará a configurar Google OAuth para autenticación."
echo ""

# Verificar si existe .env
if [ ! -f .env ]; then
    echo "📝 Creando archivo .env desde env.example.txt..."
    cp env.example.txt .env
    echo "✅ Archivo .env creado"
    echo ""
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 PASOS PARA OBTENER CREDENCIALES"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "1️⃣  Ve a Google Cloud Console:"
echo "   https://console.cloud.google.com/"
echo ""
echo "2️⃣  Selecciona o crea un proyecto"
echo ""
echo "3️⃣  Ve a: APIs & Services > Credentials"
echo ""
echo "4️⃣  Haz clic en: Create Credentials > OAuth client ID"
echo ""
echo "5️⃣  Si es la primera vez, configura la pantalla de consentimiento:"
echo "   - Tipo: External"
echo "   - App name: AMVA Digital"
echo "   - User support email: tu-email@gmail.com"
echo "   - Developer contact: tu-email@gmail.com"
echo ""
echo "6️⃣  Selecciona: Web application"
echo ""
echo "7️⃣  Configura:"
echo "   Name: AMVA Digital - Invitados"
echo ""
echo "   Authorized JavaScript origins:"
echo "   - http://localhost:4000 (desarrollo)"
echo "   - https://tu-dominio.com (producción)"
echo ""
echo "   Authorized redirect URIs:"
echo "   - http://localhost:4000/api/auth/invitado/google/callback"
echo "   - https://tu-dominio.com/api/auth/invitado/google/callback"
echo ""
echo "8️⃣  Haz clic en Create"
echo ""
echo "9️⃣  Copia el Client ID y Client Secret"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Solicitar credenciales
read -p "🔑 Ingresa tu GOOGLE_CLIENT_ID: " CLIENT_ID
read -p "🔐 Ingresa tu GOOGLE_CLIENT_SECRET: " CLIENT_SECRET

# Verificar que no estén vacíos
if [ -z "$CLIENT_ID" ] || [ -z "$CLIENT_SECRET" ]; then
    echo "❌ Error: Las credenciales no pueden estar vacías"
    exit 1
fi

# Obtener FRONTEND_URL del .env o usar default
FRONTEND_URL=$(grep "^FRONTEND_URL=" .env 2>/dev/null | cut -d '=' -f2 | tr -d '"' || echo "http://localhost:3000")

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📝 ACTUALIZANDO ARCHIVO .env"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Verificar si ya existen las variables
if grep -q "^GOOGLE_CLIENT_ID=" .env; then
    # Actualizar existente
    sed -i "s|^GOOGLE_CLIENT_ID=.*|GOOGLE_CLIENT_ID=\"$CLIENT_ID\"|" .env
    echo "✅ GOOGLE_CLIENT_ID actualizado"
else
    # Agregar nuevo
    echo "" >> .env
    echo "# Google OAuth" >> .env
    echo "GOOGLE_CLIENT_ID=\"$CLIENT_ID\"" >> .env
    echo "✅ GOOGLE_CLIENT_ID agregado"
fi

if grep -q "^GOOGLE_CLIENT_SECRET=" .env; then
    sed -i "s|^GOOGLE_CLIENT_SECRET=.*|GOOGLE_CLIENT_SECRET=\"$CLIENT_SECRET\"|" .env
    echo "✅ GOOGLE_CLIENT_SECRET actualizado"
else
    echo "GOOGLE_CLIENT_SECRET=\"$CLIENT_SECRET\"" >> .env
    echo "✅ GOOGLE_CLIENT_SECRET agregado"
fi

if grep -q "^GOOGLE_CALLBACK_URL=" .env; then
    sed -i "s|^GOOGLE_CALLBACK_URL=.*|GOOGLE_CALLBACK_URL=\"/api/auth/invitado/google/callback\"|" .env
    echo "✅ GOOGLE_CALLBACK_URL actualizado"
else
    echo "GOOGLE_CALLBACK_URL=\"/api/auth/invitado/google/callback\"" >> .env
    echo "✅ GOOGLE_CALLBACK_URL agregado"
fi

# Asegurar que FRONTEND_URL esté configurado
if ! grep -q "^FRONTEND_URL=" .env; then
    echo "FRONTEND_URL=\"$FRONTEND_URL\"" >> .env
    echo "✅ FRONTEND_URL agregado"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ CONFIGURACIÓN COMPLETADA"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 Variables configuradas en .env:"
echo "   • GOOGLE_CLIENT_ID"
echo "   • GOOGLE_CLIENT_SECRET"
echo "   • GOOGLE_CALLBACK_URL"
echo "   • FRONTEND_URL"
echo ""
echo "🚀 Próximos pasos:"
echo "   1. Reinicia el servidor backend"
echo "   2. Ve a http://localhost:3000/convencion/inscripcion"
echo "   3. Haz clic en 'Continuar con Google'"
echo ""
echo "📖 Para más detalles, consulta: docs/GOOGLE_OAUTH_SETUP.md"
echo ""









