#!/bin/bash

# Script para iniciar ngrok para el backend de Mercado Pago
# Uso: ./scripts/start-ngrok.sh

# Asegurar que ngrok esté en el PATH
export PATH="$HOME/.local/bin:$PATH"

# Verificar que ngrok esté instalado
if ! command -v ngrok &> /dev/null; then
    echo "❌ ngrok no está instalado. Instálalo primero."
    exit 1
fi

# Verificar que el backend esté corriendo
if ! curl -s http://localhost:4000/api/mercado-pago/status > /dev/null 2>&1; then
    echo "⚠️  ADVERTENCIA: El backend no parece estar corriendo en el puerto 4000"
    echo "   Asegúrate de iniciar el backend antes de usar ngrok"
    echo ""
fi

echo "🚀 Iniciando ngrok para el puerto 4000..."
echo ""
echo "📋 INSTRUCCIONES:"
echo "   1. Copia la URL HTTPS que ngrok te muestra (ej: https://abc123.ngrok.io)"
echo "   2. Ve al panel de Mercado Pago: https://www.mercadopago.com/developers/panel"
echo "   3. Configura el webhook con la URL: https://abc123.ngrok.io/api/mercado-pago/webhook"
echo "   4. Eventos: Selecciona 'Pagos'"
echo ""
echo "⚠️  NOTA: Mantén esta terminal abierta mientras uses ngrok"
echo "   Presiona Ctrl+C para detener ngrok"
echo ""

# Iniciar ngrok
ngrok http 4000























