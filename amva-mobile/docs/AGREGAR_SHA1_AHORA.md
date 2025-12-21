# 🔑 Agregar SHA-1 en Google Cloud Console

## ✅ SHA-1 Obtenido

**SHA-1**: `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25`

---

## 📋 Pasos para Agregar SHA-1

### Paso 1: Ir a Google Cloud Console

1. Abre tu navegador
2. Ve a: **https://console.cloud.google.com/apis/credentials**
3. Asegúrate de estar en el proyecto correcto (AMVA Digital o el que corresponda)

### Paso 2: Encontrar el Cliente Android

1. Busca en la lista el cliente Android con este ID:
   ```
   378853205278-c2e1gcjn06mg857rcvprns01fu8pduat
   ```
2. Haz clic en el **lápiz** (✏️) o en el **nombre del cliente** para editarlo

### Paso 3: Agregar SHA-1

1. En la sección **"SHA-1 certificate fingerprint"** o **"Huella digital del certificado SHA-1"**:
   - Si ya hay un SHA-1 listado, haz clic en **"+ Agregar huella digital"** o **"+ Add fingerprint"**
   - Si no hay ningún SHA-1, verás un campo de texto vacío
   
2. Pega el siguiente SHA-1:
   ```
   5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25
   ```
   
   ⚠️ **IMPORTANTE**: Copia exactamente como está, con los dos puntos (`:`) entre cada par de caracteres

3. Haz clic en **"Guardar"** o **"Save"**

### Paso 4: Esperar Propagación

- ⏱️ Espera **5-15 minutos** para que Google propague los cambios
- 🔄 Puedes verificar que se guardó correctamente refrescando la página

---

## ✅ Verificación

Después de agregar el SHA-1:

1. ✅ El SHA-1 debería aparecer en la lista de "SHA-1 certificate fingerprint"
2. ✅ Puedes tener múltiples SHA-1 (uno para debug, otro para producción)
3. ✅ **NO elimines** el SHA-1 de debug si ya lo tienes

---

## 🧪 Probar Login con Google

Después de esperar 5-15 minutos:

1. Abre la app en tu dispositivo Android
2. Intenta iniciar sesión con Google
3. Debería funcionar correctamente

---

## 🐛 Si No Funciona

### Verificar Logs

En la app, busca en los logs:
- `🔍 Google Sign-In configurado con:` - Muestra qué Client ID se está usando
- `❌ Error en signIn con Google:` - Muestra el error específico

### Errores Comunes

1. **"10" o "DEVELOPER_ERROR"**:
   - Verifica que el SHA-1 sea exactamente: `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25`
   - Espera más tiempo (hasta 30 minutos)
   - Verifica que estés en el proyecto correcto de Google Cloud

2. **"12500" o "SIGN_IN_CANCELLED"**:
   - Usuario canceló (esto es normal, no es un error)

---

## 📝 Notas

- ⚠️ **NO elimines** el SHA-1 de debug si ya lo tienes configurado
- ✅ Puedes tener **múltiples SHA-1** en el mismo cliente Android
- 🔄 Los cambios pueden tardar hasta **30 minutos** en propagarse completamente
- 📱 Este SHA-1 es para el keystore usado en EAS Build (producción)

---

## 🎯 Resumen

1. ✅ SHA-1 obtenido: `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25`
2. 📋 Agregar en Google Cloud Console → Cliente Android
3. ⏱️ Esperar 5-15 minutos
4. 🧪 Probar login con Google en la app

