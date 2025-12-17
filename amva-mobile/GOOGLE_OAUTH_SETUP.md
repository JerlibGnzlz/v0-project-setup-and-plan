# Configuración de Google OAuth para AMVA Mobile

## ✅ Respuesta Rápida: ¿Puedo usar el mismo Client ID de web?

**SÍ**, puedes usar exactamente el mismo Client ID de Google OAuth que funciona en la web para React Native/Expo. Expo maneja automáticamente los redirect URIs, así que no necesitas crear un Client ID separado para móvil.

## Problema: "Access blocked: Authorization Error"

Este error ocurre porque la aplicación está en **modo de prueba** y el usuario no está autorizado. Esto es normal durante el desarrollo.

## Solución Rápida: Agregar Usuarios de Prueba (Desarrollo)

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Selecciona tu proyecto
3. Ve a **APIs & Services** → **OAuth consent screen**
4. En la sección **"Test users"**, haz clic en **"+ ADD USERS"**
5. Agrega los emails que necesiten probar (ej: `jerlibgnzlz@gmail.com`)
6. Guarda los cambios
7. Intenta iniciar sesión nuevamente en la app móvil

**Nota**: Solo los usuarios agregados como "Test users" podrán iniciar sesión mientras la app esté en modo de prueba.

## Solución Permanente: Verificar la Aplicación (Producción)

Cuando la app esté lista para producción:

1. Ve a **OAuth consent screen** en Google Cloud Console
2. Completa todos los campos requeridos:
   - **App name**: AMVA Go (o el nombre que prefieras)
   - **User support email**: Tu email de soporte
   - **Developer contact information**: Tu email
   - **Privacy Policy URL**: URL de tu política de privacidad
   - **Terms of Service URL**: URL de tus términos de servicio (opcional pero recomendado)
3. Agrega los **scopes** necesarios (email, profile)
4. Haz clic en **"PUBLISH APP"** para moverla de modo de prueba a producción
5. **Nota**: El proceso de verificación puede tardar varios días si Google lo requiere

Una vez verificada, **todos los usuarios** podrán iniciar sesión sin necesidad de agregarlos manualmente.

## Configuración Actual

- **Client ID**: `378853205278-slllh10l32onum338rg1776g8itekvco.apps.googleusercontent.com`
- **Configurado en**: `app.json` → `extra.googleClientId`
- **Mismo Client ID usado en**: Backend (`GOOGLE_CLIENT_ID`) y Web

## Ventajas de Usar el Mismo Client ID

✅ **Simplicidad**: Una sola configuración para web y móvil  
✅ **Mantenimiento**: Solo necesitas actualizar en un lugar  
✅ **Expo maneja redirects**: No necesitas configurar redirect URIs manualmente  
✅ **Funciona igual**: El mismo flujo de autenticación en todas las plataformas

## Verificación de Configuración

Para verificar que todo está correcto:

1. ✅ Client ID configurado en `app.json`
2. ✅ Client ID configurado en backend `.env` como `GOOGLE_CLIENT_ID`
3. ✅ Usuarios agregados como "Test users" (desarrollo) o app verificada (producción)
4. ✅ Backend funcionando correctamente con Google OAuth

## Troubleshooting

### Error: "Access blocked: Authorization Error"
- **Causa**: Usuario no está en la lista de "Test users"
- **Solución**: Agrega el email como usuario de prueba

### Error: "400: invalid_request"
- **Causa**: Client ID incorrecto o app no configurada
- **Solución**: Verifica que el Client ID en `app.json` sea correcto

### Error: "redirect_uri_mismatch"
- **Causa**: Expo maneja esto automáticamente, pero si ocurre, verifica el `scheme` en `app.json`
- **Solución**: Asegúrate de que `scheme: "amva-app"` esté configurado correctamente
