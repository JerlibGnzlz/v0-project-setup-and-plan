#!/bin/bash

# Script para abrir Google Cloud Console con los parámetros correctos
# Facilita el acceso a las páginas necesarias para configurar OAuth

PROJECT_ID="amva-auth"
CLIENT_ID="378853205278-slllh10l32onum338rg1776g8itekvco.apps.googleusercontent.com"

echo "🔗 URLs de Google Cloud Console para configurar OAuth"
echo ""
echo "📋 Información del proyecto:"
echo "   Proyecto: $PROJECT_ID"
echo "   Client ID Web: $CLIENT_ID"
echo ""

echo "🌐 URLs directas:"
echo ""
echo "1️⃣ Credentials (para agregar Redirect URIs):"
echo "   https://console.cloud.google.com/apis/credentials?project=$PROJECT_ID"
echo ""
echo "2️⃣ OAuth Consent Screen (para publicar):"
echo "   https://console.cloud.google.com/apis/credentials/consent?project=$PROJECT_ID"
echo ""

# Intentar abrir en el navegador (solo en sistemas compatibles)
if command -v xdg-open &> /dev/null; then
    # Linux
    echo "🌐 Abriendo Google Cloud Console en el navegador..."
    xdg-open "https://console.cloud.google.com/apis/credentials?project=$PROJECT_ID" 2>/dev/null &
elif command -v open &> /dev/null; then
    # macOS
    echo "🌐 Abriendo Google Cloud Console en el navegador..."
    open "https://console.cloud.google.com/apis/credentials?project=$PROJECT_ID" 2>/dev/null &
else
    echo "📋 Copia las URLs arriba y ábrelas en tu navegador"
fi

echo ""
echo "📝 Redirect URIs a agregar:"
echo "   https://auth.expo.io/@jerlibgnzlz/amva-movil"
echo "   amva-app://"
echo "   exp://localhost:8081"
echo "   exp://192.168.*.*:8081"
echo ""
echo "📖 Para instrucciones detalladas, consulta:"
echo "   docs/PASOS_EXACTOS_AGREGAR_REDIRECT_URI.md"

