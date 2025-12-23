# 🔧 Solución: Cambiar Keystore Default en EAS

## 🔍 Situación Actual

Tienes **DOS keystores** en EAS:

1. **Build Credentials Z1yAtGGy9c (Default)** - NUEVO
   - SHA-1: `9B:AF:07:1F:4A:A2:70:9C:E6:AB:79:E4:EC:ED:AE:22:CE:F6:DB:8A`
   - Actualizado hace 1 segundo

2. **Build Credentials ZeEnL0LIUD** - ANTERIOR
   - SHA-1: `4B:24:0F:1B:6A:E6:3D:71:38:77:D1:E7:69:40:D2:1D:5D:30:7C:40`
   - Actualizado hace 2 días

**Problema**: 
- El APK que tienes instalado fue compilado con el keystore **ANTERIOR** (`4B:24:0F...`)
- EAS ahora está usando el keystore **NUEVO** como default (`9B:AF:07...`)

---

## ✅ Solución: Cambiar Default al Keystore Anterior

Para que los próximos builds usen el keystore que coincide con tu APK actual:

### Opción 1: Cambiar Default al Keystore Anterior (Recomendado)

1. En el menú de EAS credentials, selecciona: **"Change default keystore"**
2. Selecciona: **"Build Credentials ZeEnL0LIUD"** (el keystore anterior)
3. Esto hará que los próximos builds usen el keystore anterior

**Ventaja**: Los próximos builds funcionarán con el SHA-1 que ya tienes configurado (`4B:24:0F...`)

---

### Opción 2: Mantener Ambos SHA-1 en Google Cloud Console

Si prefieres usar el keystore nuevo como default:

1. Asegúrate de tener **AMBOS SHA-1** en Google Cloud Console:
   - `9B:AF:07:1F:4A:A2:70:9C:E6:AB:79:E4:EC:ED:AE:22:CE:F6:DB:8A` (nuevo)
   - `4B:24:0F:1B:6A:E6:3D:71:38:77:D1:E7:69:40:D2:1D:5D:30:7C:40` (anterior)

2. Los builds futuros usarán el keystore nuevo
3. El APK actual seguirá funcionando porque tiene el SHA-1 anterior configurado

**Ventaja**: Puedes usar el keystore nuevo para builds futuros

---

## 🎯 Recomendación

**Te recomiendo la Opción 1**: Cambiar el default al keystore anterior.

**Razón**: 
- Tu APK actual usa el keystore anterior
- Si cambias el default al anterior, los próximos builds también lo usarán
- Solo necesitas tener un SHA-1 configurado (`4B:24:0F...`)
- Es más simple y evita confusiones

---

## 📋 Pasos para Cambiar Default

1. En el menú actual, selecciona: **"Change default keystore"**
2. Selecciona: **"Build Credentials ZeEnL0LIUD"**
3. Confirma el cambio
4. Los próximos builds usarán este keystore

---

## ⚠️ Importante

**NO selecciones**:
- ❌ "Set up a new keystore" (ya tienes los que necesitas)
- ❌ "Delete your keystore" (no elimines ninguno)

**SÍ selecciona**:
- ✅ "Change default keystore" (para cambiar al anterior)
- ✅ O "Go back" (si prefieres mantener ambos SHA-1)

---

## 🔄 Después de Cambiar Default

1. Los próximos builds usarán el keystore anterior (`4B:24:0F...`)
2. Asegúrate de tener ese SHA-1 en Google Cloud Console (ya lo tienes)
3. Compila un nuevo APK:
   ```bash
   eas build --platform android --profile production
   ```
4. El nuevo APK funcionará con Google Login

---

## 💡 Alternativa: Mantener Ambos

Si prefieres mantener ambos keystores y tener ambos SHA-1 configurados:

1. Selecciona: **"Go back"**
2. Asegúrate de tener **AMBOS SHA-1** en Google Cloud Console
3. Los builds futuros usarán el keystore nuevo (default)
4. El APK actual seguirá funcionando con el SHA-1 anterior

---

## ✅ Resumen

**Para resolver DEVELOPER_ERROR rápidamente**:
1. Selecciona: **"Change default keystore"**
2. Selecciona: **"Build Credentials ZeEnL0LIUD"** (el anterior)
3. Verifica que el SHA-1 `4B:24:0F...` esté en Google Cloud Console
4. Haz reinstalación limpia de la app
5. Prueba de nuevo

**O si prefieres mantener ambos**:
1. Selecciona: **"Go back"**
2. Asegúrate de tener **AMBOS SHA-1** en Google Cloud Console
3. Haz reinstalación limpia
4. Prueba de nuevo

