# 🔑 ¿Cuál SHA-1 Agregar en Google Cloud Console?

## 🎯 Respuesta Rápida

**Necesitas agregar AMBOS SHA-1**, pero si solo puedes agregar uno ahora:

**Agrega este primero**: `4B:24:0F:1B:6A:E6:3D:71:38:77:D1:E7:69:40:D2:1D:5D:30:7C:40`

**Razón**: Tu APK actual fue compilado con el keystore anterior, así que este SHA-1 es el que necesita tu app instalada.

---

## 📋 Explicación Detallada

### SHA-1 del Keystore Anterior (PRIORITARIO)
```
4B:24:0F:1B:6A:E6:3D:71:38:77:D1:E7:69:40:D2:1D:5D:30:7C:40
```
- ✅ **Este es el que usa tu APK actual**
- ✅ **Agrégalo PRIMERO** para que funcione tu app instalada
- ✅ Keystore: `ZeEnL0LIUD` (actualizado hace 2 días)

### SHA-1 del Keystore Nuevo (SECUNDARIO)
```
9B:AF:07:1F:4A:A2:70:9C:E6:AB:79:E4:EC:ED:AE:22:CE:F6:DB:8A
```
- ⚠️ Este es el keystore nuevo (default)
- ⚠️ Los próximos builds usarán este keystore
- ⚠️ Agrégalo DESPUÉS para que funcionen los builds futuros

---

## ✅ Pasos Recomendados

### Paso 1: Agregar SHA-1 del Keystore Anterior (PRIORITARIO)

1. Ve a: **https://console.cloud.google.com/apis/credentials**
2. Busca el cliente Android: `378853205278-c2e1gcjn06mg857rcvprns01fu8pduat`
3. Haz clic para editarlo
4. En "SHA-1 certificate fingerprint":
   - Haz clic en **"+ Agregar huella digital"** o **"+ Add fingerprint"**
   - Pega: `4B:24:0F:1B:6A:E6:3D:71:38:77:D1:E7:69:40:D2:1D:5D:30:7C:40`
   - Guarda los cambios

**Este es el más importante porque tu APK actual lo necesita.**

---

### Paso 2: Agregar SHA-1 del Keystore Nuevo (OPCIONAL pero Recomendado)

1. En el mismo cliente Android
2. Haz clic en **"+ Agregar huella digital"** de nuevo
3. Pega: `9B:AF:07:1F:4A:A2:70:9C:E6:AB:79:E4:EC:ED:AE:22:CE:F6:DB:8A`
4. Guarda los cambios

**Este es para que funcionen los builds futuros con el keystore nuevo.**

---

## 🎯 Orden de Prioridad

1. **PRIMERO**: `4B:24:0F:1B:6A:E6:3D:71:38:77:D1:E7:69:40:D2:1D:5D:30:7C:40`
   - Para que funcione tu APK actual

2. **SEGUNDO**: `9B:AF:07:1F:4A:A2:70:9C:E6:AB:79:E4:EC:ED:AE:22:CE:F6:DB:8A`
   - Para que funcionen los builds futuros

---

## ⚠️ Si Solo Puedes Agregar Uno

Si por alguna razón solo puedes agregar uno ahora:

**Agrega este**: `4B:24:0F:1B:6A:E6:3D:71:38:77:D1:E7:69:40:D2:1D:5D:30:7C:40`

**Razón**: 
- Tu APK actual lo necesita para funcionar
- Puedes agregar el otro después cuando compiles un nuevo APK

---

## 📋 Resumen

| SHA-1 | Keystore | Prioridad | Para Qué |
|-------|----------|-----------|----------|
| `4B:24:0F...` | Anterior (ZeEnL0LIUD) | **ALTA** | APK actual instalado |
| `9B:AF:07...` | Nuevo (Z1yAtGGy9c) | Media | Builds futuros |

---

## ✅ Checklist

- [ ] SHA-1 del keystore anterior agregado (`4B:24:0F...`) - **OBLIGATORIO**
- [ ] SHA-1 del keystore nuevo agregado (`9B:AF:07...`) - Opcional pero recomendado
- [ ] Esperado 30 minutos después de agregar
- [ ] Reinstalación limpia realizada
- [ ] Login con Google probado

---

## 🚀 Después de Agregar

1. Espera **30 minutos** para que Google propague los cambios
2. Haz una **reinstalación limpia** de la app
3. Prueba el **login con Google**

Debería funcionar con el SHA-1 del keystore anterior (`4B:24:0F...`).

