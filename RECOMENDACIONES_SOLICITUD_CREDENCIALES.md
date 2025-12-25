# Recomendaciones para Solicitud de Credenciales desde la App

## 📋 Resumen del Flujo Actual

### ✅ Lo que ya está implementado:

1. **Endpoint de creación** (`POST /api/solicitudes-credenciales`)
   - Protegido con `InvitadoJwtAuthGuard`
   - Valida DTO con `class-validator`
   - Crea solicitud en base de datos

2. **Sistema de notificaciones**
   - `sendNotificationToAdmin()` guarda en `NotificationHistory`
   - Emite eventos WebSocket para tiempo real
   - Envía emails a admins

3. **Frontend (AMVA Digital)**
   - `NotificationsBell` muestra notificaciones
   - WebSocket conecta automáticamente
   - Navegación a `/admin/solicitudes-credenciales` cuando se hace clic

### ⚠️ Problemas identificados:

1. **NotificationHistory requiere `pastorId`**
   - Los admins no son pastores
   - Actualmente usa el primer pastor disponible como "placeholder"
   - Esto funciona pero no es ideal

2. **Error 500 al crear solicitud**
   - Necesita debugging con los logs mejorados
   - Puede ser problema de validación, conexión DB, o Prisma

## 🎯 Recomendaciones para Mejorar

### 1. **Mejorar `sendNotificationToAdmin` para Admins**

**Problema actual:**
- Busca pastor por email
- Si no encuentra, usa el primer pastor disponible
- Esto funciona pero es confuso

**Solución recomendada:**
```typescript
// Mejorar la lógica para que sea más clara
async sendNotificationToAdmin(
  email: string,
  title: string,
  body: string,
  data?: Record<string, unknown>,
): Promise<void> {
  // 1. Verificar si es admin (User)
  const user = await this.prisma.user.findUnique({
    where: { email },
  })

  if (user) {
    // 2. Buscar un pastor "sistema" o usar el primero disponible
    const systemPastor = await this.prisma.pastor.findFirst({
      where: { activo: true },
    })

    if (systemPastor) {
      // 3. Guardar notificación asociada al pastor sistema
      const notification = await this.prisma.notificationHistory.create({
        data: {
          pastorId: systemPastor.id,
          email: user.email,
          title,
          body,
          type: (data?.type as string) || 'info',
          data: data ? JSON.parse(JSON.stringify(data)) : null,
          read: false,
        },
      })

      // 4. Emitir WebSocket
      await this.notificationsGateway.emitToUser(email, {
        id: notification.id,
        title,
        body,
        type: (data?.type as string) || 'info',
        data: data || {},
        read: false,
        createdAt: notification.createdAt.toISOString(),
      })

      // 5. Actualizar conteo de no leídas
      await this.notificationsGateway.emitUnreadCountUpdate(email)

      // 6. Enviar email
      await this.sendEmailToAdmin(email, title, body, data)
    }
  }
}
```

### 2. **Asegurar que las Notificaciones Lleguen por WebSocket**

**Verificar:**
- ✅ `NotificationsGateway` está inyectado correctamente
- ✅ `emitToUser` funciona con el email del admin
- ✅ `emitUnreadCountUpdate` actualiza el contador

**Mejora recomendada:**
```typescript
// En solicitudes-credenciales.service.ts
setTimeout(async () => {
  try {
    const admins = await this.prisma.user.findMany()
    
    for (const admin of admins) {
      try {
        // 1. Guardar notificación
        await this.notificationsService.sendNotificationToAdmin(
          admin.email,
          'Nueva Solicitud de Credencial',
          `${invitado.nombre} ${invitado.apellido} ha solicitado una credencial ${tipoLabel}`,
          {
            tipo: 'solicitud_credencial',
            solicitudId: solicitud.id,
            invitadoId,
            tipoCredencial: dto.tipo,
            dni: dto.dni,
          }
        )
        
        // 2. Logging para debugging
        this.logger.log(`✅ Notificación enviada a admin ${admin.email}`)
      } catch (error) {
        this.logger.error(`Error enviando notificación a ${admin.email}:`, error)
      }
    }
  } catch (error) {
    this.logger.error('Error en proceso de notificaciones:', error)
  }
}, 0)
```

