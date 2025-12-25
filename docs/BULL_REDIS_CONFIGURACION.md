# Configuración Bull + Redis para Notificaciones

## ✅ Estado: ACTIVADO

Bull + Redis ha sido reactivado y configurado correctamente para manejar notificaciones y emails masivos.

---

## 📋 Configuración Realizada

### 1. BullModule Reactivado

**Archivo:** `backend/src/modules/notifications/notifications.module.ts`

```typescript
BullModule.forRoot({
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD || undefined,
    db: parseInt(process.env.REDIS_DB || '0'),
  },
}),
BullModule.registerQueue({
  name: 'notifications',
}),
```

### 2. NotificationListener Registrado

**Archivo:** `backend/src/modules/notifications/listeners/notification.listener.ts`

- Escucha eventos de `EventEmitter2`
- Encola notificaciones en Bull Queue
- Configuración de reintentos: 3 intentos con backoff exponencial
- Prioridades: high (10), normal (5), low (1)

### 3. NotificationProcessor Registrado

**Archivo:** `backend/src/modules/notifications/processors/notification.processor.ts`

- Procesa trabajos de la cola con concurrencia de 5
- Usa templates centralizados de emails
- Envía emails, push notifications y WebSocket notifications
- Manejo robusto de errores

---

## 🔄 Flujo Completo

### Inscripción Creada

```
1. Usuario completa formulario
   └─► POST /api/inscripciones

2. InscripcionesService.createInscripcion()
   └─► EventEmitter2.emit(INSCRIPCION_CREADA)

3. NotificationListener.handleInscripcionCreada()
   └─► Encola en Bull Queue 'notifications'

4. NotificationProcessor.handleNotification()
   ├─► Obtiene template de email
   ├─► EmailService.sendNotificationEmail() (Gmail SMTP)
   ├─► Push notification (si hay tokens)
   └─► WebSocket notification (tiempo real)

5. Email enviado exitosamente ✅
```

### Pago Validado/Rechazado

Mismo flujo con templates específicos:

- `pago_validado` → Template verde con ✅
- `pago_rechazado` → Template rojo con ❌
- `pago_rehabilitado` → Template amarillo con 🔄

### Recordatorios Masivos

```
1. Admin ejecuta: POST /api/inscripciones/acciones/enviar-recordatorios
   └─► InscripcionesService.enviarRecordatoriosPago()

2. Para cada inscripción pendiente:
   └─► EventEmitter2.emit(PAGO_RECORDATORIO)

3. NotificationListener encola cada evento
   └─► Bull procesa con rate limiting automático

4. NotificationProcessor envía emails
   └─► Con reintentos si fallan
```

---

## ⚙️ Variables de Entorno

### Redis

```env
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
```

### Gmail SMTP

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=jerlibgnzlz@gmail.com
SMTP_PASSWORD=iswisphueoxplwvp
```

---

## 📊 Características de Bull

### Reintentos Automáticos

- **Intentos:** 3
- **Backoff:** Exponencial (empieza con 2 segundos)
- **Estrategia:** `exponential`

### Limpieza Automática

- **Trabajos completados:** Se mantienen 24 horas o máximo 1000
- **Trabajos fallidos:** Se mantienen 7 días

### Prioridades

- **High:** 10 (pagos validados, inscripciones confirmadas)
- **Normal:** 5 (inscripciones creadas, recordatorios)
- **Low:** 1 (actualizaciones menores)

### Concurrencia

- **Procesamiento simultáneo:** 5 trabajos
- **Rate limiting:** Gmail limita a 100 emails/hora

---

## 🚀 Ventajas del Sistema

### ✅ Antes (Sin Cola)

- Emails síncronos bloqueaban el proceso
- Sin reintentos automáticos
- Sin manejo de errores robusto
- No escalable para emails masivos

### ✅ Ahora (Con Bull + Redis)

- Emails asíncronos (no bloquean)
- Reintentos automáticos con backoff
- Manejo robusto de errores
- Escalable para miles de emails
- Persistencia en Redis
- Monitoreo de cola disponible

---

## 📧 Límites de Gmail

### Cuenta Estándar

- **Por hora:** 100 emails
- **Por día:** 500 emails

### Recomendaciones

- Bull procesa automáticamente con rate limiting
- Para más volumen, considerar:
  - SendGrid (100 emails/día gratis)
  - Mailgun (5000 emails/mes gratis)
  - AWS SES (62,000 emails/mes gratis)

---

## 🔍 Monitoreo

### Ver Cola en Redis

```bash
# Conectar a Redis CLI
redis-cli

# Ver trabajos en cola
KEYS bull:notifications:*

# Ver trabajos pendientes
LLEN bull:notifications:wait

# Ver trabajos activos
LLEN bull:notifications:active

# Ver trabajos completados
LLEN bull:notifications:completed

# Ver trabajos fallidos
LLEN bull:notifications:failed
```

### Logs del Backend

Los logs muestran:

- `📬 Evento recibido: INSCRIPCION_CREADA`
- `✅ Notificación encolada para email@example.com`
- `📬 Procesando notificación inscripcion_creada`
- `📧 Email enviado a email@example.com`
- `✅ Notificación procesada exitosamente`

---

## 🐛 Troubleshooting

### Redis no conecta

```bash
# Verificar Redis está corriendo
redis-cli ping
# Debe responder: PONG

# Verificar variables de entorno
echo $REDIS_HOST
echo $REDIS_PORT
```

### Emails no se envían

1. Verificar credenciales SMTP en `.env`
2. Verificar logs del EmailService
3. Verificar que Gmail App Password sea válido
4. Verificar límites de Gmail (100/hora)

### Eventos no se procesan

1. Verificar que NotificationListener esté registrado
2. Verificar logs de EventEmitter2
3. Verificar que Bull Queue esté conectada a Redis
4. Verificar logs de NotificationProcessor

---

## 📝 Próximos Pasos

1. ✅ Bull + Redis configurado
2. ✅ NotificationListener activo
3. ✅ NotificationProcessor activo
4. ✅ EmailService con Gmail SMTP
5. ⏳ Probar flujo completo
6. ⏳ Monitorear cola en producción

---

## 📚 Referencias

- [Bull Documentation](https://github.com/OptimalBits/bull)
- [NestJS Bull Module](https://docs.nestjs.com/techniques/queues)
- [Gmail SMTP Setup](https://support.google.com/mail/answer/7126229)
- [Redis Documentation](https://redis.io/docs/)





















