# 📱 Crear Nuevo APK para Instalar en el Teléfono

## 🎯 Objetivo

Crear un nuevo APK usando EAS Build para instalar en tu teléfono y probar Google OAuth.

## ✅ Método 1: Build de Producción (Recomendado)

### Paso 1: Navegar al Directorio del Proyecto

```bash
cd amva-mobile
```

### Paso 2: Crear Build de Producción

```bash
eas build --platform android --profile production
```

**Opciones:**
- `--platform android`: Solo Android
- `--profile production`: Perfil de producción (usa keystore de producción)

### Paso 3: Seguir las Instrucciones

EAS te preguntará:
1. **¿Quieres crear un nuevo build?** → Sí
2. **¿Qué tipo de build?** → APK (para instalar directamente)
3. **¿Qué profile?** → production

### Paso 4: Esperar el Build

- El build tomará aproximadamente **10-15 minutos**
- Verás el progreso en la terminal
- También puedes verlo en: https://expo.dev/accounts/jerlibgnzlz/projects/amva-movil/builds

### Paso 5: Descargar el APK

Una vez completado:
1. EAS te mostrará un enlace para descargar el APK
2. O ve a: https://expo.dev/accounts/jerlibgnzlz/projects/amva-movil/builds
3. Haz clic en el build más reciente
4. Descarga el APK desde la página de detalles

## ✅ Método 2: Build de Preview (Más Rápido)

Si quieres un build más rápido para pruebas:

```bash
cd amva-mobile
eas build --platform android --profile preview
```

**Ventajas:**
- ✅ Más rápido (menos optimizaciones)
- ✅ Útil para pruebas rápidas
- ✅ Mismo keystore que producción (probablemente)

**Desventajas:**
- ⚠️ No optimizado para producción
- ⚠️ Tamaño del APK puede ser mayor

## ✅ Método 3: Build Local (Requiere Android SDK)

Si tienes Android SDK instalado y quieres un build local:

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

**Ventajas:**
- ✅ Más rápido (no esperas en cola de EAS)
- ✅ No consume cuota de EAS

**Desventajas:**
- ❌ Requiere Android SDK instalado
- ❌ Requiere configurar keystore local
- ❌ Más complejo

## 📋 Comandos Completos

### Build de Producción (APK)

```bash
cd amva-mobile
eas build --platform android --profile production --type apk
```

### Build de Preview (APK)

```bash
cd amva-mobile
eas build --platform android --profile preview --type apk
```

### Build de Producción (AAB para Play Store)

```bash
cd amva-mobile
eas build --platform android --profile production --type app-bundle
```

## 🔍 Verificar Estado del Build

### En la Terminal

El comando `eas build` mostrará el progreso en tiempo real.

### En el Navegador

1. Ve a: https://expo.dev/accounts/jerlibgnzlz/projects/amva-movil/builds
2. Verás todos tus builds
3. El más reciente aparecerá primero
4. Haz clic para ver detalles y descargar

## 📥 Instalar el APK en el Teléfono

### Método 1: Descargar Directamente

1. **Descarga el APK** desde EAS Dashboard o el enlace que te proporciona EAS
2. **Transfiere al teléfono**:
   - Por USB
   - Por email
   - Por Google Drive/Dropbox
   - Por WhatsApp/Telegram
3. **Abre el APK** en el teléfono
4. **Permite instalación** desde fuentes desconocidas si es necesario
5. **Instala** el APK

### Método 2: Usar QR Code

1. **En EAS Dashboard**, cuando el build termine, verás un **QR code**
2. **Escanea el QR** con tu teléfono
3. **Descarga** el APK directamente
4. **Instala** el APK

### Método 3: Usar ADB (Si Tienes USB Debugging)

```bash
# Conectar teléfono por USB con USB debugging habilitado
adb install path/to/app.apk
```

## ⚙️ Configuración del Build

### Verificar eas.json

Tu `eas.json` debería tener algo como:

```json
{
  "build": {
    "production": {
      "android": {
        "buildType": "apk"
      }
    },
    "preview": {
      "android": {
        "buildType": "apk"
      }
    }
  }
}
```

### Verificar app.json

Tu `app.json` debería tener:

```json
{
  "expo": {
    "android": {
      "package": "org.vidaabundante.app",
      "versionCode": 1
    }
  }
}
```

## 🎯 Recomendación para Tu Caso

### Después de Resolver el Cliente OAuth Duplicado

1. **Espera 5-10 minutos** después de eliminar el cliente duplicado
2. **Crea un nuevo build**:
   ```bash
   cd amva-mobile
   eas build --platform android --profile production --type apk
   ```
3. **Espera** a que termine (10-15 minutos)
4. **Descarga el APK**
5. **Instálalo** en tu teléfono
6. **Prueba Google OAuth**

## 📋 Checklist para Crear APK

- [ ] Navegar a `amva-mobile`
- [ ] Ejecutar `eas build --platform android --profile production --type apk`
- [ ] Esperar a que termine el build
- [ ] Descargar el APK desde EAS Dashboard
- [ ] Transferir APK al teléfono
- [ ] Permitir instalación desde fuentes desconocidas
- [ ] Instalar el APK
- [ ] Probar Google OAuth

## ⚠️ Notas Importantes

### Versión del APK

- Cada build incrementa automáticamente el `versionCode`
- El `versionName` viene de `app.json` → `version`

### Keystore

- El build de producción usa el keystore `ZeEnL0LIUD` (default)
- SHA-1: `4B:24:0F:1B:6A:E6:3D:71:38:77:D1:E7:69:40:D2:1D:5D:30:7C:40`
- Este SHA-1 debe estar configurado en Google Cloud Console

### Tamaño del APK

- Build de producción: ~30-50 MB (optimizado)
- Build de preview: ~40-60 MB (menos optimizado)

## 🎉 Resultado Esperado

Después de crear el APK:

1. ✅ APK descargado y listo para instalar
2. ✅ Instalado en tu teléfono
3. ✅ Google OAuth funcionando (después de resolver el cliente duplicado)

## 📝 Próximos Pasos

1. **Resolver el cliente OAuth duplicado** (paso anterior)
2. **Crear nuevo build** con el comando arriba
3. **Instalar en teléfono**
4. **Probar Google OAuth**

