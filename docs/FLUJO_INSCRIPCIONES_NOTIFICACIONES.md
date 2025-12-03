# Flujo de Inscripciones por Web - Notificaciones y Emails

## 📋 Resumen del Flujo Actual

### 1. Creación de Inscripción (Web)

**Endpoint:** `POST /api/inscripciones`

**Proceso:**
1. Usuario completa formulario en landing page
2. Validaciones:
   - Email único por convención
   - Cupos disponibles
   - Convención activa
3. Transacción atómica:
   - Crea registro en tabla `invitados` (si no existe)
   - Crea inscripción en tabla `inscripciones`
   - Crea pagos automáticos según `numeroCuotas`
4. **Notificaciones inmediatas:**
   - ✅ Notificación WebSocket a admins (tiempo real)
   - ✅ Email a admins (síncrono)
   - ✅ Evento `INSCRIPCION_CREADA` emitido (pero sin listener activo)

---

## 🔔 Sistema de Notificaciones Actual

### Arquitectura

```
┌─────────────────┐
│  Inscripción    │
│   Creada        │
└────────┬────────┘
         │
         ├─► EventEmitter2.emit()
         │   (Evento: INSCRIPCION_CREADA)
         │
         ├─► sendNotificationToAdmin() [DIRECTO]
         │   ├─► EmailService.sendNotificationEmail()
         │   ├─► NotificationsGateway.emitToUser() [WebSocket]
         │   └─► Guarda en NotificationHistory
         │
         └─► NotificationListener [NO ACTIVO]
             └─► Bull Queue [REMOVIDO]
```

### Estado Actual

#### ✅ Funcionando:
1. **Notificaciones a Admins (Síncronas)**
   - Se envían directamente sin eventos
   - Email inmediato vía Gmail SMTP
   - WebSocket para tiempo real en dashboard
   - Guarda historial en BD

2. **WebSocket (Socket.io)**
   - Gateway configurado en `/notifications`
   - Autenticación con JWT
   - Emite notificaciones en tiempo real
   - Actualiza conteo de no leídas

3. **Eventos Emitidos**
   - `INSCRIPCION_CREADA` ✅
   - `PAGO_VALIDADO` ✅
   - `INSCRIPCION_CONFIRMADA` ✅
   - `PAGO_RECHAZADO` ✅
   - `PAGO_REHABILITADO` ✅
   - `PAGO_RECORDATORIO` ✅

#### ❌ No Funcionando:
1. **NotificationListener**
   - Está registrado pero usa Bull Queue (removido)
   - Los eventos se emiten pero NO se procesan
   - No hay cola de trabajos activa

2. **Colas para Emails Masivos**
   - No hay sistema de colas implementado
   - Los emails se envían síncronamente
   - Puede bloquear si hay muchos destinatarios

---

## 📧 Sistema de Emails

### EmailService (Actual)

**Configuración:**
- Gmail SMTP (nodemailer)
- Envío síncrono directo
- Sin cola de trabajos
- Sin reintentos automáticos

**Limitaciones:**
- ❌ No maneja emails masivos eficientemente
- ❌ Puede bloquear el proceso si falla
- ❌ Sin rate limiting para SMTP
- ❌ Sin manejo de errores con reintentos

---

## 🚀 Mejoras Recomendadas

### Opción 1: Sistema de Colas Simple (Sin Redis)

**Ventajas:**
- No requiere Redis
- Implementación simple
- Adecuado para volúmenes medianos

**Implementación:**
```typescript
// Cola en memoria con procesamiento asíncrono
class EmailQueue {
  private queue: EmailJob[] = []
  private processing = false
  
  async add(job: EmailJob) {
    this.queue.push(job)
    this.process()
  }
  
  private async process() {
    if (this.processing) return
    this.processing = true
    
    while (this.queue.length > 0) {
      const job = this.queue.shift()
      await this.sendEmail(job)
      await delay(100) // Rate limiting
    }
    
    this.processing = false
  }
}
```

### Opción 2: Sistema de Colas con Bull (Recomendado para Producción)

