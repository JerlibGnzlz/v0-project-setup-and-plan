# Guía para Verificar el Envío de Emails

## 1. Verificar Configuración SMTP

Asegúrate de tener estas variables en tu `.env` del backend:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=tu-email@gmail.com
SMTP_PASSWORD=tu-app-password-de-16-caracteres
```

### Para Gmail:

1. Ve a https://myaccount.google.com/apppasswords
2. Genera una "App Password" de 16 caracteres
3. Úsala como `SMTP_PASSWORD` (sin espacios)

## 2. Probar el Envío de Email

### Opción A: Usar el endpoint de prueba (requiere autenticación)

```bash
# Primero, obtén un token de admin
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@ministerio-amva.org","password":"admin123"}'

# Luego prueba el email (reemplaza TOKEN con el token obtenido)
curl -X POST http://localhost:4000/api/notifications/test-email \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{"to":"tu-email@ejemplo.com"}'
```

### Opción B: Revisar los logs del backend

Cuando envíes recordatorios, revisa los logs del backend. Deberías ver:

```
✅ Email enviado exitosamente a email@ejemplo.com
   Message ID: <xxx@xxx>
   Response: 250 2.0.0 OK
```

Si ves errores, revisa:

- `❌ No se puede enviar email: servicio no configurado` → Falta SMTP_USER o SMTP_PASSWORD
- `❌ Error de autenticación SMTP` → SMTP_PASSWORD incorrecto
- `❌ Error de conexión SMTP` → SMTP_HOST o SMTP_PORT incorrectos

## 3. Verificar que los Emails Lleguen

1. Revisa la bandeja de entrada del destinatario
2. Revisa la carpeta de spam
3. Si usas Gmail, revisa que el remitente sea confiable

## 4. Solución de Problemas

### Problema: "servicio no configurado"

**Solución**: Verifica que `SMTP_USER` y `SMTP_PASSWORD` estén en el `.env` del backend

### Problema: "Error de autenticación"

**Solución**:

- Para Gmail, usa una App Password, no tu contraseña normal
- Asegúrate de que no haya espacios en el password

### Problema: "Error de conexión"

**Solución**:

- Verifica `SMTP_HOST` (debe ser `smtp.gmail.com` para Gmail)
- Verifica `SMTP_PORT` (587 para Gmail con STARTTLS)
- Verifica tu conexión a internet

### Problema: Emails no llegan

**Solución**:

- Revisa la carpeta de spam
- Verifica que el email de destino sea válido
- Revisa los logs del backend para ver si hay errores específicos

## 5. Logs a Revisar

Cuando envíes recordatorios, busca estos logs en el backend:

```
📧 Iniciando envío de recordatorios de pago...
📋 Encontradas X inscripciones pendientes
📋 X inscripciones con pagos pendientes listas para recordatorio
📧 Enviando email directo a email@ejemplo.com...
✅ Email enviado exitosamente a email@ejemplo.com
📊 Recordatorios: X enviados, Y fallidos
```

Si ves `❌` en los logs, revisa el mensaje de error específico.



