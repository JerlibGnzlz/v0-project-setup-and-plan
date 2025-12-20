#!/bin/bash

# Script simplificado para generar keystore (con valores por defecto)
# Para mayor seguridad, usa generate-keystore.sh que es interactivo

set -e

echo "🔐 Generador de Keystore Simplificado - AMVA Móvil"
echo "===================================================="
echo ""
echo "⚠️  IMPORTANTE: Este script usa valores por defecto."
echo "   Para mayor seguridad, usa: ./scripts/generate-keystore.sh"
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
    read -p "¿Deseas sobrescribirlo? (NO recomendado si ya está en producción) [y/N]: " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Operación cancelada."
        exit 1
    fi
fi

# Solicitar solo la contraseña (lo más importante)
echo "Por favor, proporciona una contraseña SEGURA para el keystore:"
echo "   - Mínimo 12 caracteres recomendado"
echo "   - Usa mayúsculas, minúsculas, números y símbolos"
echo ""

read -sp "Contraseña del keystore: " KEYSTORE_PASSWORD
echo ""
if [ ${#KEYSTORE_PASSWORD} -lt 6 ]; then
    echo -e "${RED}❌ La contraseña debe tener al menos 6 caracteres${NC}"
    exit 1
fi

read -sp "Confirmar contraseña: " KEYSTORE_PASSWORD_CONFIRM
echo ""
if [ "$KEYSTORE_PASSWORD" != "$KEYSTORE_PASSWORD_CONFIRM" ]; then
    echo -e "${RED}❌ Las contraseñas no coinciden${NC}"
    exit 1
fi

# Usar la misma contraseña para key password (puede cambiarse después)
KEY_PASSWORD="$KEYSTORE_PASSWORD"

# Valores por defecto
CN="AMVA Digital"
OU="Mobile Development"
O="Vida Abundante"
L="Buenos Aires"
ST="Buenos Aires"
C="AR"

echo ""
echo "📋 Información del certificado (valores por defecto):"
echo "   CN: $CN"
echo "   OU: $OU"
echo "   O: $O"
echo "   L: $L"
echo "   ST: $ST"
echo "   C: $C"
echo ""

read -p "¿Usar estos valores? [Y/n]: " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Nn]$ ]]; then
    echo "Por favor, ejecuta el script interactivo completo:"
    echo "   ./scripts/generate-keystore.sh"
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
    keytool -list -v -keystore "$KEYSTORE_FILE" -alias "$KEY_ALIAS" -storepass "$KEYSTORE_PASSWORD" | grep -E "(Alias|Entry type|Valid from|Certificate fingerprints)" || true
    
    echo ""
    echo -e "${YELLOW}⚠️  IMPORTANTE - LEE ESTO:${NC}"
    echo ""
    echo "1. 📦 Guarda el keystore en un lugar seguro:"
    echo "   - $KEYSTORE_FILE"
    echo ""
    echo "2. 🔑 Guarda la contraseña en un gestor de contraseñas seguro:"
    echo "   - Keystore password: [la que ingresaste]"
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
    
    # Configurar gradle.properties
    echo "📝 Configurando gradle.properties..."
    
    GRADLE_PROPERTIES="android/gradle.properties"
    
    # Verificar si ya existe configuración
    if grep -q "MYAPP_RELEASE_STORE_FILE" "$GRADLE_PROPERTIES" 2>/dev/null; then
        echo -e "${YELLOW}⚠️  Ya existe configuración de keystore en gradle.properties${NC}"
        read -p "¿Sobrescribir? [y/N]: " -n 1 -r
        echo ""
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            echo "❌ No se modificó gradle.properties"
            echo ""
            echo "💡 Para configurar manualmente, agrega estas líneas a android/gradle.properties:"
            echo ""
            echo "MYAPP_RELEASE_STORE_FILE=amva-release-key.keystore"
            echo "MYAPP_RELEASE_KEY_ALIAS=$KEY_ALIAS"
            echo "MYAPP_RELEASE_STORE_PASSWORD=[tu-contraseña]"
            echo "MYAPP_RELEASE_KEY_PASSWORD=[tu-contraseña]"
            exit 0
        fi
        
        # Eliminar configuración anterior
        sed -i.bak '/MYAPP_RELEASE_STORE_FILE/,/MYAPP_RELEASE_KEY_PASSWORD/d' "$GRADLE_PROPERTIES"
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
    echo ""
    echo -e "${GREEN}✅ Proceso completado exitosamente${NC}"
    echo ""
    echo "📋 Próximos pasos:"
    echo "   1. Verificar que android/gradle.properties está en .gitignore"
    echo "   2. Hacer backups del keystore (ver docs/KEYSTORE_BACKUP.md)"
    echo "   3. Guardar contraseñas en gestor de contraseñas seguro"
    echo "   4. Probar build de producción: cd android && ./gradlew bundleRelease"
else
    echo ""
    echo -e "${RED}❌ Error al generar el keystore${NC}"
    exit 1
fi

