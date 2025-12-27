# 🔧 Solución: Qué Falta en google-services.json para Google OAuth

## 🔴 Problemas Detectados en tu google-services.json

### Problema 1: Project Number Incorrecto
```json
"project_number": "804089781668"  // ❌ Incorrecto
```
**Esperado**: `378853205278` (el proyecto donde están tus OAuth Client IDs)

### Problema 2: OAuth Client Vacío (CRÍTICO)
```json
"oauth_client": []  // ❌ VACÍO - Esto impide que Google OAuth funcione
```
**Esperado**: Debe contener los Client IDs de Google OAuth

### Problema 3: Falta Configuración de OAuth
El archivo NO tiene los Client IDs necesarios para Google Sign-In.

## ✅ Solución: Vincular Firebase con Google Cloud Console

El problema es que tu proyecto de Firebase (`804089781668`) **NO está vinculado** con tu proyecto de Google Cloud Console (`378853205278`) donde están los OAuth Client IDs.

### Opción 1: Vincular Proyectos (Recomendado)

#### Paso 1: Verificar Proyecto en Google Cloud Console

1. Ve a: **https://console.cloud.google.com/**
2. Verifica que estés en el proyecto con `project_number: 378853205278`
3. Ve a: **APIs y Servicios** → **Credenciales**
4. Verifica que tengas el cliente Android: `378853205278-c2e1gcjn06mg857rcvprns01fu8pduat`

#### Paso 2: Vincular Firebase con Google Cloud Console

1. Ve a: **https://console.firebase.google.com/**
2. Selecciona el proyecto **"AMVA Digital"** (el que tiene `project_number: 804089781668`)
3. Ve a: **Configuración del proyecto** (⚙️) → **Configuración general**
4. Busca la sección **"Cuentas de servicio"** o **"Service accounts"**
5. Verifica que el proyecto esté vinculado con Google Cloud Console
6. Si no está vinculado, haz clic en **"Vincular proyecto"** o **"Link project"**

#### Paso 3: Habilitar Google Sign-In en Firebase

1. En Firebase Console, ve a: **Authentication** → **Sign-in method**
2. Busca **"Google"** en la lista de proveedores
3. Si no está habilitado:
   - Haz clic en **"Google"**
   - Activa el toggle **"Habilitar"**
   - Selecciona el proyecto de Google Cloud Console correcto (`378853205278`)
   - Guarda los cambios

#### Paso 4: Descargar Nuevo google-services.json

1. En Firebase Console, ve a: **Configuración del proyecto** (⚙️) → **Tus apps**
2. Haz clic en la app Android **"AMVA Móvil"**
3. Haz clic en el botón **"google-services.json"** para descargar
4. Reemplaza el archivo en `amva-mobile/android/app/google-services.json`

### Opción 2: Crear App en el Proyecto Correcto de Firebase

Si no puedes vincular los proyectos, crea una nueva app Android en Firebase usando el proyecto correcto:

#### Paso 1: Verificar/Crear Proyecto en Firebase

1. Ve a: **https://console.firebase.google.com/**
2. Busca un proyecto con `project_number: 378853205278`
3. Si NO existe, créalo:
   - Haz clic en **"Agregar proyecto"**
   - Nombre: **"AMVA Digital"**
   - Si te pregunta por Google Cloud Console, selecciona el proyecto `378853205278`

#### Paso 2: Agregar App Android

1. En Firebase Console, ve a: **Configuración del proyecto** (⚙️) → **Tus apps**
2. Haz clic en **"Agregar app"** → **Android**
3. **Package name**: `org.vidaabundante.app`
4. **Sobrenombre de la app**: `AMVA Móvil` (opcional)
5. Haz clic en **"Registrar app"**

#### Paso 3: Agregar SHA-1

1. En la configuración de la app Android, busca **"Huellas digitales del certificado SHA"**
2. Haz clic en **"Agregar huella digital"**
3. Agrega los SHA-1:
   - `4B:24:0F:1B:6A:E6:3D:71:38:77:D1:E7:69:40:D2:1D:5D:30:7C:40` (Producción - APK actual)
   - `BC:0C:2C:C3:68:D1:50:C3:7E:07:17:EE:49:8F:D0:35:7D:0F:1E:E3` (Producción - Builds futuros)
   - `A7:89:E5:05:C8:17:A1:22:EA:90:6E:A6:EA:A3:D4:8B:3A:30:AB:18` (Debug - Opcional)

#### Paso 4: Habilitar Google Sign-In

