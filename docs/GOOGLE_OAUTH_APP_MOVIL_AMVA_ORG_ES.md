# 🔧 Configurar Google OAuth para App Móvil con amva.org.es

## Error: `redirect_uri_mismatch`

Si al iniciar sesión con Google en la app móvil aparece:
```
Access blocked: This app's request is invalid
Error 400: redirect_uri_mismatch
```

Significa que el **redirect URI** que envía el backend no está autorizado en Google Cloud Console.

---

## ✅ Solución en 3 pasos

### Paso 1: Agregar redirect URIs en Google Cloud Console

1. Ve a **https://console.cloud.google.com/apis/credentials**
2. Haz clic en tu **OAuth 2.0 Client ID** (tipo "Web application")
3. En **Authorized redirect URIs**, agrega **exactamente** estas URLs:

   ```
   https://amva.org.es/api/auth/invitado/google/callback
   https://amva.org.es/api/auth/invitado/google/callback-proxy
   https://www.amva.org.es/api/auth/invitado/google/callback
   https://www.amva.org.es/api/auth/invitado/google/callback-proxy
   ```

4. En **Authorized JavaScript origins**, asegúrate de tener:
   ```
   https://amva.org.es
   https://www.amva.org.es
   ```

5. Haz clic en **SAVE**

**Importante:** La app móvil usa `callback-proxy`, no `callback`. Sin `callback-proxy` el login con Google en móvil fallará.

---

### Paso 2: Verificar BACKEND_URL en el servidor

El backend construye el redirect URI con `BACKEND_URL`. Debe ser correcto:

```bash
# Conéctate al servidor (DigitalOcean)
ssh tu_usuario@tu_ip

# Edita el .env del backend
nano /var/www/amva-production/backend/.env
```

Verifica que tenga:
```env
BACKEND_URL=https://amva.org.es
```

**Sin** `/api` al final. Guarda y reinicia:
```bash
pm2 restart amva-backend
```

---

### Paso 3: Verificar configuración de la app móvil

La app móvil ya está configurada con:
- **API URL:** `https://amva.org.es/api` (en eas.json, client.ts, app.json)
- **Deep links:** `amva.org.es` y `www.amva.org.es` (intent filters)

Si hiciste cambios, reconstruye la app:
```bash
cd amva-mobile
npx expo prebuild --clean
eas build --profile production --platform android
```

---

## 📋 Checklist

- [ ] Redirect URI `https://amva.org.es/api/auth/invitado/google/callback-proxy` en Google Cloud
- [ ] Redirect URI `https://www.amva.org.es/api/auth/invitado/google/callback-proxy` en Google Cloud
- [ ] `BACKEND_URL=https://amva.org.es` en el servidor (sin /api)
- [ ] `pm2 restart amva-backend` ejecutado
- [ ] Esperar 5–10 minutos tras guardar en Google Cloud
- [ ] Cerrar completamente la app móvil y volver a abrirla

---

## 🔍 Verificación rápida

El redirect URI que envía el backend al iniciar sesión con Google desde la app móvil es:
```
https://amva.org.es/api/auth/invitado/google/callback-proxy
```

Debe coincidir **carácter por carácter** con lo configurado en Google Cloud Console.
