# 🔑 Cómo Obtener el Server Key - Guía Detallada

## 🔍 Método 1: Desde Firebase Console (Si está disponible)

### Paso 1: Ir a Cloud Messaging

1. Abre: **https://console.firebase.google.com/project/amva-digital/settings/cloudmessaging**
2. O ve a: Firebase Console → Tu proyecto → ⚙️ Configuración → Cloud Messaging

### Paso 2: Buscar Server Key

Busca la sección **"Cloud Messaging API (Legacy)"** o **"Server key"**.

Si NO lo ves, pasa al Método 2.

---

## 🔧 Método 2: Crear Server Key desde Google Cloud Console (Recomendado)

### Paso 1: Ir a Google Cloud Console

Abre: **https://console.cloud.google.com/apis/credentials?project=amva-digital**

### Paso 2: Verificar que Cloud Messaging API está Habilitada

1. Ve a: **https://console.cloud.google.com/apis/library/cloudmessaging.googleapis.com?project=amva-digital**
2. Si dice **"Habilitar"** o **"Enable"**, haz clic
3. Espera a que se habilite

### Paso 3: Crear Clave de API

1. Vuelve a: **https://console.cloud.google.com/apis/credentials?project=amva-digital**
2. Haz clic en **"+ CREAR CREDENCIALES"** o **"+ CREATE CREDENTIALS"** (arriba)
3. Selecciona **"Clave de API"** o **"API key"**

### Paso 4: Configurar la Clave

1. Se creará una clave automáticamente
2. Haz clic en **"Restringir clave"** o **"Restrict key"** (recomendado)
3. En **"Restricciones de API"**, selecciona:
   - **"Restringir clave"** o **"Restrict key"**
   - Busca y selecciona **"Cloud Messaging API (Legacy)"**
4. Haz clic en **"Guardar"** o **"Save"**

### Paso 5: Copiar la Clave

1. Verás la clave creada (empieza con `AIza...`)
2. **Copia esta clave** - Esta es tu Server Key

⚠️ **NOTA**: Si la clave empieza con `AIza...` en lugar de `AAAA...`, está bien. Ambas funcionan.

---

## 🔄 Método 3: Usar la API Key del google-services.json (Alternativa)

Si no puedes crear el Server Key, puedes usar la API Key que ya está en tu `google-services.json`:

**API Key actual**: `AIzaSyBZOCA28SltY5zCO38AgBEWWraPGN-DSQM`

Esta clave puede funcionar, pero es mejor crear una específica para Cloud Messaging.

---

## ✅ Verificar que Funciona

Una vez que tengas el Server Key (o uses la API Key), ejecuta:

```bash
cd /home/jerlibgnzlz/Escritorio/v0-project-setup-and-plan/amva-mobile
./scripts/setup-firebase-credentials.sh
```

---

## 🆘 Si Aún No Lo Encuentras

**Opción Temporal**: Puedes usar la API Key del `google-services.json`:
- **API Key**: `AIzaSyBZOCA28SltY5zCO38AgBEWWraPGN-DSQM`

Esta puede funcionar para empezar, pero es mejor crear una clave específica para Cloud Messaging.

---

## 📋 Resumen

**Lo que necesitas**:
- **Server Key** o **API Key** para Cloud Messaging
- **Sender ID**: `804089781668` ✅ (ya lo tienes)

**Dónde obtenerlo**:
1. Firebase Console → Cloud Messaging (si está disponible)
2. Google Cloud Console → Credenciales → Crear clave de API
3. O usar la API Key del `google-services.json` (temporal)

