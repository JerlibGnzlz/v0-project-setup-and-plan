# 🔑 Obtener SHA-1 del Build de Producción

## 📋 Build Exitoso

Tu build de producción fue exitoso:
```
BUILD SUCCESSFUL in 6m 19s
484 actionable tasks: 484 executed
```

## 🔍 Cómo Obtener el SHA-1 del Build de Producción

### Opción 1: Desde EAS Build (Recomendado)

El SHA-1 del build de producción se puede obtener desde EAS:

```bash
cd amva-mobile
eas credentials
```

1. Selecciona **Android**
2. Selecciona **View credentials**
3. Busca el keystore que se usó para el build
4. Copia el **SHA-1** que aparece ahí

**Nota**: Si EAS creó un nuevo keystore para este build, el SHA-1 será diferente al anterior.

### Opción 2: Desde el APK/AAB Generado

Si tienes acceso al APK o AAB generado:

```bash
# Para APK
keytool -printcert -jarfile tu-app.apk | grep SHA1

# Para AAB (necesitas extraer el certificado primero)
# O usa el comando de EAS para obtener el SHA-1
```

### Opción 3: Desde los Logs de EAS Build

En los logs de EAS Build, busca líneas como:
- `Signing with keystore: ...`
- `SHA-1: ...`
- Información del keystore usado

### Opción 4: Verificar en EAS Dashboard

1. Ve a: **https://expo.dev/**
2. Selecciona tu proyecto
3. Ve a: **Builds** → Selecciona el build reciente
4. En los detalles del build, busca información del keystore
5. O ve a: **Credentials** → **Android** → Ver el keystore usado

## 🎯 SHA-1 Esperados Según el Keystore

### Si EAS Usó el Keystore Default Actual (`AXSye1dRA5`)

**SHA-1**: `BC:0C:2C:C3:68:D1:50:C3:7E:07:17:EE:49:8F:D0:35:7D:0F:1E:E3`

Este es el SHA-1 que acabas de agregar en Google Cloud Console.

### Si EAS Usó Otro Keystore

El SHA-1 será diferente. Necesitas obtenerlo desde EAS credentials.

## ✅ Verificación: ¿Qué SHA-1 Se Usó?

Para verificar qué SHA-1 se usó en tu build:

### Paso 1: Obtener SHA-1 desde EAS

```bash
cd amva-mobile
eas credentials
# Selecciona: Android → View credentials
# Copia el SHA-1 del keystore usado
```

### Paso 2: Comparar con Google Cloud Console

1. Ve a: **https://console.cloud.google.com/apis/credentials**
2. Busca el cliente Android: `378853205278-c2e1gcjn06mg857rcvprns01fu8pduat`
3. Verifica qué SHA-1 están configurados
4. Compara con el SHA-1 obtenido de EAS

### Paso 3: Si el SHA-1 No Está Configurado

Si el SHA-1 del build NO está en Google Cloud Console:

1. Agrega el SHA-1 obtenido de EAS en Google Cloud Console
2. Espera 30 minutos para propagación
3. Prueba Google OAuth en el APK generado

## 📝 Resumen de SHA-1

| SHA-1 | Keystore | Estado | Para Qué |
|-------|----------|--------|----------|
| `BC:0C:2C:C3:68:D1:50:C3:7E:07:17:EE:49:8F:D0:35:7D:0F:1E:E3` | `AXSye1dRA5` (default actual) | ✅ Agregado | Builds futuros (probablemente este) |
| `4B:24:0F:1B:6A:E6:3D:71:38:77:D1:E7:69:40:D2:1D:5D:30:7C:40` | `ZeEnL0LIUD` (anterior) | ✅ Agregado | APK actual funcionando |
| `A7:89:E5:05:C8:17:A1:22:EA:90:6E:A6:EA:A3:D4:8B:3A:30:AB:18` | Debug keystore | ⚠️ Opcional | Desarrollo local |

## 🎯 Respuesta Directa

**Para saber qué SHA-1 se usó en tu build de producción:**

1. **Ejecuta**: `cd amva-mobile && eas credentials`
2. **Selecciona**: Android → View credentials
3. **Busca**: El keystore usado para el build
4. **Copia**: El SHA-1 que aparece ahí

**Probablemente es**: `BC:0C:2C:C3:68:D1:50:C3:7E:07:17:EE:49:8F:D0:35:7D:0F:1E:E3` (si EAS usó el keystore default actual).

## ⚠️ Importante

**Si el SHA-1 del build NO está en Google Cloud Console**, Google OAuth NO funcionará. Debes agregarlo y esperar 30 minutos.

## ✅ Checklist

- [ ] SHA-1 obtenido desde EAS credentials
- [ ] SHA-1 verificado en Google Cloud Console
- [ ] Si falta, agregado en Google Cloud Console
- [ ] Esperado 30 minutos después de agregar
- [ ] Google OAuth probado en el APK generado

