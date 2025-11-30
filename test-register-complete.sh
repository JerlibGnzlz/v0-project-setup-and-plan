#!/bin/bash

# Script para probar el endpoint register-complete
# Uso: ./test-register-complete.sh

echo "🧪 Probando endpoint: /api/auth/pastor/register-complete"
echo ""

# Datos de prueba
NOMBRE="Test"
APELLIDO="User"
EMAIL="test$(date +%s)@test.com"  # Email único con timestamp
PASSWORD="Test1234"

echo "📝 Datos de prueba:"
echo "   Nombre: $NOMBRE"
echo "   Apellido: $APELLIDO"
echo "   Email: $EMAIL"
echo "   Password: $PASSWORD"
echo ""

# Hacer la petición
echo "📡 Enviando petición..."
echo ""

RESPONSE=$(curl -s -X POST http://localhost:4000/api/auth/pastor/register-complete \
  -H "Content-Type: application/json" \
  -d "{
    \"nombre\": \"$NOMBRE\",
    \"apellido\": \"$APELLIDO\",
    \"email\": \"$EMAIL\",
    \"password\": \"$PASSWORD\"
  }")

echo "✅ Respuesta del servidor:"
echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"
echo ""

# Verificar si fue exitoso
if echo "$RESPONSE" | grep -q "Pastor registrado exitosamente"; then
  echo "✅ ¡Éxito! El pastor fue registrado correctamente."
else
  echo "❌ Error en la respuesta"
fi

