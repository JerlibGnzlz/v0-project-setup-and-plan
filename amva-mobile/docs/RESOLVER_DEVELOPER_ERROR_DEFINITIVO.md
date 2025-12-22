# 🔧 Resolver DEVELOPER_ERROR Definitivamente

## 🔍 Problema

Con el nuevo APK compilado con EAS Build, al intentar hacer login con Google aparece:
```
DEVELOPER_ERROR: Follow troubleshooting instruction at https://react-native-google-signin.github.io/docs/troubleshooting
```

**Causa**: El SHA-1 del keystore de producción (usado por EAS Build) no está configurado en Google Cloud Console.

---

## ✅ Solución Paso a Paso

### Paso 1: Obtener SHA-1 de Producción desde EAS

Ejecuta:

```bash
cd /home/jerlibgnzlz/Escritorio/v0-project-setup-and-plan/amva-mobile
eas credentials
```

1. Selecciona **Android**
2. Selecciona **View credentials** (o **Ver credenciales**)
3. Busca la sección **"Keystore"** o **"Signing Key"**
4. Verás el **SHA-1** listado ahí (formato: `XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX`)
5. **Copia el SHA-1 completo**

---

### Paso 2: Agregar SHA-1 en Google Cloud Console

1. Ve a: **https://console.cloud.google.com/apis/credentials**
2. Inicia sesión con tu cuenta de Google
3. Selecciona el proyecto correcto (el que tiene tu OAuth client)
4. Busca el cliente Android: `378853205278-c2e1gcjn06mg857rcvprns01fu8pduat`
5. Haz clic en el nombre del cliente para editarlo
6. En la sección **"SHA-1 certificate fingerprint"**:
   - Verás el SHA-1 de debug que ya está ahí (si funciona en emulador)
   - Haz clic en **"+ Agregar huella digital"** o **"+ Add fingerprint"**
   - Pega el SHA-1 de producción que obtuviste de EAS
   - **NO elimines** el SHA-1 de debug (puedes tener ambos)
7. Haz clic en **"Guardar"** o **"Save"**

---

### Paso 3: Verificar OAuth Consent Screen

Asegúrate de que el OAuth consent screen esté correctamente configurado:

1. Ve a: **https://console.cloud.google.com/apis/credentials/consent**
2. Verifica que:
   - El tipo de aplicación sea **"Externo"** o **"External"**
   - El estado de publicación sea **"En producción"** o **"In production"** (o al menos "En prueba" con usuarios de prueba agregados)
   - Los dominios autorizados estén configurados si es necesario

---

### Paso 4: Esperar Propagación

Después de agregar el SHA-1:
- ⏱️ Espera **15-30 minutos** para que Google propague los cambios
- 🔄 Los cambios pueden tardar hasta **1 hora** en algunos casos
- ⚠️ **NO pruebes inmediatamente**, espera al menos 15 minutos

---

### Paso 5: Verificar SHA-1 Correcto

Si quieres verificar qué SHA-1 está usando tu APK:

```bash
# Opción 1: Desde EAS (recomendado)
eas credentials

# Opción 2: Si tienes el keystore localmente
keytool -list -v -keystore /path/to/keystore.jks -alias your-key-alias
```

Compara el SHA-1 que ves con el que agregaste en Google Cloud Console. Deben ser **exactamente iguales**.

---

### Paso 6: Probar en Teléfono Físico

Después de esperar 15-30 minutos:
1. Abre la app en tu teléfono físico
2. Intenta iniciar sesión con Google
3. Debería funcionar correctamente

---

## 🔍 Verificación Rápida

### Checklist de Verificación

- [ ] SHA-1 de producción obtenido desde `eas credentials`
- [ ] SHA-1 de producción agregado en Google Cloud Console
- [ ] SHA-1 de debug NO eliminado (debe estar también)
- [ ] OAuth consent screen verificado
- [ ] Esperado 15-30 minutos después de agregar SHA-1
- [ ] Probado login con Google en teléfono físico

---

## 🐛 Si Aún No Funciona

### 1. Verificar SHA-1 Correcto

Ejecuta de nuevo `eas credentials` y verifica que el SHA-1 que agregaste sea exactamente el mismo.

### 2. Verificar Client ID

Verifica que el Client ID en `app.json` sea correcto:
- Android: `378853205278-c2e1gcjn06mg857rcvprns01fu8pduat.apps.googleusercontent.com`

### 3. Verificar OAuth Consent Screen

Asegúrate de que el OAuth consent screen esté publicado o al menos en modo prueba con usuarios agregados.

### 4. Esperar Más Tiempo

A veces los cambios pueden tardar hasta 1 hora en propagarse. Espera un poco más.

### 5. Verificar Logs

Si tienes acceso a logs de la app, busca mensajes de error relacionados con Google Sign-In.

---

## 📊 Resumen

| Entorno | Keystore | SHA-1 | Estado |
|---------|----------|-------|--------|
| Emulador | Debug (por defecto) | SHA-1 de Debug | ✅ Funciona |
| Teléfono Físico | Producción (EAS Build) | SHA-1 de Producción | ❌ Falta agregar |

**Solución**: Agregar SHA-1 de producción en Google Cloud Console.

---

## 💡 Nota Importante

Puedes tener **múltiples SHA-1** en el mismo cliente Android:
- ✅ SHA-1 de Debug (para desarrollo/emulador)
- ✅ SHA-1 de Producción (para builds de EAS)
- ✅ SHA-1 de otros keystores si es necesario

**NO elimines** ningún SHA-1 existente, solo agrega el nuevo.

---

## 🚀 Próximos Pasos

1. Ejecuta `eas credentials` y obtén el SHA-1 de producción
2. Agrega el SHA-1 en Google Cloud Console
3. Espera 15-30 minutos
4. Prueba login con Google en el teléfono físico

