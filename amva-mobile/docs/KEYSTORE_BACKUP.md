# 🔐 Guía de Backup del Keystore

## ⚠️ CRÍTICO: Si pierdes el keystore, NO podrás actualizar la app en Play Store

El keystore es el certificado que firma tu aplicación. Google Play Store requiere que todas las actualizaciones de tu app estén firmadas con el mismo keystore. Si lo pierdes:

- ❌ NO podrás publicar actualizaciones de la app existente
- ❌ Tendrás que crear una NUEVA app con un nuevo package name
- ❌ Perderás todos los usuarios, reviews y ratings de la app original

## 📦 Estrategia de Backup Múltiple

### 1. Ubicaciones de Backup (Mínimo 3)

#### Opción A: Nube Encriptada (Recomendado)
- ✅ Google Drive (con encriptación adicional)
- ✅ Dropbox (con encriptación adicional)
- ✅ OneDrive (con encriptación adicional)
- ✅ iCloud (con encriptación adicional)

**Cómo encriptar antes de subir:**
```bash
# Encriptar keystore con contraseña adicional
zip -e amva-release-key-backup.zip android/app/amva-release-key.keystore

# O usar GPG
gpg -c android/app/amva-release-key.keystore
```

#### Opción B: USB Externo
- ✅ USB encriptado
- ✅ Guardar en lugar físico seguro (caja fuerte, cajón con llave)

#### Opción C: Gestor de Secretos
- ✅ 1Password
- ✅ LastPass
- ✅ Bitwarden
- ✅ KeePass (local)

### 2. Información a Guardar

Para cada backup, guarda:

1. **Archivo del keystore**
   - `android/app/amva-release-key.keystore`

2. **Contraseñas** (en gestor de contraseñas seguro):
   - Keystore password
   - Key password (puede ser la misma)

3. **Información del certificado**:
   - Alias: `amva-key-alias`
   - Algoritmo: RSA 2048 bits
   - Validez: 10000 días (~27 años)

4. **Ubicación del backup**:
   - Dónde está guardado
   - Cómo acceder a él

## 🔄 Proceso de Backup Recomendado

### Paso 1: Generar Keystore

```bash
cd amva-mobile
chmod +x scripts/generate-keystore.sh
./scripts/generate-keystore.sh
```

### Paso 2: Crear Múltiples Backups

#### Backup 1: Nube Encriptada
```bash
# Encriptar
zip -e amva-keystore-backup-$(date +%Y%m%d).zip android/app/amva-release-key.keystore

# Subir a Google Drive/Dropbox/etc
# Guardar contraseña del ZIP en gestor de contraseñas
```

#### Backup 2: USB Externo
```bash
# Copiar a USB
cp android/app/amva-release-key.keystore /media/usb/amva-keystore-backup/
```

#### Backup 3: Gestor de Secretos
1. Abrir 1Password/LastPass/etc
2. Crear nueva entrada: "AMVA Mobile - Keystore"
3. Adjuntar archivo del keystore
4. Agregar contraseñas en campos seguros
5. Agregar notas con información del certificado

### Paso 3: Verificar Backups

```bash
# Verificar que el keystore es válido
keytool -list -v -keystore android/app/amva-release-key.keystore -alias amva-key-alias
```

## 📋 Checklist de Backup

- [ ] Keystore generado
- [ ] Backup 1: Nube encriptada (Google Drive/Dropbox)
- [ ] Backup 2: USB externo
- [ ] Backup 3: Gestor de secretos (1Password/LastPass)
- [ ] Contraseñas guardadas en gestor de contraseñas
- [ ] Información del certificado documentada
- [ ] Backups verificados (puedes abrir y usar el keystore)
- [ ] Ubicaciones de backup documentadas
- [ ] Al menos una persona adicional conoce la ubicación de los backups

## 🔐 Seguridad de Contraseñas

### Gestor de Contraseñas (Recomendado)

Usa un gestor de contraseñas profesional:
- 1Password
- LastPass
- Bitwarden
- KeePass

**Entrada sugerida:**
```
Título: AMVA Mobile - Keystore Production
Usuario: amva-key-alias
Contraseña: [keystore password]
Campo personalizado: Key Password: [key password]
Notas: 
  - Alias: amva-key-alias
  - Ubicación: android/app/amva-release-key.keystore
  - Algoritmo: RSA 2048 bits
  - Validez: 10000 días
  - Fecha de creación: [fecha]
```

### Documentación Física (Opcional)

Si prefieres documentación física:
- Guardar en caja fuerte
- Encriptar la información
- Solo tú y personas de confianza deben tener acceso

## 🚨 Plan de Recuperación

Si pierdes el keystore:

1. **Verificar todos los backups**:
   - Revisar nube
   - Revisar USB
   - Revisar gestor de secretos
   - Contactar a personas que puedan tener copia

2. **Si NO encuentras el keystore**:
   - ⚠️ NO podrás actualizar la app existente
   - Tendrás que crear una nueva app en Play Store
   - Nuevo package name (ej: `org.vidaabundante.app.v2`)
   - Perderás usuarios, reviews y ratings

3. **Prevención**:
   - Hacer backups regulares
   - Verificar backups periódicamente
   - Documentar ubicaciones de backup

## 📝 Template de Documentación

Crea un archivo `KEYSTORE_BACKUP_INFO.txt` (NO commitear):

```
AMVA Mobile - Información de Backup del Keystore
================================================

Fecha de creación: [fecha]
Keystore: android/app/amva-release-key.keystore
Alias: amva-key-alias

Ubicaciones de Backup:
1. Google Drive: [ruta]
2. USB: [ubicación física]
3. 1Password: [nombre de entrada]

Contraseñas guardadas en: [gestor de contraseñas]

IMPORTANTE:
- Este archivo NO contiene contraseñas
- Las contraseñas están en [gestor de contraseñas]
- Verificar backups cada 6 meses
- Actualizar esta documentación si cambias ubicaciones

Última verificación: [fecha]
```

## 🔗 Recursos

- [Android Keystore System](https://developer.android.com/training/articles/keystore)
- [Signing Your App](https://developer.android.com/studio/publish/app-signing)
- [App Signing by Google Play](https://support.google.com/googleplay/android-developer/answer/9842756)

