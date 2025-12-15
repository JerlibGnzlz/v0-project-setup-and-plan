# 📧 Cómo Verificar Email en SendGrid

## ⚠️ Problema Actual

Estás viendo este warning:
```
⚠️ Usando email Gmail personal: jerlibgnzlz@gmail.com
Asegúrate de que este email esté verificado en SendGrid
```

Esto significa que SendGrid requiere que el email remitente esté verificado antes de poder enviar emails.

## ✅ Solución: Verificar Email en SendGrid

### Paso 1: Acceder a SendGrid

1. Ve a https://sendgrid.com
2. Inicia sesión con tu cuenta

### Paso 2: Verificar Single Sender (Email Individual)

1. **Ve a Settings → Sender Authentication**
   - En el menú lateral izquierdo, busca "Settings"
   - Haz clic en "Sender Authentication"

2. **Haz clic en "Verify a Single Sender"**
   - Esto te permite verificar un email individual (como tu Gmail)

3. **Completa el formulario:**
   - **From Email Address**: `jerlibgnzlz@gmail.com` (tu email Gmail)
   - **From Name**: `AMVA Digital` (o el nombre que prefieras)
   - **Reply To**: `jerlibgnzlz@gmail.com` (mismo email)
   - **Company Address**: Tu dirección (requerido)
   - **City**: Tu ciudad
   - **State**: Tu estado/provincia
   - **Country**: Tu país
   - **Zip Code**: Tu código postal

4. **Haz clic en "Create"**

5. **Verifica tu email:**
   - SendGrid enviará un email de verificación a `jerlibgnzlz@gmail.com`
   - **Abre tu bandeja de entrada de Gmail**
   - **Busca el email de SendGrid** (puede estar en spam)
   - **Haz clic en el botón "Verify Single Sender"** en el email

6. **Confirma la verificación:**
   - Después de hacer clic, deberías ver un mensaje de confirmación
   - Vuelve a SendGrid y verifica que el estado sea "Verified" ✅

### Paso 3: Verificar en Render/Railway

Una vez que el email esté verificado en SendGrid, asegúrate de que las variables de entorno estén configuradas correctamente:

```bash
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=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
SENDGRID_FROM_EMAIL=jerlibgnzlz@gmail.com
SENDGRID_FROM_NAME=AMVA Digital
```

### Paso 4: Reiniciar el Servidor

Después de verificar el email en SendGrid, reinicia el servidor en Render/Railway para que los cambios surtan efecto.

## 🔍 Verificar que Funciona

### 1. Revisar logs del backend:

Al iniciar el servidor, deberías ver:
```
✅ Servicio de email configurado (SendGrid)
📧 Provider: SendGrid
👤 From: jerlibgnzlz@gmail.com
```

**Ya NO deberías ver el warning** sobre email Gmail personal no verificado.

### 2. Probar envío de email:

```bash
POST /notifications/test-email
Authorization: Bearer <tu_token_admin>
Content-Type: application/json

{
  "to": "tu-email@ejemplo.com"
}
```

### 3. Verificar diagnóstico:

```bash
GET /notifications/test-email/diagnostic
Authorization: Bearer <tu_token_admin>
```

Debería mostrar:
```json
{
  "provider": "sendgrid",
  "configured": true,
  "variables": {
    "SENDGRID_FROM_EMAIL": "jerlibgnzlz@gmail.com",
    ...
  },
  "recomendaciones": [
    "✅ SendGrid está configurado correctamente"
  ]
}
```

## ⚠️ Notas Importantes

1. **El email DEBE estar verificado** antes de poder enviar emails
2. **SendGrid puede tardar unos minutos** en procesar la verificación
3. **Si no recibes el email de verificación**, revisa la carpeta de spam
4. **Una vez verificado**, puedes usar ese email para enviar emails desde tu aplicación

## 🚨 Si el Email No Se Verifica

### Problema: No recibes el email de verificación

**Soluciones:**
1. Revisa la carpeta de spam en Gmail
2. Espera unos minutos (puede tardar hasta 10 minutos)
3. Intenta crear otro Single Sender con un email diferente
4. Verifica que el email esté escrito correctamente en SendGrid

### Problema: El email está verificado pero sigue apareciendo el warning

**Soluciones:**
1. Verifica que `SENDGRID_FROM_EMAIL` coincida exactamente con el email verificado en SendGrid
2. Reinicia el servidor en Render/Railway
3. Verifica que la API Key tenga permisos de "Mail Send"

## 📊 Alternativa: Usar Dominio Propio

Si prefieres usar un dominio propio (más profesional):

1. **Verifica un dominio completo en SendGrid:**
   - Ve a Settings → Sender Authentication
   - Haz clic en "Authenticate Your Domain"
   - Sigue las instrucciones para configurar los registros DNS

2. **Usa un email de ese dominio:**
   ```bash
   SENDGRID_FROM_EMAIL=noreply@tudominio.com
   ```

Esto es más profesional y no requiere verificar cada email individual.

## ✅ Checklist de Verificación

- [ ] Email verificado en SendGrid (Settings → Sender Authentication)
- [ ] Variables de entorno configuradas en Render/Railway
- [ ] `SENDGRID_FROM_EMAIL` coincide con el email verificado
- [ ] Servidor reiniciado después de verificar
- [ ] Logs del backend muestran "✅ Servicio de email configurado (SendGrid)"
- [ ] Prueba de envío exitosa
- [ ] No aparece el warning sobre email no verificado

## 🎯 Resultado Esperado

Después de verificar el email en SendGrid:
- ✅ Los emails se enviarán correctamente
- ✅ No aparecerá el warning sobre email no verificado
- ✅ Los emails llegarán a los destinatarios
- ✅ Funcionará tanto para web como para mobile (AMVA app)
