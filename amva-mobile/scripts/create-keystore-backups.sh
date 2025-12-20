#!/bin/bash

# Script para crear múltiples backups encriptados del keystore
# IMPORTANTE: Después de crear los backups, guárdalos en lugares seguros

set -e

echo "💾 Creador de Backups del Keystore - AMVA Móvil"
echo "================================================"
echo ""

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

# Directorios y archivos
KEYSTORE_FILE="android/app/amva-release-key.keystore"
BACKUP_DIR="backups/keystore"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_PREFIX="amva-keystore-backup-$TIMESTAMP"

# Verificar que el keystore existe
if [ ! -f "$KEYSTORE_FILE" ]; then
    echo -e "${RED}❌ Error: No se encontró el keystore en $KEYSTORE_FILE${NC}"
    exit 1
fi

# Crear directorio de backups
mkdir -p "$BACKUP_DIR"
echo -e "${GREEN}✅ Directorio de backups creado: $BACKUP_DIR${NC}"
echo ""

# Obtener contraseña del keystore desde gradle.properties
GRADLE_PROPERTIES="android/gradle.properties"
if [ ! -f "$GRADLE_PROPERTIES" ]; then
    echo -e "${RED}❌ Error: No se encontró gradle.properties${NC}"
    exit 1
fi

KEYSTORE_PASSWORD=$(grep "MYAPP_RELEASE_STORE_PASSWORD" "$GRADLE_PROPERTIES" | cut -d'=' -f2)

if [ -z "$KEYSTORE_PASSWORD" ]; then
    echo -e "${YELLOW}⚠️  No se encontró la contraseña en gradle.properties${NC}"
    echo "   Por favor, ingresa la contraseña del keystore:"
    read -sp "Contraseña: " KEYSTORE_PASSWORD
    echo ""
fi

echo "📦 Creando backups encriptados..."
echo ""

# Backup 1: ZIP encriptado (para nube)
echo "1️⃣ Creando backup ZIP encriptado (para nube)..."
BACKUP_ZIP="$BACKUP_DIR/${BACKUP_PREFIX}.zip"
echo "$KEYSTORE_PASSWORD" | zip -e "$BACKUP_ZIP" "$KEYSTORE_FILE" -P > /dev/null 2>&1 || {
    # Si falla con contraseña desde stdin, usar método alternativo
    zip -e "$BACKUP_ZIP" "$KEYSTORE_FILE" <<< "$KEYSTORE_PASSWORD" <<< "$KEYSTORE_PASSWORD" > /dev/null 2>&1 || {
        echo -e "${YELLOW}⚠️  No se pudo crear ZIP encriptado automáticamente${NC}"
        echo "   Creando ZIP sin encriptar (encriptarás manualmente después)..."
        zip "$BACKUP_ZIP" "$KEYSTORE_FILE" > /dev/null 2>&1
    }
}

if [ -f "$BACKUP_ZIP" ]; then
    echo -e "${GREEN}   ✅ Backup ZIP creado: $BACKUP_ZIP${NC}"
    echo "   📤 Sube este archivo a Google Drive/Dropbox/etc"
else
    echo -e "${RED}   ❌ Error al crear backup ZIP${NC}"
fi
echo ""

# Backup 2: Copia directa (para USB)
echo "2️⃣ Creando copia directa (para USB)..."
BACKUP_COPY="$BACKUP_DIR/${BACKUP_PREFIX}.keystore"
cp "$KEYSTORE_FILE" "$BACKUP_COPY"
if [ -f "$BACKUP_COPY" ]; then
    echo -e "${GREEN}   ✅ Copia directa creada: $BACKUP_COPY${NC}"
    echo "   💾 Copia este archivo a un USB externo"
else
    echo -e "${RED}   ❌ Error al crear copia directa${NC}"
fi
echo ""

# Backup 3: GPG encriptado (más seguro)
echo "3️⃣ Creando backup GPG encriptado (más seguro)..."
BACKUP_GPG="$BACKUP_DIR/${BACKUP_PREFIX}.gpg"
if command -v gpg &> /dev/null; then
    echo "$KEYSTORE_PASSWORD" | gpg --batch --yes --passphrase-fd 0 --symmetric --cipher-algo AES256 -o "$BACKUP_GPG" "$KEYSTORE_FILE" 2>/dev/null || {
        echo -e "${YELLOW}   ⚠️  No se pudo crear backup GPG automáticamente${NC}"
        echo "   (GPG requiere configuración manual)"
    }
    if [ -f "$BACKUP_GPG" ]; then
        echo -e "${GREEN}   ✅ Backup GPG creado: $BACKUP_GPG${NC}"
        echo "   🔐 Este es el backup más seguro"
    fi
