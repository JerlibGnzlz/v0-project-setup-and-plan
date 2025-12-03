#!/bin/bash

echo "🔍 Verificando configuración de MercadoPago..."
echo ""

# Verificar archivo .env
if [ -f "backend/.env" ]; then
    echo "✅ Archivo .env existe"
else
    echo "❌ Archivo .env NO existe"
    echo "   Crea uno copiando backend/env.example.txt"
    exit 1
fi

# Verificar variables
cd backend
source .env 2>/dev/null || true

if [ -z "$MERCADOPAGO_ACCESS_TOKEN" ]; then
    echo "❌ MERCADOPAGO_ACCESS_TOKEN no configurado"
else
    echo "✅ MERCADOPAGO_ACCESS_TOKEN configurado"
fi

if [ -z "$BACKEND_URL" ]; then
    echo "❌ BACKEND_URL no configurado"
else
    echo "✅ BACKEND_URL configurado: $BACKEND_URL"
fi

if [ -z "$FRONTEND_URL" ]; then
    echo "❌ FRONTEND_URL no configurado"
else
    echo "✅ FRONTEND_URL configurado: $FRONTEND_URL"
fi

echo ""
echo "📋 Próximos pasos:"
echo "1. Verifica que el backend esté corriendo: pnpm run start:dev"
echo "2. Busca en los logs: '✅ MercadoPago inicializado'"
echo "3. Prueba crear una preferencia desde Postman o el frontend"
