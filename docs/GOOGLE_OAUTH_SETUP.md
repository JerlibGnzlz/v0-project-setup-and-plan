# Configuración de Google OAuth

## 📋 Requisitos Previos

1. Cuenta de Google Cloud Platform
2. Proyecto creado en Google Cloud Console
3. Credenciales OAuth 2.0 configuradas

## 🔧 Configuración en Google Cloud Console

### 1. Crear Credenciales OAuth 2.0

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Selecciona tu proyecto o crea uno nuevo
3. Ve a **APIs & Services** > **Credentials**
4. Haz clic en **Create Credentials** > **OAuth client ID**
5. Si es la primera vez, configura la pantalla de consentimiento OAuth
6. Selecciona **Web application**
7. Configura:
   - **Name**: AMVA Digital - Invitados
   - **Authorized JavaScript origins**:
     - `http://localhost:4000` (desarrollo)
     - `https://tu-dominio.com` (producción)
   - **Authorized redirect URIs**:
     - `http://localhost:4000/api/auth/invitado/google/callback` (desarrollo)
     - `https://tu-dominio.com/api/auth/invitado/google/callback` (producción)

### 2. Obtener Credenciales

Después de crear, obtendrás:

- **Client ID**: `xxxxx.apps.googleusercontent.com`
- **Client Secret**: `xxxxx`

## 🔐 Variables de Entorno

Agrega estas variables en tu archivo `.env` del backend:

```env
# Google OAuth
GOOGLE_CLIENT_ID=tu-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=tu-client-secret
GOOGLE_CALLBACK_URL=/api/auth/invitado/google/callback

# Frontend URL (para redirección después de OAuth)
FRONTEND_URL=http://localhost:3000
```

En producción, actualiza `FRONTEND_URL` con tu dominio real.

## ✅ Verificación

1. Inicia el backend: `pnpm start:dev`
2. Ve a la página de inscripción: `http://localhost:3000/convencion/inscripcion`
3. Haz clic en "Continuar con Google"
4. Deberías ser redirigido a Google para autenticarte
5. Después de autenticarte, serás redirigido de vuelta con el token

## 🐛 Troubleshooting

### Error: "redirect_uri_mismatch"

- Verifica que la URL en `GOOGLE_CALLBACK_URL` coincida exactamente con la configurada en Google Cloud Console
- Asegúrate de incluir el protocolo (`http://` o `https://`)

### Error: "invalid_client"

- Verifica que `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET` sean correctos
- Asegúrate de que las credenciales sean para "Web application"

### No redirige correctamente

- Verifica que `FRONTEND_URL` esté configurado correctamente
- Asegúrate de que el frontend esté escuchando en el puerto correcto

## 📝 Notas

- El `googleId` se almacena en la tabla `invitado_auth`
- Si un usuario ya tiene cuenta con email y luego usa Google OAuth, se vinculará automáticamente
- El email se marca como verificado automáticamente cuando se usa Google OAuth


























