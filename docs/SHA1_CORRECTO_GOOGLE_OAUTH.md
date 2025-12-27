# 🔑 SHA-1 Correcto para Google OAuth

## ✅ SHA-1 que DEBES Tener Configurado

Según tu keystore actual en EAS, el SHA-1 correcto es:

```
BC:0C:2C:C3:68:D1:50:C3:7E:07:17:EE:49:8F:D0:35:7D:0F:1E:E3
```

**Keystore**: `AXSye1dRA5` (default actual)

## 📋 SHA-1 Documentados Anteriormente

Según la documentación previa, estos SHA-1 también fueron mencionados:

1. **Keystore anterior** (`ZeEnL0LIUD`):
   ```
   4B:24:0F:1B:6A:E6:3D:71:38:77:D1:E7:69:40:D2:1D:5D:30:7C:40
   ```
   - ⚠️ Este keystore ya no existe en EAS
   - ✅ **Si tienes un APK compilado con este keystore, DEBES tener este SHA-1 configurado**
   - 📱 **Este es el SHA-1 que usa tu APK actual funcionando**
   - 📖 Consulta `docs/APK_FUNCIONANDO_SHA1_4B24.md` para instrucciones específicas

2. **Keystore nuevo** (`Z1yAtGGy9c`):
   ```
   9B:AF:07:1F:4A:A2:70:9C:E6:AB:79:E4:EC:ED:AE:22:CE:F6:DB:8A
   ```
   - ⚠️ Este keystore tampoco existe actualmente

3. **Keystore default actual** (`AXSye1dRA5`):
   ```
   BC:0C:2C:C3:68:D1:50:C3:7E:07:17:EE:49:8F:D0:35:7D:0F:1E:E3
   ```
   - ✅ **Este es el keystore que EAS está usando actualmente**
   - ✅ **Este es el SHA-1 que DEBES tener configurado**

## 🎯 Solución Recomendada

### Paso 1: Verificar en Google Cloud Console

1. Ve a: **https://console.cloud.google.com/apis/credentials**
2. Busca el cliente Android: **`378853205278-c2e1gcjn06mg857rcvprns01fu8pduat`**
3. Haz clic para editarlo
4. En **"SHA-1 certificate fingerprint"**, verifica qué SHA-1 están configurados

### Paso 2: Agregar el SHA-1 Correcto

Si el SHA-1 `BC:0C:2C:C3:68:D1:50:C3:7E:07:17:EE:49:8F:D0:35:7D:0F:1E:E3` **NO está** en la lista:

1. Haz clic en **"+ Agregar huella digital"** o **"+ Add fingerprint"**
2. Pega: `BC:0C:2C:C3:68:D1:50:C3:7E:07:17:EE:49:8F:D0:35:7D:0F:1E:E3`
3. Guarda los cambios

### Paso 3: Mantener SHA-1 Anteriores (Opcional pero Recomendado)

Si tienes APKs compilados con keystores anteriores, **mantén esos SHA-1 también**:

- ✅ `4B:24:0F:1B:6A:E6:3D:71:38:77:D1:E7:69:40:D2:1D:5D:30:7C:40` (si tienes APKs con este keystore)
- ✅ `9B:AF:07:1F:4A:A2:70:9C:E6:AB:79:E4:EC:ED:AE:22:CE:F6:DB:8A` (si tienes APKs con este keystore)

**Puedes tener MÚLTIPLES SHA-1 configurados** en el mismo cliente Android.

### Paso 4: Esperar Propagación

- ⏱️ Espera **30 minutos** para que Google propague los cambios
- 🔄 Los cambios pueden tardar hasta 1 hora en algunos casos

## ✅ Verificación Final

Después de agregar el SHA-1:

1. Espera 30 minutos
2. Reinstala la app completamente (desinstalar y volver a instalar)
3. Prueba el login con Google
4. Si aún no funciona, verifica los logs de la app

## 📝 Resumen

| SHA-1 | Keystore | Estado | Prioridad |
|-------|----------|--------|-----------|
| `BC:0C:2C:C3:68:D1:50:C3:7E:07:17:EE:49:8F:D0:35:7D:0F:1E:E3` | `AXSye1dRA5` (actual) | ✅ **OBLIGATORIO** | **ALTA** |
| `4B:24:0F:1B:6A:E6:3D:71:38:77:D1:E7:69:40:D2:1D:5D:30:7C:40` | `ZeEnL0LIUD` (anterior) | ⚠️ Mantener si tienes APKs antiguos | Media |
| `9B:AF:07:1F:4A:A2:70:9C:E6:AB:79:E4:EC:ED:AE:22:CE:F6:DB:8A` | `Z1yAtGGy9c` (nuevo) | ⚠️ Mantener si tienes APKs con este | Media |

## 🎯 Respuesta Directa

### Si Tienes un APK Funcionando con SHA-1 4B:24:0F...

**Si tu APK actual fue compilado con el keystore anterior, el SHA-1 que DEBES tener configurado es:**

```
4B:24:0F:1B:6A:E6:3D:71:38:77:D1:E7:69:40:D2:1D:5D:30:7C:40
```

📖 **Consulta `docs/APK_FUNCIONANDO_SHA1_4B24.md` para instrucciones paso a paso.**

### Si Vas a Compilar un Nuevo APK

**El SHA-1 que DEBES tener configurado para builds futuros es:**

```
BC:0C:2C:C3:68:D1:50:C3:7E:07:17:EE:49:8F:D0:35:7D:0F:1E:E3
```

Este es el SHA-1 del keystore default actual (`AXSye1dRA5`) que EAS está usando para compilar tu app.

### Recomendación: Agregar Ambos

**Lo ideal es tener AMBOS SHA-1 configurados** en Google Cloud Console:
- `4B:24:0F...` para tu APK actual funcionando
- `BC:0C:2C...` para builds futuros

Puedes tener múltiples SHA-1 configurados simultáneamente.

