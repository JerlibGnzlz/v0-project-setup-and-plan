# Configuración de Google OAuth para AMVA Mobile

## Problema: "Access blocked: Authorization Error"

Este error ocurre porque la aplicación está en modo de prueba y el usuario no está autorizado.

## Solución Rápida: Agregar Usuarios de Prueba

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Selecciona tu proyecto
3. Ve a **APIs & Services** → **OAuth consent screen**
4. En la sección **"Test users"**, haz clic en **"+ ADD USERS"**
5. Agrega el email `jerlibgnzlz@gmail.com` (y cualquier otro email que necesite probar)
6. Guarda los cambios
7. Intenta iniciar sesión nuevamente en la app móvil

## Solución Permanente: Verificar la Aplicación

1. Ve a **OAuth consent screen** en Google Cloud Console
2. Completa todos los campos requeridos (Privacy Policy URL, Terms of Service URL)
3. Haz clic en **"PUBLISH APP"** para moverla de modo de prueba a producción
4. Nota: Esto requiere que completes el proceso de verificación de Google (puede tardar varios días)

## Notas Importantes

- El Client ID actual (`378853205278-slllh10l32onum338rg1776g8itekvco.apps.googleusercontent.com`) es para aplicaciones web
- Para aplicaciones móviles con Expo, puedes usar el mismo Client ID, pero debes agregar usuarios de prueba
- El Client ID debe estar configurado en `app.json` → `extra.googleClientId`
