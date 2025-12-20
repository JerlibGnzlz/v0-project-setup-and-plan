# 🔧 Solución de Error de Build Gradle

## ❌ Error Actual

```
✖ Build failed
🤖 Android build failed:
Gradle build failed with unknown error. See logs for the "Run gradlew" phase for more information.
```

## 🔍 Posibles Causas

1. **Plugin de Google Services faltante**: El `google-services.json` requiere el plugin de Google Services en `build.gradle`
2. **Ruta incorrecta del google-services.json**: El archivo está en `android/app/google-services.json` pero `app.json` apunta a `./google-services.json`
3. **ProGuard/R8**: Las reglas de ProGuard pueden estar causando problemas

## ✅ Soluciones a Probar

### Solución 1: Agregar Plugin de Google Services

El `build.gradle` necesita el plugin de Google Services para procesar `google-services.json`.

### Solución 2: Verificar Logs Detallados

Revisa los logs en: https://expo.dev/accounts/jerlibgnzlz/projects/amva-movil/builds/a5240e53-3645-49c5-830c-28556a65880a

Busca específicamente la sección "Run gradlew" para ver el error exacto.

### Solución 3: Verificar Configuración de Firebase

Asegúrate de que:
- `google-services.json` esté en `android/app/google-services.json`
- El plugin de Google Services esté agregado en `android/build.gradle` y `android/app/build.gradle`

