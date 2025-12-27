# 🔧 Agregar SHA-1 BC:0C:2C... en Google Cloud Console - Paso a Paso

## 🎯 SHA-1 Requerido

```
BC:0C:2C:C3:68:D1:50:C3:7E:07:17:EE:49:8F:D0:35:7D:0F:1E:E3
```

## 📋 Pasos Exactos

### Paso 1: Abrir Google Cloud Console

**URL directa**: https://console.cloud.google.com/apis/credentials?project=amva-digital

1. Haz clic en el enlace arriba o cópialo en tu navegador
2. Asegúrate de estar logueado con la cuenta correcta de Google
3. Verifica que el proyecto seleccionado sea `amva-digital`

### Paso 2: Encontrar el Cliente OAuth de Android

1. En la página de Credentials, busca en la lista de "OAuth 2.0 Client IDs"
2. Busca el cliente con:
   - **Type**: Android
   - **Name**: "AMVA Android Client"
   - **Client ID**: `378853205278-c2e1gcjn06mg857rcvprns01fu8pduat`
3. Haz clic en el **nombre** del cliente (no en el Client ID)

### Paso 3: Agregar SHA-1

1. En la página de edición del cliente, desplázate hasta la sección **"SHA-1 certificate fingerprints"**
2. Verás una lista de SHA-1s ya configurados (puede estar vacía)
3. Haz clic en el botón **"+ ADD FINGERPRINT"** (arriba de la lista)
4. Aparecerá un campo de texto vacío
5. Copia y pega este SHA-1:

```
BC:0C:2C:C3:68:D1:50:C3:7E:07:17:EE:49:8F:D0:35:7D:0F:1E:E3
```

6. Haz clic en **"SAVE"** (botón azul, arriba o abajo de la página)

### Paso 4: Verificar

1. Después de guardar, deberías ver el SHA-1 en la lista
2. Verifica que sea exactamente: `BC:0C:2C:C3:68:D1:50:C3:7E:07:17:EE:49:8F:D0:35:7D:0F:1E:E3`

### Paso 5: Esperar Propagación

1. ⏱️ Espera **10-15 minutos** para que los cambios se propaguen
2. 🔄 Reinicia la app completamente (ciérrala y ábrela de nuevo)
3. 🧪 Prueba el login con Google nuevamente

## 📸 Visualización

```
┌─────────────────────────────────────────────────────────┐
│  Edit OAuth 2.0 Client ID                               │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Name: AMVA Android Client                              │
│  Application type: Android                              │
│                                                          │
│  Package name: org.vidaabundante.app                    │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │ SHA-1 certificate fingerprints                  │  │
│  │                                                  │  │
│  │ [Aquí agregas el SHA-1]                         │  │
│  │                                                  │  │
│  │ BC:0C:2C:C3:68:D1:50:C3:7E:07:17:EE:49:8F:...  │  │
│  │                                                  │  │
│  │ + ADD FINGERPRINT                               │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
│  [SAVE] [CANCEL]                                        │
└─────────────────────────────────────────────────────────┘
```

## ✅ Checklist

- [ ] Abrí Google Cloud Console
- [ ] Encontré "AMVA Android Client"
- [ ] Hice clic en "Edit"
- [ ] Agregué SHA-1: `BC:0C:2C:C3:68:D1:50:C3:7E:07:17:EE:49:8F:D0:35:7D:0F:1E:E3`
- [ ] Hice clic en "SAVE"
- [ ] Verifiqué que el SHA-1 aparezca en la lista
- [ ] Esperé 10-15 minutos
- [ ] Reinicié la app completamente
- [ ] Probé el login con Google

## 🚨 Si No Encuentras el Cliente Android

Si no ves "AMVA Android Client" en la lista:

1. Haz clic en **"+ CREATE CREDENTIALS"** (arriba)
2. Selecciona **"OAuth client ID"**
3. Selecciona **"Android"** como Application type
4. Ingresa:
   - **Name**: AMVA Android Client
   - **Package name**: `org.vidaabundante.app`
   - **SHA-1 certificate fingerprint**: `BC:0C:2C:C3:68:D1:50:C3:7E:07:17:EE:49:8F:D0:35:7D:0F:1E:E3`
5. Haz clic en **"CREATE"**

## 📝 Notas Importantes

1. **Propagación**: Los cambios pueden tardar hasta **15 minutos** en propagarse completamente
2. **SHA-1 Exacto**: El SHA-1 debe coincidir **exactamente** (incluyendo mayúsculas y dos puntos)
3. **Cliente Correcto**: Asegúrate de agregar el SHA-1 al cliente **Android**, no al Web
4. **Múltiples SHA-1s**: Puedes agregar múltiples SHA-1s si tienes diferentes keystores

## 🎯 Después de Agregar SHA-1

1. ✅ El SHA-1 estará configurado en Google Cloud Console
2. ✅ El método nativo de Google Sign-In funcionará correctamente
3. ✅ No verás más el error "DEVELOPER_ERROR"
4. ✅ El login con Google funcionará sin problemas

## 🔗 URLs Útiles

- **Credentials**: https://console.cloud.google.com/apis/credentials?project=amva-digital
- **OAuth Consent Screen**: https://console.cloud.google.com/apis/credentials/consent?project=amva-digital

¡Sigue estos pasos exactos y el SHA-1 será agregado correctamente! 🚀

