# 🔔 Diferencia: Notificaciones en Campanita vs Emails

## 📋 Resumen Ejecutivo

El sistema tiene **DOS tipos de notificaciones diferentes**:

1. **🔔 Notificaciones en la Campanita (Dashboard Admin)**
   - **Para:** Administradores del sistema
   - **Dónde:** Aparecen en la campanita del header del dashboard (`/admin`)
   - **Base de datos:** Se guardan en `NotificationHistory`
   - **Tiempo real:** WebSocket (actualización instantánea)
   - **Propósito:** Alertar a los admins sobre eventos importantes

2. **📧 Emails a Usuarios Finales**
   - **Para:** Usuarios que se inscriben (invitados)
   - **Dónde:** Llegan a su bandeja de correo electrónico
   - **Base de datos:** NO se guardan en `NotificationHistory`
   - **Tiempo real:** No aplica (es un email)
   - **Propósito:** Informar a los usuarios sobre el estado de su inscripción/pago

---

## 🔔 Notificaciones en la Campanita (Admins)

### ¿Qué son?

Son notificaciones que aparecen en la **campanita del header** del dashboard administrativo (`/admin`). Solo los **administradores** las ven.

### ¿Cuándo se envían?

Se envían cuando ocurren eventos importantes que los admins necesitan saber:

1. **Nueva Inscripción Creada**
   - Cuando un usuario se inscribe desde la web
   - Aparece: "Nueva inscripción de [Nombre] [Apellido]"

2. **Pago Validado**
   - Cuando un admin valida un pago
   - Aparece: "Pago validado para [Nombre] [Apellido]"

3. **Pago Rechazado**
   - Cuando un admin rechaza un pago
   - Aparece: "Pago rechazado para [Nombre] [Apellido]"

4. **Pago Rehabilitado**
   - Cuando un admin rehabilita un pago rechazado
   - Aparece: "Pago rehabilitado para [Nombre] [Apellido]"

### ¿Cómo funcionan?

```typescript
// Se llama desde inscripciones.service.ts o pagos.service.ts
await this.notificationsService.sendNotificationToAdmin(
  admin.email,  // Email del admin
  titulo,       // Título de la notificación
  mensaje,      // Mensaje de la notificación
  data          // Datos adicionales (inscripcionId, pagoId, etc.)
)
```

**Proceso:**
1. Se guarda en `NotificationHistory` (tabla de base de datos)
2. Se emite vía WebSocket al admin conectado
3. Aparece en la campanita del header
4. El contador de "no leídas" se actualiza automáticamente

### ¿Dónde se ven?

- **Componente:** `components/admin/notifications-bell.tsx`
- **Ruta:** `/admin` (cualquier página del dashboard)
- **Ubicación:** Header superior derecho (campanita 🔔)
- **WebSocket:** Se conecta automáticamente al autenticarse

### Características

- ✅ **Tiempo real:** Aparecen instantáneamente vía WebSocket
- ✅ **Persistentes:** Se guardan en base de datos
- ✅ **Marcar como leídas:** Puedes marcar individuales o todas
- ✅ **Eliminar:** Puedes eliminar notificaciones
- ✅ **Navegación:** Al hacer clic, te lleva a la página relevante (inscripciones, pagos, etc.)
- ✅ **Contador:** Muestra cuántas no has leído

---

## 📧 Emails a Usuarios Finales

### ¿Qué son?

Son **emails** que se envían a los usuarios que se inscriben (invitados) para informarles sobre el estado de su inscripción o pagos.

### ¿Cuándo se envían?

Se envían cuando ocurren eventos que afectan al usuario:

1. **Inscripción Creada**
   - Cuando el usuario completa el formulario de inscripción
   - Email: "Tu inscripción ha sido recibida"

2. **Pago Validado**
   - Cuando un admin valida el comprobante de pago
   - Email: "Tu pago ha sido validado exitosamente"

3. **Pago Rechazado**
   - Cuando un admin rechaza el comprobante de pago
   - Email: "Tu pago ha sido rechazado" (con motivo)

4. **Pago Rehabilitado**
   - Cuando un admin rehabilita un pago rechazado
   - Email: "Tu pago ha sido rehabilitado"

