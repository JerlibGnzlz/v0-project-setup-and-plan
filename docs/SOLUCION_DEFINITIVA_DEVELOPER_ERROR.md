# 🎯 Solución Definitiva para DEVELOPER_ERROR

## 🚨 Problema Actual

El error `DEVELOPER_ERROR` indica que el SHA-1 `BC:0C:2C:C3:68:D1:50:C3:7E:07:17:EE:49:8F:D0:35:7D:0F:1E:E3` **NO está configurado en Google Cloud Console**.

## ⚠️ Importante: google-services.json vs Google Cloud Console

**NO es suficiente** tener el SHA-1 en `google-services.json`. El SHA-1 **DEBE estar** en Google Cloud Console también.

### Diferencia:

- ✅ **google-services.json**: Configuración local de Firebase (ya tiene ambos SHA-1s)
- ❌ **Google Cloud Console**: Configuración de OAuth que Google verifica (necesita el SHA-1)

## ✅ Solución Paso a Paso

### Paso 1: Abrir el Cliente Android en Google Cloud Console

**URL directa:**
```
https://console.cloud.google.com/auth/clients/378853205278-c2e1gcjn06mg857rcvprns01fu8pduat.apps.googleusercontent.com?project=amva-auth
```

### Paso 2: Verificar SHA-1 Actual

En la página de edición, verás el campo:
- **Huella digital del certificado SHA-1**: `4B:24:0F:1B:6A:E6:3D:71:38:77:D1:E7:69:40:D2:1D:5D:30:7C:40`

### Paso 3: Agregar el Nuevo SHA-1

**IMPORTANTE**: En Google Auth Platform, puedes tener **múltiples SHA-1s**. Necesitas agregar el nuevo sin eliminar el existente.

**Opción A: Si el campo permite múltiples valores:**
1. Haz clic en el campo SHA-1
2. Agrega una nueva línea o separa con coma
3. Pega: `BC:0C:2C:C3:68:D1:50:C3:7E:07:17:EE:49:8F:D0:35:7D:0F:1E:E3`

**Opción B: Si el campo solo permite uno:**
1. Reemplaza el SHA-1 actual con ambos separados por coma o nueva línea
2. O crea un nuevo cliente Android con el nuevo SHA-1

### Paso 4: Guardar

1. Haz clic en **"Guardar"** (Save)
2. Espera el mensaje de confirmación

### Paso 5: Esperar Propagación

- ⏱️ **Espera 30 minutos** después de guardar
- Los cambios pueden tardar hasta 1 hora en propagarse completamente

### Paso 6: Reiniciar App

1. **Cierra completamente** la app
2. **Desinstala** la app del dispositivo
3. **Reinstala** la app
4. **Abre** la app nuevamente

### Paso 7: Probar Login

1. Haz clic en "Continuar con Google"
2. Debería funcionar sin el error `DEVELOPER_ERROR`

## 🔄 Alternativa: Usar expo-auth-session (NO Requiere SHA-1)

Si después de 1 hora sigue sin funcionar, usa esta alternativa que **NO requiere SHA-1**:

### Cambiar a expo-auth-session

1. Abre `amva-mobile/src/screens/auth/LoginScreen.tsx`
2. Cambia esta línea:
   ```typescript
   // De:
   const googleSignIn = googleSignInNative
   
   // A:
   const googleSignIn = googleSignInExpo
   ```
3. Reinicia la app
4. Prueba el login con Google

**Ventajas:**
- ✅ No requiere SHA-1
- ✅ Funciona inmediatamente
- ✅ Más simple de configurar

## 📋 Checklist Completo

- [ ] SHA-1 `BC:0C:2C...` agregado en Google Cloud Console
- [ ] SHA-1 guardado correctamente
- [ ] Esperado 30 minutos para propagación
- [ ] App desinstalada y reinstalada
- [ ] Login probado

## 🚨 Si Sigue Fallando Después de 30 Minutos

### Verificación Final:

1. **Verifica en Google Cloud Console:**
   - Ve a la URL del cliente Android
   - Verifica que el SHA-1 `BC:0C:2C...` esté en la lista
   - Si no está, agrégalo nuevamente

2. **Verifica el Package Name:**
   - Debe ser exactamente: `org.vidaabundante.app`
   - Sin espacios, sin errores de tipeo

3. **Verifica el Client ID:**
   - Debe ser: `378853205278-c2e1gcjn06mg857rcvprns01fu8pduat`
   - Debe coincidir con el configurado en `app.json`

4. **Considera usar expo-auth-session:**
   - No requiere SHA-1
   - Funciona inmediatamente
   - Más simple

## 🎯 Recomendación Final

1. ✅ **Agrega el SHA-1** en Google Cloud Console (si no lo has hecho)
2. ⏱️ **Espera 30 minutos** (crítico)
3. 🔄 **Reinicia la app** completamente
4. 🧪 **Prueba** el login
5. 🔄 **Si no funciona**, cambia a `expo-auth-session` como alternativa

¡Con estos pasos debería funcionar! 🚀

