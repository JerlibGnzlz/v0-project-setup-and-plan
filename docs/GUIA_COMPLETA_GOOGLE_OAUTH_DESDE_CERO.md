# 🚀 Guía Completa: Configurar Google OAuth desde Cero

## 🎯 Objetivo

Configurar Google OAuth para que funcione correctamente en tu app Android, empezando desde cero.

## 📋 Requisitos Previos

- ✅ Proyecto Firebase creado (`amva-digital`)
- ✅ App Android registrada en Firebase
- ✅ Package name: `org.vidaabundante.app`
- ✅ SHA-1 del keystore: `4B:24:0F:1B:6A:E6:3D:71:38:77:D1:E7:69:40:D2:1D:5D:30:7C:40`

## 🔧 Paso 1: Verificar y Limpiar Configuración Actual

### 1.1. Verificar Proyectos

1. **Firebase Console**:
   - Ve a: https://console.firebase.google.com/
   - Verifica que tengas el proyecto `amva-digital`
   - Anota el **Project ID** y **Project Number**

2. **Google Cloud Console**:
   - Ve a: https://console.cloud.google.com/
   - Verifica que tengas el proyecto vinculado a Firebase
   - Debe ser el mismo proyecto que Firebase

### 1.2. Eliminar Clientes OAuth Duplicados

1. **En Google Cloud Console**:
   - Ve a: https://console.cloud.google.com/apis/credentials
   - Revisa **todos** tus proyectos
   - Busca clientes OAuth 2.0 de tipo **Android**
   - Elimina cualquier cliente que tenga:
     - Package name: `org.vidaabundante.app`
     - SHA-1: `4B:24:0F:1B:6A:E6:3D:71:38:77:D1:E7:69:40:D2:1D:5D:30:7C:40`
   - **EXCEPTO** el del proyecto correcto (`amva-digital`)

## 🔧 Paso 2: Configurar OAuth Consent Screen

### 2.1. Abrir OAuth Consent Screen

1. Ve a: https://console.cloud.google.com/apis/credentials/consent?project=amva-digital
2. O desde Google Cloud Console: **APIs & Services** → **OAuth consent screen**

### 2.2. Configurar Información Básica

1. **User Type**: Selecciona "External" (si es para usuarios externos)
2. **App name**: `AMVA Móvil`
3. **User support email**: Tu email
4. **Developer contact information**: Tu email
5. Haz clic en **"Save and Continue"**

### 2.3. Configurar Scopes

1. En la sección "Scopes", haz clic en **"Add or Remove Scopes"**
2. Selecciona los scopes necesarios:
   - `email`
   - `profile`
   - `openid`
3. Haz clic en **"Update"** y luego **"Save and Continue"**

### 2.4. Agregar Test Users (Opcional)

1. Si la app está en modo "Testing", agrega usuarios de prueba
2. Haz clic en **"Save and Continue"**

### 2.5. Publicar OAuth Consent Screen

1. Revisa el resumen
2. Haz clic en **"Back to Dashboard"**
3. En la parte superior, haz clic en **"PUBLISH APP"**
4. Confirma la publicación

**⚠️ IMPORTANTE**: El OAuth Consent Screen debe estar **PUBLICADO** para que funcione en producción.

## 🔧 Paso 3: Habilitar Google Sign-In API

### 3.1. Abrir API Library

1. Ve a: https://console.cloud.google.com/apis/library?project=amva-digital
2. O desde Google Cloud Console: **APIs & Services** → **Library**

### 3.2. Buscar y Habilitar Google Sign-In API

1. Busca: **"Google Sign-In API"**
2. Haz clic en el resultado
3. Haz clic en **"ENABLE"** (Habilitar)
4. Espera a que se habilite

## 🔧 Paso 4: Crear Cliente OAuth Android en Google Cloud Console

### 4.1. Abrir Credentials

1. Ve a: https://console.cloud.google.com/apis/credentials?project=amva-digital
2. O desde Google Cloud Console: **APIs & Services** → **Credentials**

### 4.2. Crear Cliente OAuth Android

