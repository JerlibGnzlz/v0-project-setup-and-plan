# Resumen de Google Client IDs

## 📋 Client IDs Configurados

### 1. Client ID Web (Para verificación de tokens)
- **ID**: `378853205278-slllh10l32onum338rg1776g8itekvco.apps.googleusercontent.com`
- **Tipo**: Aplicación web
- **Uso**: 
  - ✅ Backend (`GOOGLE_CLIENT_ID`)
  - ✅ App móvil (`webClientId` en Google Sign-In)
  - ✅ Landing page web

### 2. Client ID Android (Para identificación)
- **ID**: `378853205278-c2e1gcjn06mg857rcvprns01fu8pduat.apps.googleusercontent.com`
- **Tipo**: Android
- **Package**: `org.vidaabundante.app`
- **SHA-1**: `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25`
- **Uso**: 
  - ✅ Identificación de la app en Google Cloud Console
  - ✅ Requerido para Google Sign-In en Android

## ⚠️ Importante

**NO confundas los Client IDs:**

- ❌ **NO uses** el Android Client ID como `webClientId`
- ✅ **USA** el Web Client ID como `webClientId`
- ✅ El Android Client ID solo identifica la app, no verifica tokens

## 🔧 Configuración Actual

### Backend
```env
GOOGLE_CLIENT_ID=378853205278-slllh10l32onum338rg1776g8itekvco.apps.googleusercontent.com
```

### App Móvil (`app.json`)
```json
{
  "googleClientId": "378853205278-slllh10l32onum338rg1776g8itekvco.apps.googleusercontent.com",
  "googleAndroidClientId": "378853205278-c2e1gcjn06mg857rcvprns01fu8pduat.apps.googleusercontent.com"
}
```

### App Móvil (`useGoogleAuth.ts`)
```typescript
GoogleSignin.configure({
  webClientId: "378853205278-slllh10l32onum338rg1776g8itekvco.apps.googleusercontent.com", // Web Client ID
  // El Android Client ID se usa automáticamente por Google Sign-In SDK
})
```

## ✅ Estado

- [x] Cliente Web configurado y funcionando
- [x] Cliente Android creado con SHA-1
- [x] Backend usando Web Client ID
- [x] App móvil usando Web Client ID como `webClientId`
- [x] Ambos clientes en el mismo proyecto de Google Cloud

## 🎯 Próximos Pasos

1. ✅ Verificar que el SHA-1 esté configurado en el Cliente Android
2. ✅ Probar Google Sign-In en la app móvil
3. ✅ Verificar que ambos (web y mobile) funcionen correctamente

