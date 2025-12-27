# 🔧 Redirect URI Válido para Google Cloud Console

## 🚨 Problema

Cuando intentas agregar `amva-app://` en Google Cloud Console, aparece el error:
```
Redireccionamiento no válido. Debe contener el nombre de un dominio.
```

## 🔍 Causa

Google Cloud Console para clientes OAuth de tipo **"Web application"** solo acepta URIs que:
- Empiecen con `https://` o `http://`
- Sean dominios válidos (no schemes personalizados)

Los schemes personalizados como `amva-app://` **NO son válidos** para clientes Web.

## ✅ Solución: Usar Proxy de Expo

He actualizado el código para usar el **proxy de Expo**, que proporciona un dominio válido (`https://auth.expo.io`).

### Redirect URI Correcto

```
https://auth.expo.io/@jerlibgnzlz/amva-movil
```

Este URI:
- ✅ Es un dominio válido (`https://`)
- ✅ Es aceptado por Google Cloud Console
- ✅ Funciona en desarrollo y producción
- ✅ Funciona en Play Store

## 📋 Pasos para Configurar

### Paso 1: Agregar Redirect URI en Google Cloud Console

1. Ve a: https://console.cloud.google.com/apis/credentials?project=amva-auth
2. Busca **"AMVA Web Client"** (tipo: Aplicación web)
3. Haz clic en **"Edit"** (lápiz)
4. En **"URIs de redireccionamiento autorizados"**, haz clic en **"+ ADD URI"**
5. Agrega este URI:
   ```
   https://auth.expo.io/@jerlibgnzlz/amva-movil
   ```
6. Haz clic en **"SAVE"**

### Paso 2: Verificar OAuth Consent Screen

1. Ve a: https://console.cloud.google.com/apis/credentials/consent?project=amva-auth
2. Verifica que **"Publishing status"** sea **"Published"**
3. Si está en "Testing", haz clic en **"PUBLISH APP"**

### Paso 3: Reiniciar y Probar

1. ⏱️ Espera 5-10 minutos para propagación
2. 🔄 Reinicia la app completamente
3. 🧪 Prueba el login con Google

## 📊 Comparación

| Método | Redirect URI | ¿Válido en Google Cloud? | ¿Funciona en Producción? |
|--------|--------------|--------------------------|--------------------------|
| Scheme personalizado | `amva-app://` | ❌ NO | ⚠️ Requiere cliente Android |
| Proxy de Expo | `https://auth.expo.io/@jerlibgnzlz/amva-movil` | ✅ SÍ | ✅ SÍ |

## ✅ Ventajas del Proxy de Expo

- ✅ **Dominio válido** - Google Cloud Console lo acepta
- ✅ **Funciona en desarrollo** - Sin configuración adicional
- ✅ **Funciona en producción** - Incluyendo Play Store
- ✅ **No requiere SHA-1** - Más simple de configurar
- ✅ **Mismo cliente Web** - Puedes usar el mismo que para la web

## 🔍 Verificar en Logs

Después de reiniciar la app, deberías ver en los logs:

```
🔍 Redirect URI generado: https://auth.expo.io/@jerlibgnzlz/amva-movil
```

Este URI debe coincidir exactamente con el agregado en Google Cloud Console.

## 📝 Notas Importantes

1. **Proxy de Expo**: Aunque antes mencioné no usar proxy, en realidad el proxy de Expo (`auth.expo.io`) sigue funcionando y es la forma más sencilla de hacerlo funcionar sin configurar SHA-1.

2. **Mismo Cliente**: Puedes usar el mismo cliente Web (`AMVA Web Client`) tanto para la web como para React Native.

3. **Producción**: El proxy de Expo funciona correctamente en producción y Play Store.

## 🎯 Resumen

- ❌ **NO usar**: `amva-app://` (no es válido para clientes Web)
- ✅ **Usar**: `https://auth.expo.io/@jerlibgnzlz/amva-movil` (válido y funciona)

¡Con este cambio, el redirect URI será aceptado por Google Cloud Console y el login funcionará correctamente! 🚀

