# 🔥 Configuración de Firebase Cloud Messaging (FCM) - Guía Completa

## 📋 Estado Actual

✅ **Completado**:
- Proyecto Firebase creado: `amva-digital`
- App Android agregada al proyecto
- `google-services.json` descargado y colocado en `android/app/`
- Package name configurado: `org.vidaabundante.app`

⏳ **Pendiente**:
- Habilitar Cloud Messaging API
- Obtener Server Key
- Configurar credenciales en EAS

---

## PASO 1: Habilitar Cloud Messaging API

### 1.1. Ir a Firebase Console

1. Abre: **https://console.firebase.google.com/project/amva-digital/settings/cloudmessaging**
2. O ve a: Firebase Console → Tu proyecto → ⚙️ Configuración → Cloud Messaging

### 1.2. Habilitar Cloud Messaging API (Legacy)

Si ves un mensaje que dice:
```
Cloud Messaging API (Legacy) is not enabled
```

**Haz lo siguiente**:
1. Haz clic en **"Habilitar"** o **"Enable"**
2. Espera a que se habilite (puede tardar 10-30 segundos)
3. Recarga la página si es necesario

**Alternativa desde Google Cloud Console**:
1. Ve a: **https://console.cloud.google.com/apis/library/cloudmessaging.googleapis.com?project=amva-digital**
2. Haz clic en **"Habilitar"** o **"Enable"**
3. Espera a que se habilite

---

## PASO 2: Obtener el Server Key

### 2.1. Desde Firebase Console (Recomendado)

1. Ve a: **https://console.firebase.google.com/project/amva-digital/settings/cloudmessaging**
2. Busca la sección **"Cloud Messaging API (Legacy)"**
3. Verás:

```
Server key
AAAAxYz123abc456def789ghi012jkl345mno678pqr901stu234vwx567yz...
[COPIAR]
```

4. Haz clic en **"COPIAR"** o selecciona y copia toda la cadena

### 2.2. Desde Google Cloud Console (Alternativa)

1. Ve a: **https://console.cloud.google.com/apis/credentials?project=amva-digital**
2. Busca **"Cloud Messaging API (Legacy)"** en la lista de claves de API
3. Si no existe, crea una nueva:
   - Haz clic en **"+ CREAR CREDENCIALES"** o **"+ CREATE CREDENTIALS"**
   - Selecciona **"Clave de API"** o **"API key"**
   - En "Restringir clave", selecciona **"Cloud Messaging API (Legacy)"**
   - Haz clic en **"Crear"** o **"Create"**
   - Copia la clave generada

---

## PASO 3: Configurar Credenciales en EAS

### 3.1. Ejecutar Script de Configuración

```bash
cd /home/jerlibgnzlz/Escritorio/v0-project-setup-and-plan/amva-mobile
./scripts/setup-firebase-credentials.sh
```

### 3.2. Seguir las Instrucciones del Script

El script te pedirá:

1. **Platform**: Selecciona `Android`
2. **Workflow**: Selecciona `production` (o `preview` para testing)
3. **What would you like to do?**: Selecciona `Set up Push Notifications credentials`
4. **Push Notifications Setup**: Selecciona `Set up Firebase Cloud Messaging (FCM)`

### 3.3. Proporcionar Credenciales

Cuando te pida:

**Server Key**:
- Pega el Server Key que copiaste (la cadena que empieza con `AAAA...`)

**Sender ID**:
- Ingresa: `804089781668` (este es tu Project Number)

**Google Services JSON**:
- El script puede detectarlo automáticamente si está en `android/app/google-services.json`
- O puedes proporcionar la ruta manualmente

---

## PASO 4: Verificar Configuración

### 4.1. Verificar Credenciales en EAS

```bash
eas credentials
```

Selecciona Android y verifica que aparezca la configuración de FCM.

### 4.2. Verificar google-services.json

```bash
cd amva-mobile
cat android/app/google-services.json | grep -E "(project_id|package_name)"
```

Deberías ver:
- `project_id`: `amva-digital`
- `package_name`: `org.vidaabundante.app`

---

## PASO 5: Rebuild de la App

### 5.1. Limpiar Builds Anteriores

```bash
cd amva-mobile/android
./gradlew clean
```

### 5.2. Rebuild con EAS (Recomendado)

```bash
cd amva-mobile
eas build --platform android --profile preview
```

O para producción:
```bash
eas build --platform android --profile production
```

### 5.3. O Build Local (Alternativa)

```bash
cd amva-mobile/android
./gradlew bundleRelease
```

---

## PASO 6: Probar Notificaciones Push

### 6.1. Instalar App en Dispositivo Físico

⚠️ **IMPORTANTE**: Las notificaciones push NO funcionan en emuladores. Debes probar en un dispositivo Android físico.

### 6.2. Verificar Registro de Token

1. Inicia sesión en la app como invitado
2. Verifica en los logs de la app:
   ```
   ✅ Token de notificación obtenido: ExponentPushToken[...]
   ✅ Token registrado en el backend para invitado: [email]
   ```

### 6.3. Probar Notificación

1. Crea una inscripción desde la app móvil
2. Deberías recibir una notificación push inmediatamente
3. Verifica en los logs del backend:
   ```
   📱 Push notifications enviadas a invitado [email]: X exitosas, Y errores
   ```

---

## 🔍 Troubleshooting

### Problema: "Cloud Messaging API (Legacy) is not enabled"

**Solución**:
1. Ve a Google Cloud Console: https://console.cloud.google.com/apis/library/cloudmessaging.googleapis.com?project=amva-digital
2. Haz clic en "Habilitar"
3. Espera y recarga Firebase Console

### Problema: "No se encuentra Server Key"

**Solución**:
1. Asegúrate de que Cloud Messaging API está habilitada
2. Ve a Google Cloud Console → Credenciales
3. Crea una nueva clave de API para Cloud Messaging API (Legacy)

### Problema: "Firebase no está configurado" en la app

**Solución**:
1. Verifica que `google-services.json` está en `android/app/`
2. Rebuild la app completamente
3. Limpia el cache: `cd android && ./gradlew clean`

---

## 📋 Checklist Final

- [ ] Cloud Messaging API habilitada
- [ ] Server Key obtenido
- [ ] Credenciales configuradas en EAS
- [ ] `google-services.json` verificado
- [ ] App rebuild después de agregar `google-services.json`
- [ ] App instalada en dispositivo físico
- [ ] Token de notificación obtenido y registrado
- [ ] Notificación push recibida al crear inscripción

---

## 🔗 Enlaces Útiles

- **Firebase Console**: https://console.firebase.google.com/project/amva-digital
- **Cloud Messaging**: https://console.firebase.google.com/project/amva-digital/settings/cloudmessaging
- **Google Cloud Console**: https://console.cloud.google.com/apis/credentials?project=amva-digital
- **Habilitar Cloud Messaging API**: https://console.cloud.google.com/apis/library/cloudmessaging.googleapis.com?project=amva-digital

---

## ✅ Siguiente Paso

Una vez que tengas el Server Key, ejecuta:

```bash
cd amva-mobile
./scripts/setup-firebase-credentials.sh
```

¡Y listo! 🎉

