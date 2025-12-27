# 🔧 Agregar SHA-1 BC:0C:2C... a Google Cloud Console

## ⚠️ Problema Actual

El build está usando el SHA-1: `BC:0C:2C:C3:68:D1:50:C3:7E:07:17:EE:49:8F:D0:35:7D:0F:1E:E3`

Este SHA-1 **NO está configurado** en Google Cloud Console, por eso falla incluso con Web Client ID.

## ✅ Solución: Agregar SHA-1 a Google Cloud Console

### Paso 1: Abrir Google Cloud Console

1. Ve a: https://console.cloud.google.com/apis/credentials?project=amva-auth
2. O si usas otro proyecto, ve a ese proyecto

### Paso 2: Buscar el Cliente Android OAuth

1. Busca el cliente Android: `378853205278-c2e1gcjn06mg857rcvprns01fu8pduat`
2. Si no existe, créalo (ver guía completa)
3. Haz clic en el cliente para editarlo

### Paso 3: Agregar SHA-1

1. En la sección **"SHA-1 certificate fingerprint"**
2. Haz clic en **"+ Add fingerprint"** o **"+ Agregar huella digital"**
3. Agrega el SHA-1: `BC:0C:2C:C3:68:D1:50:C3:7E:07:17:EE:49:8F:D0:35:7D:0F:1E:E3`
4. Haz clic en **"Save"** (Guardar)

### Paso 4: Verificar que Esté Agregado

1. Verifica que el SHA-1 aparezca en la lista
2. Deberías ver ambos SHA-1:
   - `4B:24:0F:1B:6A:E6:3D:71:38:77:D1:E7:69:40:D2:1D:5D:30:7C:40` (default)
   - `BC:0C:2C:C3:68:D1:50:C3:7E:07:17:EE:49:8F:D0:35:7D:0F:1E:E3` (nuevo)

### Paso 5: Esperar Propagación

1. **Espera 30 minutos** para que Google propague los cambios
2. Los cambios pueden tardar hasta 30 minutos en aplicarse

## 🎯 Verificación Rápida

### En Google Cloud Console

El cliente Android debe tener **ambos SHA-1**:

```
SHA-1 certificate fingerprint:
  ✅ 4B:24:0F:1B:6A:E6:3D:71:38:77:D1:E7:69:40:D2:1D:5D:30:7C:40
  ✅ BC:0C:2C:C3:68:D1:50:C3:7E:07:17:EE:49:8F:D0:35:7D:0F:1E:E3
```

### En Firebase Console

1. Ve a: https://console.firebase.google.com/project/amva-auth/settings/general
2. Ve a "Your apps" → Selecciona app Android
3. Verifica que ambos SHA-1 aparezcan en "SHA certificate fingerprints"

## ⚠️ Nota Importante

**`@react-native-google-signin/google-signin` siempre requiere SHA-1 para Android**, incluso si usas Web Client ID. Por eso necesitas agregar el SHA-1 correcto.

## 📋 Checklist

- [ ] Abrir Google Cloud Console
- [ ] Buscar cliente Android OAuth
- [ ] Agregar SHA-1: `BC:0C:2C:C3:68:D1:50:C3:7E:07:17:EE:49:8F:D0:35:7D:0F:1E:E3`
- [ ] Guardar cambios
- [ ] Verificar que ambos SHA-1 estén configurados
- [ ] Esperar 30 minutos
- [ ] Probar Google OAuth nuevamente

## 🎯 Resultado Esperado

Después de agregar el SHA-1 y esperar 30 minutos:

- ✅ Google OAuth debería funcionar correctamente
- ✅ No debería aparecer DEVELOPER_ERROR
- ✅ El login debería completarse exitosamente

## 🚀 Próximos Pasos

1. **Agrega el SHA-1** `BC:0C:2C...` a Google Cloud Console
2. **Espera 30 minutos** para propagación
3. **Prueba Google OAuth** nuevamente
4. **Debería funcionar** correctamente

