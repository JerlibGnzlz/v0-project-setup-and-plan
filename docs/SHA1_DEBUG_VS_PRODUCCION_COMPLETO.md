# 🔑 SHA-1 de Debug vs Producción

## 📋 SHA-1 que Obtuviste

```
A7:89:E5:05:C8:17:A1:22:EA:90:6E:A6:EA:A3:D4:8B:3A:30:AB:18
```

**Tipo**: SHA-1 de **DEBUG** (keystore de desarrollo)  
**Keystore**: `~/.android/debug.keystore`  
**Uso**: Solo para desarrollo local (cuando ejecutas `npx expo run:android` o desde Android Studio)

## ⚠️ Importante: Debug vs Producción

### SHA-1 de Debug (Lo que obtuviste)

- **SHA-1**: `A7:89:E5:05:C8:17:A1:22:EA:90:6E:A6:EA:A3:D4:8B:3A:30:AB:18`
- **Keystore**: `~/.android/debug.keystore` (keystore por defecto de Android)
- **Cuándo se usa**: 
  - Cuando ejecutas la app en modo debug desde Android Studio
  - Cuando ejecutas `npx expo run:android` sin especificar perfil de producción
  - Cuando pruebas localmente en tu dispositivo físico o emulador
- **¿Necesitas agregarlo?**: **SÍ, si quieres probar Google OAuth en modo debug**

### SHA-1 de Producción (Para APK final)

- **SHA-1 1**: `4B:24:0F:1B:6A:E6:3D:71:38:77:D1:E7:69:40:D2:1D:5D:30:7C:40`
  - Keystore: `ZeEnL0LIUD` (anterior)
  - **Para tu APK actual funcionando**
  
- **SHA-1 2**: `BC:0C:2C:C3:68:D1:50:C3:7E:07:17:EE:49:8F:D0:35:7D:0F:1E:E3`
  - Keystore: `AXSye1dRA5` (actual)
  - **Para builds futuros con EAS**

- **Cuándo se usa**: 
  - Cuando compilas un APK/AAB para producción con EAS Build
  - Cuando distribuyes la app a usuarios finales
- **¿Necesitas agregarlo?**: **SÍ, obligatorio para producción**

## ✅ ¿Qué SHA-1 Debes Tener Configurado?

### Para Desarrollo Local (Debug)

**SHA-1 de Debug**: `A7:89:E5:05:C8:17:A1:22:EA:90:6E:A6:EA:A3:D4:8B:3A:30:AB:18`

- ✅ **Agrégalo** si quieres probar Google OAuth mientras desarrollas localmente
- ⚠️ **Opcional** si solo pruebas con APKs de producción

### Para Producción

**SHA-1 de Producción 1**: `4B:24:0F:1B:6A:E6:3D:71:38:77:D1:E7:69:40:D2:1D:5D:30:7C:40`

- ✅ **OBLIGATORIO** - Para tu APK actual funcionando

**SHA-1 de Producción 2**: `BC:0C:2C:C3:68:D1:50:C3:7E:07:17:EE:49:8F:D0:35:7D:0F:1E:E3`

- ✅ **Recomendado** - Para builds futuros con EAS

## 🎯 Recomendación: Agregar Ambos

**Lo ideal es tener TODOS los SHA-1 configurados** en Google Cloud Console:

1. ✅ SHA-1 de Debug: `A7:89:E5:05:C8:17:A1:22:EA:90:6E:A6:EA:A3:D4:8B:3A:30:AB:18`
   - Para desarrollo local

2. ✅ SHA-1 de Producción 1: `4B:24:0F:1B:6A:E6:3D:71:38:77:D1:E7:69:40:D2:1D:5D:30:7C:40`
   - Para tu APK actual

3. ✅ SHA-1 de Producción 2: `BC:0C:2C:C3:68:D1:50:C3:7E:07:17:EE:49:8F:D0:35:7D:0F:1E:E3`
   - Para builds futuros

