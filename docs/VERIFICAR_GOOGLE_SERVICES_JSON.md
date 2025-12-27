# 🔍 Verificar Configuración de google-services.json

## 📋 Ubicación del Archivo

El archivo `google-services.json` debe estar en:
```
amva-mobile/android/app/google-services.json
```

Y debe estar referenciado en `app.json`:
```json
"android": {
  "googleServicesFile": "./android/app/google-services.json"
}
```

## ✅ Configuración Correcta

### 1. Package Name

El `package_name` en `google-services.json` debe coincidir exactamente con:
```
org.vidaabundante.app
```

Este es el mismo `package` configurado en `app.json`:
```json
"android": {
  "package": "org.vidaabundante.app"
}
```

### 2. Project Number

El `project_number` debe ser:
```
378853205278
```

Este es el mismo número que aparece en los Client IDs de Google Cloud Console.

### 3. OAuth Client IDs

En `google-services.json`, dentro de `oauth_client`, debe haber al menos:

1. **Android Client ID** (para Google Sign-In):
   ```
   378853205278-c2e1gcjn06mg857rcvprns01fu8pduat.apps.googleusercontent.com
   ```

2. **Web Client ID** (opcional, para otros servicios):
   ```
   378853205278-slllh10l32onum338rg1776g8itekvco.apps.googleusercontent.com
   ```

Estos deben coincidir con los configurados en `app.json`:
```json
"extra": {
  "googleClientId": "378853205278-slllh10l32onum338rg1776g8itekvco.apps.googleusercontent.com",
  "googleAndroidClientId": "378853205278-c2e1gcjn06mg857rcvprns01fu8pduat.apps.googleusercontent.com"
}
```

## 🔍 Estructura Esperada

El archivo `google-services.json` debe tener esta estructura básica:

```json
{
  "project_info": {
    "project_number": "378853205278",
    "project_id": "amva-digital",
    "storage_bucket": "..."
  },
  "client": [
    {
      "client_info": {
        "mobilesdk_app_id": "...",
        "android_client_info": {
          "package_name": "org.vidaabundante.app"
        }
      },
      "oauth_client": [
        {
          "client_id": "378853205278-c2e1gcjn06mg857rcvprns01fu8pduat.apps.googleusercontent.com",
          "client_type": 1,
          "android_info": {
            "package_name": "org.vidaabundante.app",
            "certificate_hash": ["SHA-1_1", "SHA-1_2", ...]
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
      ],
      "services": {
        "appinvite_service": {
          "other_platform_oauth_client": [...]
        }
      }
    }
  ],
  "configuration_version": "1"
}
```

## ⚠️ Puntos Críticos a Verificar

### 1. Package Name

✅ **Correcto**: `org.vidaabundante.app`  
❌ **Incorrecto**: Cualquier otro package name

### 2. Android Client ID

✅ **Correcto**: `378853205278-c2e1gcjn06mg857rcvprns01fu8pduat.apps.googleusercontent.com`  
❌ **Incorrecto**: Cualquier otro Client ID

### 3. Certificate Hash (SHA-1)

En `oauth_client` → `android_info` → `certificate_hash`, deben estar los SHA-1 configurados:

✅ **SHA-1 para APK actual**:
```
4B:24:0F:1B:6A:E6:3D:71:38:77:D1:E7:69:40:D2:1D:5D:30:7C:40
```

✅ **SHA-1 para builds futuros** (opcional):
```
BC:0C:2C:C3:68:D1:50:C3:7E:07:17:EE:49:8F:D0:35:7D:0F:1E:E3
```

**Nota**: Los SHA-1 en `google-services.json` deben coincidir con los configurados en Google Cloud Console.

## 🔄 Cómo Obtener/Actualizar google-services.json

### Opción 1: Desde Google Cloud Console (Recomendado)

1. Ve a: **https://console.firebase.google.com/**
2. Selecciona tu proyecto: **AMVA Digital**
3. Ve a: **Configuración del proyecto** (⚙️) → **Tus apps**
4. Si ya tienes una app Android:
   - Haz clic en la app Android
   - Descarga `google-services.json`
   - Reemplaza el archivo en `amva-mobile/android/app/google-services.json`
5. Si no tienes una app Android:
   - Haz clic en **"Agregar app"** → **Android**
   - Package name: `org.vidaabundante.app`
   - Descarga `google-services.json`
   - Colócalo en `amva-mobile/android/app/google-services.json`

### Opción 2: Verificar que el Archivo Esté Actualizado

El archivo `google-services.json` se actualiza automáticamente cuando:
- Agregas un nuevo SHA-1 en Google Cloud Console
- Cambias la configuración de OAuth en Firebase/Google Cloud Console

**Importante**: Después de agregar un SHA-1 en Google Cloud Console, puede tardar hasta 30 minutos en reflejarse en `google-services.json` si lo descargas nuevamente.

## ✅ Checklist de Verificación

- [ ] Archivo `google-services.json` existe en `amva-mobile/android/app/`
- [ ] `package_name` es `org.vidaabundante.app`
- [ ] `project_number` es `378853205278`
- [ ] Android Client ID es `378853205278-c2e1gcjn06mg857rcvprns01fu8pduat.apps.googleusercontent.com`
- [ ] SHA-1 `4B:24:0F...` está en `certificate_hash` (si tienes APK con ese SHA-1)
- [ ] SHA-1 `BC:0C:2C...` está en `certificate_hash` (si planeas compilar nuevos APKs)
- [ ] Archivo referenciado correctamente en `app.json`

## 🐛 Problemas Comunes

### Problema 1: Package Name No Coincide

**Síntoma**: Google Sign-In no funciona, error de configuración.

**Solución**: Verifica que el `package_name` en `google-services.json` sea exactamente `org.vidaabundante.app`.

### Problema 2: SHA-1 No Está en certificate_hash

**Síntoma**: Google Sign-In funciona pero muestra error `DEVELOPER_ERROR`.

**Solución**: 
1. Agrega el SHA-1 en Google Cloud Console
2. Descarga nuevamente `google-services.json` desde Firebase Console
3. Reemplaza el archivo en `amva-mobile/android/app/google-services.json`

### Problema 3: Client ID Incorrecto

**Síntoma**: Google Sign-In no funciona, error de autenticación.

**Solución**: Verifica que el Android Client ID en `google-services.json` sea `378853205278-c2e1gcjn06mg857rcvprns01fu8pduat.apps.googleusercontent.com`.

## 📝 Notas Importantes

- ⚠️ **NO edites manualmente** `google-services.json` - debe descargarse desde Firebase Console
- ✅ El archivo se actualiza automáticamente cuando cambias configuración en Google Cloud Console
- 🔄 Después de actualizar configuración, espera 30 minutos antes de descargar el nuevo archivo
- 📱 El `package_name` debe coincidir exactamente con el configurado en `app.json`

## 🎯 Resumen

Para que Google OAuth funcione correctamente:

1. ✅ `google-services.json` debe tener `package_name`: `org.vidaabundante.app`
2. ✅ Android Client ID: `378853205278-c2e1gcjn06mg857rcvprns01fu8pduat.apps.googleusercontent.com`
3. ✅ SHA-1 `4B:24:0F...` debe estar en `certificate_hash` (para tu APK actual)
4. ✅ SHA-1 `BC:0C:2C...` debe estar en `certificate_hash` (para builds futuros)
5. ✅ Archivo referenciado en `app.json` con `"googleServicesFile": "./android/app/google-services.json"`

