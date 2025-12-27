# 📋 Clientes OAuth: ¿Cuál es para qué?

## 🎯 Respuesta Rápida

Tienes **2 clientes OAuth** en Google Cloud Console:

### 1. **AMVA Web Client** (Tipo: Aplicación web)
- **Client ID**: `378853205278-slllh10l32onum338rg1776g8itekvco`
- **Para**: ✅ **React Native (móvil)** y ✅ **Web (Next.js)**
- **Este es el que debes usar** para React Native

### 2. **AMVA Android Client** (Tipo: Android)
- **Client ID**: `378853205278-c2e1gcjn06mg857rcvprns01fu8pduat`
- **Para**: ⚠️ Solo para `@react-native-google-signin/google-signin` (método nativo)
- **NO lo uses** con `expo-auth-session`

## 📊 Tabla Comparativa

| Cliente | Tipo | Para qué sirve | ¿Usar con expo-auth-session? |
|---------|------|----------------|------------------------------|
| **AMVA Web Client** | Web application | ✅ React Native<br>✅ Web (Next.js) | ✅ **SÍ** |
| **AMVA Android Client** | Android | ⚠️ Solo método nativo | ❌ NO |

## ✅ Configuración Correcta

### Para React Native (tu caso actual)

**Usar**: **AMVA Web Client**
- Client ID: `378853205278-slllh10l32onum338rg1776g8itekvco`
- Ya está configurado en `app.json` como `googleClientId`
- ✅ Funciona con `expo-auth-session`
- ✅ No requiere SHA-1

### Para Web (Next.js)

**Usar**: **AMVA Web Client** (el mismo)
- Client ID: `378853205278-slllh10l32onum338rg1776g8itekvco`
- Ya está funcionando en tu web
- ✅ Mismo cliente para web y móvil

## 🔍 Verificar en app.json

Tu `app.json` ya tiene el cliente correcto:

```json
{
  "expo": {
    "extra": {
      "googleClientId": "378853205278-slllh10l32onum338rg1776g8itekvco.apps.googleusercontent.com"
    }
  }
}
```

✅ **Correcto** - Este es el "AMVA Web Client"

## 🚨 Error Actual: "code_challenge_method"

El error que estás viendo:
```
Parameter not allowed for this message type: code_challenge_method
```

**Causa**: `expo-auth-session` está intentando usar PKCE (Proof Key for Code Exchange) cuando no debería para `ResponseType.IdToken`.

**Solución**: Necesito corregir el código para deshabilitar PKCE.

## 📝 Resumen

- ✅ **AMVA Web Client** → Para React Native y Web (usa este)
- ⚠️ **AMVA Android Client** → Solo para método nativo (no lo uses ahora)

Tu configuración actual es correcta, solo necesito corregir el error de PKCE en el código.

