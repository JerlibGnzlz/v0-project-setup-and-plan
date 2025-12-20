# 🔐 Instrucciones para Generar el Keystore

## ⚠️ IMPORTANTE

El script requiere que ingreses las contraseñas manualmente por seguridad. No puede ejecutarse automáticamente.

## 🚀 Pasos para Generar el Keystore

### Opción 1: Script Simplificado (Recomendado para empezar)

```bash
cd amva-mobile
chmod +x scripts/generate-keystore-simple.sh
./scripts/generate-keystore-simple.sh
```

**Este script:**
- Te pedirá solo la contraseña del keystore
- Usa valores por defecto para el certificado
- Configura `gradle.properties` automáticamente

### Opción 2: Script Completo (Más control)

```bash
cd amva-mobile
chmod +x scripts/generate-keystore.sh
./scripts/generate-keystore.sh
```

**Este script:**
- Te pedirá todas las contraseñas
- Te permitirá personalizar la información del certificado
- Configura `gradle.properties` automáticamente

## 📝 Qué Necesitas

1. **Contraseña del keystore** (mínimo 6 caracteres, recomendado 12+)
   - Usa mayúsculas, minúsculas, números y símbolos
   - Ejemplo: `Amva2024SecureKey!`

2. **Información del certificado** (solo si usas el script completo):
   - Nombre completo (CN)
   - Unidad organizacional (OU)
   - Organización (O)
   - Ciudad (L)
   - Estado/Provincia (ST)
   - Código de país (C)

## ✅ Después de Generar el Keystore

1. **Verificar que se creó:**
   ```bash
   ls -lh android/app/amva-release-key.keystore
   ```

2. **Verificar configuración en gradle.properties:**
   ```bash
   grep MYAPP_RELEASE android/gradle.properties
   ```

3. **Hacer backups inmediatamente:**
   - Ver guía: `docs/KEYSTORE_BACKUP.md`

4. **Probar build de producción:**
   ```bash
   cd android
   ./gradlew bundleRelease
   ```

## 🔐 Seguridad

- ✅ El keystore está en `.gitignore` (no se commitea)
- ✅ `gradle.properties` con contraseñas está en `.gitignore`
- ⚠️ **NO compartas las contraseñas**
- ⚠️ **Guarda las contraseñas en un gestor de contraseñas seguro**

## ❓ Problemas Comunes

### Error: "keytool: command not found"
```bash
# En Linux/Mac, keytool viene con Java
# Verificar que Java está instalado:
java -version

# Si no está instalado, instalar OpenJDK:
# Ubuntu/Debian:
sudo apt-get install openjdk-11-jdk

# macOS:
brew install openjdk@11
```

### Error: "Permission denied"
```bash
# Dar permisos de ejecución al script:
chmod +x scripts/generate-keystore-simple.sh
```

### Error: "Keystore ya existe"
- El script te preguntará si quieres sobrescribirlo
- **NO sobrescribas** si ya está en producción
- Si es la primera vez, puedes sobrescribirlo

## 📞 Ayuda

Si tienes problemas:
1. Revisa los logs del script
2. Verifica que Java/keytool está instalado
3. Verifica permisos del script
4. Consulta la documentación: `docs/KEYSTORE_BACKUP.md`

