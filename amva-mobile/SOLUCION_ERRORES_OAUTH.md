# Solución de Errores de Google OAuth y Login

## 🔴 Error 1: "Access blocked: Authorization Error" (Error 400: invalid_request)

Este error aparece cuando Google OAuth no está completamente configurado.

### ✅ Solución Paso a Paso

#### Paso 1: Verificar que las URLs funcionan

Abre estas URLs en tu navegador:

1. **Política de Privacidad:**
   ```
   https://ministerio-backend-wdbj.onrender.com/privacy-policy
   ```

2. **Términos de Servicio:**
   ```
   https://ministerio-backend-wdbj.onrender.com/terms-of-service
   ```

**Si las URLs NO funcionan:**
- Espera 2-3 minutos (el backend puede tardar en actualizarse)
- Verifica que el backend esté corriendo en Render.com
- Si aún no funcionan, el backend necesita reiniciarse

#### Paso 2: Completar "Información de la marca" en Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Selecciona el proyecto **"amva-auth"**
3. Ve a **APIs & Services** → **OAuth consent screen**
4. Haz clic en **"Información de la marca"** (Brand Information)

5. Completa estos campos **OBLIGATORIOS**:

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

#### Paso 3: Verificar Dominio Autorizado

En la misma página de "Información de la marca", verifica que en "Dominios autorizados" aparezca:
```
ministerio-backend-wdbj.onrender.com
```

Si no aparece, agrégalo haciendo clic en "Agregar un dominio".

#### Paso 4: Esperar y Probar

1. **Espera 5-15 minutos** después de guardar (Google puede tardar en procesar)
2. **Cierra completamente la app móvil** (ciérrala por completo, no solo minimices)
3. **Reinicia la app**
4. **Prueba el login con Google nuevamente**

### ⚠️ Si el error persiste después de 15 minutos

1. Verifica que las URLs sean accesibles (abre en navegador)
2. Verifica que el dominio esté en "Dominios autorizados"
3. Verifica que el estado sea "En producción" (no "Testing")
4. Revisa si hay mensajes de error en Google Cloud Console

---

## 🔴 Error 2: "Credenciales inválidas" en Login Normal

Este error aparece cuando intentas iniciar sesión con email y contraseña.

### Posibles Causas

1. **El email no está registrado como pastor**
   - El login normal es solo para pastores registrados
   - Si eres invitado, usa el login con Google

2. **La contraseña es incorrecta**
   - Verifica que estés escribiendo la contraseña correcta
   - Asegúrate de que no haya espacios antes o después

3. **La cuenta no existe**
   - Necesitas crear una cuenta primero
   - Usa el botón "Crear nueva cuenta"

### ✅ Solución

#### Opción 1: Crear una cuenta nueva

1. En la pantalla de login, haz clic en **"Crear nueva cuenta"**
2. Completa el formulario de registro
3. Una vez registrado, podrás iniciar sesión con email y contraseña

#### Opción 2: Usar Login con Google (Recomendado)

1. Haz clic en **"Continuar con Google"**
2. Selecciona tu cuenta de Google
3. Autoriza la aplicación
4. Esto funciona tanto para pastores como para invitados

#### Opción 3: Verificar credenciales existentes

Si ya tienes una cuenta:

1. Verifica que el email sea correcto (sin espacios)
2. Verifica que la contraseña sea correcta
3. Si olvidaste la contraseña, contacta al administrador

### 🔍 Debugging

Si quieres ver más detalles del error:

1. Abre la consola de desarrollo (si estás en desarrollo)
2. Busca mensajes que empiecen con:
   - `❌ authApi.login: Error detallado:`
   - `❌ Error en login:`

Estos mensajes te dirán exactamente qué está fallando.

---

## 📋 Checklist de Verificación

### Para Google OAuth:

- [ ] URLs de Privacy Policy y Terms of Service funcionan
- [ ] Campos completados en "Información de la marca"
- [ ] Dominio autorizado configurado
- [ ] Estado "En producción" (no "Testing")
- [ ] Esperado 5-15 minutos después de guardar cambios
- [ ] App cerrada completamente y reiniciada

### Para Login Normal:

- [ ] Email correcto (sin espacios)
- [ ] Contraseña correcta
- [ ] Cuenta registrada como pastor
- [ ] Si no tienes cuenta, crear una nueva

---

## 🆘 Si Nada Funciona

1. **Verifica el estado del backend:**
   - Abre: `https://ministerio-backend-wdbj.onrender.com/api/noticias/publicadas`
   - Debería devolver una lista de noticias (o un array vacío)

2. **Verifica la configuración:**
   - Revisa que el Client ID en `app.json` sea correcto
   - Verifica que las variables de entorno del backend estén configuradas

3. **Contacta al administrador:**
   - Si el problema persiste, puede ser un problema del servidor
   - Proporciona los mensajes de error específicos que ves

---

## 📝 Notas Importantes

- **Google OAuth**: Requiere que las URLs de Privacy Policy y Terms of Service estén configuradas
- **Login Normal**: Solo funciona para pastores registrados
- **Login con Google**: Funciona para pastores e invitados
- **Tiempo de propagación**: Los cambios en Google Cloud Console pueden tardar 5-15 minutos en aplicarse

