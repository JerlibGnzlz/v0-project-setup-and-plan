# 🔍 Diagnóstico de Google Login - Checklist Completo

## 🔴 Problema

Ya tienes todo configurado pero Google Login no funciona.

---

## ✅ Checklist de Verificación

### 1. Verificar SHA-1 en Google Cloud Console

**Paso 1**: Ve a Google Cloud Console
- URL: https://console.cloud.google.com/apis/credentials
- Busca el cliente Android: `378853205278-c2e1gcjn06mg857rcvprns01fu8pduat`

**Paso 2**: Verifica que tengas AMBOS SHA-1 configurados:
- ✅ SHA-1 de Debug (para emulador)
- ✅ SHA-1 de Producción (para teléfono físico con APK de EAS)

**Paso 3**: Verifica que el SHA-1 de producción sea el correcto:
- Ejecuta: `eas credentials` → Android → View credentials
- Compara el SHA-1 que ves ahí con el que está en Google Cloud Console
- **Deben ser EXACTAMENTE iguales** (mismo formato, mismos caracteres)

---

### 2. Verificar OAuth Consent Screen

**Paso 1**: Ve a OAuth Consent Screen
- URL: https://console.cloud.google.com/apis/credentials/consent

**Paso 2**: Verifica:
- ✅ Tipo de aplicación: **"Externo"** o **"External"**
- ✅ Estado de publicación: **"En producción"** o **"In production"**
  - Si está en "En prueba", asegúrate de tener usuarios de prueba agregados
- ✅ Scopes configurados: Al menos `email` y `profile`

**Paso 3**: Si está en modo prueba:
- Agrega tu email de Google como usuario de prueba
- O cambia a modo producción

---

### 3. Verificar Client ID en app.json

**Paso 1**: Verifica que el Client ID sea correcto:
- Abre: `amva-mobile/app.json`
- Busca: `googleAndroidClientId`
- Debe ser: `378853205278-c2e1gcjn06mg857rcvprns01fu8pduat.apps.googleusercontent.com`

**Paso 2**: Verifica que el formato sea correcto:
- ✅ Debe terminar en `.apps.googleusercontent.com`
- ✅ No debe tener espacios ni caracteres extra

---

### 4. Verificar Tiempo de Propagación

**Importante**: Después de agregar SHA-1 en Google Cloud Console:
- ⏱️ Espera **mínimo 15-30 minutos**
- 🔄 Puede tardar hasta **1 hora** en algunos casos
- ⚠️ **NO pruebes inmediatamente** después de agregar SHA-1

**Si acabas de agregar el SHA-1**:
- Espera al menos 30 minutos antes de probar
- Cierra completamente la app en el teléfono
- Vuelve a abrirla y prueba de nuevo

---

### 5. Verificar que Estás Usando el APK Correcto

**Paso 1**: Verifica que estés usando el APK compilado con EAS Build:
- ✅ NO uses el APK de desarrollo (`npx expo run:android`)
- ✅ Usa el APK descargado desde EAS Build

**Paso 2**: Si instalaste un APK anterior:
- Desinstala la app completamente del teléfono
- Instala el nuevo APK compilado con EAS Build
- Prueba de nuevo

---

### 6. Verificar Logs de Error

**Paso 1**: Si tienes acceso a logs de la app:
- Busca mensajes de error relacionados con Google Sign-In
- Busca el código de error específico (ej: `DEVELOPER_ERROR`, `SIGN_IN_CANCELLED`, etc.)

**Paso 2**: Errores comunes:
- `DEVELOPER_ERROR`: SHA-1 no configurado o incorrecto
- `SIGN_IN_CANCELLED`: Usuario canceló el login
- `NETWORK_ERROR`: Problema de conexión
- `SIGN_IN_REQUIRED`: Necesita iniciar sesión

---

## 🔧 Pasos de Solución

### Solución 1: Verificar SHA-1 Correcto

1. Obtén SHA-1 desde EAS:
   ```bash
   eas credentials
   # Selecciona: Android → View credentials
   # Copia el SHA-1 que aparece
   ```

2. Compara con Google Cloud Console:
   - Ve a: https://console.cloud.google.com/apis/credentials
   - Busca el cliente Android
   - Verifica que el SHA-1 sea exactamente igual

3. Si no coincide:
   - Elimina el SHA-1 incorrecto
   - Agrega el SHA-1 correcto
   - Espera 30 minutos

---

### Solución 2: Verificar OAuth Consent Screen

1. Ve a: https://console.cloud.google.com/apis/credentials/consent

2. Si está en modo "En prueba":
   - Agrega tu email como usuario de prueba
   - O cambia a modo "En producción"

3. Verifica scopes:
   - Debe tener al menos `email` y `profile`
   - Si falta alguno, agrégalo

---

### Solución 3: Limpiar Cache y Reinstalar

1. Desinstala la app completamente del teléfono
2. Limpia cache de Google Play Services (si es posible)
3. Instala el nuevo APK desde EAS Build
4. Espera 30 minutos después de agregar SHA-1
5. Prueba de nuevo

---

### Solución 4: Verificar Client ID

1. Abre `amva-mobile/app.json`
2. Verifica que `googleAndroidClientId` sea:
   ```
   378853205278-c2e1gcjn06mg857rcvprns01fu8pduat.apps.googleusercontent.com
   ```
3. Si es diferente, actualízalo y recompila

---

## 🐛 Errores Comunes y Soluciones

### Error: DEVELOPER_ERROR
**Causa**: SHA-1 no configurado o incorrecto
**Solución**: 
- Verifica SHA-1 en Google Cloud Console
- Compara con SHA-1 de EAS credentials
- Espera 30 minutos después de agregar

### Error: SIGN_IN_CANCELLED
**Causa**: Usuario canceló el login
**Solución**: No es un error, el usuario canceló

### Error: NETWORK_ERROR
**Causa**: Problema de conexión
**Solución**: Verifica conexión a internet

### Error: 10 (DEVELOPER_ERROR)
**Causa**: SHA-1 incorrecto o OAuth consent screen no publicado
**Solución**: 
- Verifica SHA-1
- Verifica OAuth consent screen
- Espera propagación

---

## 📋 Checklist Final

Antes de probar de nuevo, verifica:

- [ ] SHA-1 de producción agregado en Google Cloud Console
- [ ] SHA-1 coincide exactamente con el de EAS credentials
- [ ] OAuth consent screen está publicado o en modo prueba con usuarios
- [ ] Client ID en app.json es correcto
- [ ] Esperaste al menos 30 minutos después de agregar SHA-1
- [ ] Estás usando el APK compilado con EAS Build (no desarrollo)
- [ ] Desinstalaste y reinstalaste la app en el teléfono
- [ ] Cerraste completamente la app antes de probar de nuevo

---

## 🚀 Próximos Pasos

1. Verifica cada punto del checklist
2. Si algo no coincide, corrígelo
3. Espera 30 minutos después de cualquier cambio
4. Desinstala y reinstala la app
5. Prueba de nuevo

---

## 💡 Consejo Final

Si después de verificar todo sigue sin funcionar:
1. Toma capturas de pantalla de:
   - SHA-1 en Google Cloud Console
   - SHA-1 en EAS credentials
   - OAuth consent screen
2. Compara ambos SHA-1 caracter por caracter
3. Verifica que no haya espacios o caracteres extra

