# 🔐 Guía Rápida: Keystore y Versioning

## 🚀 Inicio Rápido

### 1. Generar Keystore de Producción

```bash
cd amva-mobile
chmod +x scripts/generate-keystore.sh
./scripts/generate-keystore.sh
```

El script te guiará paso a paso:
- Te pedirá las contraseñas
- Generará el keystore
- Configurará `gradle.properties` automáticamente
- Te recordará hacer backups

### 2. Incrementar Versión

```bash
# Incrementar versión (major, minor, patch, o build)
./scripts/increment-version.sh patch

# O interactivo
./scripts/increment-version.sh
```

## 📋 Versioning Automático

El `build.gradle` ahora lee automáticamente la versión desde `app.json`:

- `version`: Versión visible para usuarios (ej: "1.0.0")
- `versionCode`: Código interno que DEBE incrementarse en cada release

**Reglas importantes:**
- ✅ `versionCode` se incrementa automáticamente con el script
- ✅ `versionCode` NO puede decrementarse en Play Store
- ✅ Cada release debe tener un `versionCode` mayor al anterior

## 🔐 Backup del Keystore (CRÍTICO)

**Si pierdes el keystore, NO podrás actualizar la app en Play Store.**

### Estrategia de Backup Múltiple:

1. **Nube Encriptada** (Google Drive, Dropbox)
   ```bash
   zip -e amva-keystore-backup.zip android/app/amva-release-key.keystore
   # Subir a nube
   ```

2. **USB Externo** (encriptado)

3. **Gestor de Secretos** (1Password, LastPass)
   - Adjuntar archivo del keystore
   - Guardar contraseñas

Ver guía completa: [docs/KEYSTORE_BACKUP.md](docs/KEYSTORE_BACKUP.md)

## 📝 Archivos Importantes

- `android/app/amva-release-key.keystore` - Keystore de producción (NO commitear)
- `android/gradle.properties` - Configuración del keystore (NO commitear si tiene contraseñas)
- `app.json` - Versión de la app
- `android/app/build.gradle` - Configuración de build (lee versión de app.json)

## ⚠️ Antes de Publicar

- [ ] Keystore generado y guardado en lugar seguro
- [ ] Múltiples backups del keystore creados
- [ ] Contraseñas guardadas en gestor de contraseñas
- [ ] Versión actualizada con `increment-version.sh`
- [ ] Build de producción probado

## 🔗 Más Información

- [Guía Completa de Backup](docs/KEYSTORE_BACKUP.md)
- [Checklist de Play Store](docs/PLAY_STORE_CHECKLIST.md)
- [Configuración de Producción](docs/PRODUCTION_SETUP.md)

