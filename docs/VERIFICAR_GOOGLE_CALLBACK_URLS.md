# Verificación de Callback URLs - Google OAuth

## 🔍 Script de Verificación Automática

Ejecuta el script para verificar tu configuración:

```bash
cd backend
./scripts/verificar-callback-urls.sh
```

Este script:

- ✅ Lee tu configuración actual de `.env`
- ✅ Calcula la URL de callback completa
- ✅ Muestra las URLs que debes configurar en Google Cloud Console
- ✅ Valida el formato de las URLs

## 📋 URLs Requeridas en Google Cloud Console

### Desarrollo (Local)

```
http://localhost:4000/api/auth/invitado/google/callback
```

### Producción

```
https://tu-dominio-backend.com/api/auth/invitado/google/callback
```

**Nota**: Reemplaza `tu-dominio-backend.com` con tu dominio real de producción.

## 🔧 Cómo Configurar en Google Cloud Console

### Paso 1: Acceder a Google Cloud Console

1. Ve a: https://console.cloud.google.com/
2. Selecciona tu proyecto

### Paso 2: Ir a Credentials

1. En el menú lateral, ve a: **APIs & Services** > **Credentials**
2. Busca tu **OAuth 2.0 Client ID** (tipo: Web application)
3. Haz clic en el ícono de **editar** (lápiz)

### Paso 3: Configurar Authorized Redirect URIs

1. En la sección **Authorized redirect URIs**, haz clic en **+ ADD URI**
2. Agrega las siguientes URLs (una por línea):

#### Para Desarrollo:

```
http://localhost:4000/api/auth/invitado/google/callback
```

#### Para Producción:

```
https://tu-dominio-backend.com/api/auth/invitado/google/callback
```

3. Haz clic en **Save**

## ⚠️ Reglas Importantes

### ✅ DO (Hacer)

- Las URLs deben coincidir **EXACTAMENTE** (incluyendo `http://` o `https://`)
- Debe incluir el puerto si es necesario (ej: `:4000`)
- El path debe ser exacto: `/api/auth/invitado/google/callback`
- En producción, **SIEMPRE** usa `https://`
- Puedes agregar múltiples URLs (una por línea)

### ❌ DON'T (No hacer)

- ❌ No agregues trailing slash (`/`) al final
- ❌ No uses `http://` en producción
- ❌ No cambies el path sin actualizar también el código
- ❌ No uses URLs con parámetros adicionales

## 🔍 Verificación Manual

### 1. Verificar Variables de Entorno

Revisa tu archivo `.env` en el backend:

```env
# URL base del backend
BACKEND_URL="https://tu-dominio-backend.com"
# O alternativamente:
API_URL="https://tu-dominio-backend.com"

# Path del callback (relativo)
GOOGLE_CALLBACK_URL="/api/auth/invitado/google/callback"
```

### 2. Calcular URL Completa

La URL completa se construye así:

```
{BACKEND_URL}{GOOGLE_CALLBACK_URL}
```

Ejemplo:

- `BACKEND_URL="https://api.midominio.com"`
- `GOOGLE_CALLBACK_URL="/api/auth/invitado/google/callback"`
- **URL Completa**: `https://api.midominio.com/api/auth/invitado/google/callback`

### 3. Verificar en el Código

La URL se construye en:

```typescript
// backend/src/modules/auth/strategies/google-oauth.strategy.ts
const backendUrl = process.env.BACKEND_URL || process.env.API_URL || 'http://localhost:4000'
const callbackPath = process.env.GOOGLE_CALLBACK_URL || '/api/auth/invitado/google/callback'
const callbackURL = callbackPath.startsWith('http') ? callbackPath : `${backendUrl}${callbackPath}`
```

## 🐛 Troubleshooting

### Error: "redirect_uri_mismatch"

**Causa**: La URL en Google Cloud Console no coincide con la que usa tu aplicación.

**Solución**:

1. Ejecuta el script de verificación: `./scripts/verificar-callback-urls.sh`
2. Copia la URL exacta que muestra
3. Verifica que esa URL esté en Google Cloud Console
4. Asegúrate de que no haya espacios o caracteres extra

### Error: "invalid_client"

**Causa**: El `GOOGLE_CLIENT_ID` o `GOOGLE_CLIENT_SECRET` son incorrectos.

**Solución**:

1. Verifica que las credenciales en `.env` coincidan con las de Google Cloud Console
2. Asegúrate de que no haya espacios o comillas extra

### Error: "access_denied"

**Causa**: El usuario canceló la autorización o no dio permisos.

**Solución**: Esto es normal si el usuario cancela. No es un error de configuración.

## 📝 Checklist de Verificación

Antes de ir a producción, verifica:

- [ ] `BACKEND_URL` está configurado con HTTPS
- [ ] `GOOGLE_CALLBACK_URL` está configurado correctamente
- [ ] La URL de producción está agregada en Google Cloud Console
- [ ] La URL de desarrollo está agregada en Google Cloud Console (si trabajas localmente)
- [ ] Las URLs coinciden exactamente (sin trailing slash)
- [ ] El script de verificación se ejecuta sin errores
- [ ] Has probado el flujo completo de autenticación

## 🔄 Actualizar URLs

Si necesitas cambiar las URLs:

1. **Actualiza `.env`**:

   ```env
   BACKEND_URL="https://nuevo-dominio.com"
   GOOGLE_CALLBACK_URL="/api/auth/invitado/google/callback"
   ```

2. **Ejecuta el script de verificación**:

   ```bash
   ./scripts/verificar-callback-urls.sh
   ```

3. **Actualiza Google Cloud Console**:
   - Agrega la nueva URL
   - Puedes mantener la antigua temporalmente para evitar interrupciones
   - Elimina la antigua después de verificar que todo funciona

4. **Reinicia el backend** para que cargue las nuevas variables

## 📚 Referencias

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Passport Google OAuth20](https://github.com/jaredhanson/passport-google-oauth2)
- [Documentación del Proyecto](./GOOGLE_OAUTH_PRODUCTION_READY.md)

---

**Última actualización**: $(date)
**Script de verificación**: `backend/scripts/verificar-callback-urls.sh`

