#!/bin/bash

# ============================================
# Script de Verificación de Deployment
# ============================================
# Este script verifica que todas las variables
# de entorno estén configuradas correctamente

echo "🔍 Verificando configuración de deployment..."
echo ""

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Contador de errores
ERRORS=0

# Función para verificar variable
check_var() {
  local var_name=$1
  local var_value=$2
  local required=${3:-true}
  
  if [ -z "$var_value" ]; then
    if [ "$required" = true ]; then
      echo -e "${RED}❌ $var_name: NO CONFIGURADA${NC}"
      ERRORS=$((ERRORS + 1))
    else
      echo -e "${YELLOW}⚠️  $var_name: NO CONFIGURADA (opcional)${NC}"
    fi
  else
    # Ocultar valores sensibles
    if [[ "$var_name" == *"SECRET"* ]] || [[ "$var_name" == *"PASSWORD"* ]] || [[ "$var_name" == *"KEY"* ]]; then
      echo -e "${GREEN}✅ $var_name: Configurada${NC}"
    else
      echo -e "${GREEN}✅ $var_name: $var_value${NC}"
    fi
  fi
}

echo "📋 VARIABLES DEL BACKEND"
echo "========================"
echo ""

# Verificar variables del backend
check_var "DATABASE_URL" "$DATABASE_URL"
check_var "JWT_SECRET" "$JWT_SECRET"
check_var "JWT_EXPIRES_IN" "$JWT_EXPIRES_IN" false
check_var "PORT" "$PORT" false
check_var "NODE_ENV" "$NODE_ENV" false
check_var "FRONTEND_URL" "$FRONTEND_URL"
check_var "CLOUDINARY_CLOUD_NAME" "$CLOUDINARY_CLOUD_NAME"
check_var "CLOUDINARY_API_KEY" "$CLOUDINARY_API_KEY"
check_var "CLOUDINARY_API_SECRET" "$CLOUDINARY_API_SECRET"
check_var "REDIS_HOST" "$REDIS_HOST" false
check_var "REDIS_PORT" "$REDIS_PORT" false
check_var "REDIS_PASSWORD" "$REDIS_PASSWORD" false
check_var "SENDGRID_API_KEY" "$SENDGRID_API_KEY" false
check_var "SMTP_HOST" "$SMTP_HOST" false
check_var "SMTP_USER" "$SMTP_USER" false
check_var "GOOGLE_CLIENT_ID" "$GOOGLE_CLIENT_ID" false
check_var "GOOGLE_CLIENT_SECRET" "$GOOGLE_CLIENT_SECRET" false

echo ""
echo "📋 VARIABLES DEL FRONTEND"
echo "========================"
echo ""

# Verificar variables del frontend
check_var "NEXT_PUBLIC_API_URL" "$NEXT_PUBLIC_API_URL"

echo ""
echo "🔍 VERIFICACIONES ADICIONALES"
echo "============================="
echo ""

# Verificar formato de DATABASE_URL
if [ -n "$DATABASE_URL" ]; then
  if [[ "$DATABASE_URL" == *"neon.tech"* ]]; then
    echo -e "${GREEN}✅ DATABASE_URL parece ser de Neon${NC}"
  else
    echo -e "${YELLOW}⚠️  DATABASE_URL no parece ser de Neon${NC}"
  fi
  
  if [[ "$DATABASE_URL" == *"sslmode=require"* ]]; then
    echo -e "${GREEN}✅ DATABASE_URL incluye sslmode=require${NC}"
  else
    echo -e "${YELLOW}⚠️  DATABASE_URL debería incluir ?sslmode=require para Neon${NC}"
  fi
fi

# Verificar longitud de JWT_SECRET
if [ -n "$JWT_SECRET" ]; then
  LENGTH=${#JWT_SECRET}
  if [ $LENGTH -ge 32 ]; then
    echo -e "${GREEN}✅ JWT_SECRET tiene $LENGTH caracteres (mínimo 32)${NC}"
  else
    echo -e "${RED}❌ JWT_SECRET tiene solo $LENGTH caracteres (mínimo 32)${NC}"
    ERRORS=$((ERRORS + 1))
  fi
fi

# Verificar formato de FRONTEND_URL
if [ -n "$FRONTEND_URL" ]; then
  if [[ "$FRONTEND_URL" == https://* ]]; then
    echo -e "${GREEN}✅ FRONTEND_URL usa HTTPS${NC}"
  else
    echo -e "${YELLOW}⚠️  FRONTEND_URL debería usar HTTPS en producción${NC}"
  fi
  
  if [[ "$FRONTEND_URL" == */ ]]; then
    echo -e "${YELLOW}⚠️  FRONTEND_URL no debería terminar en /${NC}"
  else
    echo -e "${GREEN}✅ FRONTEND_URL tiene formato correcto${NC}"
  fi
fi

# Verificar formato de NEXT_PUBLIC_API_URL
if [ -n "$NEXT_PUBLIC_API_URL" ]; then
  if [[ "$NEXT_PUBLIC_API_URL" == https://* ]]; then
    echo -e "${GREEN}✅ NEXT_PUBLIC_API_URL usa HTTPS${NC}"
  else
    echo -e "${YELLOW}⚠️  NEXT_PUBLIC_API_URL debería usar HTTPS en producción${NC}"
  fi
  
  if [[ "$NEXT_PUBLIC_API_URL" == */api ]]; then
    echo -e "${GREEN}✅ NEXT_PUBLIC_API_URL termina en /api${NC}"
  else
    echo -e "${YELLOW}⚠️  NEXT_PUBLIC_API_URL debería terminar en /api${NC}"
  fi
fi

echo ""
echo "📊 RESUMEN"
echo "=========="
echo ""

if [ $ERRORS -eq 0 ]; then
  echo -e "${GREEN}✅ Todas las variables requeridas están configuradas${NC}"
  echo ""
  echo "🚀 Puedes proceder con el deployment"
  exit 0
else
  echo -e "${RED}❌ Se encontraron $ERRORS error(es)${NC}"
  echo ""
  echo "⚠️  Por favor, configura las variables faltantes antes de deployar"
  exit 1
fi

