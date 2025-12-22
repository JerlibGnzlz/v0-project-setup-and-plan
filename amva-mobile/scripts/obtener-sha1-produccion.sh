#!/bin/bash

# Script para obtener SHA-1 de producción desde EAS
# Este script guía al usuario para obtener el SHA-1 manualmente

echo "🔑 Obtener SHA-1 de Producción desde EAS"
echo "=========================================="
echo ""
echo "Ejecuta manualmente el siguiente comando:"
echo ""
echo "  cd /home/jerlibgnzlz/Escritorio/v0-project-setup-and-plan/amva-mobile"
echo "  eas credentials"
echo ""
echo "Luego sigue estos pasos:"
echo ""
echo "1. Selecciona: Android"
echo "2. Selecciona: View credentials (o Ver credenciales)"
echo "3. Busca la sección 'Keystore' o 'Signing Key'"
echo "4. Copia el SHA-1 completo que aparece ahí"
echo ""
echo "El SHA-1 tiene este formato:"
echo "  XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX"
echo ""
echo "Una vez que tengas el SHA-1, agrégalo en Google Cloud Console:"
echo "  https://console.cloud.google.com/apis/credentials"
echo ""
echo "Busca el cliente Android:"
echo "  378853205278-c2e1gcjn06mg857rcvprns01fu8pduat"
echo ""
echo "Y agrega el SHA-1 en la sección 'SHA-1 certificate fingerprint'"
echo ""

