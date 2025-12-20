# 🔥 Guía Paso a Paso: Configurar Firebase para Notificaciones Push

## 📋 Prerrequisitos

- ✅ Cuenta de Google (Gmail)
- ✅ Proyecto de Expo configurado
- ✅ App móvil funcionando
- ✅ EAS CLI instalado (opcional pero recomendado)

## 🎯 Objetivo

Configurar Firebase Cloud Messaging (FCM) para que las notificaciones push funcionen correctamente en Android.

---

## PASO 1: Crear Proyecto en Firebase Console

### 1.1. Ir a Firebase Console

1. Abre tu navegador y ve a: **https://console.firebase.google.com/**
2. Inicia sesión con tu cuenta de Google

### 1.2. Crear Nuevo Proyecto

1. Haz clic en **"Agregar proyecto"** o **"Create a project"**
2. **Nombre del proyecto**: `AMVA Digital` (o el nombre que prefieras)
3. Haz clic en **"Continuar"** o **"Continue"**
4. **Google Analytics** (opcional):
   - Puedes habilitarlo o deshabilitarlo
   - Si lo habilitas, selecciona o crea una cuenta de Analytics
   - Haz clic en **"Crear proyecto"** o **"Create project"**
5. Espera a que se cree el proyecto (puede tardar 1-2 minutos)
6. Cuando termine, haz clic en **"Continuar"** o **"Continue"**

---

## PASO 2: Agregar App Android al Proyecto

### 2.1. Agregar App Android

1. En la página principal del proyecto Firebase, verás iconos de diferentes plataformas
2. Haz clic en el icono de **Android** (🟢)
3. Se abrirá un formulario para agregar la app

### 2.2. Completar Información de la App

**Package name (nombre del paquete)**:
```
org.vidaabundante.app
```
⚠️ **IMPORTANTE**: Este debe ser EXACTAMENTE igual al que está en `app.json`:
- Verifica en `app.json` → `android.package`
- Debe ser: `org.vidaabundante.app`

**App nickname (apodo de la app)** (opcional):
```
AMVA Móvil
```

**Debug signing certificate SHA-1** (opcional por ahora):
- Puedes dejarlo vacío por ahora
- Lo agregaremos después si es necesario

4. Haz clic en **"Registrar app"** o **"Register app"**

### 2.3. Descargar google-services.json

1. Firebase te mostrará instrucciones para descargar `google-services.json`
2. Haz clic en **"Descargar google-services.json"** o **"Download google-services.json"**
3. **Guarda el archivo** en un lugar seguro (por ejemplo, Escritorio)

---

## PASO 3: Colocar google-services.json en el Proyecto

### 3.1. Ubicación del Archivo

El archivo `google-services.json` debe ir en:
```
amva-mobile/android/app/google-services.json
```

### 3.2. Copiar el Archivo

**Opción A: Desde la terminal** (Linux/Mac):
```bash
cd /home/jerlibgnzlz/Escritorio/v0-project-setup-and-plan/amva-mobile
# Copiar el archivo descargado a la ubicación correcta
cp ~/Descargas/google-services.json android/app/google-services.json
# O desde donde lo hayas descargado
cp /ruta/a/tu/google-services.json android/app/google-services.json
```

**Opción B: Desde el explorador de archivos**:
1. Abre el explorador de archivos
2. Navega a: `amva-mobile/android/app/`
3. Copia el archivo `google-services.json` descargado a esta carpeta

### 3.3. Verificar que el Archivo Está en el Lugar Correcto

```bash
cd amva-mobile
ls -lh android/app/google-services.json
```

Deberías ver algo como:
```
-rw-r--r-- 1 usuario usuario 1.2K dic 20 14:30 android/app/google-services.json
```

---

## PASO 4: Obtener SHA-1 del Keystore (Opcional pero Recomendado)

### 4.1. Para Debug Keystore (Desarrollo)

```bash
cd amva-mobile/android/app
keytool -list -v -keystore debug.keystore -alias androiddebugkey -storepass android -keypass android
```

