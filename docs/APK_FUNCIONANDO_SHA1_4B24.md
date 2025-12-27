# 🔑 Google OAuth para APK con SHA-1 4B:24:0F

## 📋 Situación Actual

Tienes un **APK funcionando** compilado con el keystore anterior que usa el SHA-1:
```
4B:24:0F:1B:6A:E6:3D:71:38:77:D1:E7:69:40:D2:1D:5D:30:7C:40
```

**Keystore**: `ZeEnL0LIUD` (anterior)

## ✅ Solución: Agregar SHA-1 en Google Cloud Console

Para que Google OAuth funcione con tu APK actual, necesitas agregar este SHA-1 en Google Cloud Console.

### Paso 1: Acceder a Google Cloud Console

1. Ve a: **https://console.cloud.google.com/apis/credentials**
2. Asegúrate de estar en el proyecto correcto: **AMVA Digital** (o el que corresponda)

### Paso 2: Buscar el Cliente Android

1. Busca el cliente OAuth 2.0 de tipo **Android**:
   - **Client ID**: `378853205278-c2e1gcjn06mg857rcvprns01fu8pduat`
2. Haz clic en el **lápiz** (editar) o en el nombre del cliente

### Paso 3: Agregar SHA-1

1. En la sección **"SHA-1 certificate fingerprint"** (Huella digital del certificado SHA-1):
   - Haz clic en **"+ Agregar huella digital"** o **"+ Add fingerprint"**
   - Pega el siguiente SHA-1:
     ```
     4B:24:0F:1B:6A:E6:3D:71:38:77:D1:E7:69:40:D2:1D:5D:30:7C:40
     ```
   - Haz clic en **"Guardar"** o **"Save"**

### Paso 4: Verificar SHA-1 Configurados

Después de guardar, deberías ver en la lista de SHA-1:
- ✅ `4B:24:0F:1B:6A:E6:3D:71:38:77:D1:E7:69:40:D2:1D:5D:30:7C:40` (tu APK actual)
- ✅ `BC:0C:2C:C3:68:D1:50:C3:7E:07:17:EE:49:8F:D0:35:7D:0F:1E:E3` (si lo agregaste para builds futuros)

**Puedes tener MÚLTIPLES SHA-1 configurados** - esto es correcto y recomendado.

### Paso 5: Esperar Propagación

- ⏱️ Espera **30 minutos** para que Google propague los cambios
- 🔄 Los cambios pueden tardar hasta **1 hora** en algunos casos
- ⚠️ **NO reinstales la app** durante este tiempo

### Paso 6: Probar Google OAuth

Después de esperar 30 minutos:

1. **Cierra completamente la app** (no solo minimices)
2. **Abre la app nuevamente**
3. **Intenta iniciar sesión con Google**
4. Debería funcionar correctamente

## 🎯 Resumen de SHA-1

| SHA-1 | Keystore | Estado | Para Qué |
|-------|----------|--------|----------|
| `4B:24:0F:1B:6A:E6:3D:71:38:77:D1:E7:69:40:D2:1D:5D:30:7C:40` | `ZeEnL0LIUD` (anterior) | ✅ **OBLIGATORIO** | **Tu APK actual** |
| `BC:0C:2C:C3:68:D1:50:C3:7E:07:17:EE:49:8F:D0:35:7D:0F:1E:E3` | `AXSye1dRA5` (actual) | ⚠️ Opcional | Builds futuros |

## ✅ Checklist

- [ ] SHA-1 `4B:24:0F...` agregado en Google Cloud Console
- [ ] SHA-1 guardado correctamente
- [ ] Esperado 30 minutos después de agregar
- [ ] App cerrada completamente y reabierta
- [ ] Login con Google probado y funcionando

## 🐛 Si Aún No Funciona

### Verificar en Google Cloud Console

1. Ve a: **https://console.cloud.google.com/apis/credentials**
2. Busca el cliente Android
3. Verifica que el SHA-1 `4B:24:0F...` esté en la lista
4. Si no está, agrégalo nuevamente

### Verificar OAuth Consent Screen

1. Ve a: **APIs y Servicios** > **Pantalla de consentimiento OAuth**
2. Verifica que el estado sea **"En producción"** (Published)
3. Si está en "Testing", solo los usuarios de prueba podrán iniciar sesión

### Verificar Package Name

1. En el cliente Android, verifica que el **"Package name"** sea:
   ```
   org.vidaabundante.app
   ```
2. Debe coincidir exactamente con el package name de tu app

### Esperar Más Tiempo

- Si después de 30 minutos aún no funciona, espera hasta **1 hora**
- Los cambios de Google pueden tardar en propagarse

### Reinstalar la App

Si después de 1 hora aún no funciona:

1. **Desinstala completamente** la app del dispositivo
2. **Reinstala** la app desde el APK
3. **Prueba** el login con Google nuevamente

## 📝 Notas Importantes

- ✅ **NO elimines** el SHA-1 `4B:24:0F...` una vez agregado
- ✅ Puedes tener **múltiples SHA-1** configurados simultáneamente
- ✅ El SHA-1 `4B:24:0F...` es específico para tu APK actual
- ✅ Si compilas un nuevo APK con otro keystore, necesitarás agregar ese SHA-1 también

## 🚀 Próximos Pasos

Una vez que Google OAuth funcione con tu APK actual:

1. **Mantén** el SHA-1 `4B:24:0F...` configurado (para tu APK actual)
2. **Agrega** el SHA-1 `BC:0C:2C...` si planeas compilar nuevos APKs (opcional)
3. **No elimines** ningún SHA-1 existente

## ✅ Resumen

**Para que Google OAuth funcione con tu APK actual:**

1. Agrega el SHA-1 `4B:24:0F:1B:6A:E6:3D:71:38:77:D1:E7:69:40:D2:1D:5D:30:7C:40` en Google Cloud Console
2. Espera 30 minutos
3. Cierra y reabre la app
4. Prueba el login con Google

¡Debería funcionar correctamente!

