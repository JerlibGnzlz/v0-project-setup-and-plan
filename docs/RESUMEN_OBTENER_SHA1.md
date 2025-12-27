# 📋 Resumen: Cómo Obtener SHA-1 del Build

## 🎯 Tu Pregunta: `keytool -keystore path-to-keystore -list -v`

### ✅ Qué Muestra Este Comando

El comando `keytool -keystore path-to-keystore -list -v` muestra:

- ✅ **SHA-1 Certificate Fingerprint** ← Lo que necesitamos
- ✅ SHA-256 Certificate Fingerprint
- ✅ MD5 Certificate Fingerprint
- ✅ Alias del keystore
- ✅ Información del certificado

### ⚠️ Problema con EAS

**EAS NO permite descargar keystores** por seguridad. Los keystores están en los servidores de Expo.

Por lo tanto:
- ❌ No puedes usar `keytool` directamente sobre el keystore de EAS
- ✅ Necesitas obtener el SHA-1 de otra forma

## ✅ Métodos para Obtener SHA-1 del Build

### Método 1: EAS CLI (Más Fácil) ⭐

```bash
cd amva-mobile
eas credentials
```

1. Selecciona: **Android**
2. Selecciona: **preview** (para tu build)
3. Selecciona: **View credentials**

EAS mostrará el SHA-1 directamente.

### Método 2: Extraer del APK

Si tienes el APK del build, puedes extraer el SHA-1:

```bash
# Opción A: Usar apksigner (requiere Android SDK)
apksigner verify --print-certs app.apk | grep -A 1 "SHA-1"

# Opción B: Usar keytool con certificado extraído
unzip -q app.apk -d temp_apk
keytool -printcert -file temp_apk/META-INF/*.RSA | grep -A 1 "SHA1"
rm -rf temp_apk
```

### Método 3: Probar Directamente (Más Rápido)

1. Descarga el APK del build
2. Instálalo en un dispositivo
3. Prueba Google OAuth
4. Si funciona → SHA-1 correcto ✅
5. Si no funciona → SHA-1 incorrecto ❌

## 🎯 Para tu Build Específico

**Build**: `509eaa2d-285d-474f-9a8a-c2d85488dc21`
**APK**: https://expo.dev/artifacts/eas/aXpxxM3bqffGfC1wgryc1D.apk

### Opción Recomendada

```bash
cd amva-mobile
eas credentials
# Android > preview > View credentials
```

Esto te mostrará el SHA-1 directamente.

## 📋 Información que Necesito

Una vez que tengas el SHA-1 (de cualquier método), compártelo conmigo:

```
SHA-1: [el SHA-1 que aparece]
```

O simplemente:
- "El SHA-1 es: 4B:24:0F..."
- "Google OAuth funciona" → SHA-1 correcto ✅
- "Google OAuth no funciona" → SHA-1 incorrecto ❌

## ✅ Lo que Haré con el SHA-1

1. Compararlo con los SHA-1 configurados:
   - `4B:24:0F:1B:6A:E6:3D:71:38:77:D1:E7:69:40:D2:1D:5D:30:7C:40` (default)
   - `BC:0C:2C:C3:68:D1:50:C3:7E:07:17:EE:49:8F:D0:35:7D:0F:1E:E3` (nuevo)

2. Verificar si está en Google Cloud Console

3. Identificar si ese es el SHA-1 que funciona

4. Recomendar qué hacer si falta o está incorrecto

## 🎯 Respuesta Directa

**Sobre `keytool -keystore path-to-keystore -list -v`:**

- ✅ Este comando muestra el SHA-1 del keystore
- ❌ Pero NO puedes usarlo con EAS porque no tienes acceso al keystore físico
- ✅ Usa `eas credentials` en su lugar para obtener el SHA-1 directamente

## 💡 Recomendación Final

**La forma más rápida:**

1. Ejecuta: `cd amva-mobile && eas credentials`
2. Selecciona: Android > preview > View credentials
3. Copia el SHA-1 que aparece
4. Compártelo conmigo

O simplemente:
1. Prueba el APK directamente
2. Dime si Google OAuth funciona o no
3. Con eso identifico el SHA-1 correcto

