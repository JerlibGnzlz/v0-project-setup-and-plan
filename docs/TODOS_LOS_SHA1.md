# 🔐 Todos los SHA-1 Necesarios para Google Sign-In

## 📋 SHA-1 Encontrados

### 1. SHA-1 del Keystore de Debug Estándar (Emulador/Desarrollo)
```
56:46:F7:AE:10:42:F8:3E:F0:CC:3F:70:37:54:7F:BF:DE:BC:3E:30
```
**Uso**: Para probar en emulador y builds de desarrollo
**Keystore**: `~/.android/debug.keystore` (ubicación estándar de Android)
**Alias**: `androiddebugkey`
**Estado**: ⚠️ **Este es el que falta y causa el DEVELOPER_ERROR**

---

### 2. SHA-1 del Keystore de Debug Local (Alternativo)
```
5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25
```
**Uso**: Si el emulador usa este keystore local
**Keystore**: `./android/app/debug.keystore` (en el proyecto)
**Alias**: `androiddebugkey`
**Estado**: ⚠️ **También agregar este por si acaso**

---

### 3. SHA-1 de Producción (EAS Build - Default)
```
BC:0C:2C:C3:68:D1:50:C3:7E:07:17:EE:49:8F:D0:35:7D:0F:1E:E3
```
**Uso**: Para builds de producción (APK/AAB) generados por EAS Build
**Keystore**: EAS Build (Default keystore)
**Configuración**: Build Credentials `AXSye1dRA5` (Default)

---

### 4. SHA-1 de Producción (EAS Build - Anterior)
```
4B:24:0F:1B:6A:E6:3D:71:38:77:D1:E7:69:40:D2:1D:5D:30:7C:40
```
**Uso**: Para builds de producción anteriores (si aún los usas)
**Keystore**: EAS Build (keystore anterior)
**Estado**: Puede estar obsoleto si EAS creó uno nuevo

---

### 5. SHA-1 de Producción (EAS Build - Otro)
```
9B:AF:07:1F:4A:A2:70:9C:E6:AB:79:E4:EC:ED:AE:22:CE:F6:DB:8A
```
**Uso**: Otro keystore de producción de EAS Build
**Estado**: Puede estar obsoleto

---

## ✅ SHA-1 que DEBES Agregar en Google Cloud Console

### Para Emulador/Desarrollo (OBLIGATORIO - Agregar AMBOS)

**1. SHA-1 del Keystore Estándar:**
```
56:46:F7:AE:10:42:F8:3E:F0:CC:3F:70:37:54:7F:BF:DE:BC:3E:30
```
**Este es el más común y probablemente el que falta**

**2. SHA-1 del Keystore Local (Por si acaso):**
```
5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25
```
**Agregar este también por si el emulador usa el keystore local**

### Para Producción (Ya debería estar agregado)
```
BC:0C:2C:C3:68:D1:50:C3:7E:07:17:EE:49:8F:D0:35:7D:0F:1E:E3
```
**Este es el keystore actual de EAS Build (Default)**

---

## 🔍 Cómo Verificar Qué SHA-1 Están en Google Cloud Console

1. Ve a: https://console.cloud.google.com/apis/credentials
2. Busca tu OAuth 2.0 Client ID de Android: `378853205278-c2e1gcjn06mg857rcvprns01fu8pduat.apps.googleusercontent.com`
3. Haz clic en el nombre para editarlo
4. Revisa la sección **"SHA-1 certificate fingerprints"**
5. Deberías ver una lista de todos los SHA-1 agregados

---

## 📝 Lista Completa de SHA-1 para Agregar

Agrega **TODOS** estos SHA-1 en Google Cloud Console para evitar problemas:

| SHA-1 | Tipo | Estado | Acción |
|-------|------|--------|--------|
| `56:46:F7:AE:10:42:F8:3E:F0:CC:3F:70:37:54:7F:BF:DE:BC:3E:30` | Debug Estándar | ⚠️ **FALTA** | ✅ **AGREGAR** |
| `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25` | Debug Local | ⚠️ **FALTA** | ✅ **AGREGAR** |
| `BC:0C:2C:C3:68:D1:50:C3:7E:07:17:EE:49:8F:D0:35:7D:0F:1E:E3` | Producción (EAS Default) | ✅ Ya agregado | Verificar |
| `4B:24:0F:1B:6A:E6:3D:71:38:77:D1:E7:69:40:D2:1D:5D:30:7C:40` | Producción (EAS Anterior) | ⚠️ Puede estar obsoleto | Opcional |
| `9B:AF:07:1F:4A:A2:70:9C:E6:AB:79:E4:EC:ED:AE:22:CE:F6:DB:8A` | Producción (EAS Otro) | ⚠️ Puede estar obsoleto | Opcional |

