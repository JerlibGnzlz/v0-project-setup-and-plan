# 📧 Flujo Completo de Emails - AMVA Digital

## ✅ Estado: IMPLEMENTADO Y FUNCIONANDO

---

## 🎯 Emails que se Envían Automáticamente

### 1. 📝 Email de Inscripción Recibida

**Cuándo se envía:** Al crear una inscripción desde la landing page o app móvil

**Destinatario:** El usuario que se inscribió

**Contenido:**

- ✅ Saludo personalizado
- ✅ Detalles de la convención (título, fechas, ubicación)
- ✅ Costo total y número de cuotas
- ✅ Monto por cuota
- ✅ Estado: "Pendiente de pago"
- ✅ Instrucciones sobre los próximos pasos

**Código:** `backend/src/modules/inscripciones/inscripciones.service.ts` (líneas 192-261)

---

### 2. ✅ Email de Pago Validado (por cada cuota)

**Cuándo se envía:** Cuando el admin valida un pago individual

**Destinatario:** El usuario que realizó el pago

**Contenido:**

- ✅ Confirmación de pago validado
- ✅ Monto pagado
- ✅ Número de cuota (ej: "Cuota 1 de 3")
- ✅ Progreso de pagos (ej: "Has pagado 1 de 3 cuotas")
- ✅ Cuotas pendientes

**Código:** `backend/src/modules/inscripciones/inscripciones.service.ts` (líneas 393-489)

---

### 3. 🎉 Email de Inscripción Confirmada

**Cuándo se envía:** Cuando se validan TODAS las cuotas de una inscripción

**Destinatario:** El usuario que completó todos los pagos

**Contenido:**

- ✅ Confirmación de inscripción completa
- ✅ Título de la convención
- ✅ Mensaje de bienvenida
- ✅ Información de que todos los pagos fueron validados

**Código:** `backend/src/modules/inscripciones/inscripciones.service.ts` (líneas 468-545)

---

## 🔧 Configuración

### Variables de Entorno Requeridas

En `backend/.env`:

```env
# Gmail SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=tu-email@gmail.com
SMTP_PASSWORD=tu-app-password-de-16-caracteres
```

### Cómo Obtener App Password de Gmail

1. Ve a: https://myaccount.google.com/security
2. Activa "Verificación en 2 pasos" (si no está activada)
3. Ve a: https://myaccount.google.com/apppasswords
4. Genera una App Password:
   - Aplicación: "Correo"
   - Dispositivo: "Otro (nombre personalizado)" → "AMVA Backend"
5. Copia la contraseña de 16 caracteres (sin espacios)
6. Pégala en `SMTP_PASSWORD` del `.env`

---

## 📋 Flujo Completo Paso a Paso

### Escenario: Usuario se inscribe desde la landing

1. **Usuario completa el formulario** en `/convencion/inscripcion`
   - Ingresa: nombre, apellido, email, teléfono, etc.

2. **Se crea la inscripción** en la base de datos
   - Estado: `pendiente`
   - Se crean automáticamente 3 pagos (PENDIENTE)

3. **📧 Email 1: Inscripción Recibida**
   - Se envía inmediatamente a `mariacarrillocastro81@gmail.com`
   - Título: "✅ Inscripción Recibida - Convención Nacional Venezuela"
   - Contenido: Detalles completos de la inscripción

4. **🔔 Notificación al Admin**
   - Los administradores reciben notificación en tiempo real
   - Aparece en la campana del dashboard
   - Pueden hacer clic para ir a `/admin/inscripciones`

5. **Admin valida el Pago 1** desde `/admin/pagos`
   - Cambia estado a "COMPLETADO"

6. **📧 Email 2: Pago Validado (Cuota 1/3)**
   - Se envía a `mariacarrillocastro81@gmail.com`
   - Título: "✅ Pago de Cuota 1 Validado"
   - Contenido: Monto, progreso (1/3), cuotas pendientes

7. **Admin valida el Pago 2**
   - Cambia estado a "COMPLETADO"

8. **📧 Email 3: Pago Validado (Cuota 2/3)**
   - Se envía a `mariacarrillocastro81@gmail.com`
   - Título: "✅ Pago de Cuota 2 Validado"
   - Contenido: Progreso (2/3), 1 cuota pendiente

9. **Admin valida el Pago 3** (última cuota)
   - Cambia estado a "COMPLETADO"
   - El sistema detecta que todas las cuotas están pagadas

10. **📧 Email 4: Pago Validado (Cuota 3/3)**
    - Se envía a `mariacarrillocastro81@gmail.com`
    - Título: "✅ Pago de Cuota 3 Validado"

11. **📧 Email 5: Inscripción Confirmada** (automático)
    - Se envía automáticamente cuando se detecta que todas las cuotas están pagadas
    - Título: "🎉 ¡Inscripción Confirmada!"
    - Contenido: Confirmación completa, todos los pagos validados

12. **Estado de inscripción actualizado**
    - Cambia de `pendiente` a `confirmado`

---

## 🎨 Templates de Email

Todos los emails usan el mismo template HTML profesional con:

- ✅ Header con logo y nombre "AMVA Digital"
- ✅ Iconos según el tipo de notificación
- ✅ Colores personalizados por tipo
- ✅ Sección de datos adicionales (montos, cuotas, etc.)
- ✅ Footer con información del ministerio
- ✅ Diseño responsive

**Tipos de email:**

- `inscripcion_recibida` - 📝 Azul
- `pago_validado` - ✅ Verde
- `inscripcion_confirmada` - 🎉 Ámbar

---

## 🔍 Verificación

### Probar el flujo completo:

```bash
cd backend
node test-flujo-completo.sh
```

### Probar solo el email:

```bash
cd backend
node test-email-simple.js
```

---

## 📊 Resumen de Emails por Flujo

| Evento                   | Email Enviado             | Destinatario      |
| ------------------------ | ------------------------- | ----------------- |
| Inscripción creada       | ✅ Inscripción Recibida   | Usuario           |
| Pago 1 validado          | ✅ Pago Validado (1/3)    | Usuario           |
| Pago 2 validado          | ✅ Pago Validado (2/3)    | Usuario           |
| Pago 3 validado          | ✅ Pago Validado (3/3)    | Usuario           |
| Todas las cuotas pagadas | 🎉 Inscripción Confirmada | Usuario           |
| Nueva inscripción        | 🔔 Notificación           | Admin (dashboard) |

---

## ✅ Estado Actual

- ✅ Gmail SMTP configurado y funcionando
- ✅ Email de inscripción recibida implementado
- ✅ Email de pago validado implementado
- ✅ Email de inscripción confirmada implementado
- ✅ Templates HTML profesionales
- ✅ Manejo de errores robusto
- ✅ Logs detallados
- ✅ Funciona para usuarios regulares (no requiere ser pastor)

---

## 🚀 Próximos Pasos (Opcionales)

- [ ] Agregar recordatorios de pago pendiente
- [ ] Agregar notificaciones de convención próxima
- [ ] Personalizar templates por tipo de usuario
- [ ] Agregar imágenes en los emails
- [ ] Implementar emails programados (cron jobs)

---

**Última actualización:** 30 de noviembre de 2024
