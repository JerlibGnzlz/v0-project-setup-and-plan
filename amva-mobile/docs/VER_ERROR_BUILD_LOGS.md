# 🔍 Ver Error Específico del Build - Guía Completa

## 🔴 Problema

El build falló con `Error: build command failed`, pero necesitamos ver el **error específico** en los logs.

---

## ✅ Solución: Ver los Logs Completos

### Opción 1: Desde el Enlace en la Terminal

Cuando ejecutaste `eas build`, debería haber aparecido un enlace como:

```
See logs: https://expo.dev/accounts/jerlibgnzlz/projects/amva-movil/builds/[ID]
```

1. **Copia ese enlace** de la terminal
2. **Ábrelo** en tu navegador
3. **Desplázate** hasta el final de los logs
4. **Busca** el error específico (generalmente aparece al final en rojo)

---

### Opción 2: Desde la Web de Expo

1. Ve a: **https://expo.dev/accounts/jerlibgnzlz/projects/amva-movil/builds**
2. Busca el **build más reciente** (el que falló)
3. Haz clic en él para ver los detalles
4. Haz clic en **"View logs"** o **"Ver logs"**
5. Desplázate hasta el final
6. Busca el error específico

---

## 🔍 Qué Buscar en los Logs

En los logs, busca:

1. **Errores en rojo** (generalmente al final)
2. **"FAILURE"** o **"ERROR"** en mayúsculas
3. **Mensajes de Gradle** si es un error de compilación Android
4. **Mensajes de npm/node** si es un error de dependencias
5. **Mensajes de configuración** si es un error de `app.json` o `eas.json`

---

## 🐛 Errores Comunes y Soluciones

### Error: "File google-services.json is missing"

**Solución**:
```bash
# Verificar que el archivo existe
ls -lh amva-mobile/android/app/google-services.json

# Si no existe, copiarlo desde donde lo tengas guardado
```

---

### Error: "Gradle build failed"

**Solución**:
1. Verifica que `gradle.properties` tenga las configuraciones correctas
2. Verifica que `android/app/build.gradle` esté correcto
3. Intenta limpiar:
   ```bash
   cd amva-mobile/android
   ./gradlew clean
   cd ../..
   ```

---

### Error: "Dependencies not found"

**Solución**:
```bash
cd amva-mobile
npm install
```

---

### Error: "Configuration error in app.json"

**Solución**:
1. Verifica que `app.json` tenga la sintaxis correcta
2. Verifica que las rutas de los logos sean correctas
3. Ejecuta:
   ```bash
   npx expo-doctor
   ```

---

### Error: "Keystore not found"

**Solución**:
1. Verifica que el keystore esté configurado en EAS:
   ```bash
   eas credentials
   ```
2. Selecciona el keystore correcto como default

---

### Error: "Out of memory" o "Memory limit exceeded"

**Solución**:
- Este error puede ocurrir con el plan Free
- Intenta compilar de nuevo (a veces es temporal)
- O actualiza tu plan en: https://expo.dev/accounts/jerlibgnzlz/settings/billing

---

## 📋 Pasos Inmediatos

1. **Ve a los logs** del build que falló:
   - https://expo.dev/accounts/jerlibgnzlz/projects/amva-movil/builds
   - O usa el enlace que apareció en la terminal

2. **Copia el error específico** completo (no solo "build command failed")

3. **Compártelo** conmigo para poder ayudarte mejor

---

## 💡 Mientras Tanto

Si necesitas un APK urgentemente:

1. **Usa el APK anterior** que ya tienes (el que funciona con Google Login)
2. Ese APK tiene Google Login funcionando
3. Solo le faltan los logos corregidos
4. Puedes esperar a resolver el error del build para tener los logos corregidos

---

## ✅ Resumen

| Acción | Descripción |
|--------|-------------|
| Ver logs | Ve al enlace del build en Expo |
| Buscar error | Desplázate hasta el final de los logs |
| Copiar error | Copia el mensaje de error completo |
| Compartir | Compártelo para poder ayudarte |

---

## 🚀 Próximos Pasos

1. **Ve a los logs** del build
2. **Copia el error específico** completo
3. **Compártelo** aquí
4. Con el error específico podré darte una solución precisa

El mensaje sobre el plan Free NO es el problema, solo es informativo. El error real está en los logs del build.

