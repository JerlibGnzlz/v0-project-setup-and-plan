#!/bin/bash

# Script para verificar configuración de Google OAuth
# Uso: ./scripts/verificar-configuracion-google-oauth.sh

echo "🔍 Verificación de Configuración Google OAuth"
echo ""

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

ERRORS=0
WARNINGS=0

# Verificar que estamos en el directorio correcto
if [ ! -f "app.json" ]; then
    echo "❌ Error: No se encontró app.json"
    echo "   Ejecuta este script desde el directorio amva-mobile"
    exit 1
fi

echo "✅ Verificación 1: app.json"
echo ""

# Verificar googleClientId (Web Client ID)
WEB_CLIENT_ID=$(grep -o '"googleClientId": "[^"]*"' app.json | cut -d'"' -f4)
if [ -n "$WEB_CLIENT_ID" ] && [[ "$WEB_CLIENT_ID" == *".apps.googleusercontent.com"* ]]; then
    echo "  ✅ Web Client ID configurado: ${WEB_CLIENT_ID:0:30}..."
else
    echo "  ❌ Web Client ID NO configurado o inválido"
    ((ERRORS++))
fi

# Verificar googleAndroidClientId (Android Client ID)
ANDROID_CLIENT_ID=$(grep -o '"googleAndroidClientId": "[^"]*"' app.json | cut -d'"' -f4)
if [ -n "$ANDROID_CLIENT_ID" ] && [[ "$ANDROID_CLIENT_ID" == *".apps.googleusercontent.com"* ]]; then
    echo "  ✅ Android Client ID configurado: ${ANDROID_CLIENT_ID:0:30}..."
else
    echo "  ⚠️  Android Client ID NO configurado o inválido (se usará Web Client ID como fallback)"
    ((WARNINGS++))
fi

echo ""
echo "✅ Verificación 2: google-services.json"
echo ""

if [ -f "android/app/google-services.json" ]; then
    echo "  ✅ Archivo encontrado"
    
    # Verificar package name
    PACKAGE_NAME=$(grep -o '"package_name": "[^"]*"' android/app/google-services.json | head -1 | cut -d'"' -f4)
    if [ "$PACKAGE_NAME" = "org.vidaabundante.app" ]; then
        echo "  ✅ Package name correcto: $PACKAGE_NAME"
    else
        echo "  ❌ Package name incorrecto: $PACKAGE_NAME (debería ser org.vidaabundante.app)"
        ((ERRORS++))
    fi
    
    # Verificar SHA-1
    SHA1_COUNT=$(grep -c "4B:24:0F:1B:6A:E6:3D:71:38:77:D1:E7:69:40:D2:1D:5D:30:7C:40" android/app/google-services.json || echo "0")
    if [ "$SHA1_COUNT" -gt 0 ]; then
        echo "  ✅ SHA-1 default encontrado en google-services.json"
    else
        echo "  ⚠️  SHA-1 default NO encontrado en google-services.json"
        ((WARNINGS++))
    fi
    
    # Verificar oauth_client
    OAUTH_CLIENT_COUNT=$(grep -c "oauth_client" android/app/google-services.json || echo "0")
    if [ "$OAUTH_CLIENT_COUNT" -gt 0 ]; then
        echo "  ✅ OAuth client configurado en google-services.json"
    else
        echo "  ❌ OAuth client NO configurado en google-services.json"
        ((ERRORS++))
    fi
else
    echo "  ❌ Archivo google-services.json NO encontrado"
    ((ERRORS++))
fi

echo ""
echo "✅ Verificación 3: useGoogleAuth.ts"
echo ""

if [ -f "src/hooks/useGoogleAuth.ts" ]; then
    echo "  ✅ Archivo encontrado"
    
    # Verificar que tiene fallback a Web Client ID
    FALLBACK_COUNT=$(grep -c "Web Client ID como fallback" src/hooks/useGoogleAuth.ts || echo "0")
    if [ "$FALLBACK_COUNT" -gt 0 ]; then
        echo "  ✅ Fallback a Web Client ID implementado"
    else
        echo "  ⚠️  Fallback a Web Client ID NO encontrado"
        ((WARNINGS++))
    fi
    
    # Verificar que importa GoogleSignin
    GOOGLE_SIGNIN_COUNT=$(grep -c "@react-native-google-signin/google-signin" src/hooks/useGoogleAuth.ts || echo "0")
    if [ "$GOOGLE_SIGNIN_COUNT" -gt 0 ]; then
        echo "  ✅ Google Sign-In importado correctamente"
    else
        echo "  ❌ Google Sign-In NO importado"
        ((ERRORS++))
    fi
else
    echo "  ❌ Archivo useGoogleAuth.ts NO encontrado"
    ((ERRORS++))
fi

echo ""
echo "✅ Verificación 4: package.json"
echo ""

if [ -f "package.json" ]; then
    # Verificar que tiene @react-native-google-signin/google-signin
    GOOGLE_SIGNIN_PKG=$(grep -c "@react-native-google-signin/google-signin" package.json || echo "0")
    if [ "$GOOGLE_SIGNIN_PKG" -gt 0 ]; then
        echo "  ✅ @react-native-google-signin/google-signin instalado"
    else
        echo "  ❌ @react-native-google-signin/google-signin NO instalado"
        ((ERRORS++))
    fi
else
    echo "  ❌ package.json NO encontrado"
    ((ERRORS++))
fi

echo ""
echo "📋 Resumen de Verificación:"
echo ""

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo "  ✅ Todo está configurado correctamente"
    echo ""
    echo "🎯 Próximos Pasos:"
    echo "  1. Reinicia la app si está corriendo"
    echo "  2. Prueba Google OAuth"
    echo "  3. Debería funcionar con Web Client ID automáticamente"
elif [ $ERRORS -eq 0 ]; then
    echo "  ⚠️  Configuración básica correcta, pero hay advertencias"
    echo ""
    echo "  El código usará Web Client ID como fallback si Android Client ID no funciona"
    echo ""
    echo "🎯 Próximos Pasos:"
    echo "  1. Reinicia la app si está corriendo"
    echo "  2. Prueba Google OAuth"
    echo "  3. Debería funcionar con Web Client ID"
else
    echo "  ❌ Hay $ERRORS error(es) que deben corregirse"
    echo ""
    echo "⚠️  Revisa los errores arriba antes de probar"
fi

echo ""
echo "📝 Configuración Actual:"
echo ""
echo "  Web Client ID: ${WEB_CLIENT_ID:-NO CONFIGURADO}"
echo "  Android Client ID: ${ANDROID_CLIENT_ID:-NO CONFIGURADO}"
echo ""
echo "  El código intentará usar Android Client ID primero"
echo "  Si falla, usará Web Client ID automáticamente"
echo ""

