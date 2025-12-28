# ✅ Verificar Redirect URI del Proxy de Expo

## 🎯 Redirect URI Requerido

```
https://auth.expo.io/@jerlibgnzlz/amva-movil
```

## 📋 Pasos para Verificar y Agregar

### Paso 1: Abrir Google Auth Platform

**URL directa:**
```
https://console.cloud.google.com/apis/credentials/consent?project=amva-auth
```

### Paso 2: Ir a Clientes

1. En el menú lateral izquierdo, haz clic en **"Clientes"** (Clients)
2. Verás la lista de clientes OAuth

### Paso 3: Editar Cliente Web

1. Busca **"AMVA Web Client"** (tipo: Aplicación web)
2. Haz clic en el nombre del cliente
3. Verás la página de edición

### Paso 4: Verificar/Agregar Redirect URI

1. Busca la sección **"URIs de redireccionamiento autorizados"**
2. Verifica que este URI esté en la lista:
   ```
   https://auth.expo.io/@jerlibgnzlz/amva-movil
   ```
3. Si **NO está**:
   - Haz clic en **"+ ADD URI"** o **"+ Agregar URI"**
   - Pega: `https://auth.expo.io/@jerlibgnzlz/amva-movil`
   - Haz clic en **"Guardar"** o **"SAVE"**

### Paso 5: Verificar OAuth Consent Screen

1. Ve a **"Pantalla de consentimiento de OAuth"** (OAuth consent screen)
2. Verifica que **"Publishing status"** sea **"Published"**
3. Si está en "Testing", haz clic en **"PUBLISH APP"**

### Paso 6: Esperar y Probar

1. ⏱️ Espera **10-15 minutos** para propagación
2. 🔄 Reinicia la app completamente
3. 🧪 Prueba el login con Google

## 🔍 Verificación en Logs

Después de reiniciar, deberías ver:

```
🔍 Redirect URI generado: https://auth.expo.io/@jerlibgnzlz/amva-movil
🔍 Iniciando flujo OAuth con Code + PKCE...
✅ Respuesta exitosa del proxy de Expo
✅ Código de autorización recibido, intercambiando por id_token...
✅ Login con Google exitoso (expo-auth-session)
```

**Si ves "Usuario canceló"**, verifica que el redirect URI esté agregado.

## ✅ Checklist

- [ ] Redirect URI `https://auth.expo.io/@jerlibgnzlz/amva-movil` agregado en Google Cloud Console
- [ ] OAuth Consent Screen publicado
- [ ] Esperado 10-15 minutos para propagación
- [ ] App reiniciada completamente
- [ ] Login probado

¡Con estos pasos debería funcionar! 🚀

