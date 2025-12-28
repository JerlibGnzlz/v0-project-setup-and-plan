# ✅ Agregar Redirect URI con Esquema Personalizado

## 🎯 Redirect URI Requerido

```
amva-app://
```

## 📋 Pasos para Agregar en Google Cloud Console

### Paso 1: Abrir Google Auth Platform

**URL directa:**
```
https://console.cloud.google.com/apis/credentials/consent?project=amva-auth
```

### Paso 2: Ir a Clientes

1. En el menú lateral izquierdo, haz clic en **"Clientes"** (Clients)
2. Verás la lista de clientes OAuth

### Paso 3: Editar Cliente Web

1. Busca **"AMVA Web Client"** (tipo: Aplicación web)
2. Haz clic en el nombre del cliente
3. Verás la página de edición

### Paso 4: Agregar Redirect URI con Esquema Personalizado

1. Busca la sección **"URIs de redireccionamiento autorizados"**
2. Haz clic en **"+ ADD URI"** o **"+ Agregar URI"**
3. Agrega este URI:
   ```
   amva-app://
   ```
4. Haz clic en **"Guardar"** o **"SAVE"**

### Paso 5: Verificar que Ambos URIs Estén Presentes

Deberías tener **AMBOS** URIs en la lista:

1. `https://auth.expo.io/@jerlibgnzlz/amva-movil` (para desarrollo con proxy)
2. `amva-app://` (para producción sin proxy) ⬅️ **NUEVO**

### Paso 6: Verificar OAuth Consent Screen

1. Ve a **"Pantalla de consentimiento de OAuth"** (OAuth consent screen)
2. Verifica que **"Publishing status"** sea **"Published"**
3. Si está en "Testing", haz clic en **"PUBLISH APP"**

### Paso 7: Esperar y Probar

1. ⏱️ Espera **10-15 minutos** para propagación
2. 🔄 Reinicia la app completamente
3. 🧪 Prueba el login con Google

## 🔍 Verificación en Logs

Después de reiniciar, deberías ver:

```
🔍 Redirect URI generado (esquema personalizado): amva-app://
🔍 Iniciando flujo OAuth con IdToken + nonce manual (sin proxy)...
✅ Respuesta exitosa
✅ id_token recibido directamente
✅ Login con Google exitoso (expo-auth-session)
```

## ✅ Checklist

- [ ] Redirect URI `amva-app://` agregado en Google Cloud Console
- [ ] Redirect URI `https://auth.expo.io/@jerlibgnzlz/amva-movil` también presente (por si acaso)
- [ ] OAuth Consent Screen publicado
- [ ] Esperado 10-15 minutos para propagación
- [ ] App reiniciada completamente
- [ ] Login probado

## 🚨 Nota Importante

**Google Cloud Console puede mostrar una advertencia** sobre schemes personalizados, pero **sí los acepta** para aplicaciones móviles. Si ves una advertencia, puedes ignorarla y guardar de todas formas.

¡Con estos pasos debería funcionar sin el proxy de Expo! 🚀

