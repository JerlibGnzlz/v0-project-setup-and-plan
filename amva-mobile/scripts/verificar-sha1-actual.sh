#!/bin/bash

# Script para verificar el SHA-1 actual y compararlo con el proporcionado

echo "🔍 Verificación de SHA-1"
echo "========================"
echo ""

SHA1_PROVIDED="4B:24:0F:1B:6A:E6:3D:71:38:77:D1:E7:69:40:D2:1D:5D:30:7C:40"

echo "📝 SHA-1 que agregaste en Google Cloud Console:"
echo "   $SHA1_PROVIDED"
echo ""

echo "🔑 Para obtener el SHA-1 actual desde EAS, ejecuta:"
echo "   eas credentials"
echo "   → Selecciona: Android"
echo "   → Selecciona: View credentials"
echo "   → Copia el SHA-1 que aparece"
echo ""

echo "⚠️  IMPORTANTE: Compara ambos SHA-1"
echo "   Deben ser EXACTAMENTE iguales (mismo formato, mismos caracteres)"
echo ""

echo "🔍 Verificando configuración en app.json..."
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
APP_JSON="$PROJECT_ROOT/app.json"

if [ -f "$APP_JSON" ]; then
    GOOGLE_CLIENT_ID=$(grep -o '"googleAndroidClientId": "[^"]*"' "$APP_JSON" | cut -d'"' -f4)
    echo "✅ googleAndroidClientId encontrado:"
    echo "   $GOOGLE_CLIENT_ID"
    echo ""
else
    echo "❌ app.json no encontrado"
fi

echo "📋 Checklist:"
echo ""
echo "[ ] SHA-1 en Google Cloud Console: $SHA1_PROVIDED"
echo "[ ] SHA-1 en EAS credentials: [ejecuta 'eas credentials' para obtenerlo]"
echo "[ ] Ambos SHA-1 son EXACTAMENTE iguales"
echo "[ ] Esperaste al menos 30 minutos después de agregar SHA-1"
echo "[ ] OAuth consent screen está publicado o en modo prueba"
echo "[ ] Desinstalaste y reinstalaste la app"
echo ""

