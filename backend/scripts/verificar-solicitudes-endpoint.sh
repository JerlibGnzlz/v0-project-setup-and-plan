#!/bin/bash
# Script para verificar que el endpoint de solicitudes de credenciales esté disponible

BASE_URL="${1:-https://ministerio-backend-wdbj.onrender.com/api}"
echo "🔍 Verificando endpoint de solicitudes de credenciales en: $BASE_URL"
echo "--------------------------------------------------"

# Función para probar un endpoint
test_endpoint() {
  local method=$1
  local path=$2
  local expected_status=$3
  local description=$4
  local data=$5
  local headers=$6

  echo -n "Testing $method $path ($description)... "

  local curl_cmd="curl -s -o /dev/null -w '%{http_code}'"
  if [ -n "$data" ]; then
    curl_cmd+=" -H 'Content-Type: application/json' -d '$data'"
  fi
  if [ -n "$headers" ]; then
    curl_cmd+=" $headers"
  fi
  curl_cmd+=" ${BASE_URL}${path}"

  local http_code=$(eval "$curl_cmd")

  if [ "$http_code" == "$expected_status" ]; then
    echo "✅ OK (Status: $http_code)"
  else
    echo "❌ FALLÓ (Status: $http_code, Esperado: $expected_status)"
    if [ "$http_code" == "404" ]; then
      echo "   ⚠️  El endpoint no existe. Verifica que el backend esté desplegado con los últimos cambios."
    fi
  fi
}

# Endpoints públicos (no requieren autenticación)
test_endpoint "GET" "/noticias/publicadas" "200" "Noticias públicas"

# Endpoints que requieren autenticación de invitado (con un token de prueba inválido)
INVALID_INVITADO_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJ0eXBlIjoiaW52aXRhZG8ifQ.invalid-signature"
AUTH_HEADER_INVITADO="-H 'Authorization: Bearer $INVALID_INVITADO_TOKEN'"

echo ""
echo "📋 Endpoints de Solicitudes de Credenciales:"
test_endpoint "POST" "/solicitudes-credenciales" "401" "Crear solicitud (requiere token válido)" '{"tipo":"ministerial","dni":"12345678","nombre":"Test","apellido":"User"}' "$AUTH_HEADER_INVITADO"
test_endpoint "GET" "/solicitudes-credenciales/mis-solicitudes" "401" "Mis solicitudes (requiere token válido)" "" "$AUTH_HEADER_INVITADO"

echo ""
echo "📋 Endpoints de Admins (requieren token de admin):"
INVALID_ADMIN_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.invalid-signature"
AUTH_HEADER_ADMIN="-H 'Authorization: Bearer $INVALID_ADMIN_TOKEN'"

test_endpoint "GET" "/solicitudes-credenciales" "401" "Listar todas las solicitudes (requiere token de admin)" "" "$AUTH_HEADER_ADMIN"

echo ""
echo "--------------------------------------------------"
echo "✅ Verificación completada."
echo ""
echo "💡 Si algún endpoint devuelve 404:"
echo "   1. Verifica que el backend esté desplegado en Render.com"
echo "   2. Verifica que la migración de Prisma se haya aplicado"
echo "   3. Verifica que el módulo SolicitudesCredencialesModule esté importado en app.module.ts"
echo "   4. Revisa los logs de Render.com para ver si hay errores de compilación"