1. En Firebase Console, ve a: **Authentication** → **Sign-in method**
2. Haz clic en **"Google"**
3. Activa el toggle **"Habilitar"**
4. Selecciona el proyecto de Google Cloud Console (`378853205278`)
5. Guarda los cambios

#### Paso 5: Descargar google-services.json

1. En Firebase Console, ve a: **Configuración del proyecto** (⚙️) → **Tus apps**
2. Haz clic en la app Android **"AMVA Móvil"**
3. Haz clic en el botón **"google-services.json"** para descargar
4. Reemplaza el archivo en `amva-mobile/android/app/google-services.json`

## ✅ Verificación: Qué Debe Tener el google-services.json Correcto

Después de seguir los pasos anteriores, el archivo debe tener:

```json
{
  "project_info": {
    "project_number": "378853205278",  // ✅ Correcto
    "project_id": "amva-digital",
    "storage_bucket": "amva-digital.firebasestorage.app"
  },
  "client": [
    {
      "client_info": {
        "mobilesdk_app_id": "1:378853205278:android:...",
        "android_client_info": {
          "package_name": "org.vidaabundante.app"  // ✅ Correcto
        }
      },
      "oauth_client": [  // ✅ NO debe estar vacío
        {
          "client_id": "378853205278-c2e1gcjn06mg857rcvprns01fu8pduat.apps.googleusercontent.com",
          "client_type": 1,
          "android_info": {
            "package_name": "org.vidaabundante.app",
            "certificate_hash": [
              "4B:24:0F:1B:6A:E6:3D:71:38:77:D1:E7:69:40:D2:1D:5D:30:7C:40",
              "BC:0C:2C:C3:68:D1:50:C3:7E:07:17:EE:49:8F:D0:35:7D:0F:1E:E3"
            ]
          }
        },
        {
          "client_id": "378853205278-slllh10l32onum338rg1776g8itekvco.apps.googleusercontent.com",
          "client_type": 3
        }
      ],
      "api_key": [
        {
          "current_key": "..."
        }
      ]
    }
  ]
}
```

## 🔍 Puntos Críticos a Verificar

### 1. Project Number
✅ **Correcto**: `378853205278`  
❌ **Incorrecto**: `804089781668`

### 2. OAuth Client
✅ **Correcto**: Debe tener al menos el Android Client ID  
❌ **Incorrecto**: `[]` (vacío)

### 3. Android Client ID
✅ **Correcto**: `378853205278-c2e1gcjn06mg857rcvprns01fu8pduat.apps.googleusercontent.com`  
❌ **Incorrecto**: Cualquier otro Client ID

### 4. Certificate Hash (SHA-1)
✅ **Correcto**: Debe tener los SHA-1 configurados  
❌ **Incorrecto**: Array vacío o sin SHA-1

## 📋 Checklist de Solución

- [ ] Proyecto de Firebase vinculado con Google Cloud Console (`378853205278`)
- [ ] Google Sign-In habilitado en Firebase Authentication
- [ ] SHA-1 agregados en Firebase Console (`4B:24:0F...` y `BC:0C:2C...`)
- [ ] Nuevo `google-services.json` descargado desde Firebase Console
- [ ] `project_number` es `378853205278` (no `804089781668`)
- [ ] `oauth_client` NO está vacío (tiene Client IDs)
- [ ] Android Client ID es `378853205278-c2e1gcjn06mg857rcvprns01fu8pduat`
- [ ] `certificate_hash` tiene los SHA-1 configurados
- [ ] Archivo reemplazado en `amva-mobile/android/app/google-services.json`

## 🎯 Resumen: Qué Falta

**Lo que falta en tu `google-services.json`:**

1. ❌ **`project_number` incorrecto**: Debe ser `378853205278`, no `804089781668`
2. ❌ **`oauth_client` vacío**: Debe contener los Client IDs de Google OAuth
3. ❌ **Falta Android Client ID**: Debe tener `378853205278-c2e1gcjn06mg857rcvprns01fu8pduat`
4. ❌ **Falta `certificate_hash`**: Debe tener los SHA-1 configurados

**Solución**: Vincular Firebase con Google Cloud Console o crear la app en el proyecto correcto de Firebase, luego descargar el nuevo `google-services.json`.

## ⚠️ Importante

**El `oauth_client` vacío es el problema principal**. Sin esto, Google OAuth NO puede funcionar, sin importar si los SHA-1 están configurados en Google Cloud Console.

**Debes descargar un nuevo `google-services.json` desde Firebase Console** después de:
1. Vincular los proyectos correctamente
2. Habilitar Google Sign-In en Firebase Authentication
3. Agregar los SHA-1 en Firebase Console

