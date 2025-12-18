# Guía de Prueba para Login con Google

## 🧪 Prueba Automática

Ejecuta el script de prueba:

```bash
bash amva-mobile/scripts/test-google-login.sh
```

Este script verificará:
- ✅ URLs de Privacy Policy y Terms of Service
- ✅ Endpoint de Google Auth
- ✅ Configuración del Client ID
- ✅ Archivo app.json

## 📱 Prueba Manual en la App Móvil

### Paso 1: Verificar Configuración Previa

Antes de probar, asegúrate de que:

1. **Las URLs funcionan** (abre en navegador):
   - ✅ `https://ministerio-backend-wdbj.onrender.com/privacy-policy`
   - ✅ `https://ministerio-backend-wdbj.onrender.com/terms-of-service`

2. **Google Cloud Console está configurado**:
   - ✅ Ve a Google Cloud Console → OAuth consent screen → "Información de la marca"
   - ✅ Completa los campos con las URLs de arriba
   - ✅ Guarda los cambios
   - ✅ Espera 5-15 minutos después de guardar

3. **Client ID está configurado**:
   - ✅ Verifica que `app.json` tenga `googleClientId` configurado
   - ✅ El Client ID debe ser: `378853205278-slllh10l32onum338rg1776g8itekvco.apps.googleusercontent.com`

### Paso 2: Preparar la App

1. **Cierra completamente la app móvil**:
   - No solo minimices, ciérrala completamente
   - En Android: Desliza hacia arriba y cierra la app
   - En iOS: Desliza hacia arriba y cierra la app

2. **Reinicia la app**:
   - Abre la app desde cero
   - Deberías ver la pantalla de login

### Paso 3: Probar Login con Google

1. **En la pantalla de login**:
   - Verifica que aparezca el botón "🔵 Continuar con Google"
   - El botón NO debe estar deshabilitado

2. **Haz clic en "Continuar con Google"**:
   - Debería abrirse una ventana de Google OAuth
   - Selecciona tu cuenta de Google (ej: jerlibgnzlz@gmail.com)
   - Autoriza la aplicación

3. **Resultado esperado**:
   - ✅ Si funciona: Deberías ver un mensaje de bienvenida y entrar a la app
   - ❌ Si falla: Verás un mensaje de error con instrucciones

### Paso 4: Verificar el Login Exitoso

Si el login fue exitoso:

1. **Deberías ver**:
   - Pantalla principal de la app (HomeScreen)
   - Tu nombre en la pantalla de bienvenida
   - Acceso a todas las funcionalidades

2. **Verifica en los logs** (si estás en desarrollo):
   ```
   ✅ Login con Google exitoso
   ✅ Sesión iniciada con Google como invitado: [tu-email]
   ```

## 🔍 Troubleshooting

### Error: "Access blocked: Authorization Error"

**Causa**: Las URLs de Privacy Policy o Terms of Service no están configuradas en Google Cloud Console.

**Solución**:
1. Ve a Google Cloud Console → OAuth consent screen → "Información de la marca"
2. Completa los campos con las URLs:
   - Página principal: `https://ministerio-backend-wdbj.onrender.com`
   - Política de Privacidad: `https://ministerio-backend-wdbj.onrender.com/privacy-policy`
   - Términos de Servicio: `https://ministerio-backend-wdbj.onrender.com/terms-of-service`
3. Guarda los cambios
4. Espera 5-15 minutos
5. Cierra completamente la app y reiníciala

### Error: Botón de Google deshabilitado

**Causa**: El Client ID no está configurado o es inválido.

**Solución**:
1. Verifica que `app.json` tenga `googleClientId` configurado
2. Verifica que el Client ID sea válido (debe terminar en `.apps.googleusercontent.com`)
3. Reinicia el servidor de desarrollo de Expo

### Error: "Network Error" o "ECONNREFUSED"

**Causa**: El backend no está accesible.

**Solución**:
1. Verifica que el backend esté corriendo en Render.com
2. Verifica la URL del API en `amva-mobile/src/api/client.ts`
3. Prueba abrir `https://ministerio-backend-wdbj.onrender.com/api/noticias/publicadas` en el navegador

### Error: "Credenciales inválidas" después del login con Google

**Causa**: El token de Google no se está procesando correctamente en el backend.

**Solución**:
1. Verifica los logs del backend para ver el error específico
2. Verifica que `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET` estén configurados en el backend
3. Verifica que el Client ID del backend coincida con el de la app móvil

## 📊 Checklist de Verificación

Antes de probar, verifica:

- [ ] URLs de Privacy Policy y Terms of Service funcionan (abre en navegador)
- [ ] Campos completados en Google Cloud Console "Información de la marca"
- [ ] Dominio autorizado configurado en Google Cloud Console
- [ ] Estado "En producción" en Google Cloud Console
- [ ] Client ID configurado en `app.json`
- [ ] Esperado 5-15 minutos después de guardar cambios en Google Cloud Console
- [ ] App cerrada completamente y reiniciada
- [ ] Backend accesible (prueba las URLs)

## 🎯 Resultado Esperado

Si todo está configurado correctamente:

1. ✅ El botón "Continuar con Google" está habilitado
2. ✅ Al hacer clic, se abre la ventana de Google OAuth
3. ✅ Puedes seleccionar tu cuenta de Google
4. ✅ Puedes autorizar la aplicación
5. ✅ Entras a la app con tu cuenta de Google
6. ✅ Ves tu nombre en la pantalla principal
7. ✅ Tienes acceso a todas las funcionalidades

## 📝 Notas Importantes

- **Tiempo de propagación**: Los cambios en Google Cloud Console pueden tardar 5-15 minutos en aplicarse
- **Límite de usuarios**: Mientras Google revisa tu aplicación, puedes usar hasta 100 usuarios
- **Verificación completa**: Una vez que Google apruebe tu aplicación, no habrá límite de usuarios
- **Mismo Client ID**: El Client ID debe ser el mismo en el backend y en la app móvil

## 🆘 Si Nada Funciona

1. Ejecuta el script de prueba: `bash amva-mobile/scripts/test-google-login.sh`
2. Revisa los logs de la app móvil para ver errores específicos
3. Revisa los logs del backend para ver errores del servidor
4. Consulta `amva-mobile/SOLUCION_ERRORES_OAUTH.md` para más detalles
5. Verifica que todas las URLs sean accesibles desde un navegador

