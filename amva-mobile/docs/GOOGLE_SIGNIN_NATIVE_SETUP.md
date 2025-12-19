# Configuración de Google Sign-In Nativo

## ✅ Migración Completada

Se ha migrado de `expo-auth-session` a `@react-native-google-signin/google-signin` para mejor rendimiento y UX nativa.

## 📋 Configuración Requerida

### 1. Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Selecciona tu proyecto
3. Ve a **APIs & Services** → **Credentials**
4. Asegúrate de tener configurado:
   - **OAuth 2.0 Client ID** para Web (usado como `webClientId`)
   - **OAuth 2.0 Client ID** para Android (si aplica)
   - **OAuth 2.0 Client ID** para iOS (si aplica)

### 2. Configuración Android

#### Opción A: Usando Expo (Recomendado para desarrollo)

El `app.json` ya está configurado con el `googleClientId`. Para producción:

1. **Genera un build de desarrollo**:
   ```bash
   npx expo prebuild
   ```

2. **Configura SHA-1** en Google Cloud Console:
   - Obtén tu SHA-1: `cd android && ./gradlew signingReport`
   - Agrega el SHA-1 en Google Cloud Console → Credentials → Tu Android Client ID

3. **Configura `google-services.json`** (si usas Firebase):
   - Descarga `google-services.json` de Firebase Console
   - Colócalo en `android/app/google-services.json`

#### Opción B: Configuración Manual (Producción)

1. **android/app/build.gradle**:
   ```gradle
   apply plugin: 'com.google.gms.google-services'
   ```

2. **android/build.gradle**:
   ```gradle
   dependencies {
     classpath 'com.google.gms:google-services:4.3.15'
   }
   ```

3. **android/app/src/main/AndroidManifest.xml**:
   ```xml
   <activity
     android:name="com.google.android.gms.common.api.GoogleApiActivity"
     android:exported="false"
     android:theme="@android:style/Theme.Translucent.NoTitleBar" />
   ```

### 3. Configuración iOS

#### Opción A: Usando Expo (Recomendado)

1. **Genera un build de desarrollo**:
   ```bash
   npx expo prebuild
   ```

2. **Configura URL Scheme** en `app.json`:
   ```json
   {
     "expo": {
       "ios": {
         "bundleIdentifier": "org.vidaabundante.app",
         "infoPlist": {
           "CFBundleURLTypes": [
             {
               "CFBundleURLSchemes": ["org.vidaabundante.app"]
             }
           ]
         }
       }
     }
   }
   ```

3. **Configura `GoogleService-Info.plist`** (si usas Firebase):
   - Descarga `GoogleService-Info.plist` de Firebase Console
   - Colócalo en `ios/GoogleService-Info.plist`

#### Opción B: Configuración Manual (Producción)

1. **ios/Podfile**:
   ```ruby
   pod 'GoogleSignIn'
   ```

2. **Ejecuta**:
   ```bash
   cd ios && pod install
   ```

3. **ios/AMVA_Movil/Info.plist**:
   ```xml
   <key>CFBundleURLTypes</key>
   <array>
     <dict>
       <key>CFBundleURLSchemes</key>
       <array>
         <string>org.vidaabundante.app</string>
       </array>
     </dict>
   </array>
   ```

## 🔧 Variables de Entorno

### `.env` en `amva-mobile/`:

```env
EXPO_PUBLIC_GOOGLE_CLIENT_ID=378853205278-slllh10l32onum338rg1776g8itekvco.apps.googleusercontent.com
```

### `app.json`:

```json
{
  "expo": {
    "extra": {
      "googleClientId": "378853205278-slllh10l32onum338rg1776g8itekvco.apps.googleusercontent.com"
    }
  }
}
```

**IMPORTANTE**: El `webClientId` debe ser el mismo que `GOOGLE_CLIENT_ID` en el backend.

## 🚀 Uso

El hook `useGoogleAuth` ya está integrado en:
- ✅ `LoginScreen.tsx`
- ✅ `Step1Auth.tsx`

### Ejemplo de uso:

```typescript
import { useGoogleAuth } from '@hooks/useGoogleAuth'

const { signIn, loading, error } = useGoogleAuth()

const handleGoogleLogin = async () => {
  try {
    const idToken = await signIn()
    // Enviar idToken al backend
    await loginWithGoogle(idToken)
  } catch (error) {
    // Manejar error
  }
}
```

## 🐛 Troubleshooting

### Error: "Google Play Services not available"
- **Android**: Asegúrate de tener Google Play Services instalado
- **Emulador**: Usa un emulador con Google Play Services

### Error: "Sign in cancelled"
- El usuario canceló el inicio de sesión (no es un error crítico)

### Error: "Configuration error"
- Verifica que `webClientId` esté configurado correctamente
- Verifica que el Client ID en Google Cloud Console sea correcto

### Error: "Token invalid"
- Verifica que el `webClientId` coincida con el `GOOGLE_CLIENT_ID` del backend
- Verifica que el OAuth consent screen esté configurado correctamente

## 📝 Notas Importantes

1. **No funciona con Expo Go**: Necesitas hacer un build nativo (`expo prebuild` o `eas build`)
2. **SHA-1 requerido para Android**: Debes agregar el SHA-1 de tu keystore en Google Cloud Console
3. **URL Scheme requerido para iOS**: Debe coincidir con tu bundle identifier
4. **Mismo Client ID**: El `webClientId` debe ser el mismo que `GOOGLE_CLIENT_ID` en el backend

## 🔄 Diferencias con expo-auth-session

| Característica | expo-auth-session | @react-native-google-signin |
|----------------|-------------------|------------------------------|
| **Nativo** | ❌ No (WebView) | ✅ Sí (SDK oficial) |
| **Expo Go** | ✅ Funciona | ❌ No funciona |
| **Rendimiento** | ⚠️ Medio | ✅ Excelente |
| **UX** | ⚠️ WebView | ✅ UI nativa |
| **Configuración** | ✅ Simple | ⚠️ Requiere build nativo |

## ✅ Checklist de Migración

- [x] Instalar `@react-native-google-signin/google-signin`
- [x] Crear hook `useGoogleAuth`
- [x] Actualizar `LoginScreen.tsx`
- [x] Actualizar `Step1Auth.tsx`
- [ ] Configurar Android (requiere build nativo)
- [ ] Configurar iOS (requiere build nativo)
- [ ] Probar en dispositivo físico
- [ ] Probar en build de producción

## 📚 Referencias

- [Documentación oficial](https://react-native-google-signin.github.io/docs/install)
- [Google Sign-In para Android](https://developers.google.com/identity/sign-in/android)
- [Google Sign-In para iOS](https://developers.google.com/identity/sign-in/ios)

