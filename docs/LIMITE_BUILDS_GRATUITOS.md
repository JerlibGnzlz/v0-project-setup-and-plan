# ⚠️ Límite de Builds Gratuitos de EAS

## 📋 Situación Actual

Tu cuenta de EAS ha usado todos los builds gratuitos de Android este mes.

**Mensaje**: "This account has used its Android builds from the Free plan this month, which will reset in 4 days (on Thu Jan 01 2026)."

## ✅ Opciones Disponibles

### Opción 1: Esperar al Reset (4 días)

- ✅ **Gratis**
- ⏱️ **Espera**: 4 días (hasta el 1 de enero de 2026)
- ✅ Los builds gratuitos se resetearán automáticamente

### Opción 2: Usar Build Local (Si Tienes Android SDK)

Si tienes Android SDK instalado, puedes crear el APK localmente:

```bash
cd amva-mobile

# Generar proyecto nativo
npx expo prebuild --platform android

# Compilar APK
cd android
./gradlew assembleRelease

# El APK estará en:
# android/app/build/outputs/apk/release/app-release.apk
```

**Ventajas**:
- ✅ No consume cuota de EAS
- ✅ Más rápido (no esperas en cola)
- ✅ Gratis

**Desventajas**:
- ❌ Requiere Android SDK instalado
- ❌ Requiere configurar keystore local
- ⚠️ Más complejo

### Opción 3: Usar Build Existente

Puedes usar un build existente si tienes uno reciente:

1. Ve a: https://expo.dev/accounts/jerlibgnzlz/projects/amva-movil/builds
2. Busca un build reciente que funcione
3. Descarga el APK de ese build
4. Úsalo para probar Google OAuth

### Opción 4: Actualizar Plan (Si Necesitas Más Builds)

Si necesitas más builds inmediatamente:

1. Ve a: https://expo.dev/accounts/jerlibgnzlz/settings/billing
2. Actualiza tu plan para tener más builds
3. Crea el nuevo build

## 🎯 Recomendación

### Para Probar Google OAuth Ahora

**Opción más rápida**: Usar un build existente

1. Ve a: https://expo.dev/accounts/jerlibgnzlz/projects/amva-movil/builds
2. Busca el build más reciente (probablemente `509eaa2d-285d-474f-9a8a-c2d85488dc21`)
3. Descarga el APK
4. Instálalo en tu teléfono
5. Prueba Google OAuth

**Nota**: Después de resolver el cliente OAuth duplicado, este build debería funcionar con Google OAuth.

### Para Crear Nuevo Build

**Espera 4 días** hasta que se resetee el límite de builds gratuitos, o usa build local si tienes Android SDK.

## 📋 Checklist

- [ ] Resolver cliente OAuth duplicado en Google Cloud Console
- [ ] Usar build existente para probar Google OAuth
- [ ] Esperar 4 días para crear nuevo build (si es necesario)
- [ ] O configurar build local (si tienes Android SDK)

## ⚠️ Nota Importante

El build que intentamos crear **se subió correctamente** a EAS, pero falló por el límite de builds gratuitos. Una vez que se resetee el límite (en 4 días), podrás crear nuevos builds sin problemas.

## 🎉 Buenas Noticias

Aunque no puedas crear un nuevo build ahora, puedes:
- ✅ Usar un build existente para probar Google OAuth
- ✅ Resolver el cliente OAuth duplicado mientras esperas
- ✅ Crear un nuevo build en 4 días cuando se resetee el límite

