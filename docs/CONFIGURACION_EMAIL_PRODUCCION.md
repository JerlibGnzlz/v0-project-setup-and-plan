# 📧 Configuración de Email para Producción

## ⚠️ Problema: Gmail bloquea conexiones desde servicios cloud

Gmail SMTP puede bloquear conexiones desde servicios cloud como Render, Railway, Vercel, etc. Esto es una medida de seguridad de Google.

## ✅ Soluciones Recomendadas

### Opción 1: SendGrid (Recomendado para producción)

SendGrid es un servicio de email transaccional confiable y ampliamente usado.

#### Ventajas:
- ✅ Funciona perfectamente desde servicios cloud
- ✅ Plan gratuito: 100 emails/día
- ✅ Planes de pago desde $15/mes para 40,000 emails
- ✅ Excelente deliverability (tasa de entrega)
- ✅ Dashboard para monitorear envíos
- ✅ APIs robustas

#### Configuración:

1. **Crear cuenta en SendGrid:**
   - Ve a https://sendgrid.com
   - Crea una cuenta gratuita

2. **Verificar el email remitente:**
   - Ve a Settings → Sender Authentication
   - Verifica un Single Sender (email individual) o un dominio completo
   - **IMPORTANTE:** El email debe estar verificado antes de usarlo

3. **Crear API Key:**
   - Ve a Settings → API Keys
   - Crea una nueva API Key con permisos de "Mail Send"
   - Copia la API Key (solo se muestra una vez)

4. **Configurar variables de entorno en Render/Railway:**
   ```bash
   EMAIL_PROVIDER=sendgrid
   SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   SENDGRID_FROM_EMAIL=noreply@tudominio.com  # Debe estar verificado en SendGrid
   SENDGRID_FROM_NAME=AMVA Digital
   ```

5. **Reiniciar el servidor:**
   - El backend detectará automáticamente SendGrid y lo usará

### Opción 2: Resend (Recomendado si tienes dominio propio)

Resend es un servicio moderno de email transaccional con excelente UX.

#### Ventajas:
- ✅ Plan gratuito: 3,000 emails/mes
- ✅ Planes de pago desde $20/mes para 50,000 emails
- ✅ Excelente documentación y APIs modernas
- ✅ Requiere dominio propio (más profesional)

#### Configuración:

1. **Crear cuenta en Resend:**
   - Ve a https://resend.com
   - Crea una cuenta gratuita

2. **Verificar dominio o email:**
   - Ve a Domains → Add Domain
   - Configura los registros DNS que te proporciona Resend
   - O verifica un email individual en Emails → Add Email

3. **Crear API Key:**
   - Ve a API Keys → Create API Key
   - Copia la API Key

4. **Configurar variables de entorno en Render/Railway:**
   ```bash
   EMAIL_PROVIDER=resend
   RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   RESEND_FROM_EMAIL=noreply@tudominio.com  # Debe estar verificado en Resend
   RESEND_FROM_NAME=AMVA Digital
   ```

5. **Reiniciar el servidor:**
   - El backend detectará automáticamente Resend y lo usará

### Opción 3: Mailgun (Alternativa)

Mailgun es otro servicio confiable de email transaccional.

#### Ventajas:
- ✅ Plan gratuito: 5,000 emails/mes (primeros 3 meses)
- ✅ Planes de pago desde $35/mes para 50,000 emails
- ✅ Excelente para emails transaccionales

#### Configuración:

Para usar Mailgun, necesitarías agregar soporte en el código (actualmente no está implementado). Si lo necesitas, puedo agregarlo.

### Opción 4: Gmail SMTP con OAuth2 (Complejo, no recomendado)

Gmail también soporta OAuth2, pero es más complejo de configurar y mantener.

**No recomendado** porque:
- ❌ Requiere renovación periódica de tokens
- ❌ Más complejo de mantener
- ❌ Aún puede tener problemas desde servicios cloud

## 🔍 Verificar Configuración

### 1. Usar el endpoint de diagnóstico:

```bash
GET /notifications/test-email/diagnostic
Authorization: Bearer <tu_token_admin>
```

Esto te mostrará:
- Qué proveedor está configurado
- Qué variables de entorno están configuradas
- Recomendaciones específicas

### 2. Probar envío de email:

```bash
POST /notifications/test-email
Authorization: Bearer <tu_token_admin>
Content-Type: application/json

{
  "to": "tu-email@ejemplo.com"
}
```

### 3. Revisar logs del backend:

Al iniciar el servidor, deberías ver:
```
📧 Inicializando EmailService con proveedor: sendgrid
✅ Servicio de email configurado (SendGrid)
📧 Provider: SendGrid
👤 From: noreply@tudominio.com
```

## 📊 Comparación de Servicios

| Servicio | Plan Gratuito | Plan Pago (40K emails) | Facilidad | Deliverability |
|----------|---------------|------------------------|-----------|----------------|
| **SendGrid** | 100/día | $15/mes | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Resend** | 3,000/mes | $20/mes | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Mailgun** | 5,000/mes (3 meses) | $35/mes | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Gmail SMTP** | Ilimitado | Gratis | ⭐⭐⭐ | ⭐⭐⭐ |

## 🎯 Recomendación Final

**Para producción, usa SendGrid o Resend:**

1. **SendGrid** si:
   - Quieres empezar rápido
   - No tienes dominio propio aún
   - Necesitas un servicio muy confiable y establecido

2. **Resend** si:
   - Tienes dominio propio
   - Prefieres una solución más moderna
   - Quieres mejor plan gratuito (3,000/mes vs 100/día)

## 🚀 Pasos para Migrar de Gmail SMTP a SendGrid/Resend

1. **Crear cuenta en SendGrid o Resend** (ver arriba)

2. **Configurar variables de entorno en Render/Railway:**
   - Agrega las variables según el servicio elegido
   - **IMPORTANTE:** Verifica el email remitente antes de usarlo

3. **Reiniciar el servidor:**
   - El backend detectará automáticamente el nuevo proveedor

4. **Probar con el endpoint de diagnóstico:**
   - Verifica que todo esté configurado correctamente

5. **Probar envío real:**
   - Crea una inscripción de prueba
   - Verifica que el email llegue correctamente

## 📝 Notas Importantes

- **El email remitente DEBE estar verificado** en SendGrid/Resend antes de usarlo
- **No uses emails de Gmail** directamente con SendGrid/Resend (deben estar verificados)
- **El plan gratuito de SendGrid** tiene límite de 100 emails/día
- **El plan gratuito de Resend** tiene límite de 3,000 emails/mes
- **Los emails de prueba** también cuentan para el límite

## 🔧 Troubleshooting

### Error: "Email no está verificado"
- Ve a SendGrid/Resend y verifica el email remitente
- Asegúrate de que `SENDGRID_FROM_EMAIL` o `RESEND_FROM_EMAIL` coincida con el email verificado

### Error: "API Key inválida"
- Verifica que la API Key esté correcta
- Asegúrate de que tenga permisos de "Mail Send"

### Error: "Créditos agotados"
- SendGrid: Espera hasta mañana (límite diario) o actualiza el plan
- Resend: Espera hasta el próximo mes (límite mensual) o actualiza el plan

### Los emails no llegan
- Revisa la carpeta de spam
- Verifica los logs del backend para ver errores específicos
- Usa el endpoint de diagnóstico para verificar la configuración

