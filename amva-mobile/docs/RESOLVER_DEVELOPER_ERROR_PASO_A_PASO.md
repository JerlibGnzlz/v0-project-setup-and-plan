# 🔧 Resolver DEVELOPER_ERROR - Plan de Acción Paso a Paso

## 🔴 Problema Actual

La app muestra:
- ❌ "DEVELOPER_ERROR"
- ❌ "Login con Google no disponible: DEVELOPER_ERROR"
- ❌ Error de autenticación

---

## ✅ Plan de Acción Completo

### Paso 1: Verificar SHA-1 en Google Cloud Console

1. Ve a: **https://console.cloud.google.com/apis/credentials**
2. Busca el cliente Android: `378853205278-c2e1gcjn06mg857rcvprns01fu8pduat`
3. Haz clic para editarlo
4. Verifica que tengas **AMBOS SHA-1** configurados:
   - ✅ SHA-1 del keystore NUEVO: `9B:AF:07:1F:4A:A2:70:9C:E6:AB:79:E4:EC:ED:AE:22:CE:F6:DB:8A`
   - ✅ SHA-1 del keystore ANTERIOR: `4B:24:0F:1B:6A:E6:3D:71:38:77:D1:E7:69:40:D2:1D:5D:30:7C:40`

**Si falta alguno, agrégalo ahora.**

---

### Paso 2: Verificar OAuth Consent Screen

1. Ve a: **https://console.cloud.google.com/apis/credentials/consent**
2. Verifica:
   - ✅ Tipo: "Externo" o "External"
   - ✅ Estado: "En producción" o "In production"
   - ✅ Si está en "En prueba", asegúrate de tener usuarios de prueba agregados (incluye tu email)
   - ✅ Scopes: `email` y `profile` deben estar configurados

---

### Paso 3: Verificar Tiempo de Espera

**IMPORTANTE**: Después de agregar SHA-1 en Google Cloud Console:
- ⏱️ Debes esperar **mínimo 30 minutos**
- 🔄 Puede tardar hasta **1 hora** en algunos casos
- ⚠️ Los cambios NO se aplican instantáneamente

**¿Cuándo agregaste el SHA-1?**
- Si fue hace menos de 30 minutos, **espera más tiempo**
- Si fue hace más de 1 hora y aún no funciona, continúa con el siguiente paso

---

### Paso 4: Reinstalación Limpia (OBLIGATORIA)

Si ya esperaste 30 minutos y aún no funciona, haz una reinstalación limpia:

#### 4.1 Desinstalar la App

1. Ve a **Configuración** → **Apps**
2. Busca **"AMVA Móvil"** o **"org.vidaabundante.app"**
3. Toca en la app
4. Toca **"Desinstalar"**
5. Confirma la desinstalación

#### 4.2 Limpiar Cache de Google Play Services

1. Ve a **Configuración** → **Apps**
2. Busca **"Google Play Services"**
3. Toca en la app
4. Toca **"Almacenamiento"**
5. Toca **"Borrar caché"** (NO borres los datos)

#### 4.3 Reiniciar el Teléfono

1. Mantén presionado el botón de encendido
2. Selecciona **"Reiniciar"**
3. Espera a que se reinicie completamente

#### 4.4 Instalar el APK de Nuevo

1. Abre el archivo APK que descargaste desde EAS Build
2. Instala el APK
3. Abre la app

---

### Paso 5: Verificar Client ID en app.json

Verifica que el Client ID sea correcto:

1. Abre: `amva-mobile/app.json`
2. Busca: `googleAndroidClientId`
3. Debe ser: `378853205278-c2e1gcjn06mg857rcvprns01fu8pduat.apps.googleusercontent.com`

Si es diferente, corrígelo y recompila.

---

### Paso 6: Probar de Nuevo

Después de la reinstalación limpia:

1. Abre la app
2. Toca **"Continuar con Google"**
3. Debería funcionar correctamente

---

## 🔍 Diagnóstico Adicional

Si después de todos los pasos anteriores aún no funciona:

### Verificar SHA-1 del APK Instalado

El APK que tienes instalado fue compilado con el keystore anterior (`4B:24:0F...`). Verifica que este SHA-1 esté en Google Cloud Console.

### Verificar que el SHA-1 Sea Exacto

Compara carácter por carácter:
- SHA-1 en Google Cloud Console: `4B:24:0F:1B:6A:E6:3D:71:38:77:D1:E7:69:40:D2:1D:5D:30:7C:40`
- SHA-1 del keystore anterior: `4B:24:0F:1B:6A:E6:3D:71:38:77:D1:E7:69:40:D2:1D:5D:30:7C:40`

Deben ser **EXACTAMENTE iguales** (mismo formato, mismos caracteres, sin espacios extra).

---

## 📋 Checklist Completo

- [ ] Ambos SHA-1 agregados en Google Cloud Console
- [ ] OAuth consent screen verificado (publicado o en prueba con usuarios)
- [ ] Esperado al menos 30 minutos después de agregar SHA-1
- [ ] App desinstalada completamente
- [ ] Cache de Google Play Services limpiado
- [ ] Teléfono reiniciado
- [ ] APK reinstalado
- [ ] Client ID verificado en app.json
- [ ] Login con Google probado de nuevo

---

## 🚨 Si Aún No Funciona

Si después de seguir todos los pasos aún no funciona:

1. **Verifica el SHA-1 exacto** del keystore desde EAS:
   ```bash
   eas credentials
   # Android → Keystore → View credentials
   ```

2. **Compara con Google Cloud Console** carácter por carácter

3. **Verifica OAuth consent screen**:
   - Debe estar publicado O en modo prueba con tu email agregado

4. **Verifica logs de la app** (si tienes acceso):
   - Busca mensajes de error específicos

5. **Considera recompilar** con el nuevo keystore:
   ```bash
   eas build --platform android --profile production
   ```
   Luego agrega el SHA-1 del nuevo keystore (`9B:AF:07...`) si no está ya agregado

---

## 💡 Nota Final

El problema más común es:
1. **No esperar suficiente tiempo** (mínimo 30 minutos)
2. **No hacer reinstalación limpia** después de agregar SHA-1
3. **SHA-1 no exacto** (espacios extra, caracteres diferentes)

Sigue los pasos en orden y verifica cada uno antes de continuar.

