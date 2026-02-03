# Arreglar Emails de Inscripciones - No Llegan

## Emails que Deberían Enviarse

| Momento | Destinatario | Tipo |
|---------|--------------|------|
| Usuario se inscribe | Participante | "Inscripción Recibida" |
| Usuario se inscribe | Admin | "Nueva Inscripción Recibida" |
| Admin valida pago | Participante | "Pago Validado" |
| Admin valida pago | Admin | Notificación en campanita |
| Admin rechaza pago | Participante | "Pago Rechazado" |
| Todas las cuotas pagadas | Participante | "Inscripción Confirmada" |
| Recordatorios (botón) | Participantes con pagos pendientes | "Recordatorio de Pago" |

**Nota:** No hay email cuando el usuario sube el comprobante; el email llega cuando el admin **valida** el pago.

## Cambios Realizados en el Código

El `EmailService` ahora **configura todos los proveedores disponibles** como fallbacks:

- Si usas `EMAIL_PROVIDER=resend`: SendGrid y SMTP se configuran automáticamente como fallback
- Si Resend falla (ej: email Gmail no verificado), el sistema intentará SendGrid o SMTP automáticamente

## Solución 1: Verificar Email en Resend (Recomendado)

Si usas `RESEND_FROM_EMAIL=jerlibgnzlz@gmail.com`, **debes verificar ese email en Resend**:

1. Ve a **https://resend.com** → **Emails** → **Add Email**
2. Ingresa `jerlibgnzlz@gmail.com` y haz clic en **Send Verification Email**
3. Revisa tu Gmail y haz clic en el enlace de verificación
4. Verifica que aparezca con checkmark verde ✅ en Resend

**Guía detallada:** `docs/VERIFICAR_EMAIL_RESEND.md`

## Solución 2: Usar SendGrid como Alternativa

Si Resend sigue fallando, configura SendGrid en el servidor:

```bash
# En el servidor (/var/www/amva-production/backend/.env)
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=SG.xxxxxxxxxxxx
SENDGRID_FROM_EMAIL=jerlibgnzlz@gmail.com
```

1. Crea cuenta en https://sendgrid.com
2. Ve a **Settings** → **Sender Authentication** → Verifica tu email
3. Crea API Key en **Settings** → **API Keys**
4. Agrega las variables al `.env` del servidor
5. Reinicia el backend: `pm2 restart backend`

## Solución 3: Fallback Automático (Ya Implementado)

Con el cambio en el código, si tienes **ambos** Resend y SendGrid configurados:

- Se intentará SendGrid primero
- Si falla, se intentará Resend
- Si falla, se intentará SMTP (Gmail)

**Nota:** Gmail SMTP suele fallar desde servidores cloud (Digital Ocean). Resend o SendGrid son más confiables.

## Verificar en el Servidor

1. **Revisar variables de entorno:**
   ```bash
   cd /var/www/amva-production/backend
   grep -E "EMAIL_PROVIDER|RESEND_|SENDGRID_|SMTP_" .env
   ```

2. **Revisar logs al enviar recordatorio:**
   ```bash
   pm2 logs backend
   ```
   Busca: `📧 [EmailService] Estado de proveedores:` para ver qué está configurado.

3. **Probar recordatorio** desde `/admin/inscripciones` → botón "Enviar recordatorios"

## Checklist Rápido

- [ ] Email verificado en Resend (si usas Resend)
- [ ] O SendGrid configurado (SENDGRID_API_KEY, SENDGRID_FROM_EMAIL)
- [ ] Variables en `.env` del servidor (no solo local)
- [ ] Backend reiniciado después de cambiar `.env`
- [ ] Probar botón de recordatorios