**Ventajas:**
- ✅ Persistencia en Redis
- ✅ Reintentos automáticos
- ✅ Prioridades
- ✅ Monitoreo
- ✅ Escalable

**Requisitos:**
- Redis activo
- Bull Module configurado

**Implementación:**
```typescript
// Ya tienes la estructura, solo falta reactivar
@Processor('emails')
export class EmailProcessor {
  @Process({ name: 'send-email', concurrency: 5 })
  async handleEmail(job: Job<EmailJobData>) {
    // Procesar email con reintentos
  }
}
```

---

## 📊 Flujo Recomendado para Emails Masivos

### Escenario: Enviar Recordatorios a 1000+ Inscripciones

**Problema Actual:**
- `enviarRecordatoriosPago()` envía emails uno por uno síncronamente
- Puede tomar minutos/horas
- Bloquea el proceso
- Sin manejo de errores robusto

**Solución con Colas:**

```typescript
async enviarRecordatoriosPago(convencionId?: string) {
  // 1. Obtener inscripciones pendientes
  const inscripciones = await this.getInscripcionesPendientes(convencionId)
  
  // 2. Encolar cada email (no bloquea)
  for (const insc of inscripciones) {
    await this.emailQueue.add({
      to: insc.email,
      subject: 'Recordatorio de Pago',
      template: 'pago_recordatorio',
      data: { inscripcion: insc }
    })
  }
  
  // 3. Retornar inmediatamente
  return {
    message: `${inscripciones.length} recordatorios encolados`,
    queued: inscripciones.length
  }
}
```

---

## 🔧 Estado Actual del Código

### NotificationListener
- ✅ Escucha eventos correctamente
- ❌ Intenta usar Bull Queue (no disponible)
- ⚠️ Los eventos se emiten pero NO se procesan

### NotificationsService
- ✅ `sendNotificationToAdmin()` - Funciona (síncrono)
- ✅ `sendNotificationToUser()` - Funciona (síncrono)
- ✅ WebSocket integrado
- ✅ Historial guardado

### EmailService
- ✅ Configurado con Gmail SMTP
- ✅ Templates HTML
- ❌ Sin cola de trabajos
- ❌ Sin rate limiting

---

## 💡 Recomendaciones Inmediatas

### 1. Para Emails Individuales (Actual)
**Estado:** ✅ Funciona bien
- Notificaciones a admins: inmediatas
- Notificaciones a usuarios: inmediatas
- WebSocket: tiempo real

### 2. Para Emails Masivos (Mejorar)
**Opciones:**

**A) Cola Simple en Memoria** (Rápido de implementar)
- Procesamiento asíncrono
- Rate limiting básico
- Sin persistencia

**B) Reactivar Bull + Redis** (Recomendado)
- Ya tienes el código
- Solo falta configurar Redis
- Escalable y robusto

**C) Servicio Externo** (Para producción)
- SendGrid
- Mailgun
- AWS SES
- Manejan colas automáticamente

---

## 📝 Próximos Pasos Sugeridos

1. **Decidir estrategia de colas:**
   - ¿Simple en memoria?
   - ¿Bull + Redis?
   - ¿Servicio externo?

2. **Implementar rate limiting:**
   - Gmail: ~100 emails/hora
   - Evitar bloqueos

3. **Mejorar manejo de errores:**
   - Reintentos exponenciales
   - Logging detallado
   - Notificaciones de fallos

4. **Monitoreo:**
   - Dashboard de cola
   - Métricas de envío
   - Alertas de fallos

---

## 🎯 Conclusión

**Lo que funciona bien:**
- ✅ Inscripciones por web
- ✅ Notificaciones inmediatas a admins
- ✅ WebSocket en tiempo real
- ✅ Emails individuales

**Lo que necesita mejoras:**
- ⚠️ Emails masivos (sin cola)
- ⚠️ Eventos sin procesar (listener inactivo)
- ⚠️ Rate limiting para SMTP

**Recomendación:**
Para producción con emails masivos, reactivar Bull + Redis o usar servicio externo como SendGrid.