**Puedes tener MÚLTIPLES SHA-1 configurados** en el mismo cliente Android en Google Cloud Console.

## 📋 Cómo Agregar SHA-1 de Debug

### Paso 1: Acceder a Google Cloud Console

1. Ve a: **https://console.cloud.google.com/apis/credentials**
2. Busca el cliente Android: **`378853205278-c2e1gcjn06mg857rcvprns01fu8pduat`**
3. Haz clic para editarlo

### Paso 2: Agregar SHA-1 de Debug

1. En **"SHA-1 certificate fingerprint"**:
   - Haz clic en **"+ Agregar huella digital"** o **"+ Add fingerprint"**
   - Pega: `A7:89:E5:05:C8:17:A1:22:EA:90:6E:A6:EA:A3:D4:8B:3A:30:AB:18`
   - Guarda los cambios

### Paso 3: Verificar Todos los SHA-1

Después de agregar, deberías tener en la lista:

- ✅ `A7:89:E5:05:C8:17:A1:22:EA:90:6E:A6:EA:A3:D4:8B:3A:30:AB:18` (Debug)
- ✅ `4B:24:0F:1B:6A:E6:3D:71:38:77:D1:E7:69:40:D2:1D:5D:30:7C:40` (Producción - APK actual)
- ✅ `BC:0C:2C:C3:68:D1:50:C3:7E:07:17:EE:49:8F:D0:35:7D:0F:1E:E3` (Producción - Builds futuros)

## 🔍 Verificar SHA-1 de Debug

Para obtener el SHA-1 de debug en cualquier momento:

```bash
cd amva-mobile/android
./gradlew signingReport
```

O si estás en la raíz del proyecto:

```bash
cd amva-mobile
npx expo run:android --variant debug
# Luego ejecuta: cd android && ./gradlew signingReport
```

Busca en la salida:
```
Variant: debug
SHA1: A7:89:E5:05:C8:17:A1:22:EA:90:6E:A6:EA:A3:D4:8B:3A:30:AB:18
```

## 📝 Resumen de SHA-1

| SHA-1 | Tipo | Keystore | Para Qué | Prioridad |
|-------|------|----------|----------|-----------|
| `A7:89:E5:05:C8:17:A1:22:EA:90:6E:A6:EA:A3:D4:8B:3A:30:AB:18` | Debug | `~/.android/debug.keystore` | Desarrollo local | Opcional |
| `4B:24:0F:1B:6A:E6:3D:71:38:77:D1:E7:69:40:D2:1D:5D:30:7C:40` | Producción | `ZeEnL0LIUD` | APK actual | **OBLIGATORIO** |
| `BC:0C:2C:C3:68:D1:50:C3:7E:07:17:EE:49:8F:D0:35:7D:0F:1E:E3` | Producción | `AXSye1dRA5` | Builds futuros | Recomendado |

## ✅ Checklist

- [ ] SHA-1 de Debug agregado (`A7:89:E5...`) - Opcional para desarrollo
- [ ] SHA-1 de Producción 1 agregado (`4B:24:0F...`) - **OBLIGATORIO** para APK actual
- [ ] SHA-1 de Producción 2 agregado (`BC:0C:2C...`) - Recomendado para builds futuros
- [ ] Esperado 30 minutos después de agregar
- [ ] Google OAuth probado en modo debug (si agregaste SHA-1 de debug)
- [ ] Google OAuth probado en APK de producción

## 🎯 Respuesta Directa

**Sí, el SHA-1 `A7:89:E5:05:C8:17:A1:22:EA:90:6E:A6:EA:A3:D4:8B:3A:30:AB:18` existe** - es el SHA-1 del keystore de debug de Android.

**¿Debes agregarlo?**
- ✅ **SÍ**, si quieres probar Google OAuth mientras desarrollas localmente
- ⚠️ **NO es obligatorio** si solo pruebas con APKs de producción

**Recomendación**: Agrégalo junto con los SHA-1 de producción para tener máxima compatibilidad en todos los escenarios.