### 3. **Mejorar el Frontend para Mostrar Notificaciones**

**Verificar en `notifications-bell.tsx`:**
- ✅ Maneja el tipo `solicitud_credencial`
- ✅ Navega a `/admin/solicitudes-credenciales`
- ✅ Scroll y highlight de la solicitud específica

**Código actual (ya implementado):**
```typescript
case 'solicitud_credencial':
  setOpen(false)
  router.push(`/admin/solicitudes-credenciales?solicitud=${data.solicitudId}`)
  setTimeout(() => {
    const element = document.querySelector(`[data-solicitud-id="${data.solicitudId}"]`)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' })
      element.classList.add('ring-2', 'ring-amber-500')
      setTimeout(() => {
        element.classList.remove('ring-2', 'ring-amber-500')
      }, 3000)
    }
  }, 500)
  break
```

### 4. **Debugging del Error 500**

**Pasos para identificar el problema:**

1. **Revisar logs del backend en Render:**
   ```
   📝 ===== INICIO CREATE SERVICE =====
   ✅ Conexión a la base de datos verificada
   🔍 Buscando invitado con ID: ...
   ✅ Invitado encontrado: ...
   📝 Intentando crear solicitud en Prisma...
   ```

2. **Verificar errores de Prisma:**
   - `P2002`: Constraint único violado
   - `P2003`: Foreign key inválida
   - `P2011`: Campo requerido es null

3. **Verificar validación del DTO:**
   - `tipo` debe ser `'ministerial'` o `'capellania'`
   - `dni`, `nombre`, `apellido` son requeridos
   - `fechaNacimiento` debe ser válida si se proporciona

### 5. **Mejorar Manejo de Errores**

**Recomendación:**
```typescript
// En el controller, agregar más contexto
catch (error: unknown) {
  // Si es error de validación, mostrar campos específicos
  if (error instanceof BadRequestException) {
    const response = error.getResponse()
    if (typeof response === 'object' && response !== null) {
      // Loggear detalles de validación
      this.logger.error('Error de validación:', response)
    }
  }
  
  // Re-lanzar para que el GlobalExceptionFilter lo maneje
  throw error
}
```

## 🚀 Plan de Acción Inmediato

### Paso 1: Debugging del Error 500
1. ✅ Logging mejorado ya implementado
2. ⏳ Revisar logs del backend después de intentar crear solicitud
3. ⏳ Identificar el error específico (Prisma, validación, etc.)

### Paso 2: Verificar Notificaciones
1. ✅ `sendNotificationToAdmin` ya implementado
2. ⏳ Verificar que se guarde en `NotificationHistory`
3. ⏳ Verificar que se emita por WebSocket
4. ⏳ Verificar que llegue al frontend

### Paso 3: Mejorar UX
1. ✅ Navegación a página de solicitudes implementada
2. ⏳ Agregar scroll y highlight automático
3. ⏳ Agregar badge de "nueva solicitud" en la tabla

## 📝 Checklist Final

- [ ] Error 500 resuelto
- [ ] Notificaciones se guardan en `NotificationHistory`
- [ ] Notificaciones se emiten por WebSocket
- [ ] Notificaciones aparecen en `NotificationsBell`
- [ ] Click en notificación navega a página de solicitudes
- [ ] Scroll y highlight funcionan correctamente
- [ ] Email se envía a admins (opcional)

## 🔍 Próximos Pasos

1. **Revisar logs del backend** después de intentar crear solicitud
2. **Verificar que las notificaciones se guarden** en `NotificationHistory`
3. **Probar WebSocket** desde el frontend
4. **Mejorar manejo de errores** si es necesario

