# ⚠️ Por Qué el Esquema Personalizado No Funciona

## 🚨 Problema

Cuando intentamos usar `amva-app://` como redirect URI, Google rechaza la solicitud con:
```
Error 400: invalid_request
Access blocked: Authorization Error
```

## 🔍 Causa

**Google Cloud Console cliente Web NO acepta schemes personalizados** como `amva-app://`.

Los clientes Web de Google OAuth solo aceptan URIs con dominio (https://), no schemes personalizados como `amva-app://`.

## ✅ Solución

**Usar el proxy de Expo** que proporciona un dominio válido:
```
https://auth.expo.io/@jerlibgnzlz/amva-movil
```

Este URI:
- ✅ Tiene dominio (https://)
- ✅ Es aceptado por Google Cloud Console cliente Web
- ✅ Funciona con el proxy de Expo

## 📋 Verificación

Asegúrate de que este redirect URI esté agregado en Google Cloud Console:

1. Ve a: https://console.cloud.google.com/apis/credentials/consent?project=amva-auth
2. Clientes → AMVA Web Client → Edit
3. Verifica que esté: `https://auth.expo.io/@jerlibgnzlz/amva-movil`
4. Si no está, agrégalo y guarda

## 🔄 Alternativas

Si el proxy de Expo sigue fallando:

1. **Usar método nativo** (`@react-native-google-signin/google-signin`)
   - Requiere SHA-1 configurado
   - Más confiable para producción
   - No depende del proxy

2. **Usar cliente Android específico** (si tienes SHA-1)
   - Cliente Android acepta schemes personalizados
   - Pero requiere SHA-1 en Google Cloud Console

## 📝 Resumen

- ❌ `amva-app://` NO funciona con cliente Web
- ✅ `https://auth.expo.io/@jerlibgnzlz/amva-movil` SÍ funciona
- ✅ Verifica que el redirect URI esté agregado en Google Cloud Console
- ⏱️ Espera 15 minutos después de agregar el redirect URI

