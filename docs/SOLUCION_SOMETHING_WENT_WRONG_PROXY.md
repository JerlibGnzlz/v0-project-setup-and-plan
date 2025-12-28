# 🔧 Solución: "Something went wrong trying to finish signing in"

## 🚨 Problema

Cuando intentas hacer login con Google, aparece el error:
```
Something went wrong trying to finish signing in.
Please close this screen to go back to the app.
```

Este error aparece en el proxy de Expo (`auth.expo.io`).

## 🔍 Causas Posibles

1. **Redirect URI no agregado** en Google Cloud Console
2. **OAuth Consent Screen no publicado**
3. **Problema con el intercambio de código** por token
4. **Proxy de Expo tiene problemas** temporales

## ✅ Solución Paso a Paso

### Paso 1: Verificar Redirect URI en Google Cloud Console

**Redirect URI requerido:**
```
https://auth.expo.io/@jerlibgnzlz/amva-movil
```

**Pasos:**
1. Ve a: https://console.cloud.google.com/apis/credentials/consent?project=amva-auth
2. En el menú lateral, haz clic en **"Clientes"** (Clients)
3. Busca **"AMVA Web Client"** (tipo: Aplicación web)
4. Haz clic en **"Edit"**
5. En **"URIs de redireccionamiento autorizados"**, verifica que esté:
   ```
   https://auth.expo.io/@jerlibgnzlz/amva-movil
   ```
6. Si **NO está**, agrégalo y guarda

### Paso 2: Verificar OAuth Consent Screen

1. En la misma página de Google Auth Platform
2. Ve a **"Pantalla de consentimiento de OAuth"** (OAuth consent screen)
3. Verifica que **"Publishing status"** sea **"Published"**
4. Si está en "Testing", haz clic en **"PUBLISH APP"**

### Paso 3: Esperar Propagación

- ⏱️ Espera **10-15 minutos** después de agregar el redirect URI
- Los cambios pueden tardar en propagarse

### Paso 4: Reiniciar App

1. Cierra completamente la app
2. Reinicia la app
3. Prueba el login con Google

## 🔍 Verificar en Logs

Después de reiniciar, deberías ver en los logs:

```
🔍 Redirect URI generado: https://auth.expo.io/@jerlibgnzlz/amva-movil
🔍 Iniciando flujo OAuth con Code + PKCE...
✅ Respuesta exitosa del proxy de Expo
✅ Código de autorización recibido, intercambiando por id_token...
✅ Login con Google exitoso (expo-auth-session)
```

**Si ves "Usuario canceló"**, puede ser que:
- El redirect URI no esté agregado
- El proxy de Expo esté fallando
- Hay un error en el intercambio

## 🚨 Si Sigue Fallando

### Verificación Final:

1. **Redirect URI agregado**: Verifica que `https://auth.expo.io/@jerlibgnzlz/amva-movil` esté en Google Cloud Console
2. **OAuth Consent Screen publicado**: Debe estar en "Published", no "Testing"
3. **Client ID correcto**: Debe ser `378853205278-slllh10l32onum338rg1776g8itekvco` (Web Client)
4. **Esperar propagación**: Espera 15 minutos después de agregar el redirect URI

### Alternativa: Usar Método Nativo

Si `expo-auth-session` sigue fallando, puedes usar el método nativo:

1. Abre `amva-mobile/src/screens/auth/LoginScreen.tsx`
2. Cambia:
   ```typescript
   const googleSignIn = googleSignInNative
   ```
3. Agrega el SHA-1 `BC:0C:2C...` en Google Cloud Console
4. Espera 30 minutos
5. Prueba

## 📝 Resumen

- ✅ **Redirect URI**: `https://auth.expo.io/@jerlibgnzlz/amva-movil` debe estar en Google Cloud Console
- ✅ **OAuth Consent Screen**: Debe estar publicado
- ⏱️ **Esperar**: 15 minutos para propagación
- 🔄 **Reiniciar**: App completamente
- 🧪 **Probar**: Login con Google

¡Con estos pasos debería funcionar! 🚀

