#!/bin/bash

# Script para instalar dependencias de 2FA

echo "📦 Instalando dependencias de 2FA..."

# Intentar con npm
if command -v npm &> /dev/null; then
    echo "Usando npm..."
    npm install speakeasy qrcode @types/qrcode --save --legacy-peer-deps || {
        echo "⚠️ npm falló, intentando con yarn..."
        if command -v yarn &> /dev/null; then
            yarn add speakeasy qrcode @types/qrcode
        else
            echo "❌ No se encontró npm ni yarn"
            exit 1
        fi
    }
else
    echo "⚠️ npm no encontrado, intentando con yarn..."
    if command -v yarn &> /dev/null; then
        yarn add speakeasy qrcode @types/qrcode
    else
        echo "❌ No se encontró npm ni yarn"
        exit 1
    fi
fi

echo "✅ Dependencias instaladas"
echo ""
echo "🔄 Regenerando Prisma Client..."
npx prisma generate

echo ""
echo "✅ ¡Listo! Ahora puedes reiniciar el backend"














