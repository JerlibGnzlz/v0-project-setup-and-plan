# Opciones de Google OAuth para React Native

## Comparación de Librerías

### 1. **expo-auth-session/providers/google** (Actual)
**Estado**: ✅ Actualmente en uso

#### Ventajas:
- ✅ Integrado con Expo (no requiere configuración nativa adicional)
- ✅ Funciona con Expo Go y desarrollo managed
- ✅ API simple con hooks (`useIdTokenAuthRequest`)
- ✅ No requiere ejectar de Expo
- ✅ Funciona en desarrollo sin build nativo

#### Desventajas:
- ⚠️ Depende de Expo (puede ser limitante si necesitas más control)
- ⚠️ Menos opciones de personalización
- ⚠️ Puede tener limitaciones en producción avanzada

#### Uso Actual:
```typescript
import * as Google from 'expo-auth-session/providers/google'

const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
  clientId: googleClientId,
})
```

---

### 2. **@react-native-google-signin/google-signin** (Nativa Recomendada)
**Estado**: ⭐ Recomendada para producción

#### Ventajas:
- ✅ **100% Nativa**: Usa SDKs oficiales de Google (Android + iOS)
- ✅ **Mejor rendimiento**: Integración directa con sistemas nativos
- ✅ **Más funciones**: Acceso offline, revocación de tokens, etc.
- ✅ **Mejor UX**: UI nativa de Google (más familiar para usuarios)
- ✅ **Más control**: Configuración granular de permisos
- ✅ **Producción-ready**: Usada por miles de apps en producción
- ✅ **Mantenimiento activo**: Comunidad grande y actualizaciones frecuentes

#### Desventajas:
- ⚠️ Requiere configuración nativa (Android + iOS)
- ⚠️ No funciona con Expo Go (necesitas build nativo)
- ⚠️ Requiere ejectar o usar Expo Development Build
- ⚠️ Configuración más compleja inicialmente

#### Uso:
```typescript
import { GoogleSignin } from '@react-native-google-signin/google-signin'

// Configurar
GoogleSignin.configure({
  webClientId: 'TU_WEB_CLIENT_ID',
  offlineAccess: true,
})

// Login
const signIn = async () => {
  try {
    await GoogleSignin.hasPlayServices()
    const userInfo = await GoogleSignin.signIn()
    const idToken = userInfo.data?.idToken
    // Enviar idToken al backend
  } catch (error) {
    console.error(error)
  }
}
```

---

## Recomendación

### Para tu caso (Expo Managed):

**Opción A: Mantener expo-auth-session** (Actual)
- ✅ Si funciona bien y no necesitas funciones avanzadas
- ✅ Si quieres mantener simplicidad
- ✅ Si no planeas ejectar de Expo

**Opción B: Migrar a @react-native-google-signin** (Recomendado para producción)
- ✅ Si necesitas mejor rendimiento y UX
- ✅ Si planeas hacer builds nativos
- ✅ Si necesitas funciones avanzadas (offline, revocación, etc.)
- ✅ Si quieres la mejor experiencia nativa

---

## Migración a @react-native-google-signin/google-signin

### Paso 1: Instalación

```bash
npm install @react-native-google-signin/google-signin
```

### Paso 2: Configuración Android

1. **app.json**:
```json
{
  "expo": {
    "android": {
      "googleServicesFile": "./google-services.json"
    }
  }
}
```

2. **android/app/build.gradle**:
```gradle
apply plugin: 'com.google.gms.google-services'
```

### Paso 3: Configuración iOS

1. **app.json**:
```json
{
  "expo": {
    "ios": {
      "googleServicesFile": "./GoogleService-Info.plist"
    }
  }
}
```

### Paso 4: Código

```typescript
// hooks/useGoogleAuth.ts
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin'
import { Platform } from 'react-native'

export const useGoogleAuth = () => {
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Configurar Google Sign-In
    GoogleSignin.configure({
      webClientId: 'TU_WEB_CLIENT_ID', // Mismo que en backend
      offlineAccess: true,
      forceCodeForRefreshToken: true,
    })
  }, [])

  const signIn = async (): Promise<string> => {
    try {
      setLoading(true)
      
      // Verificar que Google Play Services esté disponible (Android)
      if (Platform.OS === 'android') {
        await GoogleSignin.hasPlayServices()
      }

      // Iniciar sesión
      const userInfo = await GoogleSignin.signIn()
      
      if (!userInfo.data?.idToken) {
        throw new Error('No se recibió el token de Google')
      }

      return userInfo.data.idToken
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'code' in error) {
        const googleError = error as { code: string }
        
        switch (googleError.code) {
          case statusCodes.SIGN_IN_CANCELLED:
            throw new Error('El usuario canceló el inicio de sesión')
          case statusCodes.IN_PROGRESS:
            throw new Error('Ya hay una operación en progreso')
          case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
            throw new Error('Google Play Services no está disponible')
          default:
            throw new Error('Error desconocido al iniciar sesión con Google')
        }
      }
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      await GoogleSignin.signOut()
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
    }
  }

  return { signIn, signOut, loading }
}
```

### Paso 5: Uso en LoginScreen

```typescript
import { useGoogleAuth } from '@hooks/useGoogleAuth'

const { signIn, loading: googleLoading } = useGoogleAuth()

const handleGoogleLogin = async () => {
  try {
    const idToken = await signIn()
    await loginWithGoogle(idToken)
  } catch (error) {
    Alert.alert('Error', error.message)
  }
}
```

---

## Comparación Técnica

| Característica | expo-auth-session | @react-native-google-signin |
|----------------|-------------------|----------------------------|
| **Nativo** | ❌ No (usa WebView) | ✅ Sí (SDK nativo) |
| **Rendimiento** | ⚠️ Medio | ✅ Excelente |
| **UX** | ⚠️ WebView | ✅ UI nativa |
| **Configuración** | ✅ Simple | ⚠️ Compleja |
| **Expo Go** | ✅ Funciona | ❌ No funciona |
| **Producción** | ⚠️ Bueno | ✅ Excelente |
| **Mantenimiento** | ✅ Expo mantiene | ✅ Comunidad activa |
| **Funciones** | ⚠️ Básicas | ✅ Avanzadas |

---

## Decisión Final

### Mantener expo-auth-session si:
- ✅ Tu app funciona bien actualmente
- ✅ No necesitas funciones avanzadas
- ✅ Quieres mantener simplicidad
- ✅ Estás usando Expo managed workflow

### Migrar a @react-native-google-signin si:
- ✅ Necesitas mejor rendimiento
- ✅ Quieres UX nativa mejorada
- ✅ Planeas hacer builds nativos
- ✅ Necesitas funciones avanzadas
- ✅ Estás en producción y quieres lo mejor

---

## Conclusión

**Para tu proyecto actual**: `expo-auth-session` es suficiente y funciona bien.

**Para producción a largo plazo**: Considera migrar a `@react-native-google-signin/google-signin` para mejor rendimiento y UX nativa.

¿Quieres que te ayude a migrar a la solución nativa?

