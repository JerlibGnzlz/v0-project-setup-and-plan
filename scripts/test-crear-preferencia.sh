#!/bin/bash

# ============================================
# Script para crear una preferencia de prueba
# ============================================

echo "🧪 Creando Preferencia de Pago de Prueba"
echo "========================================="
echo ""

BACKEND_URL="${BACKEND_URL:-http://localhost:4000}"

# Verificar que el backend esté corriendo
if ! curl -s "$BACKEND_URL/api" > /dev/null 2>&1; then
    echo "❌ Backend no está corriendo. Inicia con: cd backend && npm run start:dev"
    exit 1
fi

# Obtener una convención activa
echo "1️⃣ Obteniendo una convención activa..."
CONVENCION_ID=$(curl -s "$BACKEND_URL/api/convenciones?activa=true" | jq -r '.[0].id' 2>/dev/null)

if [ -z "$CONVENCION_ID" ] || [ "$CONVENCION_ID" = "null" ]; then
    echo "⚠️  No se encontró una convención activa"
    echo "   Usando datos de prueba..."
    CONVENCION_ID="test-convencion-123"
else
    echo "✅ Convención encontrada: $CONVENCION_ID"
fi

echo ""
echo "2️⃣ Obteniendo una inscripción real..."

# Obtener una inscripción real de la BD (sin limit para evitar error de tipo)
INSCRIPCION_DATA=$(curl -s "$BACKEND_URL/api/inscripciones" | jq -r '.data[0] // .[0] // empty' 2>/dev/null)

if [ -z "$INSCRIPCION_DATA" ] || [ "$INSCRIPCION_DATA" = "null" ]; then
    echo "❌ No se encontraron inscripciones en la base de datos"
    echo "   Por favor, crea una inscripción primero desde el frontend o el admin"
    exit 1
fi

INSCRIPCION_ID=$(echo "$INSCRIPCION_DATA" | jq -r '.id')
PAGO_ID=$(echo "$INSCRIPCION_DATA" | jq -r '.pagos[0].id // empty')

if [ -z "$PAGO_ID" ] || [ "$PAGO_ID" = "null" ]; then
    echo "❌ La inscripción no tiene pagos asociados"
    echo "   Inscripción ID: $INSCRIPCION_ID"
    exit 1
fi

MONTO=$(echo "$INSCRIPCION_DATA" | jq -r '.pagos[0].monto')
EMAIL=$(echo "$INSCRIPCION_DATA" | jq -r '.email')
NOMBRE=$(echo "$INSCRIPCION_DATA" | jq -r '.nombre')
APELLIDO=$(echo "$INSCRIPCION_DATA" | jq -r '.apellido')
NUMERO_CUOTA=$(echo "$INSCRIPCION_DATA" | jq -r '.pagos[0].numeroCuota // 1')

echo "✅ Inscripción encontrada:"
echo "   - ID: $INSCRIPCION_ID"
echo "   - Email: $EMAIL"
echo "   - Nombre: $NOMBRE $APELLIDO"
echo "   - Pago ID: $PAGO_ID"
echo "   - Monto: $MONTO"
echo "   - Cuota: $NUMERO_CUOTA"

echo ""
echo "3️⃣ Creando preferencia de pago..."

# Datos reales de la inscripción
TEST_DATA=$(cat <<EOF
{
  "inscripcionId": "$INSCRIPCION_ID",
  "pagoId": "$PAGO_ID",
  "monto": $MONTO,
  "emailPayer": "$EMAIL",
  "nombrePayer": "$NOMBRE",
  "apellidoPayer": "$APELLIDO",
  "numeroCuota": $NUMERO_CUOTA,
  "descripcion": "Pago de prueba - Mercado Pago"
}
EOF
)

# Crear preferencia
echo "   Enviando request..."
RESPONSE=$(curl -s -X POST "$BACKEND_URL/api/mercado-pago/create-preference" \
  -H "Content-Type: application/json" \
  -d "$TEST_DATA")

# Verificar respuesta
if echo "$RESPONSE" | grep -q "init_point\|sandbox_init_point"; then
    echo "✅ Preferencia creada exitosamente!"
    echo ""
    echo "📋 Detalles:"
    echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"
    
    # Extraer URL de checkout
    CHECKOUT_URL=$(echo "$RESPONSE" | jq -r '.sandbox_init_point // .init_point' 2>/dev/null)
    
    if [ -n "$CHECKOUT_URL" ] && [ "$CHECKOUT_URL" != "null" ]; then
        echo ""
        echo "🔗 URL de Checkout:"
        echo "$CHECKOUT_URL"
        echo ""
        echo "💡 Abre esta URL en tu navegador para probar el pago"
        echo "   (En modo TEST, puedes usar tarjetas de prueba de Mercado Pago)"
    fi
else
    echo "❌ Error al crear la preferencia"
    echo ""
    echo "Respuesta:"
    echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"
    exit 1
fi

