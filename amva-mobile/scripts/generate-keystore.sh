#!/bin/bash

# Script para generar keystore de producción para AMVA Móvil
# IMPORTANTE: Guarda el keystore y las contraseñas en un lugar seguro

set -e

echo "🔐 Generador de Keystore para AMVA Móvil"
echo "=========================================="
echo ""

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Directorio del keystore
KEYSTORE_DIR="android/app"
KEYSTORE_FILE="$KEYSTORE_DIR/amva-release-key.keystore"
KEY_ALIAS="amva-key-alias"

# Verificar si ya existe un keystore
if [ -f "$KEYSTORE_FILE" ]; then
    echo -e "${YELLOW}⚠️  Ya existe un keystore en: $KEYSTORE_FILE${NC}"
    echo ""
    read -p "¿Deseas sobrescribirlo? (NO recomendado si ya está en producción) [y/N]: " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Operación cancelada."
        exit 1
    fi
fi

# Solicitar información
echo "Por favor, proporciona la siguiente información:"
echo ""

read -sp "Contraseña del keystore (mínimo 6 caracteres): " KEYSTORE_PASSWORD
echo ""
if [ ${#KEYSTORE_PASSWORD} -lt 6 ]; then
    echo -e "${RED}❌ La contraseña debe tener al menos 6 caracteres${NC}"
    exit 1
fi

read -sp "Confirmar contraseña del keystore: " KEYSTORE_PASSWORD_CONFIRM
echo ""
if [ "$KEYSTORE_PASSWORD" != "$KEYSTORE_PASSWORD_CONFIRM" ]; then
    echo -e "${RED}❌ Las contraseñas no coinciden${NC}"
    exit 1
fi

read -sp "Contraseña de la clave (puede ser la misma): " KEY_PASSWORD
echo ""
if [ ${#KEY_PASSWORD} -lt 6 ]; then
    echo -e "${RED}❌ La contraseña debe tener al menos 6 caracteres${NC}"
    exit 1
fi

read -p "Nombre completo (CN): " CN
read -p "Unidad organizacional (OU): " OU
read -p "Organización (O): " O
read -p "Ciudad/Localidad (L): " L
read -p "Estado/Provincia (ST): " ST
read -p "Código de país (C) [ej: AR, MX, US]: " C

# Valores por defecto si están vacíos
CN=${CN:-"AMVA Digital"}
OU=${OU:-"Mobile Development"}
O=${O:-"Vida Abundante"}
L=${L:-"Buenos Aires"}
ST=${ST:-"Buenos Aires"}
C=${C:-"AR"}

echo ""
echo "📋 Información del certificado:"
echo "   CN: $CN"
echo "   OU: $OU"
echo "   O: $O"
echo "   L: $L"
echo "   ST: $ST"
echo "   C: $C"
echo ""

read -p "¿Continuar con la generación? [Y/n]: " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Nn]$ ]]; then
    echo "❌ Operación cancelada."
    exit 1
fi

# Generar keystore
echo ""
echo "🔨 Generando keystore..."
keytool -genkeypair \
    -v \
    -storetype PKCS12 \
    -keystore "$KEYSTORE_FILE" \
    -alias "$KEY_ALIAS" \
    -keyalg RSA \
    -keysize 2048 \
    -validity 10000 \
    -storepass "$KEYSTORE_PASSWORD" \
    -keypass "$KEY_PASSWORD" \
    -dname "CN=$CN, OU=$OU, O=$O, L=$L, ST=$ST, C=$C"

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ Keystore generado exitosamente en: $KEYSTORE_FILE${NC}"
    echo ""
    
    # Mostrar información del keystore
    echo "📋 Información del keystore:"
    keytool -list -v -keystore "$KEYSTORE_FILE" -alias "$KEY_ALIAS" -storepass "$KEYSTORE_PASSWORD" | grep -E "(Alias|Entry type|Valid from|Certificate fingerprints)"
    
    echo ""
    echo -e "${YELLOW}⚠️  IMPORTANTE - LEE ESTO:${NC}"
    echo ""
    echo "1. 📦 Guarda el keystore en un lugar seguro:"
    echo "   - $KEYSTORE_FILE"
    echo ""
    echo "2. 🔑 Guarda las contraseñas en un gestor de contraseñas seguro:"
    echo "   - Keystore password: $KEYSTORE_PASSWORD"
    echo "   - Key password: $KEY_PASSWORD"
    echo ""
    echo "3. 💾 Haz múltiples backups del keystore:"
    echo "   - Encriptado en la nube (Google Drive, Dropbox, etc.)"
    echo "   - En un USB externo"
    echo "   - En un gestor de secretos (1Password, LastPass, etc.)"
    echo ""
    echo "4. ⚠️  Si pierdes el keystore:"
    echo "   - NO podrás actualizar la app en Play Store"
    echo "   - Tendrás que crear una nueva app con un nuevo package name"
    echo ""
    echo "5. 📝 Próximos pasos:"
    echo "   - Configurar gradle.properties con las contraseñas"
    echo "   - Actualizar build.gradle para usar el keystore de producción"
    echo ""
    
    # Crear archivo de información (sin contraseñas)
    INFO_FILE="$KEYSTORE_DIR/keystore-info.txt"
    cat > "$INFO_FILE" << EOF
Información del Keystore de Producción
=======================================
Fecha de creación: $(date)
Ubicación: $KEYSTORE_FILE
Alias: $KEY_ALIAS
Algoritmo: RSA 2048 bits
Validez: 10000 días (~27 años)

Información del certificado:
CN: $CN
OU: $OU
O: $O
L: $L
ST: $ST
C: $C

IMPORTANTE:
- Las contraseñas NO están en este archivo
- Guarda las contraseñas en un gestor de contraseñas seguro
- Haz múltiples backups del keystore
- Este archivo puede ser eliminado después de configurar gradle.properties
EOF
    
    echo -e "${GREEN}📄 Información guardada en: $INFO_FILE${NC}"
    echo ""
    echo "¿Deseas configurar gradle.properties ahora? [Y/n]: "
    read -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Nn]$ ]]; then
        echo ""
        echo "📝 Configurando gradle.properties..."
        
        GRADLE_PROPERTIES="android/gradle.properties"
        
        # Verificar si ya existe configuración
        if grep -q "MYAPP_RELEASE_STORE_FILE" "$GRADLE_PROPERTIES" 2>/dev/null; then
            echo -e "${YELLOW}⚠️  Ya existe configuración de keystore en gradle.properties${NC}"
            read -p "¿Sobrescribir? [y/N]: " -n 1 -r
            echo ""
            if [[ ! $REPLY =~ ^[Yy]$ ]]; then
                echo "❌ No se modificó gradle.properties"
                exit 0
            fi
        fi
        
        # Agregar configuración al final del archivo
        cat >> "$GRADLE_PROPERTIES" << EOF

# Keystore de producción para AMVA Móvil
# Generado el: $(date)
MYAPP_RELEASE_STORE_FILE=amva-release-key.keystore
MYAPP_RELEASE_KEY_ALIAS=$KEY_ALIAS
MYAPP_RELEASE_STORE_PASSWORD=$KEYSTORE_PASSWORD
MYAPP_RELEASE_KEY_PASSWORD=$KEY_PASSWORD
EOF
        
        echo -e "${GREEN}✅ gradle.properties configurado${NC}"
        echo ""
        echo -e "${YELLOW}⚠️  IMPORTANTE:${NC}"
        echo "   - gradle.properties contiene contraseñas"
        echo "   - Verifica que está en .gitignore"
        echo "   - NO commitees gradle.properties con contraseñas"
    fi
    
    echo ""
    echo -e "${GREEN}✅ Proceso completado exitosamente${NC}"
else
    echo ""
    echo -e "${RED}❌ Error al generar el keystore${NC}"
    exit 1
fi

