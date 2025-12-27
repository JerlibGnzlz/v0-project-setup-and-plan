# ⚠️ Problema Detectado en google-services.json

## 🔴 Problemas Encontrados

### 1. Project Number Incorrecto

**Actual**: `804089781668`  
**Esperado**: `378853205278`

El `project_number` en `google-services.json` no coincide con el configurado en `app.json` y Google Cloud Console.

### 2. OAuth Client Vacío (CRÍTICO)

**Actual**: `"oauth_client": []`  
**Esperado**: Debe contener al menos el Android Client ID para Google Sign-In

El array `oauth_client` está vacío, lo que significa que **NO hay configuración de OAuth para Google Sign-In**. Esto es la causa principal de que Google OAuth no funcione.

## ✅ Solución: Actualizar google-services.json

### Paso 1: Verificar Proyecto en Firebase Console

1. Ve a: **https://console.firebase.google.com/**
2. Verifica qué proyecto estás usando:
   - Si ves `project_number: 804089781668`, este es un proyecto diferente
   - Necesitas usar el proyecto con `project_number: 378853205278`

### Paso 2: Verificar Proyecto en Google Cloud Console

1. Ve a: **https://console.cloud.google.com/**
2. Verifica que estés en el proyecto correcto:
   - Debe tener el Client ID Android: `378853205278-c2e1gcjn06mg857rcvprns01fu8pduat`
   - Debe tener el Client ID Web: `378853205278-slllh10l32onum338rg1776g8itekvco`

### Paso 3: Descargar google-services.json Correcto

#### Opción A: Si el Proyecto Correcto Existe en Firebase

1. Ve a: **https://console.firebase.google.com/**
2. Selecciona el proyecto con `project_number: 378853205278`
3. Ve a: **Configuración del proyecto** (⚙️) → **Tus apps**
4. Si ya tienes una app Android con package `org.vidaabundante.app`:
   - Haz clic en la app
   - Descarga `google-services.json`
   - Reemplaza el archivo en `amva-mobile/android/app/google-services.json`
5. Si NO tienes una app Android:
   - Haz clic en **"Agregar app"** → **Android**
   - Package name: `org.vidaabundante.app`
   - Nombre de la app: `AMVA Móvil` (opcional)
   - Descarga `google-services.json`
   - Colócalo en `amva-mobile/android/app/google-services.json`

#### Opción B: Si el Proyecto NO Existe en Firebase

1. Ve a: **https://console.firebase.google.com/**
2. Haz clic en **"Agregar proyecto"** o **"Crear proyecto"**
3. Nombre del proyecto: `AMVA Digital`
4. Si te pregunta por Google Analytics, puedes activarlo o desactivarlo
5. Una vez creado, ve a: **Configuración del proyecto** (⚙️)
6. Verifica que el `project_number` sea `378853205278`
7. Ve a: **Tus apps** → **Agregar app** → **Android**
8. Package name: `org.vidaabundante.app`
9. Descarga `google-services.json`
10. Colócalo en `amva-mobile/android/app/google-services.json`

### Paso 4: Verificar que OAuth Client Esté Configurado

Después de descargar el nuevo `google-services.json`, verifica que tenga:

```json
{
  "oauth_client": [
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
  ]
}
```

**Puntos críticos**:
- ✅ `oauth_client` NO debe estar vacío `[]`
- ✅ Debe contener el Android Client ID: `378853205278-c2e1gcjn06mg857rcvprns01fu8pduat`
- ✅ Debe tener `certificate_hash` con los SHA-1 configurados
- ✅ `package_name` debe ser `org.vidaabundante.app`

## 🔍 Verificación Final

Después de actualizar `google-services.json`, verifica:

- [ ] `project_number` es `378853205278`
- [ ] `package_name` es `org.vidaabundante.app`
- [ ] `oauth_client` NO está vacío
- [ ] Android Client ID es `378853205278-c2e1gcjn06mg857rcvprns01fu8pduat`
- [ ] SHA-1 `4B:24:0F...` está en `certificate_hash`
- [ ] SHA-1 `BC:0C:2C...` está en `certificate_hash` (opcional)

## ⚠️ Importante

**El archivo `google-services.json` actual NO tiene configuración de OAuth**, por lo que Google Sign-In NO puede funcionar. Debes descargar un nuevo archivo desde Firebase Console con la configuración correcta.

## 🎯 Resumen del Problema

| Elemento | Actual | Esperado | Estado |
|-----------|--------|----------|--------|
| `project_number` | `804089781668` | `378853205278` | ❌ Incorrecto |
| `oauth_client` | `[]` (vacío) | Debe tener Client IDs | ❌ **CRÍTICO** |
| `package_name` | `org.vidaabundante.app` | `org.vidaabundante.app` | ✅ Correcto |

## ✅ Acción Requerida

**Debes descargar un nuevo `google-services.json` desde Firebase Console** con:
1. `project_number: 378853205278`
2. `oauth_client` con el Android Client ID configurado
3. `certificate_hash` con los SHA-1 correctos