5. **Inscripción Confirmada**
   - Cuando todas las cuotas están pagadas
   - Email: "Tu inscripción ha sido confirmada"

6. **Recordatorio de Pago**
   - Cuando se envían recordatorios masivos
   - Email: "Recordatorio: Tienes pagos pendientes"

### ¿Cómo funcionan?

```typescript
// Se llama desde notification.listener.ts (eventos asíncronos)
await emailService.sendNotificationEmail(
  userEmail,    // Email del usuario (invitado)
  title,        // Título del email
  body,         // Cuerpo del email (HTML)
  data          // Datos adicionales
)
```

**Proceso:**
1. Se emite un evento (ej: `PagoValidadoEvent`)
2. El `NotificationListener` escucha el evento
3. Se procesa en la cola (Bull/Redis) o directamente
4. Se envía el email vía SendGrid/SMTP
5. **NO se guarda en `NotificationHistory`** (solo se envía el email)

### ¿Dónde se ven?

- **Bandeja de entrada** del usuario (Gmail, Outlook, etc.)
- **NO aparecen en la campanita** del dashboard
- **NO se guardan en base de datos** (solo se envían)

### Características

- ✅ **Templates personalizados:** Usan el nombre real del usuario
- ✅ **HTML profesional:** Diseño responsive y atractivo
- ✅ **Fallback automático:** Si SendGrid falla, intenta SMTP
- ✅ **Asíncrono:** Se procesan en cola (no bloquea la respuesta)
- ✅ **Retry automático:** Reintenta si falla

---

## 🔄 Flujo Completo: Ejemplo de Pago Validado

### Escenario: Admin valida un pago

```
1. Admin valida pago en /admin/pagos
   ↓
2. Backend valida el pago
   ↓
3. Se emiten DOS notificaciones diferentes:
   
   A) NOTIFICACIÓN PARA ADMINS (Campanita):
      ↓
      - sendNotificationToAdmin() se llama para TODOS los admins
      - Se guarda en NotificationHistory
      - Se emite vía WebSocket
      - Aparece en la campanita de TODOS los admins conectados
      - Contador de "no leídas" se actualiza
   
   B) EMAIL PARA EL USUARIO (Invitado):
      ↓
      - Se emite evento PagoValidadoEvent
      - NotificationListener escucha el evento
      - Se procesa en cola (Bull) o directamente
      - Se envía email vía SendGrid/SMTP
      - Email llega a la bandeja del usuario
      - NO se guarda en NotificationHistory
```

### Código Real

```typescript
// En pagos.service.ts (cuando se valida un pago)

// 1. Validar el pago
await this.prisma.pago.update({
  where: { id: pagoId },
  data: { estado: 'VALIDADO' }
})

// 2. Enviar notificación a TODOS los admins (campanita)
const admins = await this.prisma.user.findMany({
  where: { rol: 'ADMIN' }
})

for (const admin of admins) {
  await this.notificationsService.sendNotificationToAdmin(
    admin.email,
    'Pago Validado',
    `Pago validado para ${inscripcion.nombre} ${inscripcion.apellido}`,
    { pagoId, inscripcionId: inscripcion.id }
  )
}

// 3. Emitir evento para enviar email al usuario (invitado)
this.eventEmitter.emit(NotificationEventType.PAGO_VALIDADO, {
  email: inscripcion.email,
  userId: inscripcion.invitadoId,
  data: {
    pagoId,
    inscripcionId: inscripcion.id,
    nombre: inscripcion.nombre,
    apellido: inscripcion.apellido,
    // ... más datos
  }
})
```

---

## 📊 Tabla Comparativa