Busca la línea que dice **"SHA1:"** y copia el valor.

### 4.2. Para Release Keystore (Producción)

```bash
cd amva-mobile/android/app
# Si ya generaste el keystore de producción
keytool -list -v -keystore amva-release-key.keystore -alias amva-key-alias -storepass [TU_CONTRASEÑA]
```

Busca la línea que dice **"SHA1:"** y copia el valor.

### 4.3. Agregar SHA-1 en Firebase

1. Ve a Firebase Console → Tu proyecto → **Configuración del proyecto** (⚙️)
2. Ve a la pestaña **"Tus apps"** o **"Your apps"**
3. Haz clic en tu app Android
4. Haz clic en **"Agregar huella digital"** o **"Add fingerprint"**
5. Pega el SHA-1 (tanto debug como release si tienes ambos)
6. Haz clic en **"Guardar"** o **"Save"**

---

## PASO 5: Configurar FCM Credentials en Expo

### 5.1. Instalar EAS CLI (si no lo tienes)

```bash
npm install -g eas-cli
```

### 5.2. Login en EAS

```bash
eas login
```

Te pedirá que inicies sesión con tu cuenta de Expo.

### 5.3. Configurar Credenciales de Firebase

```bash
cd amva-mobile
eas credentials
```

Selecciona:
1. **Platform**: `Android`
2. **Workflow**: `production` (o `preview` si quieres probar primero)
3. **What would you like to do?**: `Set up Push Notifications credentials`
4. **Push Notifications Setup**: `Set up Firebase Cloud Messaging (FCM)`

### 5.4. Proporcionar Credenciales de Firebase

EAS te pedirá:

**1. Firebase Server Key**:
   - Ve a Firebase Console → Tu proyecto → **Configuración del proyecto** (⚙️)
   - Ve a la pestaña **"Cloud Messaging"** o **"Cloud Messaging"**
   - Busca **"Cloud Messaging API (Legacy)"** o **"Server key"**
   - Si no está habilitado, haz clic en **"Habilitar"** o **"Enable"**
   - Copia el **"Server key"** (o **"Cloud Messaging API key"**)
   - Pégalo en EAS CLI

**2. Firebase Sender ID**:
   - En la misma página de Firebase Console
   - Busca **"Sender ID"** o **"Project number"**
   - Copia el número
   - Pégalo en EAS CLI

**3. Google Services JSON**:
   - EAS puede pedirte el contenido del `google-services.json`
   - O puede detectarlo automáticamente si está en `android/app/`

### 5.5. Verificar Configuración

EAS te mostrará un resumen de la configuración. Verifica que todo esté correcto.

---

## PASO 6: Verificar Configuración en app.json

### 6.1. Verificar que app.json Está Correcto

El archivo `app.json` ya debería tener:
```json
{
  "expo": {
    "android": {
      "googleServicesFile": "./google-services.json"
    }
  }
}
```

Si no lo tiene, agrégalo.

### 6.2. Verificar projectId en app.json

Verifica que el `projectId` en `app.json` coincida con el de Firebase:
```json
{
  "expo": {
    "extra": {
      "eas": {
        "projectId": "amva-mobile-example"
      }
    }
  }
}
```

---

## PASO 7: Rebuild de la App (Importante)

### 7.1. Limpiar Builds Anteriores

```bash
cd amva-mobile
# Limpiar build de Android
rm -rf android/app/build
rm -rf android/build
```

### 7.2. Rebuild con EAS (Recomendado)

```bash
eas build --platform android --profile preview
```

O para producción:
```bash
eas build --platform android --profile production
```

### 7.3. O Build Local (Alternativa)

```bash
cd amva-mobile/android
./gradlew clean
./gradlew bundleRelease
```

---

## PASO 8: Probar Notificaciones Push

### 8.1. Instalar la App en Dispositivo Físico

- Instala el APK/AAB generado en un dispositivo Android físico
- **IMPORTANTE**: Las notificaciones push NO funcionan en emuladores