1. Haz clic en **"+ CREATE CREDENTIALS"** (Crear credenciales)
2. Selecciona **"OAuth client ID"**
3. Si es la primera vez, configura OAuth Consent Screen primero (Paso 2)
4. Selecciona **"Application type"**: **Android**
5. Completa los campos:
   - **Name**: `AMVA Android Client`
   - **Package name**: `org.vidaabundante.app`
   - **SHA-1 certificate fingerprint**: `4B:24:0F:1B:6A:E6:3D:71:38:77:D1:E7:69:40:D2:1D:5D:30:7C:40`
6. Haz clic en **"CREATE"** (Crear)

### 4.3. Anotar Client ID

1. Se mostrará un popup con el **Client ID**
2. Anota el Client ID (ejemplo: `378853205278-c2e1gcjn06mg857rcvprns01fu8pduat`)
3. Haz clic en **"OK"**

## 🔧 Paso 5: Configurar SHA-1 en Firebase Console

### 5.1. Abrir Firebase Console

1. Ve a: https://console.firebase.google.com/project/amva-digital/settings/general
2. Ve a **"Your apps"** → Selecciona la app Android

### 5.2. Agregar SHA-1 Fingerprint

1. Busca la sección **"SHA certificate fingerprints"**
2. Haz clic en **"Add fingerprint"** (Agregar huella digital)
3. Agrega el SHA-1: `4B:24:0F:1B:6A:E6:3D:71:38:77:D1:E7:69:40:D2:1D:5D:30:7C:40`
4. Haz clic en **"Save"** (Guardar)

**⚠️ NOTA**: Si aparece error de cliente duplicado, significa que ya existe un cliente OAuth con esa combinación. Elimínalo primero (Paso 1.2).

### 5.3. Descargar google-services.json Actualizado

1. En la misma página, busca **"SDK setup and configuration"**
2. Haz clic en **"Download google-services.json"**
3. Descarga el archivo
4. Reemplaza el archivo en tu proyecto: `amva-mobile/android/app/google-services.json`

## 🔧 Paso 6: Verificar Configuración

### 6.1. Verificar en Google Cloud Console

1. Ve a: https://console.cloud.google.com/apis/credentials?project=amva-digital
2. Busca el cliente Android que creaste
3. Verifica que tenga:
   - ✅ Package name: `org.vidaabundante.app`
   - ✅ SHA-1: `4B:24:0F:1B:6A:E6:3D:71:38:77:D1:E7:69:40:D2:1D:5D:30:7C:40`

### 6.2. Verificar en Firebase Console

1. Ve a: https://console.firebase.google.com/project/amva-digital/settings/general
2. Ve a **"Your apps"** → Selecciona app Android
3. Verifica que el SHA-1 aparezca en la lista de fingerprints

### 6.3. Verificar google-services.json

1. Abre: `amva-mobile/android/app/google-services.json`
2. Verifica que tenga:
   - ✅ `package_name`: `org.vidaabundante.app`
   - ✅ `certificate_hash`: Debe incluir `4B:24:0F:1B:6A:E6:3D:71:38:77:D1:E7:69:40:D2:1D:5D:30:7C:40`

## 🔧 Paso 7: Configurar en el Código de la App

### 7.1. Verificar app.json

Abre `amva-mobile/app.json` y verifica:

```json
{
  "expo": {
    "android": {
      "package": "org.vidaabundante.app",
      "googleServicesFile": "./android/app/google-services.json"
    },
    "extra": {
      "googleAndroidClientId": "378853205278-c2e1gcjn06mg857rcvprns01fu8pduat.apps.googleusercontent.com"
    }
  }
}
```

### 7.2. Verificar build.gradle

Abre `amva-mobile/android/app/build.gradle` y verifica:

```gradle
android {
    namespace 'org.vidaabundante.app'
    defaultConfig {
        applicationId 'org.vidaabundante.app'
    }
}

apply plugin: 'com.google.gms.google-services'
```

## 🔧 Paso 8: Esperar Propagación

1. **Espera 30 minutos** después de configurar todo
2. Google necesita tiempo para propagar los cambios
3. Mientras tanto, puedes verificar que todo esté configurado correctamente

## 🔧 Paso 9: Crear Build y Probar

### 9.1. Crear Build

```bash
cd amva-mobile
eas build --platform android --profile preview
```

O usa el build existente:
- APK: https://expo.dev/artifacts/eas/aXpxxM3bqffGfC1wgryc1D.apk

### 9.2. Instalar en Teléfono

