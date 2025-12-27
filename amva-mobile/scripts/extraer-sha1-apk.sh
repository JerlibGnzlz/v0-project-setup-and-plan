#!/bin/bash

# Script para extraer SHA-1 del certificado de un APK
# Uso: ./scripts/extraer-sha1-apk.sh [ruta-del-apk]

APK_PATH="${1:-}"

if [ -z "$APK_PATH" ]; then
    echo "📥 Descargando APK del build 509eaa2d..."
    APK_URL="https://expo.dev/artifacts/eas/aXpxxM3bqffGfC1wgryc1D.apk"
    APK_PATH="/tmp/build_509eaa2d.apk"
    wget -q "$APK_URL" -O "$APK_PATH" || {
        echo "❌ Error al descargar APK"
        echo "   Descarga manualmente desde: $APK_URL"
        exit 1
    }
    echo "✅ APK descargado: $APK_PATH"
fi

if [ ! -f "$APK_PATH" ]; then
    echo "❌ Archivo APK no encontrado: $APK_PATH"
    exit 1
fi

echo ""
echo "🔍 Extrayendo SHA-1 del certificado del APK..."
echo ""

# Método 1: Usar apksigner (Android SDK)
if command -v apksigner &> /dev/null; then
    echo "📋 Usando apksigner..."
    echo ""
    apksigner verify --print-certs "$APK_PATH" 2>&1 | grep -A 1 "SHA-1" || {
        echo "⚠️  No se encontró SHA-1 con apksigner"
    }
    echo ""
fi

# Método 2: Usar keytool con certificado extraído
echo "📋 Extrayendo certificado del APK..."
TEMP_DIR=$(mktemp -d)
trap "rm -rf $TEMP_DIR" EXIT

unzip -q "$APK_PATH" -d "$TEMP_DIR" 2>/dev/null || {
    echo "❌ Error al extraer APK"
    exit 1
}

CERT_FILE=$(find "$TEMP_DIR/META-INF" -name "*.RSA" -o -name "*.DSA" -o -name "*.EC" 2>/dev/null | head -1)

if [ -n "$CERT_FILE" ]; then
    echo "✅ Certificado encontrado: $(basename $CERT_FILE)"
    echo ""
    echo "🔑 SHA-1 del certificado:"
    echo ""
    keytool -printcert -file "$CERT_FILE" 2>/dev/null | grep -A 1 "SHA1:" || {
        echo "⚠️  No se pudo leer el certificado con keytool"
        echo "   Verifica que Java/keytool esté instalado"
    }
else
    echo "⚠️  No se encontró archivo de certificado en META-INF"
    echo "   El APK puede no estar firmado o usar formato diferente"
fi

echo ""
echo "📋 Información completa del certificado:"
echo ""
if [ -n "$CERT_FILE" ]; then
    keytool -printcert -file "$CERT_FILE" 2>/dev/null || echo "❌ Error al leer certificado"
fi

echo ""
echo "✅ SHA-1 encontrado arriba. Compáralo con:"
echo "   - 4B:24:0F:1B:6A:E6:3D:71:38:77:D1:E7:69:40:D2:1D:5D:30:7C:40 (default)"
echo "   - BC:0C:2C:C3:68:D1:50:C3:7E:07:17:EE:49:8F:D0:35:7D:0F:1E:E3 (nuevo)"
echo ""

