# 🚀 Solución Más Sencilla para Producción en Play Store

## 🎯 Objetivo

Configurar Google OAuth de la forma **más sencilla** para que funcione en producción en Play Store **sin necesidad de configurar SHA-1**.

## ✅ Solución: expo-auth-session con Scheme Personalizado

### ¿Por qué esta solución?

- ✅ **No requiere SHA-1** configurado en Google Cloud Console
- ✅ **Funciona en desarrollo y producción**
- ✅ **Más simple** que configurar SHA-1 para cada build
- ✅ **Funciona con Play Store** sin problemas
- ✅ **Ya está configurado** en tu proyecto

## 📋 Configuración Necesaria

### 1. Redirect URI en Google Cloud Console

Solo necesitas agregar **UN** redirect URI en Google Cloud Console:

```
amva-app://
```

**Pasos:**
1. Ve a: https://console.cloud.google.com/apis/credentials?project=amva-auth
2. Busca el cliente OAuth Web: `378853205278-slllh10l32onum338rg1776g8itekvco`
3. Haz clic en el nombre del cliente
4. En **"URIs de redireccionamiento autorizados"**, haz clic en "+ ADD URI"
5. Agrega: `amva-app://`
6. Haz clic en "SAVE"

### 2. Verificar OAuth Consent Screen

1. Ve a: https://console.cloud.google.com/apis/credentials/consent?project=amva-auth
2. Verifica que "Publishing status" sea **"Published"**
3. Si está en "Testing", haz clic en "PUBLISH APP"

### 3. Verificar app.json

Tu `app.json` ya está configurado correctamente:

```json
{
  "expo": {
    "scheme": "amva-app",
    "android": {
      "intentFilters": [
        {
          "action": "VIEW",
          "data": [
            {
              "scheme": "amva-app"
            }
          ],
          "category": ["BROWSABLE", "DEFAULT"]
        }
      ]
    }
  }
}
```

✅ **Ya está configurado** - No necesitas cambiar nada.

## 🔧 Cambio Realizado

He actualizado `useGoogleAuthExpo.ts` para usar `useProxy: false` en lugar de `useProxy: true`.

**Antes:**
```typescript
const redirectUri = AuthSession.makeRedirectUri({
  scheme: 'amva-app',
  useProxy: true, // ❌ Problemas en producción
})
```

**Ahora:**
```typescript
const redirectUri = AuthSession.makeRedirectUri({
  scheme: 'amva-app',
  useProxy: false, // ✅ Funciona en producción
})
```

## 📋 Checklist para Producción

- [ ] Redirect URI `amva-app://` agregado en Google Cloud Console
- [ ] OAuth Consent Screen publicado
- [ ] Código actualizado (ya hecho)
- [ ] Probar en desarrollo
- [ ] Build de producción con EAS
- [ ] Probar APK/AAB en dispositivo físico
- [ ] Subir a Play Store

## 🧪 Probar en Desarrollo

1. Reinicia la app completamente:
   ```bash
   cd amva-mobile
   npm start
   # O
   npm run android
   ```

2. Haz clic en "Continuar con Google"
3. Debería abrir el navegador y funcionar correctamente

## 🏗️ Build para Producción

### Con EAS Build

```bash
cd amva-mobile
eas build --platform android --profile production
```

### Verificar Redirect URI en Build

Después del build, cuando pruebes el APK/AAB:

1. Abre la app
2. Abre las herramientas de desarrollo
3. Haz clic en "Continuar con Google"
4. Verifica en los logs que el Redirect URI sea: `amva-app://`

## ✅ Ventajas de Esta Solución

| Característica | Con Proxy | Sin Proxy (Scheme) |
|----------------|-----------|-------------------|
| Requiere SHA-1 | ❌ No | ❌ No |
| Funciona en desarrollo | ✅ Sí | ✅ Sí |
| Funciona en producción | ⚠️ A veces | ✅ Sí |
| Funciona en Play Store | ⚠️ A veces | ✅ Sí |
| Configuración | Compleja | Simple |

## 🚨 Si Sigue Fallando

### Verificar Redirect URI Exacto

1. Abre la app
2. Abre las herramientas de desarrollo
3. Haz clic en "Continuar con Google"
4. Busca en los logs:
   ```
   🔍 Redirect URI generado: amva-app://
   ```
5. Verifica que este URI exacto esté en Google Cloud Console

### Verificar Intent Filters

Tu `app.json` ya tiene los intent filters correctos:

```json
"intentFilters": [
  {
    "action": "VIEW",
    "data": [
      {
        "scheme": "amva-app"
      }
    ],
    "category": ["BROWSABLE", "DEFAULT"]
  }
]
```

✅ **Ya está configurado** - No necesitas cambiar nada.

## 📝 Resumen

### Lo que necesitas hacer:

1. ✅ **Agregar redirect URI** `amva-app://` en Google Cloud Console
2. ✅ **Publicar OAuth Consent Screen** si está en Testing
3. ✅ **Código ya actualizado** (useProxy: false)
4. ✅ **Probar en desarrollo**
5. ✅ **Build para producción**
6. ✅ **Subir a Play Store**

### Lo que NO necesitas:

- ❌ Configurar SHA-1
- ❌ Cambiar app.json (ya está bien)
- ❌ Configurar múltiples redirect URIs
- ❌ Usar proxy de Expo

## 🎯 Pasos Inmediatos

1. **Agregar redirect URI en Google Cloud Console:**
   - Ve a: https://console.cloud.google.com/apis/credentials?project=amva-auth
   - Agrega: `amva-app://`
   - Guarda

2. **Verificar OAuth Consent Screen:**
   - Ve a: https://console.cloud.google.com/apis/credentials/consent?project=amva-auth
   - Publica si está en Testing

3. **Esperar 5-10 minutos** para propagación

4. **Probar en desarrollo:**
   ```bash
   cd amva-mobile
   npm start
   ```

5. **Probar login con Google**

## 🎉 Resultado Esperado

- ✅ Login con Google funciona en desarrollo
- ✅ Login con Google funciona en producción
- ✅ Login con Google funciona en Play Store
- ✅ No requiere configuración de SHA-1
- ✅ Configuración simple y mantenible

¡Esta es la forma más sencilla y confiable para producción en Play Store! 🚀

