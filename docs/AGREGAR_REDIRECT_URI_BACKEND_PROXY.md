# 🔧 Agregar Redirect URI para Backend Proxy

## ❌ Error Actual

```
Error 400: redirect_uri_mismatch
```

Este error ocurre porque el redirect URI que usa el backend no está autorizado en Google Cloud Console.

## ✅ Solución

### Paso 1: Identificar el Redirect URI Correcto

El backend usa este redirect URI:
```
https://ministerio-backend-wdbj.onrender.com/api/auth/invitado/google/callback-proxy
```

### Paso 2: Agregar en Google Cloud Console

1. **Ve a Google Cloud Console:**
   ```
   https://console.cloud.google.com/apis/credentials?project=amva-auth
   ```

2. **Encuentra el Cliente OAuth:**
   - Busca el cliente con ID: `378853205278-slllh10l32onum338rg1776g8itekvco.apps.googleusercontent.com`
   - O busca "AMVA Web Client" o "Web client"

3. **Edita el Cliente:**
   - Haz clic en el nombre del cliente o en el ícono de editar (✏️)

4. **Agrega el Redirect URI:**
   - En la sección **"URIs de redireccionamiento autorizados"**
   - Haz clic en **"+ AGREGAR URI"**
   - Agrega exactamente:
     ```
     https://ministerio-backend-wdbj.onrender.com/api/auth/invitado/google/callback-proxy
     ```
   - ⚠️ **IMPORTANTE:** Debe ser exactamente igual, sin espacios, sin trailing slash

5. **Guarda:**
   - Haz clic en **"GUARDAR"** al final de la página

### Paso 3: Esperar Propagación

- Los cambios pueden tardar **5-15 minutos** en propagarse
- Espera antes de probar nuevamente

### Paso 4: Verificar

Después de esperar, prueba nuevamente el login con Google desde la app móvil.

---

## 🔍 Verificar Redirect URIs Actuales

Si quieres ver qué redirect URIs están configurados actualmente:

1. Ve a: https://console.cloud.google.com/apis/credentials?project=amva-auth
2. Busca el cliente OAuth
3. Revisa la sección "URIs de redireccionamiento autorizados"

---

## 📝 Notas Importantes

- ✅ El redirect URI debe ser **exactamente igual** al configurado
- ✅ Debe incluir `https://` (no `http://`)
- ✅ No debe tener trailing slash (`/`) al final
- ✅ No debe tener query parameters en el redirect URI base
- ✅ Google distingue entre mayúsculas y minúsculas en las URLs

---

## 🚨 Si Aún No Funciona

1. **Verifica que el redirect URI sea exacto:**
   - Copia y pega directamente desde la documentación
   - No agregues espacios ni caracteres adicionales

2. **Verifica que estés editando el cliente correcto:**
   - Debe ser el cliente **Web** (no Android)
   - El Client ID debe ser: `378853205278-slllh10l32onum338rg1776g8itekvco.apps.googleusercontent.com`

3. **Espera más tiempo:**
   - A veces puede tardar hasta 30 minutos en propagarse

4. **Verifica variables de entorno del backend:**
   - `BACKEND_URL` debe ser: `https://ministerio-backend-wdbj.onrender.com`
   - `GOOGLE_CLIENT_ID` debe estar configurado

