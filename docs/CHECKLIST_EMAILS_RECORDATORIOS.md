# ✅ Checklist: Emails y Recordatorios de Pagos Pendientes

## 🔧 Configuración Necesaria en Render

### 1. Variables de Entorno para Redis (Opcional pero Recomendado)

**Para Token Blacklist y Cola de Notificaciones:**

```
REDIS_URL=rediss://default:ARplAAImcDE0MGQ5Zjc1ZmI5NmM0YWQ2OGEyODVhMmM3OGEzZjcxZHAxNjc1Nw@striking-filly-6757.upstash.io:6379
```

**Cómo agregar:**
1. Ve a tu servicio en Render
2. Settings → Environment
3. Agrega `REDIS_URL` con el valor de arriba
4. Guarda y reinicia el servicio

### 2. Variables de Entorno para SMTP (Obligatorio para Emails)

**Para enviar emails (Gmail SMTP):**

```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=tu-email@gmail.com
SMTP_PASSWORD=tu-app-password-de-gmail
```

**Cómo obtener App Password de Gmail:**
1. Ve a https://myaccount.google.com/apppasswords
2. Selecciona "Correo" y "Otro (nombre personalizado)"
3. Escribe "AMVA Backend" y genera
4. Copia la contraseña de 16 caracteres (sin espacios)
5. Úsala como `SMTP_PASSWORD`

**Cómo agregar:**
1. Ve a tu servicio en Render
2. Settings → Environment
3. Agrega todas las variables SMTP
4. Guarda y reinicia el servicio

## ✅ Verificación

### 1. Verificar que Redis Funciona

Después de agregar `REDIS_URL`, deberías ver en los logs:

```
✅ Conectado a Redis para token blacklist
✅ Redis configurado - Habilitando cola de notificaciones con Bull
📡 Redis URL configurada: rediss://striking-filly-6757.upstash.io:6379
```

### 2. Verificar que SMTP Funciona

Después de agregar las variables SMTP, deberías ver en los logs:

```
✅ Servicio de email configurado (Gmail SMTP)
📧 SMTP: smtp.gmail.com:587
👤 Usuario: tu-email@gmail.com
```

### 3. Probar Envío de Email

Puedes probar enviando un recordatorio desde el admin:
1. Ve a `/admin/inscripciones`
2. Haz clic en "Enviar Recordatorios"
3. Revisa los logs del backend para ver:
   ```
   📧 Iniciando envío de recordatorios de pago...
   📬 Evento recibido: PAGO_RECORDATORIO para usuario@email.com
   ✅ Notificación encolada para usuario@email.com
   📧 Preparando email para usuario@email.com...
   📧 Enviando email a usuario@email.com desde tu-email@gmail.com...
   ✅ Email enviado exitosamente a usuario@email.com
   ```

## 🐛 Troubleshooting

### Problema: Emails No Llegan

**Verifica:**
1. ✅ Variables SMTP configuradas en Render
2. ✅ App Password de Gmail es correcta (16 caracteres, sin espacios)
3. ✅ `SMTP_USER` es el email completo (ej: `tu-email@gmail.com`)
4. ✅ `SMTP_PASSWORD` es la App Password, NO la contraseña de Gmail
5. ✅ Revisa los logs del backend para errores de SMTP

**Errores comunes:**
- `EAUTH`: App Password incorrecta o no configurada
- `ETIMEDOUT`: Problema de conexión a SMTP
- `ECONNREFUSED`: SMTP_HOST o SMTP_PORT incorrectos

### Problema: Recordatorios No Se Envían

**Verifica:**
1. ✅ Hay inscripciones con pagos pendientes
2. ✅ El botón "Enviar Recordatorios" se ejecuta correctamente
3. ✅ Revisa los logs del backend para ver si el evento se recibe
4. ✅ Si Redis no está configurado, debería procesar directamente

**Logs esperados:**
```
📧 Iniciando envío de recordatorios de pago...
📋 Encontradas X inscripciones pendientes
📬 Evento recibido: PAGO_RECORDATORIO para usuario@email.com
```

### Problema: Redis No Conecta

**Verifica:**
1. ✅ `REDIS_URL` está configurada correctamente en Render
2. ✅ La URL incluye el protocolo `rediss://`
3. ✅ La contraseña está incluida en la URL
4. ✅ Upstash Redis está activo

**Si Redis no funciona:**
- La aplicación seguirá funcionando
- Las notificaciones se procesarán directamente (sin cola)
- El token blacklist estará deshabilitado (pero los tokens seguirán funcionando)

## 📋 Checklist Completo

### Variables de Entorno en Render

- [ ] `REDIS_URL` configurada (opcional pero recomendado)
- [ ] `SMTP_HOST=smtp.gmail.com`
- [ ] `SMTP_PORT=587`
- [ ] `SMTP_SECURE=false`
- [ ] `SMTP_USER=tu-email@gmail.com`
- [ ] `SMTP_PASSWORD=tu-app-password` (16 caracteres)

### Verificación en Logs

- [ ] Redis conectado (si está configurado)
- [ ] SMTP configurado correctamente
- [ ] No hay errores de conexión
- [ ] Los emails se envían exitosamente

### Pruebas

- [ ] Probar envío de recordatorio desde admin
- [ ] Verificar que el email llega al destinatario
- [ ] Revisar logs para confirmar que todo funciona

## 🔗 Documentación Relacionada

- `docs/CONFIGURAR_REDIS_UPSTASH_RENDER.md` - Configurar Redis
- `docs/CONFIGURAR_GMAIL_PRODUCCION.md` - Configurar Gmail SMTP
- `docs/DIAGNOSTICAR_EMAILS_PRODUCCION.md` - Diagnosticar problemas de email

