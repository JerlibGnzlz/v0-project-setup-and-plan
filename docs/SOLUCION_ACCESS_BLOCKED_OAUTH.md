# 🔧 Solución: "Access blocked Authorization Error" en Google OAuth

## 🎯 Problema

Cuando intentas hacer login con Google en la app móvil, aparece el error:
```
Access blocked Authorization Error
```

## 🔍 Causas Posibles

Este error puede deberse a:

1. **Redirect URI no autorizado**: El redirect URI generado por `expo-auth-session` no está configurado en Google Cloud Console
2. **OAuth Consent Screen no publicado**: El consent screen está en modo "Testing" en lugar de "Published"
3. **App no verificada**: La app necesita estar verificada por Google (solo para producción)

## ✅ Solución Paso a Paso

### Paso 1: Obtener el Redirect URI

El redirect URI que usa `expo-auth-session` con `useProxy: true` es:

```
https://auth.expo.io/@jerlibgnzlz/amva-movil
```

**O** si usas un scheme personalizado (`amva-app`):

```
amva-app://
```

**Para verificar el redirect URI exacto:**

1. Abre la app y haz clic en "Continuar con Google"
2. Revisa los logs en la consola - deberías ver:
   ```
   🔍 Redirect URI generado: https://auth.expo.io/@jerlibgnzlz/amva-movil
   ```

### Paso 2: Agregar Redirect URI en Google Cloud Console

1. Ve a: https://console.cloud.google.com/apis/credentials?project=amva-digital

2. Busca el cliente OAuth de tipo **"Web application"** con Client ID:
   ```
   378853205278-slllh10l32onum338rg1776g8itekvco.apps.googleusercontent.com
   ```

3. Haz clic en el nombre del cliente para editarlo

4. En la sección **"Authorized redirect URIs"**, haz clic en **"+ ADD URI"**

5. Agrega estos URIs (uno por uno):

   **Para desarrollo (con proxy de Expo):**
   ```
   https://auth.expo.io/@jerlibgnzlz/amva-movil
   ```

   **Para producción (con scheme personalizado):**
   ```
   amva-app://
   ```

   **También agrega estos URIs alternativos:**
   ```
   exp://localhost:8081
   exp://192.168.*.*:8081
   ```

6. Haz clic en **"SAVE"**

### Paso 3: Verificar OAuth Consent Screen

1. Ve a: https://console.cloud.google.com/apis/credentials/consent?project=amva-digital

2. Verifica que el **"Publishing status"** sea **"Published"** (no "Testing")

3. Si está en "Testing", haz clic en **"PUBLISH APP"**

4. **Importante**: Si la app está en modo "Testing", solo los usuarios agregados como "Test users" pueden hacer login

### Paso 4: Verificar Scopes

1. En la misma página de OAuth Consent Screen, verifica que estos scopes estén agregados:
   - `openid`
   - `profile`
   - `email`

2. Si faltan, agrégalos haciendo clic en **"ADD OR REMOVE SCOPES"**

### Paso 5: Esperar Propagación

Después de hacer cambios en Google Cloud Console:
- ⏱️ Espera **5-10 minutos** para que los cambios se propaguen
- 🔄 Reinicia la app completamente (ciérrala y ábrela de nuevo)
- 🧪 Prueba el login con Google nuevamente

## 🔍 Verificación

### Verificar Redirect URI en Logs

1. Abre la app
2. Abre las herramientas de desarrollo (React Native Debugger o Metro)
3. Haz clic en "Continuar con Google"
4. Busca en los logs:
   ```
   🔍 Redirect URI generado: https://auth.expo.io/@jerlibgnzlz/amva-movil
   ```
5. Verifica que este URI esté en Google Cloud Console

### Verificar en Google Cloud Console

1. Ve a: https://console.cloud.google.com/apis/credentials?project=amva-digital
2. Busca tu cliente OAuth Web
3. Verifica que el redirect URI esté en la lista
4. Si no está, agrégalo siguiendo el Paso 2

## 🚨 Errores Comunes

### Error: "redirect_uri_mismatch"

**Causa**: El redirect URI usado por la app no está en la lista de URIs autorizados.

**Solución**:
1. Obtén el redirect URI exacto de los logs
2. Agrégalo en Google Cloud Console (Paso 2)

### Error: "access_denied"

**Causa**: El OAuth Consent Screen no está publicado o la app no está verificada.

**Solución**:
1. Publica el OAuth Consent Screen (Paso 3)
2. Si es necesario, agrega usuarios como "Test users" si está en modo Testing

### Error: "invalid_client"

**Causa**: El Client ID no está configurado correctamente.

**Solución**:
1. Verifica que `googleClientId` en `app.json` sea correcto
2. Verifica que el Client ID exista en Google Cloud Console

## 📋 Checklist

- [ ] Redirect URI agregado en Google Cloud Console
- [ ] OAuth Consent Screen publicado
- [ ] Scopes (`openid`, `profile`, `email`) agregados
- [ ] Esperado 5-10 minutos para propagación
- [ ] App reiniciada completamente
- [ ] Login con Google probado nuevamente

## 🎯 Redirect URIs Recomendados

Agrega estos URIs en Google Cloud Console para máxima compatibilidad:

```
https://auth.expo.io/@jerlibgnzlz/amva-movil
amva-app://
exp://localhost:8081
exp://192.168.*.*:8081
```

## 📝 Notas Importantes

1. **Propagación**: Los cambios en Google Cloud Console pueden tardar 5-10 minutos en propagarse
2. **Testing vs Production**: Si el OAuth Consent Screen está en modo "Testing", solo usuarios de prueba pueden hacer login
3. **Verificación**: Para producción, Google puede requerir verificación de la app (puede tardar días)
4. **Scheme personalizado**: El scheme `amva-app` debe coincidir con el configurado en `app.json`

## 🔗 Referencias

- [Expo AuthSession Documentation](https://docs.expo.dev/guides/authentication/#google)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [OAuth Consent Screen Guide](https://support.google.com/cloud/answer/10311615)

## ✅ Después de Configurar

1. Reinicia la app completamente
2. Prueba el login con Google
3. Si sigue fallando, verifica los logs para ver el redirect URI exacto usado
4. Asegúrate de que ese URI esté en Google Cloud Console

¡Con estos pasos deberías poder resolver el error "Access blocked Authorization Error"! 🎉

