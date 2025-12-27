# 🔧 Solución: Google OAuth Dejó de Funcionar

## 🔍 Diagnóstico Rápido

Ejecuta el script de diagnóstico:

```bash
cd backend
npx ts-node scripts/diagnostico-google-oauth.ts
```

## ❌ Problemas Comunes y Soluciones

### 1. **Callback URL No Coincide en Producción**

**Problema**: El callback URL configurado en Google Cloud Console no coincide con el del backend en producción.

**Solución**:

1. **Verifica el BACKEND_URL en producción**:
   - En Render.com, ve a tu servicio → Environment
   - Verifica que `BACKEND_URL` esté configurado con la URL completa de producción
   - Ejemplo: `https://ministerio-backend-wdbj.onrender.com`

2. **Verifica en Google Cloud Console**:
   - Ve a [Google Cloud Console](https://console.cloud.google.com/)
   - Credentials → OAuth 2.0 Client ID (Web)
   - En "Authorized redirect URIs", debe estar:
     ```
     https://ministerio-backend-wdbj.onrender.com/api/auth/invitado/google/callback
     ```
   - En "Authorized JavaScript origins", debe estar:
     ```
     https://ministerio-backend-wdbj.onrender.com
     ```

3. **Si falta, agrega la URL de producción**:
   - Copia exactamente la URL del backend en producción
   - Agrega `/api/auth/invitado/google/callback` al final
   - Guarda los cambios

### 2. **OAuth Consent Screen No Está Publicado**

**Problema**: El OAuth consent screen está en modo "Testing" y solo permite usuarios específicos.

**Solución**:

1. Ve a Google Cloud Console → OAuth consent screen
2. Verifica el estado:
   - ✅ **Publicado**: Funciona para todos los usuarios
   - ⚠️ **Testing**: Solo funciona para usuarios de prueba
3. Si está en "Testing":
   - Haz clic en "PUBLISH APP"
   - Confirma la publicación
   - Espera 5-10 minutos para que los cambios se propaguen

### 3. **Credenciales Expiradas o Revocadas**

**Problema**: Las credenciales de Google OAuth fueron revocadas o expiraron.

**Solución**:

1. Ve a Google Cloud Console → Credentials
2. Verifica el estado de tu OAuth 2.0 Client ID:
   - ✅ **Activo**: Debe estar activo
   - ❌ **Revocado**: Necesitas crear nuevas credenciales
3. Si está revocado:
   - Crea nuevas credenciales OAuth 2.0
   - Actualiza `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET` en Render.com
   - Reinicia el servicio

### 4. **SHA-1 No Configurado (Solo para App Móvil)**

**Problema**: El SHA-1 del keystore de Android no está configurado en Google Cloud Console.

**Solución**:

1. **Obtén el SHA-1 del keystore de producción**:
   ```bash
   cd amva-mobile
   keytool -list -v -keystore android/app/upload-keystore.jks -alias upload
   ```

2. **Agrega el SHA-1 en Google Cloud Console**:
   - Ve a Credentials → OAuth 2.0 Client ID (Android)
   - En "SHA-1 certificate fingerprints", agrega el SHA-1 obtenido
   - Guarda los cambios
   - Espera 30 minutos para que se propague

### 5. **Variables de Entorno Incorrectas en Producción**

**Problema**: Las variables de entorno en Render.com no están configuradas correctamente.

**Solución**:

1. Ve a Render.com → Tu servicio → Environment
2. Verifica que estas variables estén configuradas:
   ```
   GOOGLE_CLIENT_ID=tu-client-id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=tu-client-secret
   BACKEND_URL=https://ministerio-backend-wdbj.onrender.com
   GOOGLE_CALLBACK_URL=/api/auth/invitado/google/callback
   ```
3. Si faltan o están incorrectas:
   - Actualiza las variables
   - Reinicia el servicio

### 6. **CORS o Headers Bloqueados**

**Problema**: Los headers de seguridad pueden estar bloqueando las peticiones de Google.

**Solución**:

1. Verifica la configuración de CORS en `backend/src/main.ts`
2. Verifica que `helmet` no esté bloqueando los headers necesarios
3. Si es necesario, ajusta la configuración de seguridad

## 🧪 Verificación Paso a Paso

### Paso 1: Verificar Configuración Local

```bash
cd backend
npx ts-node scripts/diagnostico-google-oauth.ts
```

### Paso 2: Verificar Endpoint de Google OAuth

Abre en el navegador:
```
https://ministerio-backend-wdbj.onrender.com/api/auth/invitado/google
```

**Resultado esperado**:
- ✅ Debe redirigir a Google OAuth
- ❌ Si da error 404 o 500, hay un problema con el endpoint

### Paso 3: Verificar Callback URL

1. Intenta iniciar sesión con Google desde la web
2. Después de autenticarte con Google, debería redirigir a:
   ```
   https://ministerio-backend-wdbj.onrender.com/api/auth/invitado/google/callback
   ```
3. Si Google muestra un error de "redirect_uri_mismatch", el callback URL no está autorizado

### Paso 4: Verificar Logs del Backend

En Render.com → Logs, busca:
- ✅ `✅ Google OAuth Strategy inicializada`
- ✅ `✅ Google OAuth configurado correctamente`
- ❌ `⚠️ Google OAuth no está configurado`
- ❌ `❌ Error en callback de Google OAuth`

## 📋 Checklist de Verificación

- [ ] `GOOGLE_CLIENT_ID` configurado en Render.com
- [ ] `GOOGLE_CLIENT_SECRET` configurado en Render.com
- [ ] `BACKEND_URL` configurado con URL de producción (HTTPS)
- [ ] Callback URL autorizado en Google Cloud Console
- [ ] JavaScript origins autorizado en Google Cloud Console
- [ ] OAuth consent screen publicado (no en modo Testing)
- [ ] Credenciales OAuth activas (no revocadas)
- [ ] Para móvil: SHA-1 configurado en Google Cloud Console
- [ ] Backend reiniciado después de cambios

## 🔗 Enlaces Útiles

- [Google Cloud Console - Credentials](https://console.cloud.google.com/apis/credentials)
- [Google Cloud Console - OAuth Consent Screen](https://console.cloud.google.com/apis/credentials/consent)
- [Render.com Dashboard](https://dashboard.render.com/)

## 📞 Si Nada Funciona

1. **Revisa los logs del backend** en Render.com para ver errores específicos
2. **Verifica el estado del servicio** en Render.com
3. **Prueba el endpoint directamente** desde el navegador
4. **Verifica que las credenciales sean válidas** en Google Cloud Console

## 🎯 Solución Rápida Más Común

En el 90% de los casos, el problema es que el **callback URL no está autorizado** en Google Cloud Console:

1. Ve a Google Cloud Console → Credentials → OAuth 2.0 Client ID (Web)
2. En "Authorized redirect URIs", agrega:
   ```
   https://ministerio-backend-wdbj.onrender.com/api/auth/invitado/google/callback
   ```
3. Guarda los cambios
4. Espera 5-10 minutos
5. Prueba de nuevo

