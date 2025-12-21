# 🔧 Solución para DEVELOPER_ERROR en Google Sign-In

## ❌ Error

```
DEVELOPER_ERROR
Follow troubleshooting instruction at https://react-native-google-signin.github.io/docs/troubleshooting
```

---

## 🔍 Causas Comunes

El error `DEVELOPER_ERROR` generalmente ocurre por:

1. **SHA-1 no configurado o incorrecto** en Google Cloud Console
2. **Client ID incorrecto** en la app
3. **SHA-1 no coincide** con el keystore usado
4. **OAuth consent screen** no configurado correctamente
5. **Cambios no propagados** (necesita más tiempo)

---

## ✅ Solución Paso a Paso

### Paso 1: Verificar SHA-1 en Google Cloud Console

1. Ve a: **https://console.cloud.google.com/apis/credentials**
2. Busca el cliente Android: `378853205278-c2e1gcjn06mg857rcvprns01fu8pduat`
3. Haz clic para editarlo
4. Verifica que el SHA-1 esté agregado:
   ```
   5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25
   ```
5. **IMPORTANTE**: Verifica que:
   - ✅ El SHA-1 esté exactamente como arriba (con los dos puntos `:`)
   - ✅ No haya espacios extra
   - ✅ Esté en la sección "SHA-1 certificate fingerprint"

### Paso 2: Verificar que el SHA-1 Sea Correcto

El SHA-1 que agregaste debe ser del **keystore de producción** usado por EAS Build.

**Si no estás seguro**, verifica nuevamente:

```bash
cd amva-mobile
eas credentials
# Selecciona Android → View credentials → Verifica el SHA-1
```

**Compara** el SHA-1 que ves en EAS con el que agregaste en Google Cloud Console. Deben ser **exactamente iguales**.

### Paso 3: Verificar Client ID en app.json

Verifica que en `app.json` tengas:

```json
"googleAndroidClientId": "378853205278-c2e1gcjn06mg857rcvprns01fu8pduat.apps.googleusercontent.com"
```

**IMPORTANTE**: Debe incluir `.apps.googleusercontent.com` al final.

### Paso 4: Verificar OAuth Consent Screen

1. Ve a: **https://console.cloud.google.com/apis/credentials/consent**
2. Verifica que:
   - ✅ El OAuth consent screen esté configurado
   - ✅ Tenga al menos un usuario de prueba (si está en modo testing)
   - ✅ El email de tu cuenta de Google esté agregado como usuario de prueba

### Paso 5: Esperar Propagación

Después de agregar/modificar el SHA-1:
- ⏱️ Espera **al menos 15-30 minutos**
- 🔄 Los cambios pueden tardar hasta **1 hora** en algunos casos
- 💡 Si acabas de agregar el SHA-1, espera más tiempo

---

## 🔄 Solución Alternativa: Verificar SHA-1 del APK Instalado

Si el SHA-1 que agregaste no es el correcto, puedes obtenerlo del APK instalado:

### Opción A: Desde el Dispositivo (Requiere ADB)

```bash
# Conecta tu dispositivo Android por USB
adb shell pm list packages | grep org.vidaabundante.app

# Obtener SHA-1 del certificado de la app instalada
adb shell dumpsys package org.vidaabundante.app | grep -A 1 "signatures"
```

### Opción B: Desde EAS Build

```bash
cd amva-mobile
eas credentials
# Selecciona Android → View credentials → Ver SHA-1
```

**Compara** este SHA-1 con el que agregaste en Google Cloud Console.

---

## 🐛 Verificación Adicional

### 1. Verificar Logs de la App

En la app, busca en los logs:
- `🔍 Google Sign-In configurado con:` - Muestra qué Client ID se está usando
- `❌ Error en signIn con Google:` - Muestra el error específico

### 2. Verificar que el Client ID Sea Correcto

El código debe usar:
- **Android**: `378853205278-c2e1gcjn06mg857rcvprns01fu8pduat.apps.googleusercontent.com`
- **Web**: `378853205278-slllh10l32onum338rg1776g8itekvco.apps.googleusercontent.com`

### 3. Verificar Configuración en Google Cloud Console

En **https://console.cloud.google.com/apis/credentials**:

- ✅ Cliente Android existe: `378853205278-c2e1gcjn06mg857rcvprns01fu8pduat`
- ✅ SHA-1 agregado: `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25`
- ✅ OAuth consent screen configurado
- ✅ Tu email agregado como usuario de prueba (si está en modo testing)

---

## 🔄 Si Aún No Funciona

### Opción 1: Rebuild la App

A veces es necesario hacer un rebuild después de agregar el SHA-1:

```bash
cd amva-mobile
eas build --platform android --profile preview
```

### Opción 2: Verificar SHA-1 del Keystore de Debug

Si estás probando con un build de debug, necesitas el SHA-1 del keystore de debug:

```bash
cd amva-mobile/android
./gradlew signingReport
# Busca "SHA1:" en la salida
```

Y agrégalo también en Google Cloud Console (puedes tener múltiples SHA-1).

### Opción 3: Verificar que el Proyecto Sea Correcto

Asegúrate de estar en el proyecto correcto de Google Cloud:
- Proyecto: **AMVA Digital** (o el que corresponda)
- Verifica que el Client ID `378853205278-c2e1gcjn06mg857rcvprns01fu8pduat` esté en ese proyecto

---

## 📋 Checklist de Verificación

- [ ] SHA-1 agregado en Google Cloud Console: `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25`
- [ ] SHA-1 coincide con el keystore usado en EAS Build
- [ ] `googleAndroidClientId` correcto en `app.json`
- [ ] OAuth consent screen configurado
- [ ] Email agregado como usuario de prueba (si está en modo testing)
- [ ] Esperado al menos 15-30 minutos después de agregar SHA-1
- [ ] Verificado logs de la app para más detalles

---

## 🎯 Pasos Inmediatos

1. **Verifica SHA-1 en Google Cloud Console** - Asegúrate de que esté exactamente como arriba
2. **Verifica SHA-1 desde EAS** - Compara con el que agregaste
3. **Espera 30 minutos** - Los cambios pueden tardar
4. **Verifica OAuth consent screen** - Asegúrate de que esté configurado
5. **Rebuild la app** (opcional) - Si después de 30 minutos aún no funciona

---

## 📚 Recursos

- Troubleshooting oficial: https://react-native-google-signin.github.io/docs/troubleshooting
- Google Cloud Console: https://console.cloud.google.com/apis/credentials
- EAS Credentials: `eas credentials`

