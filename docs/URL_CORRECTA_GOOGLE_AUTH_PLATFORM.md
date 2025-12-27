# 🔗 URL Correcta para Google Auth Platform

## 🚨 Problema

La URL `https://console.cloud.google.com/apis/credentials?project=amva-digital` te lleva a la **interfaz antigua** donde no ves los clientes OAuth.

## ✅ Solución: Usar Google Auth Platform

Google tiene **DOS interfaces** diferentes:

### 1. Interfaz Antigua (APIs & Services)
- URL: `https://console.cloud.google.com/apis/credentials?project=amva-digital`
- ❌ No muestra los clientes OAuth correctamente
- ❌ Interfaz antigua

### 2. Interfaz Nueva (Google Auth Platform) ✅
- URL: `https://console.cloud.google.com/apis/credentials/consent?project=amva-digital`
- O mejor: `https://console.cloud.google.com/apis/credentials/consent?project=amva-digital&authuser=0`
- ✅ Muestra los clientes OAuth correctamente
- ✅ Interfaz moderna

## 🎯 URL Correcta para Agregar SHA-1

### Opción 1: Desde Google Auth Platform (RECOMENDADO)

**URL directa al cliente Android:**
```
https://console.cloud.google.com/apis/credentials/consent?project=amva-digital
```

**Pasos:**
1. Haz clic en el enlace arriba
2. En el menú lateral izquierdo, haz clic en **"Clientes"** (Clients)
3. Busca **"AMVA Android Client"**
4. Haz clic en el nombre del cliente
5. Verás la página de edición con el campo SHA-1

### Opción 2: URL Directa al Cliente

Si conoces el Client ID, puedes ir directamente:

```
https://console.cloud.google.com/apis/credentials/consent/edit-client/378853205278-c2e1gcjn06mg857rcvprns01fu8pduat?project=amva-digital
```

## 📋 Pasos Exactos en Google Auth Platform

### Paso 1: Abrir Google Auth Platform

1. Ve a: https://console.cloud.google.com/apis/credentials/consent?project=amva-digital
2. Verás la página de "Pantalla de consentimiento de OAuth"

### Paso 2: Ir a Clientes

1. En el menú lateral izquierdo, busca **"Clientes"** (Clients)
2. Haz clic en **"Clientes"**
3. Verás la lista de clientes OAuth

### Paso 3: Editar Cliente Android

1. Busca **"AMVA Android Client"** en la lista
2. Haz clic en el nombre del cliente
3. Verás la página de edición con:
   - Nombre del paquete: `org.vidaabundante.app`
   - Campo SHA-1: `4B:24:0F:1B:6A:E6:3D:71:38:77:D1:E7:69:40:D2:1D:5D:30:7C:40`

### Paso 4: Agregar SHA-1

1. En el campo **"Huella digital del certificado SHA-1"**
2. Verás que ya tiene: `4B:24:0F:1B:6A:E6:3D:71:38:77:D1:E7:69:40:D2:1D:5D:30:7C:40`
3. **Necesitas agregar también**: `BC:0C:2C:C3:68:D1:50:C3:7E:07:17:EE:49:8F:D0:35:7D:0F:1E:E3`
4. Haz clic en el campo SHA-1
5. Agrega el nuevo SHA-1 (puedes tener múltiples SHA-1s)
6. Haz clic en **"Guardar"** (Save)

## 🔍 Verificación

Después de guardar, deberías ver **AMBOS** SHA-1s:
- ✅ `4B:24:0F:1B:6A:E6:3D:71:38:77:D1:E7:69:40:D2:1D:5D:30:7C:40` (ya está)
- ✅ `BC:0C:2C:C3:68:D1:50:C3:7E:07:17:EE:49:8F:D0:35:7D:0F:1E:E3` (nuevo)

## 📝 Nota Importante

**Puedes tener MÚLTIPLES SHA-1s** en el mismo cliente Android. Esto es útil si:
- Tienes diferentes keystores (debug, producción, etc.)
- Tienes APKs compilados con diferentes keystores
- Quieres soportar múltiples builds

## 🎯 Resumen

- ❌ **NO uses**: `https://console.cloud.google.com/apis/credentials?project=amva-digital` (interfaz antigua)
- ✅ **USA**: `https://console.cloud.google.com/apis/credentials/consent?project=amva-digital` (Google Auth Platform)
- ✅ **O directamente**: Ve a "Clientes" en el menú lateral y busca "AMVA Android Client"

¡Con esta URL correcta podrás agregar el SHA-1 sin problemas! 🚀

