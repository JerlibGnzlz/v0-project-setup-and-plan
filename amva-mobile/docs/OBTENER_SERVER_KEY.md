# 🔑 Cómo Obtener el Server Key de Firebase

## 📋 Pasos para Obtener el Server Key

### Paso 1: Ir a Firebase Console

1. Abre: **https://console.firebase.google.com/project/amva-digital**
2. Asegúrate de estar en el proyecto correcto: **amva-digital**

### Paso 2: Ir a Cloud Messaging

**Opción A: Desde Configuración**
1. Haz clic en el icono de **⚙️ Configuración** (arriba a la izquierda)
2. Selecciona **"Configuración del proyecto"** o **"Project settings"**
3. Ve a la pestaña **"Cloud Messaging"** o **"Cloud Messaging"**

**Opción B: Directo**
1. En el menú lateral izquierdo, busca **"Engage"** o **"Compromiso"**
2. Haz clic en **"Cloud Messaging"**

### Paso 3: Habilitar Cloud Messaging API (si es necesario)

Si ves un mensaje que dice **"Cloud Messaging API (Legacy) is not enabled"**:

1. Haz clic en **"Habilitar"** o **"Enable"**
2. Espera a que se habilite (puede tardar unos segundos)
3. Recarga la página si es necesario

### Paso 4: Obtener el Server Key

Una vez en la página de Cloud Messaging, busca:

**"Cloud Messaging API (Legacy)"** o **"Server key"**

Verás algo como:
```
Server key
AAAA... (una cadena larga)
```

**Copia esta cadena completa**. Es el Server Key que necesitarás para EAS.

### Paso 5: Alternativa - Obtener desde Google Cloud Console

Si no encuentras el Server Key en Firebase Console:

1. Ve a: **https://console.cloud.google.com/apis/credentials?project=amva-digital**
2. Busca **"Cloud Messaging API (Legacy)"** o **"Server key"**
3. Si no existe, crea una nueva clave:
   - Haz clic en **"Crear credenciales"** o **"Create credentials"**
   - Selecciona **"Clave de API"** o **"API key"**
   - Selecciona **"Cloud Messaging API (Legacy)"**

## ⚠️ Nota Importante

- El Server Key es una credencial sensible
- No lo compartas públicamente
- Solo lo necesitarás para configurar EAS una vez
- EAS lo guardará de forma segura

## 📝 Información que Ya Tienes

- **Sender ID**: `804089781668` (Project Number)
- **Server Key**: (lo obtendrás de Firebase Console)

## ✅ Una Vez que Tengas el Server Key

Ejecuta:
```bash
cd amva-mobile
./scripts/setup-firebase-credentials.sh
```

El script te pedirá:
1. Server Key (lo que acabas de copiar)
2. Sender ID: `804089781668` (ya lo tienes)

