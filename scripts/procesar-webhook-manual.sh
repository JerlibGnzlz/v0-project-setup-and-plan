#!/bin/bash

# ============================================
# Script para Procesar Webhook Manualmente
# ============================================

echo "🔧 Procesar Webhook de Mercado Pago Manualmente"
echo "================================================"
echo ""

BACKEND_URL="${BACKEND_URL:-http://localhost:4000}"

# Verificar que el backend esté corriendo
if ! curl -s "$BACKEND_URL/api" > /dev/null 2>&1; then
    echo "❌ Backend no está corriendo. Inicia con: cd backend && npm run start:dev"
    exit 1
fi

echo "📋 Para procesar el webhook, necesitas el payment_id de Mercado Pago"
echo ""
echo "¿Dónde encontrar el payment_id?"
echo "1. En la URL después del pago: ?payment_id=123456789"
echo "2. En los logs del backend cuando creaste la preferencia"
echo "3. Consultando el estado del pago desde la preferencia"
echo ""

# Obtener payment_id como parámetro o solicitarlo
if [ -n "$1" ]; then
    PAYMENT_ID="$1"
    echo "✅ Usando payment_id: $PAYMENT_ID"
else
    echo "Ingresa el payment_id de Mercado Pago:"
    read -r PAYMENT_ID
    
    if [ -z "$PAYMENT_ID" ]; then
        echo "❌ payment_id requerido"
        echo ""
        echo "Uso: ./scripts/procesar-webhook-manual.sh [payment_id]"
        exit 1
    fi
fi

echo ""
echo "🔍 Verificando estado del pago primero..."
echo ""

# Verificar estado del pago
PAYMENT_STATUS=$(curl -s "$BACKEND_URL/api/mercado-pago/payment/$PAYMENT_ID")

if echo "$PAYMENT_STATUS" | grep -q "status"; then
    STATUS=$(echo "$PAYMENT_STATUS" | jq -r '.status' 2>/dev/null)
    EXTERNAL_REF=$(echo "$PAYMENT_STATUS" | jq -r '.external_reference' 2>/dev/null)
    
    echo "✅ Estado del pago:"
    echo "   - Payment ID: $PAYMENT_ID"
    echo "   - Estado: $STATUS"
    echo "   - External Reference (Pago ID en BD): $EXTERNAL_REF"
    echo ""
    
    if [ "$STATUS" != "approved" ]; then
        echo "⚠️  El pago no está aprobado (estado: $STATUS)"
        echo "   ¿Deseas procesar el webhook de todas formas? (s/n)"
        read -r CONFIRM
        if [ "$CONFIRM" != "s" ] && [ "$CONFIRM" != "S" ]; then
            echo "❌ Cancelado"
            exit 0
        fi
    fi
else
    echo "⚠️  No se pudo obtener el estado del pago"
    echo "   ¿Deseas continuar de todas formas? (s/n)"
    read -r CONFIRM
    if [ "$CONFIRM" != "s" ] && [ "$CONFIRM" != "S" ]; then
        echo "❌ Cancelado"
        exit 0
    fi
fi

echo ""
echo "📤 Procesando webhook..."
echo ""

# Procesar webhook
WEBHOOK_RESPONSE=$(curl -s -X POST "$BACKEND_URL/api/mercado-pago/webhook" \
  -H "Content-Type: application/json" \
  -d "{
    \"type\": \"payment\",
    \"action\": \"payment.updated\",
    \"data_id\": \"$PAYMENT_ID\"
  }")

# Verificar respuesta
if echo "$WEBHOOK_RESPONSE" | grep -q "ok\|procesado"; then
    echo "✅ Webhook procesado exitosamente!"
    echo ""
    echo "📋 Respuesta:"
    echo "$WEBHOOK_RESPONSE" | jq '.' 2>/dev/null || echo "$WEBHOOK_RESPONSE"
    
    if [ -n "$EXTERNAL_REF" ] && [ "$EXTERNAL_REF" != "null" ]; then
        echo ""
        echo "🔍 Verificando que el pago se actualizó en la BD..."
        echo ""
        
        # Obtener información del pago desde la BD
        PAGO_INFO=$(curl -s "$BACKEND_URL/api/inscripciones" | jq -r ".data[] | select(.pagos[].id == \"$EXTERNAL_REF\") | {id, email, pagos: [.pagos[] | select(.id == \"$EXTERNAL_REF\")]} | .pagos[0]" 2>/dev/null)
        
        if [ -n "$PAGO_INFO" ]; then
            ESTADO_BD=$(echo "$PAGO_INFO" | jq -r '.estado' 2>/dev/null)
            echo "✅ Pago actualizado en la BD:"
            echo "   - Estado: $ESTADO_BD"
            echo "   - Pago ID: $EXTERNAL_REF"
        else
            echo "⚠️  No se pudo verificar el estado en la BD"
        fi
    fi
    
    echo ""
    echo "✅ Proceso completado!"
    echo ""
    echo "💡 El pago debería estar actualizado. Verifica en:"
    echo "   - Panel admin: http://localhost:3000/admin/inscripciones"
    echo "   - O consulta: curl $BACKEND_URL/api/inscripciones | jq '.data[] | select(.pagos[].id == \"$EXTERNAL_REF\")'"
else
    echo "❌ Error al procesar el webhook"
    echo ""
    echo "Respuesta:"
    echo "$WEBHOOK_RESPONSE" | jq '.' 2>/dev/null || echo "$WEBHOOK_RESPONSE"
    exit 1
fi

