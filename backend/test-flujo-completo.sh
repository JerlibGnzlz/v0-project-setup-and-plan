#!/bin/bash

# Script para probar el flujo completo de inscripción y validación de pagos

echo "🧪 PRUEBA COMPLETA DEL FLUJO DE INSCRIPCIÓN Y PAGOS"
echo "=================================================="
echo ""

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 1. Obtener token de admin
echo -e "${YELLOW}📝 Paso 1: Obteniendo token de admin...${NC}"
TOKEN=$(curl -s -X POST http://localhost:4000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@ministerio-amva.org","password":"admin123"}' | \
  grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo -e "${RED}❌ Error: No se pudo obtener el token${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Token obtenido${NC}"
echo ""

# 2. Crear nueva inscripción
echo -e "${YELLOW}📝 Paso 2: Creando nueva inscripción...${NC}"
INSCRIPCION_RESPONSE=$(curl -s -X POST http://localhost:4000/api/inscripciones \
  -H "Content-Type: application/json" \
  -d '{
    "convencionId": "91d9c1ba-f83d-426b-ae2f-8af887494f36",
    "nombre": "Maria",
    "apellido": "Carrillo Castro",
    "email": "mariacarrillocastro81@gmail.com",
    "telefono": "+54 11 1234-5678",
    "sede": "Buenos Aires",
    "tipoInscripcion": "pastor",
    "numeroCuotas": 3,
    "origenRegistro": "web"
  }')

INSCRIPCION_ID=$(echo $INSCRIPCION_RESPONSE | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -z "$INSCRIPCION_ID" ]; then
  echo -e "${RED}❌ Error: No se pudo crear la inscripción${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Inscripción creada: $INSCRIPCION_ID${NC}"
echo -e "${GREEN}📧 Email de confirmación debería haberse enviado a mariacarrillocastro81@gmail.com${NC}"
echo ""

# 3. Obtener IDs de los pagos
echo -e "${YELLOW}📝 Paso 3: Obteniendo IDs de pagos...${NC}"
PAGOS_RESPONSE=$(curl -s http://localhost:4000/api/inscripciones/$INSCRIPCION_ID)
PAGO1_ID=$(echo $PAGOS_RESPONSE | grep -o '"id":"[^"]*","monto":"33333.33","estado":"PENDIENTE"[^}]*"numeroCuota":1' | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
PAGO2_ID=$(echo $PAGOS_RESPONSE | grep -o '"id":"[^"]*","monto":"33333.33","estado":"PENDIENTE"[^}]*"numeroCuota":2' | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
PAGO3_ID=$(echo $PAGOS_RESPONSE | grep -o '"id":"[^"]*","monto":"33333.33","estado":"PENDIENTE"[^}]*"numeroCuota":3' | grep -o '"id":"[^"]*"' | cut -d'"' -f4)

# Método alternativo: obtener todos los pagos y filtrar
PAGO1_ID=$(curl -s http://localhost:4000/api/pagos -H "Authorization: Bearer $TOKEN" | grep -o "\"inscripcionId\":\"$INSCRIPCION_ID\"[^}]*\"numeroCuota\":1[^}]*\"id\":\"[^\"]*\"" | grep -o '"id":"[^"]*"' | cut -d'"' -f4 | head -1)
PAGO2_ID=$(curl -s http://localhost:4000/api/pagos -H "Authorization: Bearer $TOKEN" | grep -o "\"inscripcionId\":\"$INSCRIPCION_ID\"[^}]*\"numeroCuota\":2[^}]*\"id\":\"[^\"]*\"" | grep -o '"id":"[^"]*"' | cut -d'"' -f4 | head -1)
PAGO3_ID=$(curl -s http://localhost:4000/api/pagos -H "Authorization: Bearer $TOKEN" | grep -o "\"inscripcionId\":\"$INSCRIPCION_ID\"[^}]*\"numeroCuota\":3[^}]*\"id\":\"[^\"]*\"" | grep -o '"id":"[^"]*"' | cut -d'"' -f4 | head -1)

echo "Pago 1 ID: $PAGO1_ID"
echo "Pago 2 ID: $PAGO2_ID"
echo "Pago 3 ID: $PAGO3_ID"
echo ""

# 4. Validar Pago 1
if [ ! -z "$PAGO1_ID" ]; then
  echo -e "${YELLOW}💰 Paso 4: Validando Pago 1 (Cuota 1/3)...${NC}"
  curl -s -X PATCH http://localhost:4000/api/pagos/$PAGO1_ID \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{"estado": "COMPLETADO"}' > /dev/null
  echo -e "${GREEN}✅ Pago 1 validado${NC}"
  echo -e "${GREEN}📧 Email de pago validado debería haberse enviado${NC}"
  echo ""
  sleep 2
fi

# 5. Validar Pago 2
if [ ! -z "$PAGO2_ID" ]; then
  echo -e "${YELLOW}💰 Paso 5: Validando Pago 2 (Cuota 2/3)...${NC}"
  curl -s -X PATCH http://localhost:4000/api/pagos/$PAGO2_ID \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{"estado": "COMPLETADO"}' > /dev/null
  echo -e "${GREEN}✅ Pago 2 validado${NC}"
  echo -e "${GREEN}📧 Email de pago validado debería haberse enviado${NC}"
  echo ""
  sleep 2
fi

# 6. Validar Pago 3 (debería confirmar la inscripción)
if [ ! -z "$PAGO3_ID" ]; then
  echo -e "${YELLOW}💰 Paso 6: Validando Pago 3 (Cuota 3/3 - FINAL)...${NC}"
  curl -s -X PATCH http://localhost:4000/api/pagos/$PAGO3_ID \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{"estado": "COMPLETADO"}' > /dev/null
  echo -e "${GREEN}✅ Pago 3 validado${NC}"
  echo -e "${GREEN}📧 Email de inscripción confirmada debería haberse enviado${NC}"
  echo ""
  sleep 2
fi

# 7. Verificar estado final
echo -e "${YELLOW}📊 Paso 7: Verificando estado final...${NC}"
ESTADO_FINAL=$(curl -s http://localhost:4000/api/inscripciones/$INSCRIPCION_ID | grep -o '"estado":"[^"]*"' | cut -d'"' -f4)
echo -e "${GREEN}Estado de la inscripción: $ESTADO_FINAL${NC}"
echo ""

echo "=================================================="
echo -e "${GREEN}✅ FLUJO COMPLETO FINALIZADO${NC}"
echo ""
echo "📬 Emails que deberían haber llegado a mariacarrillocastro81@gmail.com:"
echo "   1. ✅ Email de confirmación de inscripción recibida"
echo "   2. ✅ Email de pago validado (Cuota 1/3)"
echo "   3. ✅ Email de pago validado (Cuota 2/3)"
echo "   4. ✅ Email de pago validado (Cuota 3/3)"
echo "   5. ✅ Email de inscripción confirmada (todas las cuotas pagadas)"
echo ""
echo "🔔 Notificaciones en dashboard admin:"
echo "   - Nueva inscripción recibida"
echo "   - (Aparecen en la campana de notificaciones)"
echo ""

