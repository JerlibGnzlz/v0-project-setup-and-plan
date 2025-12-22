#!/bin/bash

# Script directo para generar keystore SIN entrada interactiva
# Usa valores por defecto y genera una contraseña temporal
# IMPORTANTE: Cambia la contraseña después si es necesario

set -e

echo "🔐 Generador de Keystore Directo - AMVA Móvil"
echo "=============================================="
echo ""

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Directorio del keystore
KEYSTORE_DIR="android/app"
KEYSTORE_FILE="$KEYSTORE_DIR/amva-release-key.keystore"
KEY_ALIAS="amva-key-alias"

# Verificar si ya existe un keystore
if [ -f "$KEYSTORE_FILE" ]; then
    echo -e "${YELLOW}⚠️  Ya existe un keystore en: $KEYSTORE_FILE${NC}"
    echo ""
    echo "Para regenerarlo, elimínalo primero:"
    echo "  rm $KEYSTORE_FILE"
    echo ""
    exit 1
fi

# Generar contraseña temporal (puedes cambiarla después)
# Usa fecha + random para hacerla única pero reproducible
TEMP_PASSWORD="Amva2024$(date +%s | tail -c 6)!"

echo "📝 Generando keystore con valores por defecto..."
echo "   Alias: $KEY_ALIAS"
echo "   Algoritmo: RSA 2048 bits"
echo "   Validez: 10000 días (~27 años)"
echo ""

# Valores por defecto del certificado
CN="AMVA Digital"
OU="Mobile Development"
O="Vida Abundante"
L="Buenos Aires"
ST="Buenos Aires"
C="AR"

# Generar keystore
echo "🔨 Generando keystore..."
keytool -genkeypair \
    -v \
    -storetype PKCS12 \
    -keystore "$KEYSTORE_FILE" \
    -alias "$KEY_ALIAS" \
    -keyalg RSA \
    -keysize 2048 \
    -validity 10000 \
    -storepass "$TEMP_PASSWORD" \
    -keypass "$TEMP_PASSWORD" \
    -dname "CN=$CN, OU=$OU, O=$O, L=$L, ST=$ST, C=$C" \
    -noprompt

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ Keystore generado exitosamente!${NC}"
    echo ""
    
    # Mostrar información
    echo "📋 Información del keystore:"
    keytool -list -v -keystore "$KEYSTORE_FILE" -alias "$KEY_ALIAS" -storepass "$TEMP_PASSWORD" | grep -E "(Alias|Entry type|Valid from|Certificate fingerprints)" || true
    
    echo ""
    echo -e "${YELLOW}⚠️  CONTRASEÑA GENERADA:${NC}"
    echo -e "${GREEN}$TEMP_PASSWORD${NC}"
    echo ""
    echo "📝 IMPORTANTE:"
    echo "   1. Guarda esta contraseña en un gestor de contraseñas seguro"
    echo "   2. La contraseña también se guardará en gradle.properties"
    echo "   3. Puedes cambiarla después con: keytool -storepasswd -keystore $KEYSTORE_FILE"
    echo ""
    
    # Crear archivo con la contraseña (temporal, para que la veas)
    PASSWORD_FILE="$KEYSTORE_DIR/keystore-password.txt"
    cat > "$PASSWORD_FILE" << EOF
CONTRASEÑA DEL KEYSTORE DE PRODUCCIÓN
======================================
Fecha de generación: $(date)
Keystore: $KEYSTORE_FILE
Alias: $KEY_ALIAS

CONTRASEÑA: $TEMP_PASSWORD

⚠️  IMPORTANTE:
- Guarda esta contraseña en un gestor de contraseñas seguro
- Elimina este archivo después de guardar la contraseña
- Esta contraseña también está en android/gradle.properties
EOF
    
    echo -e "${YELLOW}📄 Contraseña guardada temporalmente en: $PASSWORD_FILE${NC}"
    echo -e "${RED}   ⚠️  ELIMINA este archivo después de guardar la contraseña en un lugar seguro${NC}"
    echo ""
    
    # Configurar gradle.properties
    echo "📝 Configurando gradle.properties..."
    
    GRADLE_PROPERTIES="android/gradle.properties"
    
    # Verificar si ya existe configuración
    if grep -q "MYAPP_RELEASE_STORE_FILE" "$GRADLE_PROPERTIES" 2>/dev/null; then
        echo -e "${YELLOW}⚠️  Ya existe configuración de keystore en gradle.properties${NC}"
        echo "   Eliminando configuración anterior..."
        # Crear backup
        cp "$GRADLE_PROPERTIES" "$GRADLE_PROPERTIES.backup"
        # Eliminar configuración anterior (líneas entre MYAPP_RELEASE_STORE_FILE y MYAPP_RELEASE_KEY_PASSWORD)
        sed -i.bak '/MYAPP_RELEASE_STORE_FILE/,/MYAPP_RELEASE_KEY_PASSWORD/d' "$GRADLE_PROPERTIES"
    fi
    
    # Agregar configuración al final del archivo
    cat >> "$GRADLE_PROPERTIES" << EOF

# Keystore de producción para AMVA Móvil
# Generado el: $(date)
MYAPP_RELEASE_STORE_FILE=amva-release-key.keystore
MYAPP_RELEASE_KEY_ALIAS=$KEY_ALIAS
MYAPP_RELEASE_STORE_PASSWORD=$TEMP_PASSWORD
MYAPP_RELEASE_KEY_PASSWORD=$TEMP_PASSWORD
EOF
    
    echo -e "${GREEN}✅ gradle.properties configurado${NC}"
    echo ""
    echo -e "${GREEN}✅ Proceso completado exitosamente${NC}"
    echo ""
    echo "📋 Próximos pasos:"
    echo "   1. Guarda la contraseña en un gestor de contraseñas seguro"
    echo "   2. Elimina el archivo temporal: rm $PASSWORD_FILE"
    echo "   3. Haz backups del keystore (ver docs/KEYSTORE_BACKUP.md)"
    echo "   4. Verifica que android/gradle.properties está en .gitignore"
    echo "   5. Probar build: cd android && ./gradlew bundleRelease"
    echo ""
else
    echo ""
    echo -e "${RED}❌ Error al generar el keystore${NC}"
    echo ""
    echo "Verifica que:"
    echo "  1. Java/keytool está instalado: java -version"
    echo "  2. Tienes permisos de escritura en android/app/"
    exit 1
fi



