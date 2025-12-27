# 🎯 Pasos Exactos para Agregar Redirect URI en Google Cloud Console

## 📋 Información Necesaria

**Proyecto**: `amva-auth`  
**Client ID Web**: `378853205278-slllh10l32onum338rg1776g8itekvco.apps.googleusercontent.com`  
**Redirect URIs a agregar**:
- `https://auth.expo.io/@jerlibgnzlz/amva-movil`
- `amva-app://`
- `exp://localhost:8081`
- `exp://192.168.*.*:8081`

## 🚀 Pasos Exactos

### Paso 1: Abrir Google Cloud Console

**URL directa**: https://console.cloud.google.com/apis/credentials?project=amva-auth

1. Haz clic en el enlace arriba o cópialo en tu navegador
2. Asegúrate de estar logueado con la cuenta correcta de Google
3. Verifica que el proyecto seleccionado sea `amva-auth`

### Paso 2: Encontrar el Cliente OAuth Web

1. En la página de Credentials, busca en la lista de "OAuth 2.0 Client IDs"
2. Busca el cliente con:
   - **Type**: Web application
   - **Name**: Puede ser "Web client" o similar
   - **Client ID**: `378853205278-slllh10l32onum338rg1776g8itekvco`
3. Haz clic en el **nombre** del cliente (no en el Client ID)

### Paso 3: Agregar Redirect URIs

1. En la página de edición del cliente, desplázate hasta la sección **"Authorized redirect URIs"**
2. Verás una lista de URIs ya configurados (puede estar vacía)
3. Haz clic en el botón **"+ ADD URI"** (arriba de la lista)
4. Aparecerá un campo de texto vacío
5. Copia y pega cada uno de estos URIs (uno por uno):

   ```
   https://auth.expo.io/@jerlibgnzlz/amva-movil
   ```

   Luego haz clic en **"+ ADD URI"** nuevamente y agrega:

   ```
   amva-app://
   ```

   Luego haz clic en **"+ ADD URI"** nuevamente y agrega:

   ```
   exp://localhost:8081
   ```

   Luego haz clic en **"+ ADD URI"** nuevamente y agrega:

   ```
   exp://192.168.*.*:8081
   ```

### Paso 4: Guardar Cambios

1. Después de agregar todos los URIs, desplázate hasta el final de la página
2. Haz clic en el botón **"SAVE"** (azul, en la parte superior o inferior de la página)
3. Espera a que aparezca el mensaje de confirmación: "Client saved"

### Paso 5: Verificar OAuth Consent Screen

**URL directa**: https://console.cloud.google.com/apis/credentials/consent?project=amva-auth

1. Haz clic en el enlace arriba
2. Busca la sección **"Publishing status"**
3. Verifica que diga **"Published"** (no "Testing")
4. Si dice "Testing":
   - Haz clic en el botón **"PUBLISH APP"** (arriba a la derecha)
   - Confirma la acción
   - Espera a que cambie a "Published"

### Paso 6: Verificar Scopes

En la misma página de OAuth Consent Screen:

1. Busca la sección **"Scopes"**
2. Verifica que estos scopes estén agregados:
   - ✅ `openid`
   - ✅ `profile`
   - ✅ `email`
3. Si faltan:
   - Haz clic en **"ADD OR REMOVE SCOPES"**
   - Busca y marca los scopes faltantes
   - Haz clic en **"UPDATE"**

### Paso 7: Esperar Propagación

1. ⏱️ Espera **5-10 minutos** para que los cambios se propaguen
2. 🔄 Cierra completamente la app móvil (no solo minimizar)
3. 🧪 Abre la app nuevamente
4. 🎯 Prueba el login con Google

## ✅ Checklist

- [ ] Redirect URIs agregados en Google Cloud Console
- [ ] OAuth Consent Screen publicado (no en Testing)
- [ ] Scopes (`openid`, `profile`, `email`) agregados
- [ ] Esperado 5-10 minutos para propagación
- [ ] App cerrada completamente
- [ ] App abierta nuevamente
- [ ] Login con Google probado

## 🔍 Verificación Final

### Verificar Redirect URIs Agregados

1. Ve a: https://console.cloud.google.com/apis/credentials?project=amva-auth
2. Haz clic en tu cliente OAuth Web
3. Verifica que en "Authorized redirect URIs" aparezcan:
   - ✅ `https://auth.expo.io/@jerlibgnzlz/amva-movil`
   - ✅ `amva-app://`
   - ✅ `exp://localhost:8081`
   - ✅ `exp://192.168.*.*:8081`

### Verificar en Logs de la App

1. Abre la app
2. Abre las herramientas de desarrollo (Metro/React Native Debugger)
3. Haz clic en "Continuar con Google"
4. Busca en los logs:
   ```
   🔍 Redirect URI generado: https://auth.expo.io/@jerlibgnzlz/amva-movil
   ```
5. Verifica que este URI esté en la lista de Google Cloud Console

## 🚨 Si Sigue Fallando

1. **Verifica el redirect URI exacto** en los logs de la app
2. **Asegúrate de que ese URI exacto** esté en Google Cloud Console
3. **Espera más tiempo** (hasta 15 minutos) para propagación
4. **Verifica que el OAuth Consent Screen** esté publicado
5. **Revisa los scopes** agregados

## 📝 Notas Importantes

- Los cambios pueden tardar hasta **15 minutos** en propagarse completamente
- Si el OAuth Consent Screen está en modo "Testing", solo usuarios de prueba pueden hacer login
- El redirect URI debe coincidir **exactamente** con el usado por la app
- Los wildcards (`*`) funcionan para desarrollo local

## 🎉 Después de Configurar

Una vez que hayas seguido todos los pasos:

1. ✅ Los redirect URIs estarán configurados
2. ✅ El OAuth Consent Screen estará publicado
3. ✅ Los scopes estarán agregados
4. ✅ El login con Google debería funcionar

¡Sigue estos pasos exactos y el error "Access blocked Authorization Error" debería resolverse! 🚀

