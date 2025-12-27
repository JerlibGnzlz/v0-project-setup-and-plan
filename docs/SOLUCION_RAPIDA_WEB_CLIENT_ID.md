# ⚡ Solución Rápida: Usar Web Client ID para Google OAuth

## 🎯 Solución Más Rápida

Tu `app.json` ya tiene el **Web Client ID** configurado. Podemos usarlo temporalmente para que Google OAuth funcione **sin necesidad de SHA-1**.

## ✅ Ventajas de Esta Solución

- ✅ **Ya está configurado** en tu `app.json`
- ✅ **No requiere SHA-1** para funcionar
- ✅ **Funciona inmediatamente**
- ✅ **Útil para desarrollo y testing**

## 🔧 Paso 1: Verificar Web Client ID

Tu `app.json` ya tiene:

```json
{
  "expo": {
    "extra": {
      "googleClientId": "378853205278-slllh10l32onum338rg1776g8itekvco.apps.googleusercontent.com",
      "googleAndroidClientId": "378853205278-c2e1gcjn06mg857rcvprns01fu8pduat.apps.googleusercontent.com"
    }
  }
}
```

## 🔧 Paso 2: Usar Web Client ID Temporalmente

### Opción A: Modificar app.json (Temporal)

Actualiza `amva-mobile/app.json`:

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

**Nota**: Usa el **Web Client ID** en `googleAndroidClientId` temporalmente.

### Opción B: Modificar useGoogleAuth.ts (Mejor)

Modifica `amva-mobile/src/hooks/useGoogleAuth.ts` para usar Web Client ID como fallback:

```typescript
const getGoogleClientId = (): string => {
  if (Platform.OS === 'android') {
    // Intentar Android Client ID primero
    const androidClientId =
      Constants?.expoConfig?.extra?.googleAndroidClientId ||
      Constants?.manifest?.extra?.googleAndroidClientId ||
      ''
    
    // Si Android Client ID no funciona o no está configurado, usar Web Client ID
    // El Web Client ID funciona sin SHA-1
    if (!androidClientId || androidClientId.includes('c2e1gcjn06mg857rcvprns01fu8pduat')) {
      // Usar Web Client ID como fallback
      const webClientId =
        Constants?.expoConfig?.extra?.googleClientId ||
        Constants?.manifest?.extra?.googleClientId ||
        ''
      if (webClientId && webClientId.includes('.apps.googleusercontent.com')) {
        console.log('⚠️ Usando Web Client ID como fallback (no requiere SHA-1)')
        return webClientId
      }
    }
    
    if (androidClientId && androidClientId.includes('.apps.googleusercontent.com')) {
      return androidClientId
    }
  }
  
  // Fallback al Web Client ID
  const googleClientIdFromEnv = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || ''
  const googleClientIdFromConfig =
    Constants?.expoConfig?.extra?.googleClientId ||
    Constants?.manifest?.extra?.googleClientId ||
    ''

  return googleClientIdFromEnv || googleClientIdFromConfig
}
```

## 🔧 Paso 3: Verificar Web Client ID en Google Cloud Console

1. Ve a: https://console.cloud.google.com/apis/credentials?project=amva-auth
2. Busca el cliente OAuth de tipo **"Web application"**
3. Verifica que el Client ID sea: `378853205278-slllh10l32onum338rg1776g8itekvco`
4. Si no existe, créalo (ver guía completa)

## 🔧 Paso 4: Probar

1. **Reinicia la app** (si modificaste código)
2. **Prueba Google OAuth**
3. **Debería funcionar** con Web Client ID

## ⚠️ Limitaciones del Web Client ID

- ⚠️ Menos seguro que Android Client ID
- ⚠️ No recomendado para producción a largo plazo
- ⚠️ Puede tener limitaciones de uso

## ✅ Solución Definitiva (Para Producción)

Una vez que funcione con Web Client ID, configura correctamente el Android Client ID:

1. Obtén el SHA-1 del build de producción
2. Agrégalo a Google Cloud Console
3. Cambia `googleAndroidClientId` de vuelta al Android Client ID
4. Prueba nuevamente

## 🎯 Recomendación

**Para empezar rápido**:
1. Usa Web Client ID temporalmente (Opción B arriba)
2. Prueba Google OAuth
3. Si funciona, luego configura Android Client ID correctamente

**Para producción**:
1. Configura Android Client ID con SHA-1 correcto
2. Usa Android Client ID en producción
3. Mantén Web Client ID como fallback

