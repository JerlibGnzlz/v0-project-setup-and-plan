# 🔍 Verificar Configuración Completa de Google Sign-In

## 🚨 Problema Actual

El login con Google no está funcionando después de agregar el SHA-1.

## ✅ Checklist de Verificación

### 1. Verificar SHA-1 en Google Cloud Console

**SHA-1 requerido:**
```
BC:0C:2C:C3:68:D1:50:C3:7E:07:17:EE:49:8F:D0:35:7D:0F:1E:E3
```

**Pasos:**
1. Ve a: https://console.cloud.google.com/apis/credentials?project=amva-auth
2. Busca **"AMVA Android Client"** (tipo: Android)
3. Haz clic en "Edit"
4. Verifica que el SHA-1 esté en la lista de "SHA-1 certificate fingerprints"
5. Si NO está, agrégalo y guarda

### 2. Verificar Cliente Android en Google Cloud Console

**Client ID esperado:**
```
378853205278-c2e1gcjn06mg857rcvprns01fu8pduat.apps.googleusercontent.com
```

**Pasos:**
1. En la misma página del cliente Android
2. Verifica que el **Client ID** sea: `378853205278-c2e1gcjn06mg857rcvprns01fu8pduat`
3. Verifica que el **Package name** sea: `org.vidaabundante.app`

### 3. Verificar app.json

**Debe tener:**
```json
{
  "expo": {
    "extra": {
      "googleClientId": "378853205278-slllh10l32onum338rg1776g8itekvco.apps.googleusercontent.com",
      "googleAndroidClientId": "378853205278-c2e1gcjn06mg857rcvprns01fu8pduat.apps.googleusercontent.com"
    }
  }
}
```

### 4. Verificar Tiempo de Propagación

- ⏱️ **Espera 15-30 minutos** después de agregar el SHA-1
- Los cambios en Google Cloud Console pueden tardar hasta 30 minutos en propagarse

### 5. Verificar Logs de la App

Después de reiniciar la app, deberías ver:

```
🔍 Google Sign-In configurado con: {"clientId": "378853205278-c2e1...", "platform": "android"}
🔍 Configurando con Android Client ID: 378853205278-c2e1...
✅ Google Sign-In configurado correctamente
```

**Si ves el Web Client ID en lugar del Android Client ID**, hay un problema de configuración.

## 🔧 Solución Aplicada

He actualizado el código para usar el **Android Client ID específico** en lugar del Web Client ID cuando es Android.

### Cambio Realizado

**Antes:**
```typescript
GoogleSignin.configure({
  webClientId: googleClientId, // Usaba Web Client ID
})
```

**Ahora:**
```typescript
const androidClientId = Platform.OS === 'android' 
  ? googleAndroidClientId  // Usa Android Client ID específico
  : googleClientId

GoogleSignin.configure({
  webClientId: androidClientId, // Usa Android Client ID
})
```

## 📋 Pasos para Resolver

### Paso 1: Verificar SHA-1

1. Ve a Google Cloud Console
2. Verifica que el SHA-1 `BC:0C:2C...` esté agregado
3. Si no está, agrégalo y guarda

### Paso 2: Esperar Propagación

1. ⏱️ Espera **15-30 minutos** después de agregar el SHA-1
2. Los cambios necesitan tiempo para propagarse

### Paso 3: Reiniciar App Completamente

1. Cierra completamente la app (no solo minimizar)
2. Desinstala la app si es necesario
3. Reinstala la app
4. Abre la app nuevamente

### Paso 4: Verificar Logs

1. Abre las herramientas de desarrollo
2. Haz clic en "Continuar con Google"
3. Verifica los logs:
   - Debe mostrar: `Configurando con Android Client ID: 378853205278-c2e1...`
   - NO debe mostrar: `DEVELOPER_ERROR`

### Paso 5: Probar Login

1. Haz clic en "Continuar con Google"
2. Debería aparecer el diálogo nativo de Google
3. Selecciona tu cuenta
4. Debería funcionar correctamente

## 🚨 Si Sigue Fallando

### Verificar que el SHA-1 Esté Correcto

1. El SHA-1 debe ser exactamente: `BC:0C:2C:C3:68:D1:50:C3:7E:07:17:EE:49:8F:D0:35:7D:0F:1E:E3`
2. Debe estar en el cliente **Android**, no en el Web
3. Debe estar en el proyecto **amva-auth**

### Verificar que el Cliente Android Esté Correcto

1. Client ID: `378853205278-c2e1gcjn06mg857rcvprns01fu8pduat`
2. Package name: `org.vidaabundante.app`
3. SHA-1: `BC:0C:2C:C3:68:D1:50:C3:7E:07:17:EE:49:8F:D0:35:7D:0F:1E:E3`

### Verificar Logs de Error

Si ves `DEVELOPER_ERROR` después de esperar 30 minutos:

1. Verifica que el SHA-1 esté exactamente como se muestra arriba
2. Verifica que esté en el cliente Android correcto
3. Verifica que el package name sea `org.vidaabundante.app`
4. Espera más tiempo (hasta 1 hora)

## 📝 Resumen

- ✅ SHA-1 agregado: `BC:0C:2C:C3:68:D1:50:C3:7E:07:17:EE:49:8F:D0:35:7D:0F:1E:E3`
- ✅ Cliente Android: `378853205278-c2e1gcjn06mg857rcvprns01fu8pduat`
- ✅ Código actualizado para usar Android Client ID
- ⏱️ Esperar 15-30 minutos para propagación
- 🔄 Reiniciar app completamente
- 🧪 Probar login con Google

¡Con estos pasos debería funcionar! 🚀

