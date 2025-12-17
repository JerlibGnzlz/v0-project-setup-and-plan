# Pasos Finales para Completar Google OAuth en AMVA Mobile

## ✅ Lo que ya está hecho

1. ✅ **Backend configurado** con endpoints públicos:
   - `https://ministerio-backend-wdbj.onrender.com/privacy-policy`
   - `https://ministerio-backend-wdbj.onrender.com/terms-of-service`

2. ✅ **App en producción** en Google Cloud Console
3. ✅ **Client ID configurado** en `app.json`
4. ✅ **Dominio autorizado**: `ministerio-backend-wdbj.onrender.com`

## 🔴 Lo que falta hacer (5 minutos)

### Paso 1: Verificar que las URLs funcionan

Abre estas URLs en tu navegador para verificar que funcionan:

1. **Política de Privacidad:**
   ```
   https://ministerio-backend-wdbj.onrender.com/privacy-policy
   ```

2. **Términos de Servicio:**
   ```
   https://ministerio-backend-wdbj.onrender.com/terms-of-service
   ```

Si las URLs no funcionan, espera unos minutos (el backend puede tardar en actualizarse) o verifica que el backend esté corriendo.

### Paso 2: Completar campos en Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Selecciona el proyecto **"amva-auth"**
3. Ve a **APIs & Services** → **OAuth consent screen**
4. Haz clic en **"Información de la marca"** (Brand Information)

5. Completa los siguientes campos:

   **Página principal de la aplicación:**
   ```
   https://ministerio-backend-wdbj.onrender.com
   ```

   **Vínculo a la Política de Privacidad:** ⚠️ OBLIGATORIO
   ```
   https://ministerio-backend-wdbj.onrender.com/privacy-policy
   ```

   **Vínculo a las Condiciones del Servicio:** (Recomendado)
   ```
   https://ministerio-backend-wdbj.onrender.com/terms-of-service
   ```

6. Haz clic en **"Guardar"** (Save)

### Paso 3: Esperar y Probar

1. **Espera 5-10 minutos** después de guardar (Google puede tardar en procesar)
2. **Cierra completamente la app móvil** (ciérrala por completo)
3. **Reinicia la app**
4. **Prueba el login con Google**

## ✅ Verificación Final

Después de completar estos pasos, deberías poder:

- ✅ Iniciar sesión con Google en la app móvil
- ✅ Ver tu perfil después del login
- ✅ Usar todas las funcionalidades de la app

## 🔍 Troubleshooting

### Si las URLs no funcionan:

1. Verifica que el backend esté corriendo en Render.com
2. Espera unos minutos (puede tardar en actualizarse)
3. Verifica que las URLs sean exactamente:
   - `https://ministerio-backend-wdbj.onrender.com/privacy-policy`
   - `https://ministerio-backend-wdbj.onrender.com/terms-of-service`

### Si aún aparece "Access blocked":

1. Verifica que guardaste los cambios en Google Cloud Console
2. Espera 10-15 minutos después de guardar
3. Verifica que el dominio `ministerio-backend-wdbj.onrender.com` esté en "Dominios autorizados"
4. Cierra completamente la app y reiníciala

### Si necesitas ayuda:

- Revisa los logs de la app móvil para ver errores específicos
- Verifica que el Client ID en `app.json` sea correcto
- Asegúrate de que el backend esté accesible

## 📝 Notas Importantes

- La **Política de Privacidad es OBLIGATORIA** para apps en producción
- Los **Términos de Servicio son recomendados** pero no obligatorios
- El dominio debe estar en "Dominios autorizados" para que funcione
- Google puede tardar 5-15 minutos en procesar los cambios

## 🎉 Una vez que funcione

- ✅ Todos los usuarios podrán iniciar sesión con Google (hasta 100 sin verificación completa)
- ✅ No necesitas agregar usuarios manualmente
- ✅ El mismo Client ID funciona para web y mobile
- ✅ La app estará completamente funcional

