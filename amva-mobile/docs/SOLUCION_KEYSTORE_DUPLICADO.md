# 🔧 Solución: Dos Keystores en EAS - Agregar Ambos SHA-1

## 🔍 Problema Identificado

Tienes **DOS keystores** diferentes en EAS:

1. **Build Credentials Z1yAtGGy9c (Default)** - NUEVO
   - SHA-1: `9B:AF:07:1F:4A:A2:70:9C:E6:AB:79:E4:EC:ED:AE:22:CE:F6:DB:8A`
   - Actualizado hace 1 segundo

2. **Build Credentials ZeEnL0LIUD** - ANTERIOR
   - SHA-1: `4B:24:0F:1B:6A:E6:3D:71:38:77:D1:E7:69:40:D2:1D:5D:30:7C:40`
   - Actualizado hace 2 días

**Problema**: 
- El APK que tienes instalado fue compilado con el keystore **ANTERIOR** (`4B:24:0F...`)
- Google Cloud Console tiene configurado el SHA-1 del keystore **NUEVO** (`9B:AF:07...`)
- Por eso no funciona: el SHA-1 del APK no coincide con el configurado en Google Cloud Console

---

## ✅ Solución: Agregar AMBOS SHA-1

Debes tener **AMBOS SHA-1** configurados en Google Cloud Console para que funcionen ambos APKs:

### Paso 1: Ir a Google Cloud Console

Ve a: https://console.cloud.google.com/apis/credentials

### Paso 2: Buscar el Cliente Android

Busca el cliente Android: `378853205278-c2e1gcjn06mg857rcvprns01fu8pduat`

### Paso 3: Agregar Ambos SHA-1

En la sección **"SHA-1 certificate fingerprint"**:

1. **Verifica** que tengas el SHA-1 del keystore NUEVO:
   - `9B:AF:07:1F:4A:A2:70:9C:E6:AB:79:E4:EC:ED:AE:22:CE:F6:DB:8A`
   - (Ya debería estar ahí según la imagen)

2. **Agrega** el SHA-1 del keystore ANTERIOR:
   - Haz clic en **"+ Agregar huella digital"** o **"+ Add fingerprint"**
   - Pega: `4B:24:0F:1B:6A:E6:3D:71:38:77:D1:E7:69:40:D2:1D:5D:30:7C:40`
   - Haz clic en **"Guardar"** o **"Save"**

### Paso 4: Verificar que Tengas Ambos

Después de agregar, deberías tener:

- ✅ SHA-1 del keystore NUEVO: `9B:AF:07:1F:4A:A2:70:9C:E6:AB:79:E4:EC:ED:AE:22:CE:F6:DB:8A`
- ✅ SHA-1 del keystore ANTERIOR: `4B:24:0F:1B:6A:E6:3D:71:38:77:D1:E7:69:40:D2:1D:5D:30:7C:40`

---

## ⏱️ Esperar Propagación

Después de agregar el segundo SHA-1:
- ⏱️ Espera **15-30 minutos** para que Google propague los cambios
- 🔄 Puede tardar hasta **1 hora** en algunos casos

---

## 🚀 Después de Esperar

1. **No necesitas recompilar** el APK actual
2. El APK que tienes instalado debería funcionar (usa el SHA-1 del keystore anterior)
3. Los futuros builds usarán el keystore nuevo (default)

---

## 📋 Resumen

| Keystore | SHA-1 | Estado en Google Cloud Console |
|----------|-------|-------------------------------|
| Z1yAtGGy9c (Nuevo, Default) | `9B:AF:07:1F:4A:A2:70:9C:E6:AB:79:E4:EC:ED:AE:22:CE:F6:DB:8A` | ✅ Ya está configurado |
| ZeEnL0LIUD (Anterior) | `4B:24:0F:1B:6A:E6:3D:71:38:77:D1:E7:69:40:D2:1D:5D:30:7C:40` | ❌ Falta agregar |

**Solución**: Agregar el SHA-1 del keystore anterior (`4B:24:0F...`) en Google Cloud Console.

---

## 💡 Nota Importante

Puedes tener **múltiples SHA-1** en el mismo cliente Android. Esto es normal y recomendado cuando:
- Tienes múltiples keystores (debug, producción, diferentes builds)
- Cambias de keystore pero quieres que los APKs anteriores sigan funcionando
- Tienes diferentes entornos (desarrollo, staging, producción)

**NO elimines** ningún SHA-1 existente, solo agrega el que falta.

---

## ✅ Checklist

- [ ] SHA-1 del keystore NUEVO verificado en Google Cloud Console (`9B:AF:07...`)
- [ ] SHA-1 del keystore ANTERIOR agregado en Google Cloud Console (`4B:24:0F...`)
- [ ] Ambos SHA-1 están configurados
- [ ] Esperado 15-30 minutos después de agregar
- [ ] Probado login con Google en el teléfono físico

