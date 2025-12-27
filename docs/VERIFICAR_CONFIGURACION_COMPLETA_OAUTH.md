# ✅ Verificar Configuración Completa de Google OAuth

## 🎯 Estado Actual

Según los logs, tienes:
- ✅ **Client ID correcto**: `378853205278-slllh10l32onum338rg1776g8itekvco.apps.googleusercontent.com`

## 🔍 Qué Verificar en los Logs

Cuando hagas clic en "Continuar con Google", deberías ver en los logs:

```
🔐 Iniciando sesión con Google (expo-auth-session)...
🔍 Redirect URI generado: https://auth.expo.io/@jerlibgnzlz/amva-movil
🔍 Client ID: 378853205278-slllh10l32onum338rg1776g8itekvco.apps.googleusercontent.com
```

### ✅ Verificación 1: Redirect URI en Logs

**¿Qué buscar?**
```
🔍 Redirect URI generado: [algún URI aquí]
```

**¿Qué debería aparecer?**
- `https://auth.expo.io/@jerlibgnzlz/amva-movil` (más probable)
- O `amva-app://` (si no usa proxy)

**Acción**: Copia el Redirect URI exacto que aparece en los logs.

### ✅ Verificación 2: Redirect URI en Google Cloud Console

1. Ve a: https://console.cloud.google.com/apis/credentials?project=amva-digital
2. Busca el cliente OAuth Web con Client ID: `378853205278-slllh10l32onum338rg1776g8itekvco`
3. Haz clic en el nombre del cliente
4. Busca la sección **"URIs de redireccionamiento autorizados"**
5. Verifica que el Redirect URI de los logs esté en la lista

**Si NO está en la lista:**
- Haz clic en "+ ADD URI"
- Pega el Redirect URI exacto de los logs
- Haz clic en "SAVE"

## 📋 Checklist Completo

### 1. Configuración en app.json
- [x] Client ID configurado: `378853205278-slllh10l32onum338rg1776g8itekvco`
- [ ] Scheme configurado: `amva-app`

### 2. Logs de la App
- [x] Client ID aparece en logs
- [ ] Redirect URI aparece en logs
- [ ] Copiar Redirect URI exacto de los logs

### 3. Google Cloud Console - Redirect URIs
- [ ] Redirect URI de los logs agregado en "URIs de redireccionamiento autorizados"
- [ ] Todos los URIs recomendados agregados:
  - [ ] `https://auth.expo.io/@jerlibgnzlz/amva-movil`
  - [ ] `amva-app://`
  - [ ] `exp://localhost:8081`
  - [ ] `exp://192.168.*.*:8081`

### 4. Google Cloud Console - OAuth Consent Screen
- [ ] OAuth Consent Screen publicado (no en "Testing")
- [ ] Scopes agregados: `openid`, `profile`, `email`

### 5. Prueba
- [ ] Esperado 5-10 minutos después de agregar Redirect URIs
- [ ] App cerrada completamente
- [ ] App abierta nuevamente
- [ ] Login con Google probado

## 🚀 Próximos Pasos

### Paso 1: Ver Redirect URI en Logs

1. Abre la app
2. Abre las herramientas de desarrollo (Metro/React Native Debugger)
3. Haz clic en "Continuar con Google"
4. Busca en los logs:
   ```
   🔍 Redirect URI generado: [URI aquí]
   ```
5. **Copia ese URI exacto**

### Paso 2: Agregar Redirect URI en Google Cloud Console

1. Ve a: https://console.cloud.google.com/apis/credentials?project=amva-digital
2. Busca el cliente OAuth Web
3. Haz clic en el nombre del cliente
4. En "URIs de redireccionamiento autorizados", haz clic en "+ ADD URI"
5. Pega el Redirect URI exacto de los logs
6. Haz clic en "SAVE"

### Paso 3: Agregar URIs Adicionales (Recomendado)

Agrega también estos URIs para máxima compatibilidad:

```
https://auth.expo.io/@jerlibgnzlz/amva-movil
amva-app://
exp://localhost:8081
exp://192.168.*.*:8081
```

### Paso 4: Verificar OAuth Consent Screen

1. Ve a: https://console.cloud.google.com/apis/credentials/consent?project=amva-digital
2. Verifica que "Publishing status" sea "Published"
3. Si está en "Testing", haz clic en "PUBLISH APP"

### Paso 5: Esperar y Probar

1. ⏱️ Espera 5-10 minutos
2. 🔄 Cierra completamente la app
3. 🧪 Abre la app nuevamente
4. 🎯 Prueba el login con Google

## 🔍 Si Sigue Fallando

### Verificar Redirect URI Exacto

El Redirect URI en los logs debe coincidir **exactamente** con el agregado en Google Cloud Console.

**Ejemplo:**
- ✅ Logs: `https://auth.expo.io/@jerlibgnzlz/amva-movil`
- ✅ Google Cloud: `https://auth.expo.io/@jerlibgnzlz/amva-movil`
- ✅ Coinciden → Debería funcionar

**Si no coinciden:**
- ❌ Logs: `https://auth.expo.io/@jerlibgnzlz/amva-movil`
- ❌ Google Cloud: `amva-app://`
- ❌ No coinciden → Agregar el URI de los logs

### Verificar Errores Específicos

Si ves un error específico en los logs, busca:

- `redirect_uri_mismatch` → Redirect URI no está en Google Cloud Console
- `access_denied` → OAuth Consent Screen no está publicado
- `invalid_client` → Client ID incorrecto o no existe

## 📝 Resumen

**Lo que tienes:**
- ✅ Client ID correcto en logs

**Lo que necesitas verificar:**
1. Redirect URI en logs (copiar exacto)
2. Redirect URI agregado en Google Cloud Console
3. OAuth Consent Screen publicado
4. Esperar propagación (5-10 minutos)
5. Probar login con Google

## 🎯 Acción Inmediata

1. **Haz clic en "Continuar con Google"** en la app
2. **Busca en los logs** el Redirect URI generado
3. **Copia ese URI exacto**
4. **Agrégalo en Google Cloud Console** en "URIs de redireccionamiento autorizados"
5. **Haz clic en SAVE**
6. **Espera 5-10 minutos**
7. **Prueba nuevamente**

¡Con el Client ID correcto, solo falta asegurarte de que el Redirect URI esté agregado en Google Cloud Console! 🚀

