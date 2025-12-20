# 🔑 Obtener SHA-1 del Keystore de Producción

## ⚠️ Problema

El login con Google no funciona en la app compilada porque el **SHA-1 del keystore de producción** no está configurado en Google Cloud Console.

---

## 📋 Paso 1: Obtener SHA-1 desde EAS

### Opción A: Desde EAS CLI (Recomendado)

```bash
cd /home/jerlibgnzlz/Escritorio/v0-project-setup-and-plan/amva-mobile
eas credentials
```

1. Selecciona **Android**
2. Selecciona **View credentials**
3. Busca la sección **"Keystore"** o **"Signing Key"**
4. Verás el **SHA-1** listado ahí
5. Copia el SHA-1 completo

### Opción B: Si Tienes el Keystore Local

Si tienes acceso al keystore de producción (`amva-release-key.keystore`):

```bash
# Reemplaza con tu alias y contraseña reales
keytool -list -v -keystore android/app/amva-release-key.keystore -alias amva-key-alias -storepass TU_CONTRASEÑA
```

Busca la línea que dice **"SHA1:"** y copia el valor.

---

## 📋 Paso 2: Agregar SHA-1 en Google Cloud Console

1. Ve a: **https://console.cloud.google.com/apis/credentials**
2. Selecciona tu proyecto: **AMVA Digital** (o el que corresponda)
3. Busca el cliente Android: **`378853205278-c2e1gcjn06mg857rcvprns01fu8pduat`**
4. Haz clic en el **lápiz** (editar) o en el nombre del cliente
5. En la sección **"SHA-1 certificate fingerprint"**:
   - Haz clic en **"+ Agregar huella digital"** o **"+ Add fingerprint"**
   - Pega el SHA-1 del keystore de producción
   - **NO elimines** el SHA-1 de debug si ya está ahí (puedes tener ambos)
6. Haz clic en **"Guardar"** o **"Save"**

---

## ⏱️ Paso 3: Esperar Propagación

Después de agregar el SHA-1:
- ⏱️ Espera **5-15 minutos** para que Google propague los cambios
- 🔄 Puedes verificar en: https://console.cloud.google.com/apis/credentials

---

## ✅ Paso 4: Verificar Configuración

Verifica que:
- ✅ SHA-1 de producción agregado en Google Cloud Console
- ✅ `googleAndroidClientId` en `app.json`: `378853205278-c2e1gcjn06mg857rcvprns01fu8pduat`
- ✅ OAuth consent screen configurado

---

## 🔄 Paso 5: Rebuild (Opcional pero Recomendado)

Aunque no es estrictamente necesario, puedes hacer un rebuild para asegurarte:

```bash
cd /home/jerlibgnzlz/Escritorio/v0-project-setup-and-plan/amva-mobile
eas build --platform android --profile production
```

O si prefieres probar rápido con preview:

```bash
eas build --platform android --profile preview
```

---

## 🐛 Si Aún No Funciona

### Verificar Logs

En la app, busca en los logs:
- `🔍 Google Sign-In configurado con:` - Muestra qué Client ID se está usando
- `❌ Error en signIn con Google:` - Muestra el error específico

### Errores Comunes

1. **"10" o "DEVELOPER_ERROR"**
   - SHA-1 no está configurado o no coincide
   - Verifica que el SHA-1 sea correcto
   - Espera más tiempo (hasta 30 minutos)

2. **"12500" o "SIGN_IN_CANCELLED"**
   - Usuario canceló (esto es normal, no es un error)

3. **"PLAY_SERVICES_NOT_AVAILABLE"**
   - Actualiza Google Play Services en tu dispositivo

---

## 📝 Notas Importantes

- ⚠️ **NO elimines** el SHA-1 de debug si ya lo tienes configurado
- ✅ Puedes tener **múltiples SHA-1** en el mismo cliente Android
- 🔄 Los cambios pueden tardar hasta **30 minutos** en propagarse
- 📱 El SHA-1 de producción es **diferente** al SHA-1 de debug

---

## 🎯 Resumen

1. Obtener SHA-1 del keystore de producción (desde EAS o local)
2. Agregar SHA-1 en Google Cloud Console → Cliente Android
3. Esperar 5-15 minutos
4. Probar login con Google en la app
5. Si no funciona, esperar hasta 30 minutos y verificar logs

