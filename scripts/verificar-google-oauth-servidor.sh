#!/bin/bash
# Script para verificar la configuración de Google OAuth en el servidor
# Ejecutar en el servidor: bash scripts/verificar-google-oauth-servidor.sh

set -e
cd "$(dirname "$0")/.."

ENV_FILE="backend/.env"
if [ ! -f "$ENV_FILE" ]; then
  echo "❌ No se encuentra $ENV_FILE"
  exit 1
fi

echo "🔍 VERIFICACIÓN GOOGLE OAUTH - SERVIDOR"
echo "========================================"

# Extraer variables (evitar source por compatibilidad)
BACKEND_URL=$(grep -E '^BACKEND_URL=' "$ENV_FILE" 2>/dev/null | cut -d'=' -f2- | tr -d '"' | tr -d "'" || echo "NO CONFIGURADO")
FRONTEND_URL=$(grep -E '^FRONTEND_URL=' "$ENV_FILE" 2>/dev/null | cut -d'=' -f2- | tr -d '"' | tr -d "'" || echo "NO CONFIGURADO")
GOOGLE_CLIENT_ID=$(grep -E '^GOOGLE_CLIENT_ID=' "$ENV_FILE" 2>/dev/null | cut -d'=' -f2- | tr -d '"' | tr -d "'" || echo "NO CONFIGURADO")
GOOGLE_CLIENT_SECRET=$(grep -E '^GOOGLE_CLIENT_SECRET=' "$ENV_FILE" 2>/dev/null | cut -d'=' -f2- | tr -d '"' | tr -d "'" || echo "")

echo ""
echo "1. BACKEND_URL: $BACKEND_URL"
if [[ "$BACKEND_URL" != "https://amva.org.es" ]]; then
  echo "   ⚠️  Para producción debe ser: https://amva.org.es"
fi

echo ""
echo "2. FRONTEND_URL: $FRONTEND_URL"
if [[ "$FRONTEND_URL" != "https://amva.org.es" ]]; then
  echo "   ⚠️  Para producción debe ser: https://amva.org.es"
fi

echo ""
echo "3. GOOGLE_CLIENT_ID: ${GOOGLE_CLIENT_ID:0:40}..."
if [[ "$GOOGLE_CLIENT_ID" == *"378853205278-slllh10l32onum338rg1776g8itekvco"* ]]; then
  echo "   ❌ Este Client ID ya NO existe en Google (invalid_client)"
  echo "   → Debes crear un NUEVO OAuth client y actualizar aquí"
fi

echo ""
echo "4. GOOGLE_CLIENT_SECRET: $([ -n "$GOOGLE_CLIENT_SECRET" ] && echo "${#GOOGLE_CLIENT_SECRET} caracteres" || echo "NO CONFIGURADO")"

CALLBACK_URL="$([ "$BACKEND_URL" != "NO CONFIGURADO" ] && echo "${BACKEND_URL}/api/auth/invitado/google/callback" || echo "https://amva.org.es/api/auth/invitado/google/callback")"
echo ""
echo "5. Callback URL que usa el backend: $CALLBACK_URL"
echo "   → Esta URL debe estar en Google Cloud Console (Authorized redirect URIs)"
echo ""
echo "========================================"
echo "📋 Si ves 'invalid_client', haz esto:"
echo "   1. Ve a https://console.cloud.google.com/apis/credentials"
echo "   2. Crea NUEVO OAuth client (Web application)"
echo "   3. Agrega redirect URIs: $CALLBACK_URL"
echo "   4. Copia el NUEVO Client ID y Secret"
echo "   5. nano $ENV_FILE"
echo "   6. Reemplaza GOOGLE_CLIENT_ID y GOOGLE_CLIENT_SECRET"
echo "   7. Asegura BACKEND_URL=https://amva.org.es"
echo "   8. pm2 restart amva-backend"
echo ""
