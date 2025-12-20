# 🚀 Configuración para Producción

## 1. Variables de Entorno

### Configurar en EAS Secrets

```bash
# Instalar EAS CLI
npm install -g eas-cli

# Login
eas login

# Configurar variables de entorno
eas secret:create --scope project --name EXPO_PUBLIC_API_URL --value https://ministerio-backend-wdbj.onrender.com/api
eas secret:create --scope project --name EXPO_PUBLIC_GOOGLE_CLIENT_ID --value 378853205278-slllh10l32onum338rg1776g8itekvco.apps.googleusercontent.com
```

### Variables Requeridas

- `EXPO_PUBLIC_API_URL`: URL del backend de producción
- `EXPO_PUBLIC_GOOGLE_CLIENT_ID`: Client ID de Google OAuth (ya configurado en app.json)

### Variables Opcionales

- `SENTRY_DSN`: Para crash reporting (si usas Sentry)
- Variables de Firebase (si configuras notificaciones push)

## 2. Generar Keystore de Producción

### Paso 1: Generar Keystore

```bash
cd android/app
keytool -genkeypair -v -storetype PKCS12 -keystore amva-release-key.keystore -alias amva-key-alias -keyalg RSA -keysize 2048 -validity 10000
```

**IMPORTANTE**: 
- Guarda la contraseña en un lugar seguro
- NO commitear el keystore al repositorio
- Guarda múltiples backups del keystore

### Paso 2: Configurar en gradle.properties

Agregar en `android/gradle.properties`:

```properties
MYAPP_RELEASE_STORE_FILE=amva-release-key.keystore
MYAPP_RELEASE_KEY_ALIAS=amva-key-alias
MYAPP_RELEASE_STORE_PASSWORD=tu-password-seguro
MYAPP_RELEASE_KEY_PASSWORD=tu-password-seguro
```

**IMPORTANTE**: Agregar `gradle.properties` al `.gitignore` si contiene contraseñas.

### Paso 3: Actualizar build.gradle

Ya está configurado en `android/app/build.gradle`. Solo necesitas descomentar las líneas del keystore de producción cuando tengas el keystore generado.

## 3. Configurar Firebase (Notificaciones Push)

### Paso 1: Crear Proyecto en Firebase

1. Ir a [Firebase Console](https://console.firebase.google.com/)
2. Crear nuevo proyecto o usar existente
3. Agregar app Android:
   - Package name: `org.vidaabundante.app`
   - App nickname: "AMVA Móvil"
   - SHA-1: Obtener con `keytool -list -v -keystore android/app/debug.keystore -alias androiddebugkey` (para debug) o del keystore de producción

### Paso 2: Descargar google-services.json

1. Descargar `google-services.json` desde Firebase Console
2. Colocar en `android/app/google-services.json`

### Paso 3: Configurar FCM en Expo

Seguir la guía: https://docs.expo.dev/push-notifications/fcm-credentials/

```bash
# Obtener credenciales de Firebase
eas credentials

# O subir manualmente las credenciales
eas credentials:configure
```

## 4. Build de Producción

### Opción 1: EAS Build (Recomendado)

```bash
# Build para Android
eas build --platform android --profile production

# Build para iOS (si aplica)
eas build --platform ios --profile production
```

### Opción 2: Build Local

```bash
# Android
cd android
./gradlew bundleRelease

# El AAB estará en: android/app/build/outputs/bundle/release/app-release.aab
```

## 5. Versioning

### Actualizar Versión

En `app.json`:
```json
{
  "expo": {
    "version": "1.0.0",  // VersionName (visible para usuarios)
    "android": {
      "versionCode": 1   // VersionCode (debe incrementarse en cada release)
    }
  }
}
```

**Reglas**:
- `versionCode` debe incrementarse en cada release (1, 2, 3, ...)
- `versionName` puede ser cualquier string (ej: "1.0.0", "1.0.1", "2.0.0")
- No puedes decrementar `versionCode` en Play Store

## 6. Testing Pre-Producción

### Checklist de Testing

- [ ] Probar en dispositivo físico Android
- [ ] Probar login con Google
- [ ] Probar registro de usuarios
- [ ] Probar todas las funcionalidades principales
- [ ] Probar con conexión lenta/sin conexión
- [ ] Probar notificaciones push (si están configuradas)
- [ ] Verificar que no hay crashes
- [ ] Verificar que los logs no exponen información sensible

### Testing Interno

```bash
# Build para testing interno
eas build --platform android --profile preview

# O build de desarrollo
eas build --platform android --profile development
```

## 7. Optimizaciones

### Bundle Size

Verificar tamaño del bundle:
```bash
eas build --platform android --profile production --local
```

Optimizaciones aplicadas:
- ✅ ProGuard/R8 habilitado
- ✅ Resource shrinking habilitado
- ✅ Code minification habilitado
- ✅ PNG crunching habilitado

### Performance

- ✅ Lazy loading de componentes pesados
- ✅ Optimización de imágenes
- ✅ Code splitting automático de Expo

## 8. Monitoreo

### Crash Reporting (Recomendado)

#### Opción 1: Sentry

```bash
npm install @sentry/react-native
```

Configurar en `App.tsx`:
```typescript
import * as Sentry from '@sentry/react-native'

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: __DEV__ ? 'development' : 'production',
})
```

#### Opción 2: Firebase Crashlytics

Ya incluido si configuras Firebase para notificaciones push.

### Analytics (Opcional)

Firebase Analytics está disponible si configuras Firebase.

## 9. Seguridad

### Checklist de Seguridad

- [x] ProGuard/R8 configurado para ofuscar código
- [x] Variables de entorno para configuración sensible
- [x] `.env` en `.gitignore`
- [x] Keystore NO en repositorio
- [x] No hay tokens/secretos hardcodeados
- [x] HTTPS para todas las comunicaciones
- [x] Validación de inputs en frontend y backend

## 10. Despliegue

### Subir a Play Store

1. Crear build de producción: `eas build --platform android --profile production`
2. Descargar AAB desde EAS dashboard
3. Subir a Play Console:
   - Ir a [Play Console](https://play.google.com/console)
   - Seleccionar app
   - Ir a "Production" o "Testing"
   - Crear nueva release
   - Subir AAB
   - Completar release notes
   - Enviar para revisión

### Actualizaciones

Para actualizar la app:
1. Incrementar `versionCode` en `app.json`
2. Actualizar `version` si es necesario
3. Crear nuevo build: `eas build --platform android --profile production`
4. Subir nuevo AAB a Play Console

## 🔗 Recursos

- [EAS Build Docs](https://docs.expo.dev/build/introduction/)
- [Play Console](https://play.google.com/console)
- [Firebase Console](https://console.firebase.google.com/)
- [Sentry React Native](https://docs.sentry.io/platforms/react-native/)