### 8.2. Verificar Registro de Token

1. Inicia sesión en la app como invitado
2. Verifica en los logs de la app:
   ```
   ✅ Token de notificación obtenido: ExponentPushToken[...]
   ✅ Token registrado en el backend para invitado: [email]
   ```

### 8.3. Probar Notificación

1. Crea una inscripción desde la app móvil
2. Deberías recibir una notificación push inmediatamente
3. Verifica en los logs del backend:
   ```
   📱 Push notifications enviadas a invitado [email]: X exitosas, Y errores
   ```

---

## 🔍 Verificación y Troubleshooting

### Verificar que google-services.json Está Correcto

```bash
cd amva-mobile
cat android/app/google-services.json | grep -E "(project_id|package_name)"
```

Deberías ver:
- `project_id`: El ID de tu proyecto Firebase
- `package_name`: `org.vidaabundante.app`

### Verificar que Firebase Está Configurado en EAS

```bash
eas credentials
```

Selecciona Android y verifica que aparezca la configuración de FCM.

### Verificar Logs de la App

Si ves este warning:
```
⚠️ Firebase no está configurado. Las notificaciones push no estarán disponibles.
```

Significa que:
1. `google-services.json` no está en la ubicación correcta, O
2. La app no se ha rebuild después de agregar `google-services.json`

**Solución**: Rebuild la app después de agregar `google-services.json`.

### Verificar que el Token se Registra

En los logs del backend, busca:
```
Token registrado para invitado [invitadoId]
```

Si no aparece, verifica:
1. Que el endpoint `/notifications/register/invitado` funciona
2. Que el token se está obteniendo correctamente en la app
3. Que el usuario está autenticado como invitado

---

## 📝 Checklist Final

- [ ] Proyecto creado en Firebase Console
- [ ] App Android agregada al proyecto Firebase
- [ ] `google-services.json` descargado
- [ ] `google-services.json` colocado en `android/app/`
- [ ] SHA-1 agregado en Firebase (opcional pero recomendado)
- [ ] FCM credentials configuradas en EAS
- [ ] `app.json` verificado (tiene `googleServicesFile`)
- [ ] App rebuild después de agregar `google-services.json`
- [ ] App instalada en dispositivo físico Android
- [ ] Token de notificación obtenido y registrado
- [ ] Notificación push recibida al crear inscripción

---

## 🆘 Problemas Comunes

### Problema 1: "Firebase no está configurado"

**Causa**: `google-services.json` no está en la ubicación correcta o la app no se rebuild.

**Solución**:
1. Verifica que `google-services.json` está en `android/app/`
2. Rebuild la app completamente
3. Limpia el cache: `cd android && ./gradlew clean`

### Problema 2: "Token no se registra"

**Causa**: El endpoint no funciona o el usuario no está autenticado.

**Solución**:
1. Verifica que el usuario está autenticado como invitado
2. Verifica los logs del backend para errores
3. Verifica que el endpoint `/notifications/register/invitado` existe

### Problema 3: "Notificaciones no llegan"

**Causa**: Token no registrado o Firebase no configurado correctamente.

**Solución**:
1. Verifica que el token se registró en la base de datos
2. Verifica que Firebase está configurado correctamente
3. Verifica que estás probando en dispositivo físico (no emulador)

---

## 🔗 Recursos Útiles

- [Firebase Console](https://console.firebase.google.com/)
- [Documentación de Expo Push Notifications](https://docs.expo.dev/push-notifications/push-notifications-setup/)
- [Configuración de FCM en Expo](https://docs.expo.dev/push-notifications/fcm-credentials/)
- [EAS CLI Documentation](https://docs.expo.dev/build/introduction/)

---

## ✅ Siguiente Paso

Una vez configurado Firebase, las notificaciones push deberían funcionar correctamente en Android. 

**Prueba**:
1. Crear una inscripción desde la app móvil
2. Verificar que recibes la notificación push
3. Verificar que los recordatorios de pagos pendientes funcionan

¡Listo! 🎉

