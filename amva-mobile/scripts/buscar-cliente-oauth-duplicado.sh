#!/bin/bash

# Script para ayudar a encontrar cliente OAuth duplicado
# Uso: ./scripts/buscar-cliente-oauth-duplicado.sh

echo "🔍 Buscando Cliente OAuth Duplicado"
echo ""

SHA1_DUPLICADO="4B:24:0F:1B:6A:E6:3D:71:38:77:D1:E7:69:40:D2:1D:5D:30:7C:40"
PACKAGE_NAME="org.vidaabundante.app"
PROYECTO_CORRECTO="amva-digital"

echo "📋 Información del Cliente Duplicado:"
echo "  SHA-1: $SHA1_DUPLICADO"
echo "  Package Name: $PACKAGE_NAME"
echo "  Proyecto Correcto: $PROYECTO_CORRECTO"
echo ""

echo "⚠️  Este error significa que otro proyecto de Google Cloud/Firebase"
echo "   tiene un cliente OAuth con la misma combinación SHA-1 + package name."
echo ""

echo "✅ Pasos para Resolver:"
echo ""
echo "1️⃣  Identificar el Proyecto Duplicado:"
echo "   - Ve a: https://console.cloud.google.com/apis/credentials"
echo "   - Revisa TODOS tus proyectos de Google Cloud"
echo "   - Busca clientes OAuth 2.0 de tipo 'Android'"
echo "   - Busca el que tenga:"
echo "     * Package: $PACKAGE_NAME"
echo "     * SHA-1: $SHA1_DUPLICADO"
echo ""

echo "2️⃣  Verificar en el Proyecto Correcto:"
echo "   - Ve a: https://console.cloud.google.com/apis/credentials?project=$PROYECTO_CORRECTO"
echo "   - Busca el cliente Android: 378853205278-c2e1gcjn06mg857rcvprns01fu8pduat"
echo "   - Verifica que tenga el SHA-1: $SHA1_DUPLICADO"
echo ""

echo "3️⃣  Eliminar el Cliente Duplicado:"
echo "   - Abre el proyecto donde está el cliente duplicado"
echo "   - Ve a: APIs & Services → Credentials"
echo "   - Busca el cliente Android con ese SHA-1 y package name"
echo "   - Elimínalo o elimina solo ese SHA-1"
echo "   - Guarda los cambios"
echo ""

echo "4️⃣  Esperar y Verificar:"
echo "   - Espera 5-10 minutos para sincronización"
echo "   - Vuelve a Firebase e intenta agregar el SHA-1 nuevamente"
echo "   - Debería funcionar ahora"
echo ""

echo "🔍 Proyectos Comunes a Revisar:"
echo "   - $PROYECTO_CORRECTO (tu proyecto actual) ✅"
echo "   - Proyectos anteriores relacionados"
echo "   - Proyectos de prueba o desarrollo"
echo "   - Proyectos con nombres similares"
echo ""

echo "⚠️  Precauciones:"
echo "   - NO elimines el cliente del proyecto $PROYECTO_CORRECTO"
echo "   - Solo elimina el cliente del proyecto INCORRECTO"
echo "   - Verifica que el proyecto correcto tenga el cliente antes de eliminar"
echo ""

echo "📝 Checklist:"
echo "   [ ] Revisar todos los proyectos en Google Cloud Console"
echo "   [ ] Identificar cuál tiene el cliente duplicado"
echo "   [ ] Verificar que $PROYECTO_CORRECTO tenga el cliente correcto"
echo "   [ ] Eliminar el cliente del proyecto incorrecto"
echo "   [ ] Esperar 5-10 minutos"
echo "   [ ] Intentar agregar SHA-1 en Firebase nuevamente"
echo ""

