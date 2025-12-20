# 🔥 Información de Firebase Configurada

## 📋 Datos del Proyecto Firebase

- **Project ID**: `amva-digital`
- **Project Number** (Sender ID): `804089781668`
- **Package Name**: `org.vidaabundante.app` ✅
- **Storage Bucket**: `amva-digital.firebasestorage.app`

## 📄 Archivo google-services.json

- **Ubicación**: `android/app/google-services.json` ✅
- **Estado**: Configurado correctamente

## 🔑 Información para EAS Credentials

Cuando ejecutes `eas credentials`, necesitarás:

### 1. Server Key (Cloud Messaging API key)

**Cómo obtenerlo**:
1. Ve a Firebase Console: https://console.firebase.google.com/
2. Selecciona el proyecto: **amva-digital**
3. Ve a **Configuración** (⚙️) → **Cloud Messaging**
4. Busca **"Server key"** o **"Cloud Messaging API (Legacy)"**
5. Si no está habilitado, haz clic en **"Habilitar"** o **"Enable"**
6. Copia el **"Server key"** (es una cadena larga que empieza con `AAAA...`)

### 2. Sender ID

**Ya lo tienes**: `804089781668`

Este es el **Project Number** que aparece en Firebase Console.

## ✅ Próximos Pasos

1. ✅ `google-services.json` colocado correctamente
2. ⏳ Configurar credenciales en EAS (ejecutar `./scripts/setup-firebase-credentials.sh`)
3. ⏳ Rebuild la app
4. ⏳ Probar notificaciones push

## 🔗 Enlaces Útiles

- Firebase Console: https://console.firebase.google.com/project/amva-digital
- Cloud Messaging: https://console.firebase.google.com/project/amva-digital/settings/cloudmessaging

