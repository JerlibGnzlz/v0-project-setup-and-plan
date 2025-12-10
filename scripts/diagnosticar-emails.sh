#!/bin/bash

# Script para diagnosticar problemas con emails en producción
# Uso: ./scripts/diagnosticar-emails.sh [BACKEND_URL] [TOKEN_JWT]

set -e

# Color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Obtener URL del backend y token
BACKEND_URL="${1:-https://ministerio-backend-wdbj.onrender.com}"
TOKEN="${2:-}"

echo ""
echo -e "${BLUE}📧 DIAGNÓSTICO DE EMAILS EN PRODUCCIÓN${NC}"
echo -e "${BLUE}📍 Backend: ${BACKEND_URL}${NC}"
echo ""

# Verificar que el backend esté online
echo -e "${YELLOW}1. Verificando que el backend esté online...${NC}"
if curl -s -o /dev/null -w "%{http_code}" "${BACKEND_URL}/api" | grep -q "200\|404"; then
  echo -e "  ${GREEN}✅ Backend está online${NC}"
else
  echo -e "  ${RED}❌ Backend no responde${NC}"
  exit 1
fi

echo ""
echo -e "${YELLOW}2. Verificando variables de entorno en Render:${NC}"
echo ""
echo "   Ve a: https://dashboard.render.com → Tu servicio → Environment"
echo ""
echo -e "   ${BLUE}Variables requeridas:${NC}"
echo "   - SMTP_HOST=smtp.gmail.com"
echo "   - SMTP_PORT=587"
echo "   - SMTP_SECURE=false"
echo "   - SMTP_USER=tu_email@gmail.com"
echo "   - SMTP_PASSWORD=tu_app_password (16 caracteres, sin espacios)"
echo ""

# Si hay token, probar envío de email
if [ -n "$TOKEN" ]; then
  echo -e "${YELLOW}3. Probando envío de email de prueba...${NC}"
  echo ""
  
  RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "${BACKEND_URL}/api/notifications/test-email" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer ${TOKEN}" \
    -d '{
      "to": "jerlibgv@gmail.com",
      "subject": "Test Email desde Producción",
      "body": "Este es un email de prueba para verificar que el servicio de email funciona correctamente."
    }')
  
  HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
  BODY=$(echo "$RESPONSE" | sed '$d')
  
  if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "201" ]; then
    echo -e "  ${GREEN}✅ Email de prueba enviado exitosamente${NC}"
    echo "  Respuesta: $BODY"
  else
    echo -e "  ${RED}❌ Error al enviar email de prueba${NC}"
    echo "  HTTP Code: $HTTP_CODE"
    echo "  Respuesta: $BODY"
  fi
else
  echo -e "${YELLOW}3. Para probar envío de email:${NC}"
  echo ""
  echo "   Necesitas un token JWT de admin. Ejecuta:"
  echo ""
  echo -e "   ${BLUE}./scripts/diagnosticar-emails.sh ${BACKEND_URL} <tu-token-jwt>${NC}"
  echo ""
fi

echo ""
echo -e "${YELLOW}4. Verificar logs en Render:${NC}"
echo ""
echo "   Ve a: https://dashboard.render.com → Tu servicio → Logs"
echo ""
echo "   Busca estos mensajes:"
echo -e "   ${GREEN}✅ Servicio de email configurado (Gmail SMTP)${NC}"
echo -e "   ${GREEN}✅ Email enviado exitosamente${NC}"
echo ""
echo "   O estos errores:"
echo -e "   ${RED}❌ Error de autenticación SMTP (EAUTH)${NC}"
echo -e "   ${RED}   → Verifica SMTP_USER y SMTP_PASSWORD${NC}"
echo -e "   ${RED}   → Asegúrate de usar App Password, no tu contraseña normal${NC}"
echo ""
echo -e "   ${RED}❌ Error de conexión SMTP (ECONNECTION)${NC}"
echo -e "   ${RED}   → Verifica SMTP_HOST y SMTP_PORT${NC}"
echo ""
echo -e "   ${RED}❌ Servicio de email no configurado${NC}"
echo -e "   ${RED}   → Verifica que todas las variables SMTP estén configuradas${NC}"
echo ""

echo -e "${YELLOW}5. Checklist de configuración:${NC}"
echo ""
echo "   [ ] Verificación en 2 pasos habilitada en Gmail"
echo "   [ ] App Password creada en Gmail"
echo "   [ ] SMTP_HOST configurado en Render"
echo "   [ ] SMTP_PORT configurado en Render"
echo "   [ ] SMTP_SECURE configurado en Render (debe ser 'false')"
echo "   [ ] SMTP_USER configurado en Render (email completo)"
echo "   [ ] SMTP_PASSWORD configurado en Render (App Password sin espacios)"
echo "   [ ] Servicio reiniciado en Render después de configurar variables"
echo ""

echo -e "${YELLOW}6. Pasos para crear App Password de Gmail:${NC}"
echo ""
echo "   a) Habilitar verificación en 2 pasos:"
echo "      https://myaccount.google.com/security"
echo ""
echo "   b) Crear App Password:"
echo "      https://myaccount.google.com/apppasswords"
echo "      - Aplicación: Correo"
echo "      - Dispositivo: Otro (AMVA Digital Backend)"
echo "      - Copiar la contraseña de 16 caracteres (sin espacios)"
echo ""

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}📚 DOCUMENTACIÓN${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "   Ver: docs/CONFIGURAR_GMAIL_PRODUCCION.md"
echo ""

