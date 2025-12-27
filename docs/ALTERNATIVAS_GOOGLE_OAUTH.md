# 🔄 Alternativas para Hacer que Google OAuth Funcione

## 🎯 Situación Actual

Estás usando `@react-native-google-signin/google-signin` que requiere:
- ✅ Cliente OAuth Android con SHA-1 configurado
- ✅ Configuración correcta en Google Cloud Console
- ✅ `google-services.json` actualizado

## ✅ Alternativa 1: Usar Web Client ID (Más Simple - Recomendado para Desarrollo)

### Ventajas

- ✅ **No requiere SHA-1** para funcionar
- ✅ Más fácil de configurar
- ✅ Funciona inmediatamente
- ✅ Útil para desarrollo y testing

### Desventajas

- ⚠️ Menos seguro que Android Client ID
- ⚠️ No recomendado para producción
- ⚠️ Puede tener limitaciones

### Cómo Implementar

#### Paso 1: Obtener Web Client ID

1. Ve a: https://console.cloud.google.com/apis/credentials?project=amva-auth
2. Busca el cliente OAuth de tipo **"Web application"**
3. Si no existe, créalo:
   - Haz clic en "+ CREATE CREDENTIALS" → "OAuth client ID"
   - Selecciona "Web application"
   - Nombre: `AMVA Web Client`
   - Authorized redirect URIs: Deja vacío o agrega `https://localhost`
   - Haz clic en "CREATE"
4. Copia el **Client ID** (ejemplo: `378853205278-slllh10l32onum338rg1776g8itekvco.apps.googleusercontent.com`)

#### Paso 2: Configurar en app.json

Abre `amva-mobile/app.json` y actualiza:

```json
{
  "expo": {
    "extra": {
      "googleClientId": "378853205278-slllh10l32onum338rg1776g8itekvco.apps.googleusercontent.com",
      "googleAndroidClientId": "378853205278-slllh10l32onum338rg1776g8itekvco.apps.googleusercontent.com"
    }
  }
}
```

**Nota**: Usa el **Web Client ID** en ambos campos temporalmente.

#### Paso 3: Actualizar useGoogleAuth.ts

El código ya está preparado para usar el Client ID desde `app.json`. Solo necesitas asegurarte de que el Web Client ID esté configurado.

#### Paso 4: Probar

1. Reinicia la app
2. Prueba Google OAuth
3. Debería funcionar sin necesidad de SHA-1

## ✅ Alternativa 2: Usar Expo AuthSession (Fallback)

Ya tienes `expo-auth-session` instalado. Puedes usarlo como alternativa.

### Ventajas

- ✅ Ya está instalado
- ✅ Funciona con Web Client ID
- ✅ No requiere configuración nativa compleja

### Desventajas

- ⚠️ Menos nativo (abre navegador)
- ⚠️ Menor UX que Google Sign-In nativo

### Cómo Implementar

#### Crear Hook Alternativo

Crea `amva-mobile/src/hooks/useGoogleAuthExpo.ts`:

```typescript
import * as AuthSession from 'expo-auth-session'
import * as WebBrowser from 'expo-web-browser'
import { Platform } from 'react-native'
import Constants from 'expo-constants'

WebBrowser.maybeCompleteAuthSession()

export function useGoogleAuthExpo() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getGoogleClientId = (): string => {
    const googleClientId =
      Constants?.expoConfig?.extra?.googleClientId ||
      Constants?.manifest?.extra?.googleClientId ||
      ''
    return googleClientId
  }

  const signIn = async (): Promise<string> => {
    try {
      setLoading(true)
      setError(null)

      const clientId = getGoogleClientId()
      if (!clientId) {
        throw new Error('Google Client ID no configurado')
      }

      const request = new AuthSession.AuthRequest({
        clientId,
        scopes: ['openid', 'profile', 'email'],
        responseType: AuthSession.ResponseType.IdToken,
        redirectUri: AuthSession.makeRedirectUri({
          useProxy: true,
        }),
      })

      const result = await request.promptAsync({
        authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
      })

      if (result.type === 'success') {
        const { id_token } = result.params
        if (id_token) {
          return id_token
        }
        throw new Error('No se recibió id_token')
      }

      throw new Error('Usuario canceló el inicio de sesión')
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return { signIn, loading, error }
}
```

#### Usar en LoginScreen

En `amva-mobile/src/screens/auth/LoginScreen.tsx`, puedes agregar un fallback:

```typescript
import { useGoogleAuth } from '@/hooks/useGoogleAuth'
import { useGoogleAuthExpo } from '@/hooks/useGoogleAuthExpo'

// En el componente
const googleAuth = useGoogleAuth()
const googleAuthExpo = useGoogleAuthExpo()

const handleGoogleLogin = async () => {
  try {
    // Intentar con método nativo primero
    const idToken = await googleAuth.signIn()
    // Enviar al backend...
  } catch (error) {
    // Si falla, usar Expo AuthSession como fallback
    if (error.message.includes('DEVELOPER_ERROR')) {
      try {
        const idToken = await googleAuthExpo.signIn()
        // Enviar al backend...
      } catch (expoError) {
        // Manejar error
      }
    }
  }
}
```