---

## 🎯 Recomendación

### Mínimo Necesario (OBLIGATORIO)
Agrega estos 3 SHA-1:
1. ✅ `56:46:F7:AE:10:42:F8:3E:F0:CC:3F:70:37:54:7F:BF:DE:BC:3E:30` (Debug Estándar - para emulador)
2. ✅ `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25` (Debug Local - por si acaso)
3. ✅ `BC:0C:2C:C3:68:D1:50:C3:7E:07:17:EE:49:8F:D0:35:7D:0F:1E:E3` (Producción - EAS Default)

### Opcional (Si Quieres Mantener Compatibilidad)
Si tienes builds antiguos con los otros keystores, también agrégalos:
3. `4B:24:0F:1B:6A:E6:3D:71:38:77:D1:E7:69:40:D2:1D:5D:30:7C:40`
4. `9B:AF:07:1F:4A:A2:70:9C:E6:AB:79:E4:EC:ED:AE:22:CE:F6:DB:8A`

---

## 🔧 Cómo Agregar SHA-1 en Google Cloud Console

### Paso a Paso

1. **Ir a Credenciales**:
   - https://console.cloud.google.com/apis/credentials

2. **Encontrar tu OAuth Client ID de Android**:
   - Busca: `378853205278-c2e1gcjn06mg857rcvprns01fu8pduat.apps.googleusercontent.com`
   - O busca por Package name: `org.vidaabundante.app`

3. **Editar el Client ID**:
   - Haz clic en el nombre del Client ID

4. **Agregar SHA-1**:
   - En "SHA-1 certificate fingerprints", haz clic en **"+ Add fingerprint"**
   - Pega el SHA-1 que quieres agregar
   - Haz clic en **"Save"**

5. **Repetir para cada SHA-1**:
   - Agrega todos los SHA-1 que necesites (mínimo 2: debug + producción)

---

## ⏱️ Tiempo de Propagación

Después de agregar los SHA-1:
- ⏰ Espera **5-10 minutos** para que Google propague los cambios
- 🔄 Cierra completamente la app en el emulador
- 🚀 Reinicia la app
- ✅ Prueba iniciar sesión con Google

---

## 🚨 Si el Error Persiste

### Verificar que el SHA-1 Esté Correcto

Ejecuta este comando para verificar el SHA-1 del keystore de debug:

```bash
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android | grep -A 1 "SHA1:"
```

Deberías ver:
```
SHA1: 56:46:F7:AE:10:42:F8:3E:F0:CC:3F:70:37:54:7F:BF:DE:BC:3E:30
```

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

## 📊 Resumen

| SHA-1 | Prioridad | Estado Actual |
|-------|-----------|---------------|
| Debug Estándar (`56:46:F7...`) | 🔴 **CRÍTICO** | ⚠️ **FALTA** - Causa el error |
| Debug Local (`5E:8F:16...`) | 🔴 **CRÍTICO** | ⚠️ **FALTA** - Agregar por si acaso |
| Producción EAS Default (`BC:0C:2C...`) | 🟢 **IMPORTANTE** | ✅ Debería estar agregado |
| Producción EAS Anterior (`4B:24:0F...`) | 🟡 **OPCIONAL** | ⚠️ Puede estar obsoleto |
| Producción EAS Otro (`9B:AF:07...`) | 🟡 **OPCIONAL** | ⚠️ Puede estar obsoleto |

---

## ✅ Checklist Final

- [ ] SHA-1 de debug estándar agregado: `56:46:F7:AE:10:42:F8:3E:F0:CC:3F:70:37:54:7F:BF:DE:BC:3E:30`
- [ ] SHA-1 de debug local agregado: `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25`
- [ ] SHA-1 de producción verificado: `BC:0C:2C:C3:68:D1:50:C3:7E:07:17:EE:49:8F:D0:35:7D:0F:1E:E3`
- [ ] Package name verificado: `org.vidaabundante.app`
- [ ] OAuth Consent Screen configurado
- [ ] Esperado 5-10 minutos después de agregar SHA-1
- [ ] App reiniciada completamente
- [ ] Probado iniciar sesión con Google

---

**Los SHA-1 de debug (`56:46:F7...` y `5E:8F:16...`) son los que faltan y causan el DEVELOPER_ERROR. Agrégales AMBOS primero.**

