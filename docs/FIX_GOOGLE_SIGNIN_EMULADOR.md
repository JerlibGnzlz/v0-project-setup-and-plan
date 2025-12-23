# 🔧 Solución: DEVELOPER_ERROR en Google Sign-In (Emulador)

## 🔴 Problema

Error al intentar iniciar sesión con Google en el emulador:
```
DEVELOPER_ERROR: Follow troubleshooting instructions at https://react-native-google-signin.github.io/docs/troubleshooting
```

## ✅ Solución

Este error ocurre porque **falta el SHA-1 del keystore de debug** en Google Cloud Console.

---

## 📋 SHA-1 del Keystore de Debug

**SHA-1 encontrado:**
```
56:46:F7:AE:10:42:F8:3E:F0:CC:3F:70:37:54:7F:BF:DE:BC:3E:30
```

**SHA-256 (por si lo necesitas):**
```
7F:69:7D:DD:B1:FD:C9:3C:50:3E:0F:0A:B9:BB:D3:C2:1D:D5:CB:D6:47:D0:82:71:CC:DA:28:E9:B9:3B:29:0A
```

---

## 🔧 Pasos para Agregar SHA-1 en Google Cloud Console

### 1. Ir a Google Cloud Console

1. Ve a: https://console.cloud.google.com/
2. Selecciona tu proyecto (o crea uno si no tienes)

### 2. Ir a Credenciales de OAuth

1. En el menú lateral, ve a **"APIs y servicios"** → **"Credenciales"**
2. O directamente: https://console.cloud.google.com/apis/credentials

### 3. Encontrar tu OAuth 2.0 Client ID de Android

1. Busca el Client ID que corresponde a tu app Android
2. El Client ID debería ser: `378853205278-c2e1gcjn06mg857rcvprns01fu8pduat.apps.googleusercontent.com`
3. Haz clic en el nombre del Client ID para editarlo

### 4. Agregar SHA-1 del Keystore de Debug

1. En la sección **"SHA-1 certificate fingerprints"**, haz clic en **"+ Add fingerprint"**
2. Pega el SHA-1 del keystore de debug:
   ```
   56:46:F7:AE:10:42:F8:3E:F0:CC:3F:70:37:54:7F:BF:DE:BC:3E:30
   ```
3. Haz clic en **"Save"**

### 5. Verificar que se Guardó

Deberías ver **múltiples SHA-1** en la lista:
- ✅ SHA-1 del keystore de debug (para emulador)
- ✅ SHA-1 del keystore de producción (para APK/AAB)

---

## ⚠️ Importante

### SHA-1 para Emulador vs Producción

- **Emulador (Debug)**: `56:46:F7:AE:10:42:F8:3E:F0:CC:3F:70:37:54:7F:BF:DE:BC:3E:30`
- **Producción (Release)**: Ya deberías tener el SHA-1 de producción agregado

### ¿Por qué Necesitas Ambos?

- **SHA-1 Debug**: Para probar en emulador y dispositivos físicos con build de desarrollo
- **SHA-1 Production**: Para builds de producción (APK/AAB) que subes a Google Play

---

## 🔍 Verificar Configuración Actual

### En Google Cloud Console

1. Ve a: https://console.cloud.google.com/apis/credentials
2. Busca tu OAuth 2.0 Client ID de Android
3. Verifica que tenga **al menos estos SHA-1**:
   - ✅ `56:46:F7:AE:10:42:F8:3E:F0:CC:3F:70:37:54:7F:BF:DE:BC:3E:30` (Debug)
   - ✅ SHA-1 de producción (si ya lo agregaste antes)

### En tu App

El Client ID de Android está configurado en `app.json`:
```json
{
  "extra": {
    "googleAndroidClientId": "378853205278-c2e1gcjn06mg857rcvprns01fu8pduat.apps.googleusercontent.com"
  }
}
```

---

## 🧪 Probar Después de Agregar SHA-1

1. **Espera 5-10 minutos** después de agregar el SHA-1 (Google puede tardar en propagar)
2. **Cierra completamente la app** en el emulador
3. **Reinicia la app**
4. **Intenta iniciar sesión con Google nuevamente**

---

## 🚨 Si el Error Persiste

### Verificar que el SHA-1 Esté Correcto

Ejecuta este comando para verificar el SHA-1 del keystore de debug:

```bash
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android | grep -A 1 "SHA1:"
```

Deberías ver:
```
SHA1: 56:46:F7:AE:10:42:F8:3E:F0:CC:3F:70:37:54:7F:BF:DE:BC:3E:30
```

### Verificar el Package Name

En Google Cloud Console, verifica que el **Package name** del OAuth Client ID sea:
```
org.vidaabundante.app
```

Este debe coincidir exactamente con el `package` en `app.json`:
```json
{
  "android": {
    "package": "org.vidaabundante.app"
  }
}
```

### Verificar el OAuth Consent Screen

1. Ve a: https://console.cloud.google.com/apis/credentials/consent
2. Verifica que el **OAuth Consent Screen** esté configurado
3. Si está en modo "Testing", agrega tu email como usuario de prueba

---

## 📝 Resumen de SHA-1s Necesarios

| Tipo | SHA-1 | Uso |
|------|-------|-----|
| **Debug** | `56:46:F7:AE:10:42:F8:3E:F0:CC:3F:70:37:54:7F:BF:DE:BC:3E:30` | Emulador y desarrollo |
| **Production** | (Ya agregado anteriormente) | APK/AAB de producción |

---

## ✅ Checklist

- [ ] SHA-1 de debug agregado en Google Cloud Console
- [ ] Package name coincide (`org.vidaabundante.app`)
- [ ] OAuth Consent Screen configurado
- [ ] Esperado 5-10 minutos después de agregar SHA-1
- [ ] App reiniciada completamente
- [ ] Probado iniciar sesión con Google

---

## 🔗 Enlaces Útiles

- Google Cloud Console: https://console.cloud.google.com/apis/credentials
- Documentación oficial: https://react-native-google-signin.github.io/docs/troubleshooting
- OAuth Consent Screen: https://console.cloud.google.com/apis/credentials/consent

---

**Después de agregar el SHA-1, espera unos minutos y prueba nuevamente. El error debería desaparecer.**

