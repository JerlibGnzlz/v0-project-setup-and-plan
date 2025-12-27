# ⏱️ ¿Por Qué Tarda en Actualizarse el SHA-1 en Google Cloud Console?

## ✅ SHA-1 que Estás Agregando

```
BC:0C:2C:C3:68:D1:50:C3:7E:07:17:EE:49:8F:D0:35:7D:0F:1E:E3
```

**Keystore**: `AXSye1dRA5` (keystore default actual de EAS)  
**Para**: Builds futuros con EAS Build

## ⏱️ Tiempo de Propagación de Google

### Tiempo Normal de Espera

- **Mínimo**: 5-15 minutos
- **Promedio**: 30 minutos
- **Máximo**: 1 hora (en casos raros, hasta 2 horas)

### ¿Por Qué Tarda?

Google Cloud Console necesita tiempo para:

1. **Validar el SHA-1**: Verificar que el formato sea correcto
2. **Propagar cambios**: Distribuir la configuración a todos los servidores de Google
3. **Actualizar cachés**: Actualizar las cachés de autenticación en diferentes regiones
4. **Sincronizar servicios**: Sincronizar con Firebase, Google Sign-In, y otros servicios

**Esto es normal y esperado**. No es un error, es parte del proceso de Google.

## ✅ Verificación: ¿Qué SHA-1 Debes Tener Configurados?

### SHA-1 que Estás Agregando (Correcto)

```
BC:0C:2C:C3:68:D1:50:C3:7E:07:17:EE:49:8F:D0:35:7D:0F:1E:E3
```

✅ **Este es correcto** - Para builds futuros con EAS

### SHA-1 que También Debes Tener (Importante)

```
4B:24:0F:1B:6A:E6:3D:71:38:77:D1:E7:69:40:D2:1D:5D:30:7C:40
```

⚠️ **¿Lo tienes agregado?** - Este es para tu APK actual funcionando

**Recomendación**: Agrega AMBOS SHA-1 en Google Cloud Console para máxima compatibilidad.

## 🔍 Cómo Verificar que Está Configurado

### Paso 1: Verificar en Google Cloud Console

1. Ve a: **https://console.cloud.google.com/apis/credentials**
2. Busca el cliente Android: `378853205278-c2e1gcjn06mg857rcvprns01fu8pduat`
3. Haz clic para editarlo
4. En **"SHA-1 certificate fingerprint"**, verifica que aparezcan:

   - ✅ `BC:0C:2C:C3:68:D1:50:C3:7E:07:17:EE:49:8F:D0:35:7D:0F:1E:E3` (el que acabas de agregar)
   - ✅ `4B:24:0F:1B:6A:E6:3D:71:38:77:D1:E7:69:40:D2:1D:5D:30:7C:40` (para tu APK actual)

### Paso 2: Esperar Propagación

Después de agregar el SHA-1:

1. ⏱️ **Espera 30 minutos** (tiempo promedio de propagación)
2. 🔄 **No reinstales la app** durante este tiempo
3. ✅ **Después de 30 minutos**, prueba Google OAuth

## 🎯 Qué Hacer Mientras Esperas

### Opción 1: Verificar que Tengas Ambos SHA-1

Asegúrate de tener configurados:

1. **SHA-1 de Producción 1** (`4B:24:0F...`):
   - Para tu APK actual funcionando
   - **OBLIGATORIO** si quieres que funcione tu APK actual

2. **SHA-1 de Producción 2** (`BC:0C:2C...`):
   - Para builds futuros con EAS
   - El que acabas de agregar
   - **Recomendado** para builds futuros

3. **SHA-1 de Debug** (`A7:89:E5...`) - Opcional:
   - Para desarrollo local
   - Solo si quieres probar Google OAuth en modo debug

### Opción 2: Verificar Configuración Completa

Mientras esperas, verifica:

- [ ] SHA-1 `4B:24:0F...` agregado (para APK actual)
- [ ] SHA-1 `BC:0C:2C...` agregado (el que acabas de agregar)
- [ ] OAuth Consent Screen está publicado (en producción)
- [ ] Package name es `org.vidaabundante.app`
- [ ] `google-services.json` tiene `oauth_client` configurado

## ⚠️ Si Después de 1 Hora Aún No Funciona

### Verificar Logs de la App

Si después de 1 hora Google OAuth aún no funciona:

1. **Revisa los logs** de la app para ver el error específico
2. **Verifica** que el SHA-1 esté correctamente agregado en Google Cloud Console
3. **Confirma** que estás usando el keystore correcto para compilar

### Posibles Problemas

1. **SHA-1 incorrecto**: Verifica que el SHA-1 sea exactamente `BC:0C:2C:C3:68:D1:50:C3:7E:07:17:EE:49:8F:D0:35:7D:0F:1E:E3`
2. **Keystore diferente**: Si compilas con otro keystore, necesitarás agregar ese SHA-1 también
3. **OAuth Consent Screen**: Debe estar en estado "Published" (En producción)

## 📝 Resumen

| SHA-1 | Estado | Tiempo de Propagación |
|-------|--------|----------------------|
| `BC:0C:2C:C3:68:D1:50:C3:7E:07:17:EE:49:8F:D0:35:7D:0F:1E:E3` | ✅ Agregado | ⏱️ 30 minutos (promedio) |
| `4B:24:0F:1B:6A:E6:3D:71:38:77:D1:E7:69:40:D2:1D:5D:30:7C:40` | ⚠️ Verificar | Ya debería estar funcionando |

## ✅ Checklist

- [ ] SHA-1 `BC:0C:2C...` agregado en Google Cloud Console
- [ ] SHA-1 `4B:24:0F...` también agregado (para APK actual)
- [ ] Esperado 30 minutos después de agregar
- [ ] OAuth Consent Screen publicado
- [ ] Package name verificado (`org.vidaabundante.app`)
- [ ] Google OAuth probado después de esperar

## 🎯 Respuesta Directa

**El SHA-1 que estás agregando (`BC:0C:2C:C3:68:D1:50:C3:7E:07:17:EE:49:8F:D0:35:7D:0F:1E:E3`) es correcto.**

**Se tarda en actualizarse porque:**
- Google necesita tiempo para propagar los cambios (5 minutos a 1 hora)
- Debe sincronizar con múltiples servidores y servicios
- Debe actualizar cachés de autenticación

**Recomendación:**
- Espera **30 minutos** después de agregar el SHA-1
- Verifica que también tengas el SHA-1 `4B:24:0F...` agregado (para tu APK actual)
- Después de esperar, prueba Google OAuth en la app

**Esto es normal y esperado. No es un error.**