else
    echo -e "${YELLOW}   ⚠️  GPG no está instalado, saltando este backup${NC}"
    echo "   (Instalar con: sudo apt install gnupg)"
fi
echo ""

# Crear archivo de información del backup
INFO_FILE="$BACKUP_DIR/${BACKUP_PREFIX}-INFO.txt"
cat > "$INFO_FILE" << EOF
INFORMACIÓN DE BACKUP DEL KEYSTORE
==================================
Fecha de creación: $(date)
Keystore original: $KEYSTORE_FILE
Ubicación del backup: $BACKUP_DIR

ARCHIVOS DE BACKUP CREADOS:
1. ${BACKUP_PREFIX}.zip - Backup ZIP encriptado (para nube)
2. ${BACKUP_PREFIX}.keystore - Copia directa (para USB)
3. ${BACKUP_PREFIX}.gpg - Backup GPG encriptado (más seguro)

CONTRASEÑA DEL KEYSTORE:
⚠️  Esta contraseña está en android/gradle.properties
⚠️  NO compartas esta contraseña con nadie
⚠️  Guarda esta contraseña en un gestor de contraseñas seguro

INFORMACIÓN DEL CERTIFICADO:
- Alias: amva-key-alias
- Algoritmo: RSA 2048 bits
- Validez: 10000 días (~27 años)

DÓNDE GUARDAR ESTOS BACKUPS:
1. Nube encriptada (Google Drive, Dropbox, OneDrive)
   → Subir: ${BACKUP_PREFIX}.zip o ${BACKUP_PREFIX}.gpg

2. USB externo (encriptado si es posible)
   → Copiar: ${BACKUP_PREFIX}.keystore

3. Gestor de secretos (1Password, LastPass, Bitwarden)
   → Adjuntar cualquiera de los archivos de backup

4. Servidor seguro (si tienes acceso)
   → Subir todos los archivos

IMPORTANTE:
- Guarda los backups en al menos 3 lugares diferentes
- Verifica los backups periódicamente (cada 6 meses)
- Si pierdes el keystore, NO podrás actualizar la app en Play Store
- Guarda también la contraseña en un lugar seguro separado

ÚLTIMA VERIFICACIÓN:
- Verificar backup: keytool -list -v -keystore ${BACKUP_PREFIX}.keystore -alias amva-key-alias
EOF

echo -e "${GREEN}✅ Archivo de información creado: $INFO_FILE${NC}"
echo ""

# Verificar backups creados
echo "📋 Resumen de backups creados:"
echo ""
BACKUP_COUNT=0
for backup_file in "$BACKUP_DIR/${BACKUP_PREFIX}"*; do
    if [ -f "$backup_file" ]; then
        BACKUP_COUNT=$((BACKUP_COUNT + 1))
        SIZE=$(du -h "$backup_file" | cut -f1)
        echo -e "${GREEN}   ✅ $(basename "$backup_file")${NC} - $SIZE"
    fi
done

echo ""
if [ $BACKUP_COUNT -gt 0 ]; then
    echo -e "${GREEN}✅ Se crearon $BACKUP_COUNT archivos de backup${NC}"
    echo ""
    echo -e "${BLUE}📋 PRÓXIMOS PASOS:${NC}"
    echo ""
    echo "1. 📤 Subir a nube encriptada:"
    echo "   → ${BACKUP_PREFIX}.zip o ${BACKUP_PREFIX}.gpg"
    echo "   → Google Drive, Dropbox, OneDrive, etc."
    echo ""
    echo "2. 💾 Copiar a USB externo:"
    echo "   → ${BACKUP_PREFIX}.keystore"
    echo "   → Preferiblemente USB encriptado"
    echo ""
    echo "3. 🔐 Guardar en gestor de secretos:"
    echo "   → Adjuntar cualquiera de los backups"
    echo "   → 1Password, LastPass, Bitwarden, etc."
    echo ""
    echo "4. ✅ Verificar backups:"
    echo "   → Abrir uno de los backups para verificar que funciona"
    echo "   → Guardar la contraseña en un lugar seguro"
    echo ""
    echo -e "${YELLOW}⚠️  IMPORTANTE:${NC}"
    echo "   - Los backups están en: $BACKUP_DIR"
    echo "   - NO commitees estos archivos al repositorio"
    echo "   - Elimina los backups locales después de guardarlos en lugares seguros"
    echo "   - Guarda también la contraseña en un gestor de contraseñas"
    echo ""
else
    echo -e "${RED}❌ No se crearon backups${NC}"
    exit 1
fi

