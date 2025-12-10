# 🔐 Configurar Google OAuth para Producción

## ⚠️ Problema Común

Google OAuth no funciona en producción si solo tienes configurado `localhost` en los URIs de redireccionamiento autorizados.

## ✅ Solución: Agregar URL de Producción

### Paso 1: Identificar la URL de Producción

Tu backend está en Render:
```
https://ministerio-backend-wdbj.onrender.com
```

El callback de Google OAuth es:
```
https://ministerio-backend-wdbj.onrender.com/api/auth/invitado/google/callback
```

### Paso 2: Agregar URI en Google Cloud Console

1. Ve a: https://console.cloud.google.com/apis/credentials
2. Selecciona tu proyecto
3. Busca tu **OAuth 2.0 Client ID** (el que usas para la web)
4. Haz clic en el nombre del cliente para editarlo
5. En **"URIs de redireccionamiento autorizados"**, agrega:

```
https://ministerio-backend-wdbj.onrender.com/api/auth/invitado/google/callback
```

### Paso 3: Configurar Variables de Entorno en Render

1. Ve a: https://dashboard.render.com
2. Selecciona: `ministerio-backend`
3. Ve a: **Environment** (Variables de entorno)
4. Agrega o verifica:

```env
GOOGLE_CLIENT_ID=tu-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=tu-client-secret
BACKEND_URL=https://ministerio-backend-wdbj.onrender.com
GOOGLE_CALLBACK_URL=/api/auth/invitado/google/callback
```

**Opcional**: Si quieres especificar el callback completo:
```env
GOOGLE_CALLBACK_URL=https://ministerio-backend-wdbj.onrender.com/api/auth/invitado/google/callback
```

### Paso 4: Reiniciar el Servicio

1. En Render Dashboard → Tu servicio
2. **Manual Deploy** → **Deploy latest commit**
3. O espera a que Render detecte los cambios

## 📋 URIs que Debes Tener Configurados

En Google Cloud Console, deberías tener:

### Para Desarrollo (Local):
```
http://localhost:4000/api/auth/invitado/google/callback
```

### Para Producción (Render):
```
https://ministerio-backend-wdbj.onrender.com/api/auth/invitado/google/callback
```

## 🔍 Verificar la Configuración

### 1. Verificar en los Logs de Render

Busca estos mensajes al iniciar:
```
✅ Google OAuth Strategy inicializada
Callback URL: https://ministerio-backend-wdbj.onrender.com/api/auth/invitado/google/callback
```

### 2. Probar el Endpoint

```bash
# Debería redirigir a Google OAuth
curl -I https://ministerio-backend-wdbj.onrender.com/api/auth/invitado/google
```

Debería responder con un `302 Redirect` a Google.

## 🐛 Errores Comunes

### Error: "redirect_uri_mismatch"

**Causa**: La URL del callback no está en los URIs autorizados

**Solución**:
1. Verifica que la URL exacta esté en Google Cloud Console
2. Asegúrate de que no haya espacios o caracteres extra
3. Verifica que uses `https://` (no `http://`) en producción

### Error: "invalid_client"

**Causa**: `GOOGLE_CLIENT_ID` o `GOOGLE_CLIENT_SECRET` incorrectos

**Solución**:
1. Verifica que las credenciales estén correctas en Render
2. Asegúrate de usar las credenciales del cliente OAuth 2.0 correcto
3. Verifica que no haya espacios en las variables de entorno

## 📝 Checklist

- [ ] URI de producción agregada en Google Cloud Console
- [ ] `GOOGLE_CLIENT_ID` configurado en Render
- [ ] `GOOGLE_CLIENT_SECRET` configurado en Render
- [ ] `BACKEND_URL` configurado en Render
- [ ] Servicio reiniciado en Render
- [ ] Logs verificados (callback URL correcta)
- [ ] Prueba de autenticación exitosa

## 🔗 Enlaces Útiles

- **Google Cloud Console**: https://console.cloud.google.com/apis/credentials
- **OAuth 2.0 Playground**: https://developers.google.com/oauthplayground/
- **Documentación OAuth**: https://developers.google.com/identity/protocols/oauth2

## 💡 Nota Importante

- Puedes tener **múltiples URIs** configurados (localhost para desarrollo y producción)
- Google permite hasta **100 URIs** por cliente OAuth
- Cada URI debe ser exacta (incluye `https://`, sin espacios, etc.)

