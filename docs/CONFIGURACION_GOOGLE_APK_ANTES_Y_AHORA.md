# Configuración Google OAuth para APK: Antes (Render) vs Ahora (amva.org.es)

## Cómo funcionaba ANTES (ministerio-backend-wdbj.onrender.com)

### 1. Backend (Render.com)
```env
BACKEND_URL=https://ministerio-backend-wdbj.onrender.com
FRONTEND_URL=https://v0-ministerio-amva.vercel.app
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```
- El backend construía el `redirect_uri` para Google: `https://ministerio-backend-wdbj.onrender.com/api/auth/invitado/google/callback-proxy`

### 2. App móvil (React Native / Expo)
- **eas.json** (build production): `EXPO_PUBLIC_API_URL=https://ministerio-backend-wdbj.onrender.com/api`
- **app.json** extra: `apiUrl` (opcional)
- **client.ts** fallback: `https://ministerio-backend-wdbj.onrender.com/api`
- La app llamaba a `https://ministerio-backend-wdbj.onrender.com/api/auth/invitado/google/authorize`

### 3. Google Cloud Console
- Redirect URIs: `https://ministerio-backend-wdbj.onrender.com/api/auth/invitado/google/callback-proxy`

---

## Cómo debe estar AHORA (amva.org.es)

### 1. Backend (DigitalOcean - servidor)
Archivo: `/var/www/amva-production/backend/.env`

```env
BACKEND_URL=https://amva.org.es
FRONTEND_URL=https://amva.org.es
GOOGLE_CLIENT_ID=378853205278-slllh10l32onum338rg1776g8itekvco.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-...
GOOGLE_CALLBACK_URL=/api/auth/invitado/google/callback
```

**Crítico:** `BACKEND_URL` sin `/api` al final. El backend añade `/api/...` automáticamente.

### 2. App móvil (React Native / Expo)
- **eas.json** production env: `EXPO_PUBLIC_API_URL=https://amva.org.es/api` ✅ (ya está)
- **app.json** extra.apiUrl: `https://amva.org.es/api` ✅ (ya está)
- **EAS Secret** (para builds): `eas secret:create --name EXPO_PUBLIC_API_URL --value https://amva.org.es/api` ✅

### 3. Google Cloud Console
En [Credentials](https://console.cloud.google.com/apis/credentials) → OAuth 2.0 Client ID:

**Authorized redirect URIs** (agregar si no están):
```
https://amva.org.es/api/auth/invitado/google/callback-proxy
https://www.amva.org.es/api/auth/invitado/google/callback-proxy
```

**Authorized JavaScript origins:**
```
https://amva.org.es
https://www.amva.org.es
```

---

## Resumen: ¿Dónde se configura cada cosa?

| Componente | Dónde | Variable |
|------------|-------|----------|
| **Backend** | `.env` del servidor | `BACKEND_URL`, `FRONTEND_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` |
| **App móvil** | eas.json, app.json, EAS Secrets | `EXPO_PUBLIC_API_URL` o `apiUrl` |
| **Google** | Google Cloud Console | Redirect URIs, JavaScript origins |

---

## Verificación rápida

1. **Backend responde:**
   ```bash
   curl -s -o /dev/null -w "%{http_code}" https://amva.org.es/api/auth/invitado/google/authorize
   ```
   Debe devolver `302` (redirección a Google).

2. **Privacy Policy (requerido por Google):**
   ```bash
   curl -s -o /dev/null -w "%{http_code}" https://amva.org.es/privacy-policy
   ```
   Debe devolver `200`.

3. **Redirect URI en Google:** Debe existir exactamente:
   `https://amva.org.es/api/auth/invitado/google/callback-proxy`