## ✅ Alternativa 3: Configurar SHA-1 Correctamente (Solución Definitiva)

### Verificar SHA-1 del Build Actual

1. **Obtener SHA-1 del APK**:
   ```bash
   cd amva-mobile
   ./scripts/extraer-sha1-apk.sh
   ```

2. **Verificar en Google Cloud Console**:
   - Ve a: https://console.cloud.google.com/apis/credentials?project=amva-auth
   - Busca el cliente Android
   - Verifica que tenga el SHA-1 correcto

3. **Agregar SHA-1 si falta**:
   - En Google Cloud Console, edita el cliente Android
   - Agrega el SHA-1 que obtuviste del APK
   - Guarda los cambios

4. **Esperar 30 minutos** para propagación

## ✅ Alternativa 4: Usar Debug Keystore (Solo para Desarrollo)

### Para Desarrollo Local

Si estás desarrollando localmente, puedes usar el debug keystore:

1. **Obtener SHA-1 del debug keystore**:
   ```bash
   keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android | grep SHA1
   ```

2. **Agregar SHA-1 a Google Cloud Console**:
   - Ve a Google Cloud Console
   - Agrega el SHA-1 del debug keystore al cliente Android
   - Esto permitirá que funcione en desarrollo

3. **Para producción**, usa el SHA-1 del keystore de producción

## ✅ Alternativa 5: Verificar Configuración Actual

### Verificar app.json

Abre `amva-mobile/app.json` y verifica:

```json
{
  "expo": {
    "extra": {
      "googleAndroidClientId": "378853205278-c2e1gcjn06mg857rcvprns01fu8pduat.apps.googleusercontent.com"
    }
  }
}
```

### Verificar que el Client ID Sea Correcto

1. Ve a Google Cloud Console
2. Busca el cliente Android: `378853205278-c2e1gcjn06mg857rcvprns01fu8pduat`
3. Verifica que exista y esté configurado correctamente

## 🎯 Recomendación por Escenario

### Escenario 1: Desarrollo Rápido (Testing)

**Usa**: Alternativa 1 (Web Client ID)
- ✅ Más rápido de configurar
- ✅ No requiere SHA-1
- ✅ Funciona inmediatamente

### Escenario 2: Desarrollo con Emulador

**Usa**: Alternativa 4 (Debug Keystore)
- ✅ SHA-1 del debug keystore
- ✅ Funciona en emulador
- ✅ Fácil de configurar

### Escenario 3: Producción

**Usa**: Alternativa 3 (SHA-1 Correcto)
- ✅ Más seguro
- ✅ Mejor UX
- ✅ Requiere configuración correcta

### Escenario 4: Fallback si Nada Funciona

**Usa**: Alternativa 2 (Expo AuthSession)
- ✅ Funciona con Web Client ID
- ✅ No requiere SHA-1
- ✅ Útil como último recurso

## 📋 Checklist de Alternativas

### Alternativa 1: Web Client ID

- [ ] Obtener Web Client ID de Google Cloud Console
- [ ] Configurar en `app.json`
- [ ] Reiniciar app
- [ ] Probar Google OAuth

### Alternativa 2: Expo AuthSession

- [ ] Crear hook `useGoogleAuthExpo.ts`
- [ ] Agregar fallback en `LoginScreen.tsx`
- [ ] Probar Google OAuth

### Alternativa 3: SHA-1 Correcto

- [ ] Obtener SHA-1 del APK actual
- [ ] Agregar SHA-1 a Google Cloud Console
- [ ] Esperar 30 minutos
- [ ] Probar Google OAuth

### Alternativa 4: Debug Keystore

- [ ] Obtener SHA-1 del debug keystore
- [ ] Agregar SHA-1 a Google Cloud Console
- [ ] Probar en emulador/dispositivo de desarrollo

## 🎯 Recomendación Final

**Para empezar rápido**: Usa **Alternativa 1 (Web Client ID)**

1. Obtén el Web Client ID
2. Configúralo en `app.json`
3. Prueba Google OAuth
4. Si funciona, luego configura el Android Client ID correctamente para producción

**Para producción**: Usa **Alternativa 3 (SHA-1 Correcto)**

1. Obtén el SHA-1 del build de producción
2. Agrégalo a Google Cloud Console
3. Configura el Android Client ID correctamente
4. Prueba en producción

## 📝 Próximos Pasos

1. **Elige una alternativa** según tu necesidad
2. **Sigue los pasos** de esa alternativa
3. **Prueba Google OAuth**
4. **Si funciona**: ✅ Listo
5. **Si no funciona**: Prueba otra alternativa

