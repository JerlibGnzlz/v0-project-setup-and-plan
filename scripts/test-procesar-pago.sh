#!/bin/bash

# ============================================
# Script para probar el procesamiento automático de webhook
# ============================================

echo "🧪 Prueba del Procesamiento Automático de Webhook"
echo "=================================================="
echo ""

BACKEND_URL="${BACKEND_URL:-http://localhost:4000}"

# Verificar que el backend esté corriendo
if ! curl -s "$BACKEND_URL/api" > /dev/null 2>&1; then
    echo "❌ Backend no está corriendo. Inicia con: cd backend && npm run start:dev"
    exit 1
fi

echo "✅ Backend está corriendo"
echo ""

# Solicitar payment_id
if [ -z "$1" ]; then
    echo "📋 Uso: $0 <payment_id>"
    echo ""
    echo "💡 Para obtener el payment_id:"
    echo "   1. Completa un pago en Mercado Pago"
    echo "   2. Después del pago, mira la URL de redirección"
    echo "   3. El payment_id está en: ?payment_id=123456789"
    echo ""
    echo "   Ejemplo: $0 123456789"
    exit 1
fi

PAYMENT_ID="$1"

echo "🔄 Procesando webhook para payment_id: $PAYMENT_ID"
echo ""

# Llamar al endpoint de procesamiento automático
RESPONSE=$(curl -s -X POST "$BACKEND_URL/api/mercado-pago/process-payment" \
  -H "Content-Type: application/json" \
  -d "{\"paymentId\": \"$PAYMENT_ID\"}")

# Verificar respuesta
if echo "$RESPONSE" | grep -q '"status":"ok"'; then
    echo "✅ Webhook procesado exitosamente!"
    echo ""
    echo "📋 Respuesta:"
    echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"
    echo ""
    echo "✅ El estado del pago ha sido actualizado en la base de datos"
    echo "✅ Se ha enviado el email de confirmación (si aplica)"
else
    echo "❌ Error al procesar el webhook"
    echo ""
    echo "Respuesta:"
    echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"
    exit 1
fi
