#!/bin/bash

# Script para verificar configuración de Gmail SMTP
# Uso: ./scripts/verificar-gmail-config.sh [BACKEND_URL]

set -e

# Color codes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Obtener URL del backend
BACKEND_URL="${1:-https://ministerio-backend-wdbj.onrender.com}"

echo ""
echo -e "${BLUE}📧 VERIFICACIÓN DE CONFIGURACIÓN GMAIL SMTP${NC}"
echo -e "${BLUE}📍 URL: ${BACKEND_URL}${NC}"
echo ""

# Verificar que el backend esté online
echo -e "${YELLOW}1. Verificando que el backend esté online...${NC}"
if curl -s -o /dev/null -w "%{http_code}" "${BACKEND_URL}/api/mercado-pago/status" | grep -q "200"; then
  echo -e "  ${GREEN}✅ Backend está online${NC}"
else
  echo -e "  ${RED}❌ Backend no responde${NC}"
  exit 1
fi

echo ""
echo -e "${YELLOW}2. Variables de entorno requeridas en Render:${NC}"
echo ""
echo -e "${BLUE}SMTP_HOST${NC} = smtp.gmail.com"
echo -e "${BLUE}SMTP_PORT${NC} = 587"
echo -e "${BLUE}SMTP_SECURE${NC} = false"
echo -e "${BLUE}SMTP_USER${NC} = tu_email@gmail.com"
echo -e "${BLUE}SMTP_PASSWORD${NC} = tu_app_password (16 caracteres, sin espacios)"
echo ""

echo -e "${YELLOW}3. Pasos para configurar Gmail:${NC}"
echo ""
echo "   a) Habilitar verificación en 2 pasos:"
echo "      https://myaccount.google.com/security"
echo ""
echo "   b) Crear App Password:"
echo "      https://myaccount.google.com/apppasswords"
echo "      - Aplicación: Correo"
echo "      - Dispositivo: Otro (AMVA Digital Backend)"
echo ""
echo "   c) Configurar en Render Dashboard:"
echo "      https://dashboard.render.com → Tu servicio → Environment"
echo ""

echo -e "${YELLOW}4. Para probar el envío de email:${NC}"
echo ""
echo "   Necesitas un token JWT de admin. Luego ejecuta:"
echo ""
echo -e "   ${BLUE}curl -X POST ${BACKEND_URL}/api/notifications/test-email \\${NC}"
echo -e "     ${BLUE}-H \"Content-Type: application/json\" \\${NC}"
echo -e "     ${BLUE}-H \"Authorization: Bearer <tu-token-jwt>\" \\${NC}"
echo -e "     ${BLUE}-d '{\"to\": \"tu_email@gmail.com\"}'${NC}"
echo ""

echo -e "${YELLOW}5. Verificar logs en Render:${NC}"
echo ""
echo "   Busca estos mensajes en los logs:"
echo -e "   ${GREEN}✅ Servicio de email configurado (Gmail SMTP)${NC}"
echo -e "   ${GREEN}✅ Email enviado exitosamente${NC}"
echo ""
echo "   O estos errores:"
echo -e "   ${RED}❌ Error de autenticación SMTP (EAUTH)${NC}"
echo -e "   ${RED}❌ Error de conexión SMTP (ECONNECTION)${NC}"
echo ""

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}📚 DOCUMENTACIÓN COMPLETA${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "   Ver: docs/CONFIGURAR_GMAIL_PRODUCCION.md"
echo ""