| Característica | 🔔 Notificaciones (Campanita) | 📧 Emails (Usuarios) |
|----------------|-------------------------------|----------------------|
| **Destinatario** | Administradores | Usuarios finales (invitados) |
| **Dónde se ven** | Campanita del dashboard | Bandeja de correo |
| **Base de datos** | ✅ Se guardan en `NotificationHistory` | ❌ NO se guardan |
| **Tiempo real** | ✅ WebSocket (instantáneo) | ❌ No aplica (email) |
| **Persistencia** | ✅ Permanentes (hasta que se eliminen) | ❌ Solo en el email |
| **Método** | `sendNotificationToAdmin()` | `sendNotificationEmail()` |
| **Templates** | Texto simple | HTML profesional |
| **Contador** | ✅ Muestra "no leídas" | ❌ No aplica |
| **Marcar leídas** | ✅ Sí | ❌ No aplica |
| **Eliminar** | ✅ Sí | ❌ No aplica |
| **Navegación** | ✅ Al hacer clic, navega | ❌ No aplica |
| **Procesamiento** | Directo (síncrono) | Cola (asíncrono) |
| **Fallback** | ❌ No aplica | ✅ SendGrid → SMTP |

---

## 🎯 ¿Por qué dos sistemas diferentes?

### Razones de Diseño

1. **Audiencias diferentes:**
   - **Admins:** Necesitan notificaciones en tiempo real en el dashboard
   - **Usuarios:** Necesitan emails en su bandeja de correo

2. **Propósitos diferentes:**
   - **Notificaciones:** Alertar sobre eventos que requieren acción
   - **Emails:** Informar sobre el estado de su inscripción/pago

3. **Persistencia diferente:**
   - **Notificaciones:** Se guardan para revisión posterior
   - **Emails:** Se envían y el usuario los gestiona en su email

4. **Interacción diferente:**
   - **Notificaciones:** Click → Navega a la página relevante
   - **Emails:** Click → Abre el email (o link externo)

---

## 🔍 Verificación

### ¿Cómo verificar que las notificaciones funcionan?

#### Notificaciones en Campanita (Admins):

1. Abre el dashboard (`/admin`)
2. Haz clic en la campanita 🔔 del header
3. Deberías ver las notificaciones
4. El contador muestra cuántas no has leído

**Logs esperados:**
```
✅ Notificación guardada en historial para admin@example.com
✅ Notificación emitida vía WebSocket
```

#### Emails a Usuarios:

1. Crea una inscripción o valida un pago
2. Revisa los logs de Render
3. Deberías ver:
   ```
   📧 Preparando email con SendGrid para usuario@example.com...
   📧 Enviando email a usuario@example.com...
   ✅ Email enviado exitosamente a usuario@example.com (SendGrid)
   ```
4. Revisa la bandeja de entrada del usuario

---

## ❓ Preguntas Frecuentes

### ¿Los emails también aparecen en la campanita?

**No.** Los emails son solo para usuarios finales (invitados). No aparecen en la campanita del dashboard.

### ¿Las notificaciones de la campanita también se envían por email?

**No.** Las notificaciones de la campanita son solo para admins y solo aparecen en el dashboard. No se envían por email.

### ¿Puedo desactivar las notificaciones de la campanita?

**No directamente**, pero puedes:
- Marcar todas como leídas
- Eliminar notificaciones individuales
- Ignorar la campanita

### ¿Puedo desactivar los emails a usuarios?

**Sí**, puedes:
- No configurar `EMAIL_PROVIDER` (pero esto desactivaría TODOS los emails)
- Modificar el código para no emitir eventos de email

### ¿Por qué no llegan los emails?

**Posibles causas:**
1. SendGrid no configurado correctamente
2. Email no verificado en SendGrid
3. Plan de SendGrid agotado
4. SMTP fallando como fallback
5. Email en spam

**Ver:** `docs/DIAGNOSTICAR_EMAILS_NO_LLEGAN_SMTP.md`

### ¿Por qué no aparecen notificaciones en la campanita?

**Posibles causas:**
1. WebSocket no conectado
2. No hay eventos que generen notificaciones
3. Notificaciones ya leídas/eliminadas
4. Error en `sendNotificationToAdmin()`

**Ver:** Logs de Render para `sendNotificationToAdmin`

---

## 📝 Resumen

- **🔔 Notificaciones (Campanita):** Para admins, aparecen en el dashboard, se guardan en BD, tiempo real vía WebSocket
- **📧 Emails:** Para usuarios finales, llegan a su correo, NO se guardan en BD, se envían vía SendGrid/SMTP

**Ambos sistemas funcionan independientemente** y sirven propósitos diferentes.

---

**Última actualización:** Diciembre 2025

