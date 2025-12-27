# 📋 Información Necesaria para Verificar Builds

## 🎯 Información que Necesito

Para verificar qué build funciona con Google OAuth, necesito una de estas opciones:

## ✅ Opción 1: Información del Build desde EAS Dashboard (Recomendado)

Para cada build que quieres verificar, necesito:

### Información Básica del Build

1. **Nombre del build** (ej: "Android Play Store build 1.0.0 (1)")
2. **Fecha de creación** (ej: "hace 5 días")
3. **Profile** (ej: "production" o "preview")

### Información del Keystore/SHA-1

En la página de detalles del build, busca y comparte:

1. **SHA-1 Certificate Fingerprint** (si está visible)
   - Ejemplo: `4B:24:0F:1B:6A:E6:3D:71:38:77:D1:E7:69:40:D2:1D:5D:30:7C:40`

2. **Keystore Alias** (si está visible)
   - Ejemplo: `ZeEnL0LIUD` o `AXSye1dRA5`

3. **Signing Key** o **Credentials** (si está visible)
   - Cualquier información sobre el keystore usado

### Cómo Obtener Esta Información

1. Ve a: https://expo.dev/accounts/[tu-cuenta]/projects/[tu-proyecto]/builds
2. Haz clic en el build que quieres verificar
3. Busca en la página:
   - Sección "Signing" o "Credentials"
   - "Certificate Fingerprint"
   - "SHA-1"
   - "Keystore"
4. Toma una captura de pantalla o copia la información

## ✅ Opción 2: Resultado de Prueba Directa (Más Rápido)

Si ya probaste los builds directamente:

### Para cada build probado:

1. **Nombre del build**
   - Ejemplo: "Android Play Store build 1.0.0 (1)"

2. **¿Google OAuth funciona?**
   - ✅ Sí funciona
   - ❌ No funciona
   - ⚠️ No probado aún

3. **Mensaje de error** (si no funciona)
   - Ejemplo: "DEVELOPER_ERROR" o "10: ..."

### Ejemplo de Respuesta:

```
Build 1: "Android Play Store build 1.0.0 (1)" - ✅ Funciona
Build 2: "Android internal distribution build 1.0.0 (1)" - ❌ No funciona (Error: DEVELOPER_ERROR)
Build 3: "Android Play Store build" (hace 7 días) - ⚠️ No probado
```

## ✅ Opción 3: Información desde EAS CLI

Si prefieres usar la terminal:

```bash
cd amva-mobile
eas credentials
```

Luego:
1. Selecciona: **Android**
2. Selecciona: **production** (o el profile que usaste)
3. Selecciona: **View credentials**
4. Comparte la información mostrada (SHA-1, keystore alias, etc.)

## 🎯 Información Mínima Necesaria

**Mínimo necesario:**
- Nombre del build
- SHA-1 usado en el build (si está disponible)
- O resultado de prueba directa (funciona/no funciona)

**Ideal:**
- Nombre del build
- SHA-1 completo
- Keystore alias
- Profile usado
- Fecha de creación

## 📋 Formato de Respuesta Sugerido

Puedes responder en este formato:

```
Build: "Android Play Store build 1.0.0 (1)"
Profile: production
Fecha: hace 5 días
SHA-1: 4B:24:0F:1B:6A:E6:3D:71:38:77:D1:E7:69:40:D2:1D:5D:30:7C:40
Keystore: ZeEnL0LIUD
Google OAuth: ✅ Funciona / ❌ No funciona
```

O simplemente:

```
Build 1: "Android Play Store build 1.0.0 (1)" - ✅ Funciona
Build 2: "Android internal distribution build 1.0.0 (1)" - ❌ No funciona
```

## 🎯 Lo que Haré con Esta Información

1. **Comparar SHA-1** del build con los configurados en Google Cloud Console
2. **Identificar** qué SHA-1 funciona y cuál no
3. **Verificar** si falta algún SHA-1 en Google Cloud Console
4. **Recomendar** qué hacer para que todos los builds funcionen

## ⚠️ Importante

- Si un build **funciona** → Su SHA-1 está correctamente configurado ✅
- Si un build **no funciona** → Su SHA-1 falta o está incorrecto ❌
- Si **todos funcionan** → Todo está bien configurado 🎉

