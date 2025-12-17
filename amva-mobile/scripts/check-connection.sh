#!/bin/bash

# Script para verificar la conectividad con el backend
# Uso: ./scripts/check-connection.sh

echo "🔍 Verificando conectividad con el backend..."
echo ""

# Obtener IP local
LOCAL_IP=$(hostname -I 2>/dev/null | awk '{print $1}' || ip addr show | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | cut -d/ -f1 | head -1)
API_URL="http://${LOCAL_IP}:4000/api"

echo "📍 Tu IP local: $LOCAL_IP"
echo "📍 URL del API: $API_URL"
echo ""

# Verificar si el puerto está abierto
echo "🔍 Verificando si el puerto 4000 está abierto..."
if command -v nc &> /dev/null; then
  if nc -z localhost 4000 2>/dev/null; then
    echo "✅ Puerto 4000 está abierto en localhost"
  else
    echo "❌ Puerto 4000 NO está abierto en localhost"
    echo "   → El backend probablemente no está corriendo"
    echo "   → Ejecuta: cd backend && npm run start:dev"
  fi
else
  echo "⚠️  'nc' (netcat) no está disponible, no se puede verificar el puerto"
fi

echo ""
echo "🧪 Probando conexión HTTP..."

# Intentar conexión con curl
if command -v curl &> /dev/null; then
  echo "📡 Probando: curl $API_URL/noticias/publicadas"
  if curl -s --connect-timeout 5 "$API_URL/noticias/publicadas" > /dev/null 2>&1; then
    echo "✅ Conexión exitosa desde esta máquina"
  else
    echo "❌ No se puede conectar desde esta máquina"
    echo "   → Verifica que el backend esté corriendo"
    echo "   → Verifica que el backend escuche en 0.0.0.0 (no solo localhost)"
  fi
else
  echo "⚠️  'curl' no está disponible, no se puede probar la conexión"
fi

echo ""
echo "💡 Pasos para resolver problemas:"
echo "   1. Verifica que el backend esté corriendo:"
echo "      cd backend && npm run start:dev"
echo ""
echo "   2. Verifica que el backend escuche en 0.0.0.0:"
echo "      Busca 'await app.listen(port, '0.0.0.0')' en backend/src/main.ts línea 177"
echo ""
echo "   3. Verifica el firewall (Linux):"
echo "      sudo ufw allow 4000"
echo ""
echo "   4. Verifica que dispositivo móvil y PC estén en la misma red WiFi"
echo ""
echo "   5. Si tu IP cambió, actualiza LOCAL_IP en:"
echo "      amva-mobile/src/api/client.ts línea 63"
echo "      IP actual: $LOCAL_IP"

