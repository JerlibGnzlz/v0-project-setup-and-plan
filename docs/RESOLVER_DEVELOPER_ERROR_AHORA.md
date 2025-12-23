# 🔧 Resolver DEVELOPER_ERROR AHORA - Guía Rápida

## ⚠️ Error Actual
```
DEVELOPER_ERROR: Verifica que el SHA-1 esté configurado en Google Cloud Console
```

## ✅ SHA-1 que DEBES Agregar (Para Emulador)

Si estás probando en el **emulador**, necesitas agregar estos SHA-1 de **debug**:

### 1. SHA-1 del Keystore de Debug Estándar (OBLIGATORIO)
```
56:46:F7:AE:10:42:F8:3E:F0:CC:3F:70:37:54:7F:BF:DE:BC:3E:30
```
**Este es el más común y el que probablemente falta**

### 2. SHA-1 del Keystore de Debug Local (RECOMENDADO)
```
5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25
```
**Agregar este también por si el emulador usa el keystore local**

---

## 📋 Todos los SHA-1 Disponibles

| SHA-1 | Tipo | Cuándo Agregar |
|-------|------|----------------|
| `56:46:F7:AE:10:42:F8:3E:F0:CC:3F:70:37:54:7F:BF:DE:BC:3E:30` | **Debug Estándar** | ✅ **AGREGAR AHORA** (para emulador) |
| `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25` | **Debug Local** | ✅ **AGREGAR AHORA** (para emulador) |
| `BC:0C:2C:C3:68:D1:50:C3:7E:07:17:EE:49:8F:D0:35:7D:0F:1E:E3` | Producción (EAS Default) | ✅ Ya debería estar agregado |
| `4B:24:0F:1B:6A:E6:3D:71:38:77:D1:E7:69:40:D2:1D:5D:30:7C:40` | Producción (Anterior) | ⚠️ Opcional (si tienes APKs antiguos) |
| `9B:AF:07:1F:4A:A2:70:9C:E6:AB:79:E4:EC:ED:AE:22:CE:F6:DB:8A` | Producción (Otro) | ⚠️ Opcional (si tienes APKs antiguos) |

---

## 🎯 Pasos para Resolver el Error

### Paso 1: Ir a Google Cloud Console
1. Ve a: https://console.cloud.google.com/apis/credentials
2. Asegúrate de estar en el proyecto correcto

### Paso 2: Encontrar tu OAuth Client ID de Android
1. Busca el OAuth 2.0 Client ID de Android
2. El Client ID debería ser: `378853205278-c2e1gcjn06mg857rcvprns01fu8pduat.apps.googleusercontent.com`
3. O busca por Package name: `org.vidaabundante.app`
4. Haz clic en el nombre del Client ID para editarlo

### Paso 3: Agregar SHA-1 de Debug (OBLIGATORIO)
1. En la sección **"SHA-1 certificate fingerprints"**, haz clic en **"+ Add fingerprint"**
2. Pega el primer SHA-1 de debug:
   ```
   56:46:F7:AE:10:42:F8:3E:F0:CC:3F:70:37:54:7F:BF:DE:BC:3E:30
   ```
3. Haz clic en **"Save"**

### Paso 4: Agregar SHA-1 de Debug Local (RECOMENDADO)
1. Haz clic nuevamente en **"+ Add fingerprint"**
2. Pega el segundo SHA-1 de debug:
   ```
   5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25
   ```
3. Haz clic en **"Save"**

### Paso 5: Verificar SHA-1 de Producción
1. Verifica que el SHA-1 de producción esté agregado:
   ```
   BC:0C:2C:C3:68:D1:50:C3:7E:07:17:EE:49:8F:D0:35:7D:0F:1E:E3
   ```
2. Si no está, agrégalo también

### Paso 6: Esperar y Probar
1. **Espera 5-10 minutos** después de agregar los SHA-1 (Google puede tardar en propagar)
2. **Cierra completamente** la app en el emulador (no solo la minimices)
3. **Reinicia** la app en el emulador
4. **Prueba** iniciar sesión con Google nuevamente

---

## 🔍 Verificar Qué SHA-1 Está Usando el Emulador

Si quieres verificar qué SHA-1 está usando tu emulador actualmente, ejecuta:

```bash
cd amva-mobile
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android | grep -A 1 "SHA1:"
```

Deberías ver:
```
SHA1: 56:46:F7:AE:10:42:F8:3E:F0:CC:3F:70:37:54:7F:BF:DE:BC:3E:30
```

---

## ✅ Checklist Final

- [ ] SHA-1 de debug estándar agregado: `56:46:F7:AE:10:42:F8:3E:F0:CC:3F:70:37:54:7F:BF:DE:BC:3E:30`
- [ ] SHA-1 de debug local agregado: `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25`
- [ ] SHA-1 de producción verificado: `BC:0C:2C:C3:68:D1:50:C3:7E:07:17:EE:49:8F:D0:35:7D:0F:1E:E3`
- [ ] Package name verificado: `org.vidaabundante.app`
- [ ] Esperado 5-10 minutos después de agregar SHA-1
- [ ] App cerrada completamente y reiniciada
- [ ] Probado iniciar sesión con Google

---

## 🚨 Si el Error Persiste

### Verificar que los SHA-1 Estén Correctos

1. Ejecuta el comando de verificación arriba
2. Compara el SHA-1 que obtienes con los que agregaste
3. Si son diferentes, agrega el SHA-1 que obtuviste

### Verificar el Package Name

En Google Cloud Console, verifica que el **Package name** sea exactamente:
```
org.vidaabundante.app
```

### Verificar el OAuth Consent Screen

1. Ve a: https://console.cloud.google.com/apis/credentials/consent
2. Verifica que el **OAuth Consent Screen** esté configurado
3. Si está en modo "Testing", agrega tu email como usuario de prueba

---

## 📝 Resumen Rápido

**Para resolver el DEVELOPER_ERROR en el emulador, agrega estos 2 SHA-1:**

1. ✅ `56:46:F7:AE:10:42:F8:3E:F0:CC:3F:70:37:54:7F:BF:DE:BC:3E:30`
2. ✅ `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25`

**Y verifica que este SHA-1 de producción esté agregado:**

3. ✅ `BC:0C:2C:C3:68:D1:50:C3:7E:07:17:EE:49:8F:D0:35:7D:0F:1E:E3`

**Después de agregar, espera 5-10 minutos y prueba nuevamente.**

