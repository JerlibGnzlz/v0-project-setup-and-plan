# 🔍 Verificar Redirect URI en Producción

## Problema

El error `redirect_uri_mismatch` indica que el redirect URI que usa el backend en producción no está autorizado en Google Cloud Console.

## ✅ Redirect URI Correcto para Producción

El backend en producción (Render) usa este redirect URI:

```
https://ministerio-backend-wdbj.onrender.com/api/auth/invitado/google/callback-proxy
```

## 📋 Pasos para Agregar en Google Cloud Console

### Paso 1: Abrir Google Cloud Console

Ve a:
```
https://console.cloud.google.com/apis/credentials?project=amva-auth
```

### Paso 2: Encontrar el Cliente OAuth Web

1. Busca el cliente con ID: `378853205278-slllh10l32onum338rg1776g8itekvco.apps.googleusercontent.com`
2. O busca "AMVA Web Client" o "Web client"
3. Haz clic en el nombre del cliente o en el ícono de editar (✏️)

### Paso 3: Agregar Redirect URI

1. En la sección **"URIs de redireccionamiento autorizados"**
2. Haz clic en **"+ AGREGAR URI"** o **"ADD URI"**
3. Agrega **EXACTAMENTE** este URI (copia y pega):
   ```
   https://ministerio-backend-wdbj.onrender.com/api/auth/invitado/google/callback-proxy
   ```
4. ⚠️ **IMPORTANTE:** 
   - Debe ser exactamente igual (sin espacios)
   - Debe usar `https://` (no `http://`)
   - No debe tener trailing slash (`/`) al final
   - No debe tener query parameters

### Paso 4: Guardar

1. Haz clic en **"GUARDAR"** o **"SAVE"** al final de la página
2. Espera 5-15 minutos para que los cambios se propaguen

## 🔍 Verificar que Está Agregado

Después de agregar, deberías ver en la lista de redirect URIs:

```
https://ministerio-backend-wdbj.onrender.com/api/auth/invitado/google/callback-proxy
```

## 🧪 Probar Después de Agregar

1. Espera 5-15 minutos después de guardar
2. Prueba nuevamente el login con Google desde la app móvil
3. El error `redirect_uri_mismatch` debería desaparecer

## 📝 Notas

- Si ya existe un redirect URI similar pero diferente, **agrega este nuevo** (puedes tener múltiples redirect URIs)
- El redirect URI debe coincidir **exactamente** con el que usa el backend
- Google distingue entre mayúsculas y minúsculas en las URLs

## 🚨 Si Aún No Funciona

1. Verifica que copiaste el URI exactamente (sin espacios adicionales)
2. Verifica que estás editando el cliente **Web** correcto
3. Verifica que el backend en producción está usando `BACKEND_URL=https://ministerio-backend-wdbj.onrender.com`
4. Espera más tiempo (hasta 30 minutos) para la propagación

