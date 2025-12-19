#!/bin/bash
# Script para iniciar el emulador Android

# Buscar emulador
EMULATOR_PATH=$(find ~/Android/Sdk -name "emulator" -type f 2>/dev/null | head -1)

if [ -z "$EMULATOR_PATH" ]; then
    echo "❌ No se encontró el emulador de Android"
    echo "   Asegúrate de tener Android SDK instalado"
    exit 1
fi

# Verificar si ya hay un emulador corriendo
if adb devices | grep -q "emulator.*device"; then
    echo "✅ Ya hay un emulador corriendo:"
    adb devices | grep "emulator"
    echo ""
    echo "Para usar este emulador, ejecuta:"
    echo "  cd amva-mobile && npx expo run:android"
    exit 0
fi

# Listar emuladores disponibles
echo "📱 Emuladores disponibles:"
$EMULATOR_PATH -list-avds
echo ""

# Iniciar el primero disponible (o Pixel_7 si existe)
AVD_NAME="Pixel_7"
if ! $EMULATOR_PATH -list-avds | grep -q "$AVD_NAME"; then
    AVD_NAME=$($EMULATOR_PATH -list-avds | head -1)
fi

if [ -z "$AVD_NAME" ]; then
    echo "❌ No hay emuladores configurados"
    echo "   Crea uno desde Android Studio → Device Manager"
    exit 1
fi

echo "🚀 Iniciando emulador: $AVD_NAME"
echo "   Esto puede tardar 1-2 minutos..."
echo ""

# Iniciar emulador en background
$EMULATOR_PATH -avd "$AVD_NAME" > /dev/null 2>&1 &

# Esperar a que el emulador esté listo
echo "⏳ Esperando a que el emulador esté listo..."
sleep 5

# Verificar cada 5 segundos hasta que esté listo (máximo 2 minutos)
for i in {1..24}; do
    if adb devices | grep -q "emulator.*device"; then
        echo "✅ Emulador listo!"
        adb devices | grep "emulator"
        echo ""
        echo "Ahora puedes ejecutar:"
        echo "  cd amva-mobile && npx expo run:android"
        exit 0
    fi
    sleep 5
    echo "   Esperando... ($i/24)"
done

echo "⚠️ El emulador está iniciando pero aún no está listo"
echo "   Espera unos minutos más y verifica con: adb devices"

