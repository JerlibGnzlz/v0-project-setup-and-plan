# 🔑 Ver Todas las Credenciales en EAS

## 🎯 Objetivo

Ver todas las credenciales (keystores) configuradas en EAS para identificar cuál usar.

---

## ✅ Pasos para Ver Todas las Credenciales

### Paso 1: Ejecutar EAS Credentials

```bash
cd /home/jerlibgnzlz/Escritorio/v0-project-setup-and-plan/amva-mobile
eas credentials
```

### Paso 2: Seleccionar Android

1. Selecciona: **Android**

### Paso 3: Seleccionar Keystore

1. Selecciona: **Keystore: Manage everything needed to build your project**

### Paso 4: Ver Todas las Credenciales

Cuando veas el menú, deberías ver algo como:

```
Configuration: Build Credentials [Nombre] (Default)
Keystore
  Type: JKS
  Key Alias: [alias]
  SHA1 Fingerprint: [SHA-1]
  Updated: [fecha]

Configuration: Build Credentials [Otro Nombre]
Keystore
  Type: JKS
  Key Alias: [alias]
  SHA1 Fingerprint: [SHA-1]
  Updated: [fecha]
```

**Cada "Configuration" es un keystore diferente.**

---

## 🔍 SHA-1 que Viste

El SHA-1 que mencionaste: `F7:2B:AF:20:1C:84:29:93:30:07:00:5D:EB:1C:1E:95:F6:79:2C:E6`

**Este es diferente** a los que habíamos visto antes:
- ❌ No es `4B:24:0F...` (keystore anterior)
- ❌ No es `9B:AF:07...` (keystore nuevo)
- ✅ Es un **tercer keystore** diferente

---

## 📋 Lista de Keystores que Deberías Ver

Basado en lo que hemos visto, deberías tener:

1. **Build Credentials ZeEnL0LIUD**
   - SHA-1: `4B:24:0F:1B:6A:E6:3D:71:38:77:D1:E7:69:40:D2:1D:5D:30:7C:40`
   - Este es el que funciona con Google Login

2. **Build Credentials Z1yAtGGy9c** (Default)
   - SHA-1: `9B:AF:07:1F:4A:A2:70:9C:E6:AB:79:E4:EC:ED:AE:22:CE:F6:DB:8A`

3. **Build Credentials [Nuevo]** (posiblemente `degYzI_bIR` o similar)
   - SHA-1: `F7:2B:AF:20:1C:84:29:93:30:07:00:5D:EB:1C:1E:95:F6:79:2C:E6`
   - Este es el que acabas de ver

---

## 🎯 Qué Hacer con Esta Información

### Opción 1: Usar el Keystore que Funciona

**Usa el keystore anterior** (`ZeEnL0LIUD`) con SHA-1 `4B:24:0F...`:

1. En EAS credentials, selecciona: **"Change default keystore"**
2. Selecciona: **"Build Credentials ZeEnL0LIUD"**
3. Confirma el cambio
4. Compila el APK

**Ventaja**: Este SHA-1 ya está configurado en Google Cloud Console y funciona.

---

### Opción 2: Agregar el Nuevo SHA-1

Si quieres usar el keystore nuevo (`F7:2B:AF...`):

1. Agrega este SHA-1 en Google Cloud Console:
   - `F7:2B:AF:20:1C:84:29:93:30:07:00:5D:EB:1C:1E:95:F6:79:2C:E6`
2. Espera 30 minutos
3. Compila el APK con ese keystore
4. Prueba Google Login

**Desventaja**: Tendrás que esperar propagación y puede no funcionar inmediatamente.

---

## ✅ Recomendación

**Usa el keystore que ya funciona**: `ZeEnL0LIUD` con SHA-1 `4B:24:0F...`

**Razón**:
- ✅ Ya está configurado en Google Cloud Console
- ✅ Google Login ya funciona con ese SHA-1
- ✅ No necesitas esperar propagación
- ✅ Funcionará inmediatamente

---

## 📋 Resumen de Keystores

| Nombre | SHA-1 | Estado | Recomendación |
|--------|-------|--------|---------------|
| ZeEnL0LIUD | `4B:24:0F...` | ✅ Funciona | **Usar este** |
| Z1yAtGGy9c | `9B:AF:07...` | ⚠️ No probado | Agregar SHA-1 |
| [Nuevo] | `F7:2B:AF...` | ⚠️ No probado | Agregar SHA-1 |

---

## 🚀 Próximos Pasos

1. **Verifica** todas las credenciales con `eas credentials`
2. **Identifica** el keystore `ZeEnL0LIUD` (SHA-1 `4B:24:0F...`)
3. **Cámbialo** como default si no lo es
4. **Compila** el APK con ese keystore
5. **Funcionará** inmediatamente con Google Login

---

## 💡 Nota

El SHA-1 `F7:2B:AF...` que viste es de un **nuevo keystore** que EAS creó. Si quieres usarlo, tendrás que agregarlo en Google Cloud Console y esperar. Pero es más fácil usar el keystore que ya funciona (`4B:24:0F...`).

