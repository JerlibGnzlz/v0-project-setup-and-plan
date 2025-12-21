# 🔍 Verificar SHA-1 Correcto para Resolver DEVELOPER_ERROR

## ⚠️ Error Actual

```
DEVELOPER_ERROR
```

Este error generalmente significa que el SHA-1 no coincide o no está configurado correctamente.

---

## ✅ Verificación Paso a Paso

### Paso 1: Verificar SHA-1 en Google Cloud Console

1. Ve a: **https://console.cloud.google.com/apis/credentials**
2. Busca el cliente Android: `378853205278-c2e1gcjn06mg857rcvprns01fu8pduat`
3. Haz clic para editarlo
4. Verifica que el SHA-1 esté agregado:
   ```
   5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25
   ```

**Verifica que**:
- ✅ Esté exactamente como arriba (con los dos puntos `:`)
- ✅ No haya espacios extra antes o después
- ✅ Esté en la sección "SHA-1 certificate fingerprint"
- ✅ Esté guardado (haz clic en "Guardar" si hiciste cambios)

### Paso 2: Obtener SHA-1 Real del Keystore de Producción

El SHA-1 que agregaste debe ser del **keystore de producción** usado por EAS Build.

**Obtener desde EAS**:

```bash
cd /home/jerlibgnzlz/Escritorio/v0-project-setup-and-plan/amva-mobile
eas credentials
```

1. Selecciona **Android**
2. Selecciona **View credentials**
3. Busca la sección **"Keystore"** o **"Signing Key"**
4. Verás el **SHA-1** listado ahí
5. **Copia el SHA-1 completo**

**Compara** este SHA-1 con el que agregaste en Google Cloud Console (`5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25`).

**Si son diferentes**, ese es el problema. Necesitas agregar el SHA-1 correcto.

### Paso 3: Verificar OAuth Consent Screen

1. Ve a: **https://console.cloud.google.com/apis/credentials/consent**
2. Verifica que:
   - ✅ El OAuth consent screen esté configurado
   - ✅ Tenga al menos un usuario de prueba (si está en modo testing)
   - ✅ Tu email de Google esté agregado como usuario de prueba

**Si está en modo "Testing"**:
- Agrega tu email como usuario de prueba
- Los usuarios que no estén en la lista no podrán hacer login

### Paso 4: Verificar Client ID

En `app.json` debe estar:
```json
"googleAndroidClientId": "378853205278-c2e1gcjn06mg857rcvprns01fu8pduat.apps.googleusercontent.com"
```

✅ Ya está correcto.

---

## 🔄 Si el SHA-1 No Coincide

Si el SHA-1 que obtienes de EAS es diferente al que agregaste:

1. **Copia el SHA-1 correcto** desde EAS
2. **Agrégalo en Google Cloud Console** (puedes tener múltiples SHA-1)
3. **NO elimines** el SHA-1 anterior si ya lo tenías
4. **Espera 15-30 minutos**
5. **Prueba nuevamente**

---

## ⏱️ Tiempo de Propagación

Después de agregar/modificar el SHA-1:
- ⏱️ Espera **al menos 15-30 minutos**
- 🔄 Los cambios pueden tardar hasta **1 hora** en algunos casos
- 💡 Si acabas de agregar el SHA-1, espera más tiempo

---

## 🐛 Verificación Adicional

### Verificar Logs de la App

En la app, busca en los logs:
- `🔍 Google Sign-In configurado con:` - Muestra qué Client ID se está usando
- Debe mostrar: `378853205278-c2e1gcjn06mg857rcvprns01fu8pduat.apps.googleusercontent.com`

### Verificar que el Proyecto Sea Correcto

Asegúrate de estar en el proyecto correcto de Google Cloud:
- Proyecto: **AMVA Digital** (o el que corresponda)
- Verifica que el Client ID `378853205278-c2e1gcjn06mg857rcvprns01fu8pduat` esté en ese proyecto

---

## 📋 Checklist de Verificación

- [ ] SHA-1 agregado en Google Cloud Console
- [ ] SHA-1 coincide con el keystore de producción (verificado desde EAS)
- [ ] OAuth consent screen configurado
- [ ] Email agregado como usuario de prueba (si está en modo testing)
- [ ] Esperado al menos 15-30 minutos después de agregar SHA-1
- [ ] Client ID correcto en `app.json`

---

## 🎯 Pasos Inmediatos

1. **Ejecuta**: `eas credentials` y obtén el SHA-1 real
2. **Compara** con el que agregaste: `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25`
3. **Si son diferentes**, agrega el SHA-1 correcto en Google Cloud Console
4. **Verifica OAuth consent screen**
5. **Espera 30 minutos**
6. **Prueba nuevamente**

