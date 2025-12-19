# Configuración de Google Client IDs

## 🔑 Importante: Diferencia entre Client IDs

### Client ID de Tipo "Web" (Para verificación de tokens)
- **ID**: `378853205278-slllh10l32onum338rg1776g8itekvco.apps.googleusercontent.com`
- **Uso**: 
  - Backend verifica tokens con este ID (`GOOGLE_CLIENT_ID`)
  - App móvil usa este como `webClientId` para verificar tokens
- **Ubicación**: Google Cloud Console → Credentials → OAuth 2.0 Client ID → Tipo "Aplicación web"

### Client ID de Tipo "Android" (Para identificación de app)
- **ID**: `378853205278-c2e1gcjn06mg857rcvprns01fu8pduat.apps.googleusercontent.com`
- **Uso**: 
  - Identifica la app Android en Google Cloud Console
  - Requiere SHA-1 para verificación
- **Ubicación**: Google Cloud Console → Credentials → OAuth 2.0 Client ID → Tipo "Android"

## ⚠️ Confusión Común

**NO uses el Client ID de Android como `webClientId` en la app móvil.**

El `webClientId` en Google Sign-In para Android debe ser el **Client ID de tipo "Web"** porque:
- Google verifica los tokens de ID usando el Web Client ID
- El backend también verifica con el Web Client ID
- El Android Client ID solo identifica la app, no verifica tokens

## ✅ Configuración Correcta

### Backend (`GOOGLE_CLIENT_ID`):
```
378853205278-slllh10l32onum338rg1776g8itekvco.apps.googleusercontent.com
```
(Client ID de tipo "Web")

### App Móvil (`webClientId`):
```
378853205278-slllh10l32onum338rg1776g8itekvco.apps.googleusercontent.com
```
(Mismo que el backend - Client ID de tipo "Web")

### Google Cloud Console:
- **Cliente Web**: `378853205278-slllh10l32onum338rg1776g8itekvco` ✅ (Ya existe)
- **Cliente Android**: `378853205278-c2e1gcjn06mg857rcvprns01fu8pduat` ✅ (Nuevo, con SHA-1)

## 🎯 Resumen

1. **Backend**: Usa Web Client ID para verificar tokens
2. **App Móvil**: Usa Web Client ID como `webClientId` para verificar tokens
3. **Google Cloud Console**: Tiene ambos clientes (Web y Android)
4. **Android Client ID**: Solo para identificación, no para verificación de tokens

## 📝 Nota Técnica

Cuando Google Sign-In genera un token de ID en Android:
- El token se genera usando el Android Client ID (identificación)
- Pero el token se verifica usando el Web Client ID (verificación)
- Por eso ambos deben estar en el mismo proyecto de Google Cloud