1. Descarga el APK
2. Transfiérelo a tu teléfono
3. Instálalo (permite instalación desde fuentes desconocidas si es necesario)

### 9.3. Probar Google OAuth

1. Abre la app en tu teléfono
2. Ve a la pantalla de login
3. Haz clic en "Iniciar sesión con Google"
4. Selecciona tu cuenta de Google
5. Autoriza la app

## ✅ Checklist Completo

### Configuración Inicial

- [ ] Proyecto Firebase creado (`amva-digital`)
- [ ] App Android registrada en Firebase
- [ ] Clientes OAuth duplicados eliminados

### OAuth Consent Screen

- [ ] OAuth Consent Screen configurado
- [ ] Información básica completada
- [ ] Scopes agregados (email, profile, openid)
- [ ] OAuth Consent Screen publicado

### Google Sign-In API

- [ ] Google Sign-In API habilitada

### Cliente OAuth Android

- [ ] Cliente OAuth Android creado en Google Cloud Console
- [ ] Package name configurado: `org.vidaabundante.app`
- [ ] SHA-1 agregado: `4B:24:0F:1B:6A:E6:3D:71:38:77:D1:E7:69:40:D2:1D:5D:30:7C:40`
- [ ] Client ID anotado

### Firebase Console

- [ ] SHA-1 agregado en Firebase Console
- [ ] `google-services.json` descargado y actualizado
- [ ] SHA-1 aparece en la lista de fingerprints

### Verificación

- [ ] Cliente OAuth verificado en Google Cloud Console
- [ ] SHA-1 verificado en Firebase Console
- [ ] `google-services.json` verificado localmente
- [ ] `app.json` verificado
- [ ] `build.gradle` verificado

### Build y Prueba

- [ ] Build creado o APK descargado
- [ ] APK instalado en teléfono
- [ ] Google OAuth probado
- [ ] Google OAuth funcionando correctamente

## 🎯 Resumen de URLs Importantes

- **Firebase Console**: https://console.firebase.google.com/project/amva-digital
- **Google Cloud Console**: https://console.cloud.google.com/?project=amva-digital
- **OAuth Consent Screen**: https://console.cloud.google.com/apis/credentials/consent?project=amva-digital
- **Credentials**: https://console.cloud.google.com/apis/credentials?project=amva-digital
- **API Library**: https://console.cloud.google.com/apis/library?project=amva-digital

## ⚠️ Problemas Comunes y Soluciones

### Error: "Cliente duplicado"

**Causa**: Hay múltiples clientes OAuth con el mismo SHA-1 y package name.

**Solución**: Elimina los clientes duplicados en otros proyectos (Paso 1.2).

### Error: "OAuth Consent Screen no publicado"

**Causa**: El OAuth Consent Screen está en modo "Testing".

**Solución**: Publica el OAuth Consent Screen (Paso 2.5).

### Error: "Google Sign-In API no habilitada"

**Causa**: La API no está habilitada en el proyecto.

**Solución**: Habilita Google Sign-In API (Paso 3).

### Google OAuth no funciona después de configurar

**Causa**: Los cambios no se han propagado.

**Solución**: Espera 30 minutos y vuelve a intentar (Paso 8).

## 🎉 Resultado Final

Después de seguir todos los pasos:

- ✅ Google OAuth configurado correctamente
- ✅ Cliente OAuth Android creado
- ✅ SHA-1 configurado en Firebase y Google Cloud
- ✅ OAuth Consent Screen publicado
- ✅ Google Sign-In API habilitada
- ✅ App lista para usar Google OAuth

## 📝 Notas Importantes

1. **Un solo proyecto**: Usa el mismo proyecto en Firebase y Google Cloud Console
2. **Un solo cliente**: Solo debe haber un cliente OAuth Android con esa combinación SHA-1 + package name
3. **Propagación**: Los cambios pueden tardar hasta 30 minutos en propagarse
4. **OAuth Consent Screen**: Debe estar publicado para producción

## 🚀 Siguiente Paso

Una vez completados todos los pasos:

1. ✅ Espera 30 minutos para propagación
2. ✅ Descarga el APK o crea un nuevo build
3. ✅ Instala en tu teléfono
4. ✅ Prueba Google OAuth
5. ✅ Debería funcionar correctamente

