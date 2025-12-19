# Guía de Build Nativo para Google Sign-In

## ✅ Prebuild Completado

Los archivos nativos han sido generados exitosamente:
- ✅ `android/` - Proyecto Android generado
- ✅ `ios/` - Proyecto iOS generado (requiere macOS para build)

## 🔧 Configuración Android

### 1. Obtener SHA-1 (Requerido para Google Sign-In)

El SHA-1 es necesario para configurar Google Sign-In en Google Cloud Console.

#### Opción A: Usando el script (Linux/Mac)
```bash
cd amva-mobile
./scripts/get-sha1.sh
```

#### Opción B: Usando el script (Windows)
```powershell
cd amva-mobile
.\scripts\get-sha1.ps1
```

#### Opción C: Manual
```bash
cd amva-mobile/android
./gradlew signingReport
```

Busca la línea que dice `SHA1:` en la salida y copia el valor.

### 2. Configurar SHA-1 en Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Selecciona tu proyecto
3. Ve a **APIs & Services** → **Credentials**
4. Selecciona tu **Android OAuth 2.0 Client ID** (o créalo si no existe)
5. En **SHA-1 certificate fingerprint**, agrega el SHA-1 obtenido
6. Guarda los cambios

### 3. Configurar google-services.json (Opcional - Solo si usas Firebase)

Si usas Firebase para otras funciones:

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto
3. Ve a **Project Settings** → **Your apps**
4. Selecciona tu app Android o créala
5. Descarga `google-services.json`
6. Colócalo en `android/app/google-services.json`

**Nota**: Si no usas Firebase, puedes omitir este paso. Google Sign-In funciona sin Firebase.

### 4. Build de Desarrollo

```bash
cd amva-mobile

# Opción 1: Usar Expo CLI
npx expo run:android

# Opción 2: Usar Gradle directamente
cd android
./gradlew assembleDebug
```

### 5. Build de Producción

```bash
cd amva-mobile/android

# Generar APK de release
./gradlew assembleRelease

# O generar AAB (recomendado para Play Store)
./gradlew bundleRelease
```

**Importante**: Para producción, necesitas:
- Keystore de producción configurado
- SHA-1 del keystore de producción agregado en Google Cloud Console

## 🍎 Configuración iOS (Requiere macOS)

### 1. Instalar CocoaPods

```bash
cd amva-mobile/ios
pod install
```

### 2. Configurar URL Scheme

El URL Scheme ya está configurado en `app.json`:
```json
{
  "expo": {
    "ios": {
      "bundleIdentifier": "org.vidaabundante.app"
    }
  }
}
```

### 3. Configurar GoogleService-Info.plist (Opcional - Solo si usas Firebase)

Si usas Firebase:

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto
3. Ve a **Project Settings** → **Your apps**
4. Selecciona tu app iOS o créala
5. Descarga `GoogleService-Info.plist`
6. Colócalo en `ios/GoogleService-Info.plist`

### 4. Build de Desarrollo

```bash
cd amva-mobile

# Opción 1: Usar Expo CLI
npx expo run:ios

# Opción 2: Usar Xcode
open ios/AMVA_Movil.xcworkspace
```

## 🧪 Probar Google Sign-In

### En Emulador Android

1. **Asegúrate de usar un emulador con Google Play Services**:
   - En Android Studio, crea un emulador con Google APIs (no AOSP)
   - O usa un dispositivo físico con Google Play Services

2. **Ejecuta la app**:
   ```bash
   npx expo run:android
   ```

3. **Prueba el login con Google**:
   - Debería abrirse la UI nativa de Google
   - Selecciona una cuenta
   - La app debería recibir el token y autenticarse

### En Dispositivo Físico

1. **Habilita modo desarrollador** en tu dispositivo Android
2. **Conecta el dispositivo** vía USB
3. **Ejecuta**:
   ```bash
   npx expo run:android
   ```

## 🐛 Troubleshooting

### Error: "Google Play Services not available"

**Solución**:
- Usa un emulador con Google Play Services (no AOSP)
- O usa un dispositivo físico con Google Play Services instalado

### Error: "SHA-1 not configured"

**Solución**:
1. Obtén el SHA-1 usando `./scripts/get-sha1.sh`
2. Agrégalo en Google Cloud Console → Credentials → Android Client ID

### Error: "Sign in cancelled"

**Solución**:
- Esto no es un error, el usuario canceló el inicio de sesión
- Verifica que el OAuth consent screen esté configurado correctamente

### Error: "Configuration error"

**Solución**:
1. Verifica que `webClientId` en `useGoogleAuth.ts` coincida con `GOOGLE_CLIENT_ID` del backend
2. Verifica que el OAuth consent screen esté en "En producción"
3. Espera 5-15 minutos después de hacer cambios en Google Cloud Console

### Error: "Build failed"

**Solución**:
```bash
# Limpiar build
cd android
./gradlew clean

# Rebuild
cd ..
npx expo prebuild --clean
npx expo run:android
```

## ✅ Checklist de Configuración

### Android
- [x] Prebuild ejecutado
- [x] Google Services plugin agregado
- [ ] SHA-1 obtenido y configurado en Google Cloud Console
- [ ] Build de desarrollo probado
- [ ] Google Sign-In probado en emulador/dispositivo

### iOS (si aplica)
- [x] Prebuild ejecutado
- [ ] CocoaPods instalado (`pod install`)
- [ ] URL Scheme configurado
- [ ] Build de desarrollo probado
- [ ] Google Sign-In probado en simulador/dispositivo

## 📝 Notas Importantes

1. **No funciona con Expo Go**: Debes hacer un build nativo
2. **SHA-1 requerido**: Sin SHA-1 configurado, Google Sign-In no funcionará
3. **Google Play Services**: Requerido en Android (no funciona en emuladores AOSP)
4. **Mismo Client ID**: El `webClientId` debe ser el mismo que `GOOGLE_CLIENT_ID` en el backend

## 🚀 Próximos Pasos

1. Obtén el SHA-1 usando `./scripts/get-sha1.sh`
2. Configúralo en Google Cloud Console
3. Haz un build de desarrollo: `npx expo run:android`
4. Prueba Google Sign-In en un emulador/dispositivo con Google Play Services

## 📚 Referencias

- [Google Sign-In Android Setup](https://developers.google.com/identity/sign-in/android/start)
- [Expo Prebuild Documentation](https://docs.expo.dev/workflow/prebuild/)
- [React Native Google Sign-In](https://react-native-google-signin.github.io/docs/install)

