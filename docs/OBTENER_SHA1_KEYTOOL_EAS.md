# 🔑 Obtener SHA-1 usando keytool y EAS

## 🎯 Comando keytool

El comando `keytool -keystore path-to-keystore -list -v` muestra información detallada del keystore, incluyendo:

- ✅ **SHA-1 Certificate Fingerprint** (lo que necesitamos)
- ✅ **SHA-256 Certificate Fingerprint**
- ✅ **MD5 Certificate Fingerprint**
- ✅ **Alias del keystore**
- ✅ **Fecha de validez**
- ✅ **Información del certificado**

## ⚠️ Problema con EAS

En EAS, los keystores están en los servidores de Expo, **NO localmente**. Por lo tanto:

- ❌ No puedes ejecutar `keytool` directamente sobre el keystore de EAS
- ✅ Necesitas obtener el SHA-1 de otra forma

## ✅ Método 1: Obtener SHA-1 desde EAS CLI (Recomendado)

### Paso 1: Ver Credenciales

```bash
cd amva-mobile
eas credentials
```

### Paso 2: Seleccionar Opciones

1. Selecciona: **Android**
2. Selecciona: **preview** (o **production** según el build)
3. Selecciona: **View credentials** o **Show keystore info**

### Paso 3: Ver SHA-1

EAS mostrará:
- **Keystore alias**
- **SHA-1 fingerprint** ← Esto es lo que necesitamos
- **SHA-256 fingerprint**

## ✅ Método 2: Obtener Keystore desde EAS (Si es Necesario)

Si realmente necesitas el keystore físico para usar `keytool`:

### Paso 1: Descargar Keystore

```bash
cd amva-mobile
eas credentials
```

1. Selecciona: **Android**
2. Selecciona: **preview** (o **production**)
3. Selecciona: **Download keystore** (si está disponible)

⚠️ **Nota**: EAS generalmente **NO permite** descargar keystores por seguridad. Solo muestra el SHA-1.

### Paso 2: Usar keytool (Si Tienes el Keystore)

Si lograste obtener el keystore:

```bash
keytool -keystore path/to/keystore.jks -list -v
```

O si es un keystore con alias específico:

```bash
keytool -keystore path/to/keystore.jks -list -v -alias nombre-del-alias
```

### Paso 3: Buscar SHA-1 en la Salida

En la salida del comando, busca:

```
Certificate fingerprints:
         SHA1: 4B:24:0F:1B:6A:E6:3D:71:38:77:D1:E7:69:40:D2:1D:5D:30:7C:40
         SHA256: ...
```

## ✅ Método 3: Obtener SHA-1 desde APK Firmado

Si tienes el APK del build, puedes extraer el SHA-1 del certificado usado para firmarlo:

### Paso 1: Descargar APK

```bash
# El APK del build está en:
# https://expo.dev/artifacts/eas/aXpxxM3bqffGfC1wgryc1D.apk
```

### Paso 2: Extraer SHA-1 del APK

```bash
# Opción A: Usar apksigner (Android SDK)
apksigner verify --print-certs path/to/app.apk | grep -A 1 "SHA-1"

# Opción B: Usar keytool con el certificado extraído
unzip -q app.apk -d temp_apk
keytool -printcert -file temp_apk/META-INF/*.RSA | grep -A 1 "SHA1"
rm -rf temp_apk
```

### Paso 3: Ver SHA-1

El comando mostrará el SHA-1 del certificado usado para firmar el APK.

## 🎯 Para tu Build Específico

### Build: `509eaa2d-285d-474f-9a8a-c2d85488dc21`
- **Profile**: `preview`
- **APK**: https://expo.dev/artifacts/eas/aXpxxM3bqffGfC1wgryc1D.apk

### Opción Más Fácil: EAS CLI

```bash
cd amva-mobile
eas credentials
# Android > preview > View credentials
```

Esto te mostrará el SHA-1 directamente sin necesidad de `keytool`.

### Opción Alternativa: Extraer del APK

```bash
# Descargar APK
wget https://expo.dev/artifacts/eas/aXpxxM3bqffGfC1wgryc1D.apk -O build.apk

# Extraer SHA-1 (requiere Android SDK)
apksigner verify --print-certs build.apk | grep -A 1 "SHA-1"

# O usando keytool
unzip -q build.apk -d temp_apk
keytool -printcert -file temp_apk/META-INF/*.RSA | grep -A 1 "SHA1"
rm -rf temp_apk
```

## 📋 Información que Muestra keytool

Cuando ejecutas `keytool -keystore keystore.jks -list -v`, verás:

```
Keystore type: JKS
Keystore provider: SUN

Your keystore contains 1 entry

Alias name: nombre-del-alias
Creation date: Dec 22, 2025
Entry type: PrivateKeyEntry
Certificate chain length: 1
Certificate[1]:
Owner: CN=...
Issuer: CN=...
Serial number: ...
Valid from: ... until: ...
Certificate fingerprints:
         SHA1: 4B:24:0F:1B:6A:E6:3D:71:38:77:D1:E7:69:40:D2:1D:5D:30:7C:40
         SHA256: ...
         MD5: ...
Signature algorithm name: SHA256withRSA
Subject Public Key Algorithm: ...
Version: 3
```

## ✅ Recomendación

**Para tu caso específico:**

1. **Usa EAS CLI** (más fácil):
   ```bash
   cd amva-mobile
   eas credentials
   # Android > preview > View credentials
   ```

2. **O extrae del APK** (si tienes Android SDK):
   ```bash
   apksigner verify --print-certs build.apk | grep -A 1 "SHA-1"
   ```

3. **O prueba directamente** el APK:
   - Si Google OAuth funciona → SHA-1 correcto ✅
   - Si no funciona → SHA-1 incorrecto ❌

## 🎯 Lo que Necesito

Una vez que tengas el SHA-1 (de cualquier método), compártelo conmigo y podré:

1. ✅ Compararlo con los SHA-1 configurados en `google-services.json`
2. ✅ Verificar si está en Google Cloud Console
3. ✅ Identificar si ese es el SHA-1 que funciona con Google OAuth
4. ✅ Recomendar qué hacer si falta o está incorrecto

## 📝 Nota Importante

**EAS generalmente NO permite descargar keystores** por seguridad. Solo muestra el SHA-1 directamente. Por eso, el método más fácil es usar `eas credentials` en lugar de `keytool`.

