# 🚀 Comando Correcto para Build

## ✅ Comando Correcto

```bash
cd /home/jerlibgnzlz/Escritorio/v0-project-setup-and-plan/amva-mobile
eas build --platform android --profile production
```

## ⚠️ Errores Comunes

### Error: "Flag --platform expects a value"

Esto puede ocurrir si:
1. Hay espacios incorrectos en el comando
2. El comando está mal formateado
3. Hay caracteres especiales que interfieren

### Solución

Asegúrate de que el comando esté escrito exactamente así:

```bash
eas build --platform android --profile production
```

**Sin espacios extra** entre `--platform` y `android`.

## 🔄 Alternativas

Si el comando anterior no funciona, prueba:

```bash
# Opción 1: Con comillas (si hay problemas con espacios)
eas build --platform "android" --profile "production"

# Opción 2: Sin especificar profile (usará el default)
eas build --platform android

# Opción 3: Con preview profile (más rápido para probar)
eas build --platform android --profile preview
```

## 📋 Verificar EAS CLI

Si el problema persiste, verifica que EAS CLI esté instalado correctamente:

```bash
eas --version
```

Debería mostrar algo como: `eas-cli/x.x.x`

