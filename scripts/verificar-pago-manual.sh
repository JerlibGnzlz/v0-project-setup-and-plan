#!/bin/bash

# ============================================
# Script para verificar manualmente el estado de un pago
# ============================================
# Útil cuando el webhook no se procesa automáticamente (localhost)

echo "🔍 Verificación Manual de Pago"
echo "==============================="
echo ""

BACKEND_URL="${BACKEND_URL:-http://localhost:4000}"

# Verificar que el backend esté corriendo
if ! curl -s "$BACKEND_URL/api" > /dev/null 2>&1; then
    echo "❌ Backend no está corriendo. Inicia con: cd backend && npm run start:dev"
    exit 1
fi

# Solicitar el ID del pago
echo "Ingresa el ID del pago de Mercado Pago (payment_id):"
read -r PAYMENT_ID

if [ -z "$PAYMENT_ID" ]; then
    echo "❌ ID de pago requerido"
    exit 1
fi

echo ""
echo "🔍 Consultando estado del pago: $PAYMENT_ID"
echo ""

# Obtener estado del pago desde Mercado Pago
PAYMENT_STATUS=$(curl -s "$BACKEND_URL/api/mercado-pago/payment/$PAYMENT_ID")

if echo "$PAYMENT_STATUS" | grep -q "status"; then
    echo "✅ Estado del pago obtenido:"
    echo ""
    echo "$PAYMENT_STATUS" | jq '.' 2>/dev/null || echo "$PAYMENT_STATUS"
    
    STATUS=$(echo "$PAYMENT_STATUS" | jq -r '.status' 2>/dev/null)
    EXTERNAL_REF=$(echo "$PAYMENT_STATUS" | jq -r '.external_reference' 2>/dev/null)
    
    echo ""
    echo "📊 Resumen:"
    echo "   - Estado: $STATUS"
    echo "   - External Reference (Pago ID): $EXTERNAL_REF"
    
    if [ "$STATUS" = "approved" ]; then
        echo ""
        echo "✅ Pago APROBADO"
        echo ""
        echo "💡 Ahora necesitas procesar el webhook manualmente:"
        echo "   curl -X POST $BACKEND_URL/api/mercado-pago/webhook \\"
        echo "     -H 'Content-Type: application/json' \\"
        echo "     -d '{\"type\":\"payment\",\"action\":\"payment.updated\",\"data_id\":\"$PAYMENT_ID\"}'"
    elif [ "$STATUS" = "pending" ]; then
        echo ""
        echo "⏳ Pago PENDIENTE"
        echo "   Espera unos minutos y vuelve a verificar"
    elif [ "$STATUS" = "rejected" ] || [ "$STATUS" = "cancelled" ]; then
        echo ""
        echo "❌ Pago RECHAZADO o CANCELADO"
    fi
else
    echo "❌ Error al obtener el estado del pago"
    echo "$PAYMENT_STATUS" | jq '.' 2>/dev/null || echo "$PAYMENT_STATUS"
    exit 1
fi

