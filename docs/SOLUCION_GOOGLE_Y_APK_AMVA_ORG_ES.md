# Solución: Botón Google y descarga APK en amva.org.es

## Problemas

1. **Botón "Continuar con Google"** no deja iniciar sesión
2. **Descarga del APK** no funciona correctamente

---

## 1. Configuración del servidor (DigitalOcean)

El backend debe tener estas variables en `/var/www/amva-production/backend/.env`:

```env
BACKEND_URL=https://amva.org.es
FRONTEND_URL=https://amva.org.es
```

**Importante:** Sin `/api` al final de `BACKEND_URL`.

Después de editar:
```bash
pm2 restart amva-backend
```

---

## 2. Variables del frontend en el build

Al desplegar el frontend (Next.js), asegúrate de que el build tenga:

```env
NEXT_PUBLIC_API_URL=https://amva.org.es/api
NEXT_PUBLIC_SITE_URL=https://amva.org.es
NEXT_PUBLIC_APK_DOWNLOAD_URL=https://expo.dev/artifacts/eas/pPV1ZAU6ye7cwd3ry5qiZb.apk
```

- En **Vercel**: Project Settings → Environment Variables
- En **servidor propio**: Variables de entorno antes de `npm run build`

---

## 3. Google Cloud Console - Redirect URIs

En [Google Cloud Console](https://console.cloud.google.com/apis/credentials) → OAuth 2.0 Client ID:

**Authorized redirect URIs** (todos necesarios):
```
https://amva.org.es/api/auth/invitado/google/callback
https://amva.org.es/api/auth/invitado/google/callback-proxy
https://www.amva.org.es/api/auth/invitado/google/callback
https://www.amva.org.es/api/auth/invitado/google/callback-proxy
```

**Authorized JavaScript origins:**
```
https://amva.org.es
https://www.amva.org.es
```

---

## 4. Descarga del APK en móviles

- El atributo `download` en enlaces externos no funciona bien en muchos navegadores móviles
- Se ha quitado para que el enlace abra la URL directamente
- El usuario puede descargar desde la página de Expo o usar "Guardar enlace" si el navegador lo ofrece

---

## 5. Verificación rápida

1. **API accesible:** `curl https://amva.org.es/api/noticias/publicadas`
2. **Google OAuth:** Abrir `https://amva.org.es/api/auth/invitado/google` en el navegador → debe redirigir a Google
3. **APK:** Abrir `https://expo.dev/artifacts/eas/pPV1ZAU6ye7cwd3ry5qiZb.apk` → debe iniciar descarga
