# 🔧 Corregir: "OAuth client was not found" / "invalid_client"

## 🎯 Problema

Al hacer clic en **"Continuar con Google"** en la landing (inscripción a convención) aparece:
```
Access blocked: Authorization Error
The OAuth client was not found.
Error 401: invalid_client
```

**Causas posibles:**
- El Client ID `378853205278-slllh10l32onum338rg1776g8itekvco` ya NO existe en Google (fue eliminado)
- Las credenciales en el `.env` del servidor son incorrectas o de otro proyecto
- Los redirect URIs en Google Cloud no coinciden exactamente con los que usa el backend

**⚠️ IMPORTANTE:** El archivo `.env` del servidor (`/var/www/amva-production/backend/.env`) debe tener el Client ID del cliente OAuth que configuraste en Google Cloud. Si usas el antiguo `378853205278-...`, Google devolverá "invalid_client".

## ✅ Solución: Usar el Client ID correcto en el servidor

### Opción A: Ya tienes el cliente configurado en Google Cloud (con amva.org.es)

1. Ve a **https://console.cloud.google.com/apis/credentials**
2. Haz clic en el nombre del cliente OAuth (tipo "Web application") que tiene los redirect URIs de amva.org.es
3. Copia el **Client ID** que aparece (ej: `123456789-xxxx.apps.googleusercontent.com`)
4. Para el **Client secret**: si no lo tienes, crea un NUEVO cliente OAuth (los pasos están abajo)
5. Conéctate al servidor por SSH y edita:
   ```bash
   nano /var/www/amva-production/backend/.env
   ```
6. Reemplaza `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET` con los valores del cliente que configuraste
7. Asegúrate de tener: `BACKEND_URL=https://amva.org.es` y `FRONTEND_URL=https://amva.org.es`
8. Guarda y ejecuta: `pm2 restart amva-backend`

### Opción B: Crear un NUEVO OAuth Client

### Paso 1: Ir a Google Cloud Console

1. Ve a **https://console.cloud.google.com/apis/credentials**
2. Inicia sesión con **jerlibgnzlz@gmail.com**
3. Selecciona el proyecto correcto (el mismo donde está la OAuth consent screen)

### Paso 2: Crear OAuth 2.0 Client ID (Web application)

1. Haz clic en **"+ CREATE CREDENTIALS"** → **"OAuth client ID"**
2. Si te pide configurar la pantalla de consentimiento:
   - **User Type:** External (para que cualquier usuario pueda hacer login)
   - **App name:** AMVA Digital
   - **User support email:** jerlibgnzlz@gmail.com
   - **Developer contact:** jerlibgnzlz@gmail.com
   - **Scopes:** agregar `email`, `profile`, `openid`
   - Guardar y continuar

3. En el formulario de creación:
   - **Application type:** Web application
   - **Name:** AMVA Web (o el que prefieras)

4. **Authorized JavaScript origins** - Agregar:
   ```
   https://amva.org.es
   https://www.amva.org.es
   http://localhost:3000
   ```

5. **Authorized redirect URIs** - Agregar:
   ```
   https://amva.org.es/api/auth/invitado/google/callback
   https://www.amva.org.es/api/auth/invitado/google/callback
   http://localhost:4000/api/auth/invitado/google/callback
   ```

6. Haz clic en **"CREATE"**

### Paso 3: Copiar credenciales

1. Se mostrará un modal con:
   - **Client ID:** `xxxxxxxxxx-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com`
   - **Client secret:** `GOCSPX-xxxxxxxxxxxxxxxxxxxxxxxx`

2. **Copia ambos** inmediatamente (el secret solo se muestra una vez)

### Paso 4: Actualizar en el servidor

```bash
nano /var/www/amva-production/backend/.env
```

Reemplaza las líneas de Google OAuth:

```env
GOOGLE_CLIENT_ID=tu_nuevo_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-tu_nuevo_client_secret
GOOGLE_CALLBACK_URL=/api/auth/invitado/google/callback
BACKEND_URL=https://amva.org.es
```

Guarda y reinicia:

```bash
pm2 restart amva-backend
```

### Paso 5: Probar

1. Ve a **https://amva.org.es**
2. Entra a la sección de convención / inscripción
3. Haz clic en **"Continuar con Google"**
4. Debería funcionar correctamente

---

## 📋 Checklist

- [ ] OAuth Client creado en Google Cloud Console (tipo Web application)
- [ ] Authorized JavaScript origins: amva.org.es, www.amva.org.es
- [ ] Authorized redirect URIs: .../api/auth/invitado/google/callback
- [ ] GOOGLE_CLIENT_ID y GOOGLE_CLIENT_SECRET actualizados en el servidor
- [ ] BACKEND_URL=https://amva.org.es en el servidor
- [ ] pm2 restart amva-backend
- [ ] OAuth Consent Screen publicado (o en Testing con tu email como test user)

---

## ⚠️ OAuth Consent Screen en "Testing"

Si está en modo Testing, solo los usuarios agregados como "Test users" pueden hacer login:

1. Ve a **OAuth consent screen**
2. En **Test users** → **+ ADD USERS**
3. Agrega los emails que necesitan probar (ej: jerlibgnzlz@gmail.com)

O publica la app: **PUBLISH APP** para que cualquier usuario pueda hacer login.

---

## 🔍 Verificación rápida

**URL que usa el backend para el callback** (debe coincidir EXACTAMENTE en Google Cloud):
```
{BACKEND_URL}/api/auth/invitado/google/callback
```

Ejemplo con `BACKEND_URL=https://amva.org.es`:
```
https://amva.org.es/api/auth/invitado/google/callback
```

**Variables que debe tener el servidor** (`/var/www/amva-production/backend/.env`):
```env
BACKEND_URL=https://amva.org.es
FRONTEND_URL=https://amva.org.es
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxx
GOOGLE_CALLBACK_URL=/api/auth/invitado/google/callback
```

**Importante:** `BACKEND_URL` NO debe incluir `/api` al final.

---

## ⚠️ Si sigue sin funcionar

1. **Espera 5-10 minutos** tras guardar en Google Cloud (propagación)
2. **Reinicia el backend:** `pm2 restart amva-backend`
3. **Revisa los logs:** `pm2 logs amva-backend` al hacer clic en "Continuar con Google"
4. **Verifica el proyecto** en Google Cloud: el Client ID debe ser del mismo proyecto que tiene la OAuth consent screen configurada
