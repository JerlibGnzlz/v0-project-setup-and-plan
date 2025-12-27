# 🔧 Solución: Error "code_challenge_method"

## 🚨 Error

```
Parameter not allowed for this message type: code_challenge_method
Error 400: invalid_request
```

## 🔍 Causa

`expo-auth-session` está intentando usar **PKCE** (Proof Key for Code Exchange) cuando usas `ResponseType.IdToken`, pero Google OAuth no permite PKCE con `id_token` response type.

## ✅ Solución Aplicada

He actualizado el código para **deshabilitar PKCE explícitamente**:

```typescript
const request = new AuthSession.AuthRequest({
  clientId,
  scopes: ['openid', 'profile', 'email'],
  responseType: AuthSession.ResponseType.IdToken,
  redirectUri,
  // Deshabilitar PKCE explícitamente
  codeChallenge: undefined,
  codeChallengeMethod: undefined,
})
```

## 📋 Verificación

### Paso 1: Reiniciar la App

```bash
cd amva-mobile
npm start
# O
npm run android
```

### Paso 2: Probar Login con Google

1. Abre la app
2. Haz clic en "Continuar con Google"
3. Debería funcionar sin el error "code_challenge_method"

### Paso 3: Verificar Redirect URI

Asegúrate de que `amva-app://` esté agregado en Google Cloud Console:

1. Ve a: https://console.cloud.google.com/apis/credentials?project=amva-digital
2. Busca "AMVA Web Client"
3. Haz clic en "Edit" (lápiz)
4. En "URIs de redireccionamiento autorizados", verifica que esté:
   ```
   amva-app://
   ```
5. Si no está, agrégalo y guarda

## 🎯 Cliente Correcto

**Usar**: **AMVA Web Client**
- Client ID: `378853205278-slllh10l32onum338rg1776g8itekvco`
- Tipo: Aplicación web
- ✅ Funciona con `expo-auth-session`
- ✅ Ya está configurado en `app.json`

**NO usar**: **AMVA Android Client**
- Solo para método nativo (`@react-native-google-signin/google-signin`)
- No funciona con `expo-auth-session`

## ✅ Checklist

- [x] Código actualizado (PKCE deshabilitado)
- [ ] Redirect URI `amva-app://` agregado en Google Cloud Console
- [ ] OAuth Consent Screen publicado
- [ ] App reiniciada
- [ ] Login con Google probado

## 🚀 Próximos Pasos

1. **Agregar redirect URI** `amva-app://` en Google Cloud Console (si no está)
2. **Reiniciar la app** completamente
3. **Probar login con Google**
4. **Debería funcionar** sin el error "code_challenge_method"

## 📝 Notas Técnicas

- **PKCE** es un mecanismo de seguridad para OAuth 2.0
- Se usa típicamente con `ResponseType.Code`
- **NO se usa** con `ResponseType.IdToken`
- Google rechaza requests con PKCE cuando se solicita `id_token`

## 🎉 Resultado Esperado

- ✅ No más error "code_challenge_method"
- ✅ Login con Google funciona correctamente
- ✅ Usa el cliente Web correcto
- ✅ Funciona en desarrollo y producción

¡Con este cambio, el error debería desaparecer! 🚀

