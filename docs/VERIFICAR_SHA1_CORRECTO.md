# 🔑 Verificar SHA-1 Correcto para Google OAuth

## 📋 SHA-1 que Tienes Actualmente

```
BC:0C:2C:C3:68:D1:50:C3:7E:07:17:EE:49:8F:D0:35:7D:0F:1E:E3
```

## ✅ ¿Es el Correcto?

**Para saber si este SHA-1 es el correcto, necesitas verificar:**

### 1. ¿Qué APK/App Bundle Estás Usando?

El SHA-1 que necesitas depende del keystore que se usó para firmar tu app:

- **Si usas un APK compilado con EAS Build**: El SHA-1 viene del keystore de EAS
- **Si usas un APK compilado localmente**: El SHA-1 viene del keystore local
- **Si usas un AAB de Google Play**: El SHA-1 viene del keystore de Google Play

### 2. Obtener el SHA-1 Correcto

#### Opción A: Desde EAS (Si usas EAS Build)

```bash
cd amva-mobile
eas credentials
```

1. Selecciona **Android**
2. Selecciona **View credentials**
3. Busca la sección **"Keystore"** o **"Signing Key"**
4. Copia el **SHA-1** que aparece ahí
5. **Este es el SHA-1 que DEBES tener en Google Cloud Console**

#### Opción B: Desde el Keystore Local

Si tienes acceso al keystore de producción:

```bash
cd amva-mobile
keytool -list -v -keystore android/app/amva-release-key.keystore -alias amva-key-alias -storepass TU_CONTRASEÑA
```

Busca la línea que dice **"SHA1:"** y copia el valor.

#### Opción C: Desde el APK Instalado

Si tienes el APK que está instalado en tu dispositivo:

```bash
keytool -list -printcert -jarfile tu-app.apk
```

Busca **"SHA1:"** en la salida.

### 3. Comparar con Google Cloud Console

1. Ve a: **https://console.cloud.google.com/apis/credentials**
2. Busca el cliente Android: **`378853205278-c2e1gcjn06mg857rcvprns01fu8pduat`**
3. Haz clic para editarlo
4. En **"SHA-1 certificate fingerprint"**, verifica qué SHA-1 están configurados
5. Compara con el SHA-1 que obtuviste en el paso anterior

## 🎯 Regla General

**El SHA-1 que DEBES tener en Google Cloud Console es el mismo SHA-1 del keystore que se usó para firmar tu app actual.**

## ✅ Solución Recomendada

### Paso 1: Obtener SHA-1 Real del Keystore Actual

```bash
cd amva-mobile
eas credentials
# Selecciona Android → View credentials → Copia el SHA-1
```

### Paso 2: Verificar en Google Cloud Console

1. Ve a Google Cloud Console → Credentials
2. Busca el cliente Android
3. Verifica si el SHA-1 obtenido está en la lista

### Paso 3: Si No Está, Agregarlo

1. Haz clic en **"+ Agregar huella digital"** o **"+ Add fingerprint"**
2. Pega el SHA-1 obtenido de EAS
3. **NO elimines** los SHA-1 existentes (puedes tener múltiples)
4. Guarda los cambios

### Paso 4: Esperar Propagación

- ⏱️ Espera **30 minutos** para que Google propague los cambios
- 🔄 Los cambios pueden tardar hasta 1 hora en algunos casos

## ⚠️ Importante

- ✅ Puedes tener **MÚLTIPLES SHA-1** configurados en el mismo cliente Android
- ✅ **NO elimines** SHA-1 existentes a menos que estés seguro de que no los necesitas
- ✅ Cada keystore diferente tiene un SHA-1 diferente
- ✅ El SHA-1 de debug es diferente al SHA-1 de producción

## 🔍 Verificación Final

Después de agregar el SHA-1:

1. Espera 30 minutos
2. Reinstala la app completamente (desinstalar y volver a instalar)
3. Prueba el login con Google
4. Si aún no funciona, verifica los logs de la app para ver el error específico

## 📝 SHA-1 Documentados Anteriormente

Según la documentación previa, estos SHA-1 fueron mencionados:

1. **Keystore anterior**: `4B:24:0F:1B:6A:E6:3D:71:38:77:D1:E7:69:40:D2:1D:5D:30:7C:40`
2. **Keystore nuevo**: `9B:AF:07:1F:4A:A2:70:9C:E6:AB:79:E4:EC:ED:AE:22:CE:F6:DB:8A`

**Tu SHA-1 actual**: `BC:0C:2C:C3:68:D1:50:C3:7E:07:17:EE:49:8F:D0:35:7D:0F:1E:E3`

Si este SHA-1 no coincide con ninguno de los anteriores, significa que:
- Estás usando un keystore diferente
- O el keystore cambió recientemente

**Solución**: Obtén el SHA-1 directamente desde EAS o desde el keystore que estás usando actualmente.

