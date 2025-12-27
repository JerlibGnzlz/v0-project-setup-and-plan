# ✅ Verificar que el Cliente Duplicado Fue Eliminado

## 🎯 Objetivo

Verificar que el cliente OAuth duplicado fue eliminado correctamente y que todo está configurado bien.

## 📋 Verificación 1: Google Cloud Console - Proyecto Correcto

### Paso 1: Abrir el Proyecto Correcto

1. Ve a: https://console.cloud.google.com/apis/credentials?project=amva-auth
2. O selecciona el proyecto `amva-auth` desde el selector

### Paso 2: Verificar el Cliente Android

1. Busca la sección **"OAuth 2.0 Client IDs"**
2. Busca el cliente Android: `378853205278-c2e1gcjn06mg857rcvprns01fu8pduat`
3. Haz clic en el cliente para ver sus detalles

### Paso 3: Verificar Configuración

El cliente debe tener:

- ✅ **Application type**: Android
- ✅ **Package name**: `org.vidaabundante.app`
- ✅ **SHA-1 certificate fingerprint**: Debe incluir:
  - `4B:24:0F:1B:6A:E6:3D:71:38:77:D1:E7:69:40:D2:1D:5D:30:7C:40`
  - (Y posiblemente `BC:0C:2C:C3:68:D1:50:C3:7E:07:17:EE:49:8F:D0:35:7D:0F:1E:E3`)

**Si tiene estos datos**: ✅ El proyecto correcto está bien configurado

## 📋 Verificación 2: Google Cloud Console - Otros Proyectos

### Paso 1: Revisar Otros Proyectos

Para cada proyecto en tu lista (excepto `amva-auth`):

1. Selecciona el proyecto desde el selector
2. Ve a: **APIs & Services** → **Credentials**
3. Busca clientes OAuth 2.0 de tipo **Android**
4. Verifica que **NO tengan**:
   - Package name: `org.vidaabundante.app`
   - SHA-1: `4B:24:0F:1B:6A:E6:3D:71:38:77:D1:E7:69:40:D2:1D:5D:30:7C:40`

**Si NO encuentras ningún cliente con esa combinación**: ✅ El duplicado fue eliminado

## 📋 Verificación 3: Firebase Console

### Paso 1: Abrir Firebase

1. Ve a: https://console.firebase.google.com/project/amva-auth/settings/general
2. Ve a **"Your apps"** → Selecciona la app Android

### Paso 2: Intentar Agregar SHA-1

1. Busca la sección **"SHA certificate fingerprints"**
2. Intenta agregar el SHA-1: `4B:24:0F:1B:6A:E6:3D:71:38:77:D1:E7:69:40:D2:1D:5D:30:7C:40`
3. Haz clic en **"Add fingerprint"** o **"Agregar huella digital"**

### Paso 3: Verificar Resultado

**Si NO aparece el error**: ✅ El cliente duplicado fue eliminado correctamente

**Si aún aparece el error**: ⚠️ Puede ser que:
- El cliente duplicado aún existe en otro proyecto
- Necesitas esperar más tiempo (hasta 30 minutos)
- Hay un problema de caché

## 📋 Verificación 4: Verificar en google-services.json

### Paso 1: Verificar Archivo Local

El archivo `amva-mobile/android/app/google-services.json` debe tener:

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
    }
  ]
}
```

**Si tiene esta configuración**: ✅ El archivo está correcto

## ✅ Checklist de Verificación

### Google Cloud Console

- [ ] Proyecto `amva-auth` tiene el cliente Android configurado
- [ ] Cliente tiene package name: `org.vidaabundante.app`
- [ ] Cliente tiene SHA-1: `4B:24:0F...`
- [ ] Otros proyectos NO tienen cliente con esa combinación

### Firebase Console

- [ ] Puedo agregar el SHA-1 sin error
- [ ] No aparece el mensaje de cliente duplicado
- [ ] SHA-1 aparece en la lista de fingerprints

### Archivo Local

- [ ] `google-services.json` tiene el cliente correcto
- [ ] `google-services.json` tiene ambos SHA-1 configurados

## 🎯 Resultado Esperado

Si todas las verificaciones pasan:

- ✅ El cliente duplicado fue eliminado
- ✅ Solo `amva-auth` tiene esa combinación SHA-1 + package name
- ✅ Firebase acepta el SHA-1 sin errores
- ✅ Google OAuth debería funcionar correctamente

## ⚠️ Si Aún Aparece el Error

### Opción 1: Esperar Más Tiempo

1. Espera **30 minutos** después de eliminar
2. Vuelve a intentar en Firebase
3. Google puede tardar en sincronizar

### Opción 2: Verificar Todos los Proyectos Nuevamente

1. Revisa **todos** los proyectos una vez más
2. Busca cualquier cliente Android con esa combinación
3. Elimínalo si lo encuentras

### Opción 3: Limpiar Caché

1. Cierra y vuelve a abrir el navegador
2. O usa modo incógnito
3. Vuelve a intentar en Firebase

## 📝 Próximos Pasos

Una vez verificado que todo está correcto:

1. ✅ Descarga el APK: https://expo.dev/artifacts/eas/aXpxxM3bqffGfC1wgryc1D.apk
2. ✅ Instálalo en tu teléfono
3. ✅ Prueba Google OAuth
4. ✅ Debería funcionar correctamente

