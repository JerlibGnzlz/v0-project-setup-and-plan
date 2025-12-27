# 🔍 Cómo Obtener SHA-1 del Build desde EAS Dashboard

## 🎯 Build ID: `509eaa2d-285d-474f-9a8a-c2d85488dc21`

## ✅ Método 1: Desde EAS Dashboard (Más Fácil)

### Paso 1: Abrir el Build

1. Ve a: https://expo.dev/accounts/jerlibgnzlz/projects/amva-movil/builds/509eaa2d-285d-474f-9a8a-c2d85488dc21
2. O simplemente haz clic en el build desde la lista de builds

### Paso 2: Buscar Información del Keystore/SHA-1

En la página de detalles del build, busca estas secciones:

#### Opción A: Sección "Signing" o "Credentials"
- Busca un título que diga: **"Signing"**, **"Credentials"**, o **"Signing Key"**
- Ahí debería aparecer el **SHA-1 Certificate Fingerprint**

#### Opción B: Sección "Build Details"
- Busca información sobre el **keystore** usado
- O el **certificate fingerprint**

#### Opción C: Sección "Artifacts" o "Download"
- A veces el SHA-1 aparece junto con el APK descargable

### Paso 3: Información que Buscar

Busca específicamente:
- **"SHA-1"** o **"SHA-1 Certificate Fingerprint"**
- **"Certificate Fingerprint"**
- **"Keystore Alias"** (ej: `ZeEnL0LIUD` o `AXSye1dRA5`)
- **"Signing Key"**

### Paso 4: Compartir la Información

Una vez que encuentres el SHA-1, debería verse algo así:

```
SHA-1: 4B:24:0F:1B:6A:E6:3D:71:38:77:D1:E7:69:40:D2:1D:5D:30:7C:40
```

O:

```
Keystore: ZeEnL0LIUD
SHA-1: 4B:24:0F:1B:6A:E6:3D:71:38:77:D1:E7:69:40:D2:1D:5D:30:7C:40
```

## ✅ Método 2: Usar EAS CLI

### Paso 1: Ver Credenciales de Producción

```bash
cd amva-mobile
eas credentials
```

### Paso 2: Seleccionar Opciones

1. Selecciona: **Android**
2. Selecciona: **production** (o el profile que usaste para ese build)
3. Selecciona: **View credentials** o **Show keystore info**

### Paso 3: Ver SHA-1

EAS mostrará:
- **Keystore alias**
- **SHA-1 fingerprint**
- **SHA-256 fingerprint**

## ✅ Método 3: Verificar en Google Cloud Console

Si el build **funciona** con Google OAuth, puedes verificar qué SHA-1 está configurado:

1. Ve a: https://console.cloud.google.com/apis/credentials
2. Busca: `378853205278-c2e1gcjn06mg857rcvprns01fu8pduat`
3. Haz clic para editarlo
4. En **"SHA-1 certificate fingerprint"**, verás los SHA-1 configurados
5. Compara con los que tienes:
   - `4B:24:0F:1B:6A:E6:3D:71:38:77:D1:E7:69:40:D2:1D:5D:30:7C:40` (default)
   - `BC:0C:2C:C3:68:D1:50:C3:7E:07:17:EE:49:8F:D0:35:7D:0F:1E:E3` (nuevo)

## 🎯 Información que Necesito

Para verificar qué SHA-1 usa ese build, necesito:

### Opción A: SHA-1 Directo
```
SHA-1: [el SHA-1 que aparece en el build]
```

### Opción B: Keystore Alias
```
Keystore: [el alias del keystore]
```

### Opción C: Captura de Pantalla
- Una captura de la sección "Signing" o "Credentials" del build

### Opción D: Resultado de Prueba
- Si ya probaste el build:
  - ✅ Funciona → El SHA-1 está correctamente configurado
  - ❌ No funciona → El SHA-1 falta o está incorrecto

## 🔍 Qué Hacer si No Encuentras el SHA-1

Si no encuentras el SHA-1 en la página del build:

1. **Verifica el Profile del Build**
   - Si es "production" → Probablemente usa `4B:24:0F...` (default)
   - Si es "preview" → Puede usar otro keystore

2. **Usa EAS CLI**
   ```bash
   cd amva-mobile
   eas credentials
   ```

3. **Prueba Directamente**
   - Descarga el APK del build
   - Instálalo y prueba Google OAuth
   - Si funciona → El SHA-1 está bien configurado ✅

## ✅ Comparación con SHA-1 Configurados

Una vez que tengas el SHA-1 del build, compáralo con:

| SHA-1 | Keystore | Estado |
|-------|----------|--------|
| `4B:24:0F:1B:6A:E6:3D:71:38:77:D1:E7:69:40:D2:1D:5D:30:7C:40` | `ZeEnL0LIUD` (default) | ✅ Configurado en google-services.json |
| `BC:0C:2C:C3:68:D1:50:C3:7E:07:17:EE:49:8F:D0:35:7D:0F:1E:E3` | `AXSye1dRA5` (nuevo) | ✅ Configurado en google-services.json |

## 🎯 Resultado Esperado

Una vez que tengas el SHA-1:
- ✅ Si coincide con alguno de los dos arriba → Debería funcionar con Google OAuth
- ❌ Si no coincide → Necesitas agregar ese SHA-1 a Google Cloud Console

## 💡 Recomendación

**La forma más rápida:**
1. Abre el build en EAS Dashboard
2. Busca "Signing" o "SHA-1"
3. Comparte el SHA-1 que aparece
4. O simplemente dime: "El build funciona" o "El build no funciona"

Con esa información puedo identificar exactamente qué SHA-1 está usando y si está correctamente configurado.

