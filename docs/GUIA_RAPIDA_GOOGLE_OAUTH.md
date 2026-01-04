# 🚀 Guía Rápida: Configurar Google OAuth

## Opción 1: Script Automático (Recomendado)

```bash
cd backend
./scripts/configurar-google-oauth.sh
```

El script te guiará paso a paso para obtener las credenciales y configurarlas automáticamente.

## Opción 2: Configuración Manual

### Paso 1: Obtener Credenciales en Google Cloud Console

1. **Ve a Google Cloud Console**
   - URL: https://console.cloud.google.com/
   - Inicia sesión con tu cuenta de Google

2. **Crea o selecciona un proyecto**
   - Si no tienes proyecto, haz clic en "Create Project"
   - Nombre sugerido: "AMVA Digital"

3. **Habilita la API de Google+**
   - Ve a: **APIs & Services** > **Library**
   - Busca "Google+ API"
   - Haz clic en "Enable"

4. **Configura la pantalla de consentimiento OAuth**
   - Ve a: **APIs & Services** > **OAuth consent screen**
   - Selecciona **External** (si es para usuarios externos)
   - Completa:
     - **App name**: AMVA Digital
     - **User support email**: tu-email@gmail.com
     - **Developer contact**: tu-email@gmail.com
   - Haz clic en **Save and Continue**
   - En "Scopes", haz clic en **Save and Continue**
   - En "Test users", agrega tu email y haz clic en **Save and Continue**

5. **Crea credenciales OAuth 2.0**
   - Ve a: **APIs & Services** > **Credentials**
   - Haz clic en **Create Credentials** > **OAuth client ID**
   - Selecciona **Web application**
   - Configura:
     - **Name**: AMVA Digital - Invitados
     - **Authorized JavaScript origins**:
       ```
       http://localhost:4000
       ```
     - **Authorized redirect URIs**:
       ```
       http://localhost:4000/api/auth/invitado/google/callback
       ```
   - Haz clic en **Create**

6. **Copia las credenciales**
   - Se mostrará un modal con:
     - **Your Client ID**: `xxxxx.apps.googleusercontent.com`
     - **Your Client Secret**: `xxxxx`
   - **Guarda estas credenciales** (no las compartas)

### Paso 2: Configurar Variables de Entorno

Edita el archivo `backend/.env` y agrega:

```env
# Google OAuth
GOOGLE_CLIENT_ID="tu-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="tu-client-secret"
GOOGLE_CALLBACK_URL="/api/auth/invitado/google/callback"

# Frontend URL (ya debería estar configurado)
FRONTEND_URL="http://localhost:3000"
```

### Paso 3: Verificar Configuración

1. **Reinicia el servidor backend**

   ```bash
   cd backend
   pnpm start:dev
   ```

2. **Prueba la autenticación**
   - Ve a: http://localhost:3000/convencion/inscripcion
   - Haz clic en "Continuar con Google"
   - Deberías ser redirigido a Google para autenticarte
   - Después de autenticarte, serás redirigido de vuelta

## 🔧 Configuración para Producción

Cuando despliegues a producción, agrega también en Google Cloud Console:

**Authorized JavaScript origins:**

```
https://tu-dominio.com
```

**Authorized redirect URIs:**

```
https://tu-dominio.com/api/auth/invitado/google/callback
```

Y actualiza `FRONTEND_URL` en producción:

```env
FRONTEND_URL="https://tu-dominio.com"
```

## 🐛 Solución de Problemas

### Error: "redirect_uri_mismatch"

- Verifica que la URL en `GOOGLE_CALLBACK_URL` coincida exactamente con la configurada en Google Cloud Console
- Asegúrate de incluir el protocolo completo (`http://` o `https://`)

### Error: "invalid_client"

- Verifica que `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET` sean correctos
- Asegúrate de que las credenciales sean para "Web application"

### No redirige correctamente

- Verifica que `FRONTEND_URL` esté configurado correctamente
- Asegúrate de que el frontend esté escuchando en el puerto correcto

## 📝 Notas Importantes

- ⚠️ **Nunca compartas** tu `GOOGLE_CLIENT_SECRET` públicamente
- ✅ El `googleId` se almacena en la base de datos para vincular cuentas
- ✅ Si un usuario ya tiene cuenta con email y luego usa Google OAuth, se vinculará automáticamente
- ✅ El email se marca como verificado automáticamente cuando se usa Google OAuth

## 📚 Documentación Adicional

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Passport Google Strategy](http://www.passportjs.org/packages/passport-google-oauth20/)






























