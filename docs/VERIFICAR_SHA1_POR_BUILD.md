# 🔍 Verificar SHA-1 por Build de EAS

## 🎯 Objetivo

Determinar qué SHA-1 se usó en cada build de EAS y cuál debería funcionar con Google OAuth.

## 📋 Método 1: Verificar en EAS Dashboard (Más Fácil)

### Paso 1: Abrir Detalles del Build

1. En la lista de builds, haz clic en el **nombre del build** que quieres verificar
2. Se abrirá la página de detalles del build

### Paso 2: Ver Información del Keystore

En la página de detalles, busca:
- **"Signing Key"** o **"Keystore"**
- **"Certificate Fingerprint"** o **"SHA-1"**
- **"Credentials"** o **"Signing Credentials"**

### Paso 3: Comparar con SHA-1 Configurados

Compara el SHA-1 del build con los que tienes configurados en Google Cloud Console:

| SHA-1 | Keystore | Estado |
|-------|----------|--------|
| `4B:24:0F:1B:6A:E6:3D:71:38:77:D1:E7:69:40:D2:1D:5D:30:7C:40` | `ZeEnL0LIUD` (default) | ✅ Debe funcionar |
| `BC:0C:2C:C3:68:D1:50:C3:7E:07:17:EE:49:8F:D0:35:7D:0F:1E:E3` | `AXSye1dRA5` (nuevo) | ✅ Debe funcionar |
| `A7:89:E5:05:C8:17:A1:22:EA:90:6E:A6:EA:A3:D4:8B:3A:30:AB:18` | Debug keystore | ⚠️ Solo para desarrollo |

## 📋 Método 2: Usar EAS CLI (Más Preciso)

### Paso 1: Ver Credenciales de Producción

```bash
cd amva-mobile
eas credentials
```

1. Selecciona: **Android**
2. Selecciona: **production** (o el profile que usaste)
3. Selecciona: **View credentials** o **Show keystore info**

### Paso 2: Ver SHA-1 del Keystore

EAS mostrará:
- **Keystore alias**
- **SHA-1 fingerprint**
- **SHA-256 fingerprint**

### Paso 3: Comparar con Google Cloud Console

Compara el SHA-1 mostrado con los configurados en Google Cloud Console.

## 📋 Método 3: Verificar por Profile

### Builds con Profile "production"

Los builds con profile **"production"** generalmente usan:
- ✅ **Keystore default**: `ZeEnL0LIUD` → SHA-1: `4B:24:0F:1B:6A:E6:3D:71:38:77:D1:E7:69:40:D2:1D:5D:30:7C:40`

### Builds con Profile "preview"

Los builds con profile **"preview"** pueden usar:
- ⚠️ **Keystore diferente** o el mismo default
- ⚠️ Verificar en los detalles del build

## 🎯 Análisis de Tus Builds

Basado en tus builds visibles:

### Builds de Producción (Profile: "production")

1. **"Android Play Store build 1.0.0 (1)"** - hace 5 días
   - ✅ **Probable SHA-1**: `4B:24:0F:1B:6A:E6:3D:71:38:77:D1:E7:69:40:D2:1D:5D:30:7C:40`
   - ✅ **Debería funcionar** si este SHA-1 está en Google Cloud Console

2. **"Android Play Store build 1.0.0 (1)"** - hace 5 días (segundo build)
   - ✅ **Probable SHA-1**: `4B:24:0F:1B:6A:E6:3D:71:38:77:D1:E7:69:40:D2:1D:5D:30:7C:40`
   - ✅ **Debería funcionar** si este SHA-1 está en Google Cloud Console

3. **"Android Play Store build"** - hace 7 días
   - ⚠️ **Verificar SHA-1** en los detalles del build
   - ⚠️ Puede usar un keystore diferente si es más antiguo

### Builds de Preview (Profile: "preview")

1. **"Android internal distribution build 1.0.0 (1)"** - hace 5 días
   - ⚠️ **Verificar SHA-1** en los detalles del build
   - ⚠️ Puede usar keystore diferente

2. **"Android internal distribution build"** - hace 7 días
   - ⚠️ **Verificar SHA-1** en los detalles del build
   - ⚠️ Puede usar keystore diferente

## ✅ Pasos para Verificar

### Opción A: Verificar en EAS Dashboard (Recomendado)

1. Haz clic en cada build que quieres verificar
2. Busca **"Signing Key"**, **"Certificate"**, o **"SHA-1"**
3. Compara con los SHA-1 configurados en Google Cloud Console
4. Si coincide → ✅ **Debería funcionar**
5. Si no coincide → ❌ **No funcionará** (agregar SHA-1 a Google Cloud Console)

### Opción B: Usar EAS CLI

```bash
cd amva-mobile

# Ver credenciales de producción
eas credentials

# Seleccionar:
# - Android
# - production
# - View credentials
```

### Opción C: Probar Directamente

1. Descarga el APK del build
2. Instálalo en un dispositivo
3. Prueba Google OAuth
4. Si funciona → ✅ **SHA-1 correcto**
5. Si no funciona → ❌ **SHA-1 incorrecto o no configurado**

## 🎯 Recomendación

### Para Builds Recientes (hace 5 días)

Los builds de producción más recientes probablemente usan:
- ✅ **SHA-1**: `4B:24:0F:1B:6A:E6:3D:71:38:77:D1:E7:69:40:D2:1D:5D:30:7C:40`
- ✅ **Deberían funcionar** si este SHA-1 está en Google Cloud Console

### Para Builds Antiguos (hace 7 días)

Los builds más antiguos pueden usar:
- ⚠️ **SHA-1 diferente** (keystore anterior)
- ⚠️ **Verificar** en los detalles del build

## ✅ Checklist de Verificación

Para cada build que quieres probar:

- [ ] Abrir detalles del build en EAS Dashboard
- [ ] Verificar SHA-1 usado en el build
- [ ] Comparar con SHA-1 configurados en Google Cloud Console
- [ ] Si coincide → ✅ Debería funcionar
- [ ] Si no coincide → Agregar SHA-1 a Google Cloud Console
- [ ] Probar Google OAuth en el APK del build

## 🎉 Resultado Esperado

Si el SHA-1 del build está configurado en Google Cloud Console:
- ✅ Google OAuth debería funcionar
- ✅ No necesitas esperar propagación (ya está configurado)
- ✅ Puedes probar inmediatamente

## ⚠️ Importante

Si el SHA-1 del build **NO está** en Google Cloud Console:
- ❌ Google OAuth NO funcionará
- ✅ Agregar SHA-1 a Google Cloud Console
- ⏱️ Esperar 30 minutos después de agregar
- ✅ Probar nuevamente

