#!/bin/bash

# ============================================
# Script para Obtener Payment ID desde Preference ID
# ============================================
# Útil cuando solo tienes el preference_id

echo "🔍 Obtener Payment ID desde Preference ID"
echo "==========================================="
echo ""

BACKEND_URL="${BACKEND_URL:-http://localhost:4000}"

# Verificar que el backend esté corriendo
if ! curl -s "$BACKEND_URL/api" > /dev/null 2>&1; then
    echo "❌ Backend no está corriendo"
    exit 1
fi

# Obtener preference_id
if [ -n "$1" ]; then
    PREFERENCE_ID="$1"
else
    echo "Ingresa el preference_id (el ID que aparece en la URL de checkout):"
    read -r PREFERENCE_ID
fi

if [ -z "$PREFERENCE_ID" ]; then
    echo "❌ preference_id requerido"
    exit 1
fi

echo ""
echo "📋 Nota importante:"
echo "   El payment_id se genera DESPUÉS de completar el pago."
echo "   Si aún no completaste el pago, este script no funcionará."
echo ""
echo "   El payment_id aparece en la URL después del pago:"
echo "   ?payment_id=123456789"
echo ""
echo "   O puedes consultarlo desde el panel de Mercado Pago:"
echo "   https://www.mercadopago.com.ar/activities/payments"
echo ""

# Intentar obtener información de la preferencia
echo "🔍 Consultando información de la preferencia..."
echo "   (Esto solo muestra la preferencia, no el payment_id)"
echo ""

# Nota: No hay endpoint directo para obtener payments desde preference
# El payment_id solo se obtiene después del pago

echo "💡 Para obtener el payment_id:"
echo ""
echo "1. Completa el pago en Mercado Pago"
echo "2. Después del pago, Mercado Pago te redirige a:"
echo "   http://localhost:3000/convencion/pago-exitoso?payment_id=XXXXX"
echo "3. El payment_id está en el parámetro ?payment_id=XXXXX"
echo ""
echo "O consulta en el panel de Mercado Pago:"
echo "   https://www.mercadopago.com.ar/activities/payments"
echo ""
echo "Preference ID: $PREFERENCE_ID"

