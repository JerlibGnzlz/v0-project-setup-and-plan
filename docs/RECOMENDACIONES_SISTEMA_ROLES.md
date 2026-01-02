# Recomendaciones para Sistemas de Roles y Permisos

## 📋 Índice
1. [Gestión de Usuarios](#gestión-de-usuarios)
2. [Auditoría y Logs](#auditoría-y-logs)
3. [Seguridad](#seguridad)
4. [Funcionalidades Adicionales](#funcionalidades-adicionales)
5. [Mejores Prácticas](#mejores-prácticas)

---

## 1. Gestión de Usuarios

### ✅ **CRÍTICO: Página de Gestión de Usuarios**

**Por qué es importante:**
- Permite crear/editar/eliminar usuarios desde el admin
- Asignar roles sin tocar la base de datos
- Cambiar contraseñas de usuarios
- Activar/desactivar usuarios

**Implementación recomendada:**
```
/app/admin/usuarios/
├── page.tsx                    # Lista de usuarios
├── components/
│   ├── usuarios-table.tsx      # Tabla con usuarios
│   ├── usuarios-dialog.tsx     # Crear/editar usuario
│   ├── usuarios-filters.tsx    # Filtros por rol
│   └── usuarios-stats.tsx      # Estadísticas
```

**Funcionalidades:**
- ✅ Crear usuarios (solo ADMIN)
- ✅ Editar usuarios (solo ADMIN)
- ✅ Cambiar rol de usuario (solo ADMIN)
- ✅ Cambiar contraseña (propia o de otros si es ADMIN)
- ✅ Activar/desactivar usuarios
- ✅ Ver último login
- ✅ Ver actividad reciente

---

## 2. Auditoría y Logs

### ✅ **CRÍTICO: Sistema de Auditoría**

**Por qué es importante:**
- Rastrear quién hizo qué y cuándo
- Detectar accesos no autorizados
- Cumplimiento de regulaciones
- Debugging de problemas

**Implementación recomendada:**

#### 2.1. Modelo de Auditoría en Prisma
```prisma
model AuditLog {
  id          String   @id @default(uuid())
  userId      String   @map("user_id")
  action      String   // CREATE, UPDATE, DELETE, LOGIN, LOGOUT
  entity      String   // User, Noticia, Galeria, etc.
  entityId    String?  @map("entity_id")
  changes     Json?    // Cambios realizados (before/after)
  ipAddress   String?  @map("ip_address")
  userAgent   String?  @map("user_agent")
  createdAt   DateTime @default(now()) @map("created_at")
  user        User     @relation(fields: [userId], references: [id])
  
  @@index([userId])
  @@index([action])
  @@index([entity])
  @@index([createdAt])
  @@map("audit_logs")
}
```

#### 2.2. Decorador de Auditoría
```typescript
// backend/src/common/decorators/audit.decorator.ts
export const Audit = (action: string, entity: string) => {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    // Interceptar método y registrar acción
  }
}
```

#### 2.3. Página de Auditoría en Admin
```
/app/admin/auditoria/
├── page.tsx                    # Lista de logs
├── components/
│   ├── audit-filters.tsx       # Filtros por usuario/acción/entidad
│   └── audit-details-dialog.tsx # Ver detalles de cambios
```

**Eventos a auditar:**
- ✅ Login/Logout
- ✅ Crear/Editar/Eliminar usuarios
- ✅ Cambios de roles
- ✅ Crear/Editar/Eliminar noticias
- ✅ Crear/Editar/Eliminar galería
- ✅ Validar/Rechazar pagos
- ✅ Accesos a rutas protegidas

---

## 3. Seguridad

### ✅ **CRÍTICO: Mejoras de Seguridad**

#### 3.1. Rate Limiting por Rol
```typescript
// Limitar intentos de login por IP
@ThrottleAuth() // Ya implementado ✅

// Limitar acciones por usuario
@Throttle(10, 60) // 10 acciones por minuto
```

#### 3.2. Validación de Contraseñas
```typescript
// Reglas de contraseña fuerte
- Mínimo 8 caracteres
- Al menos 1 mayúscula
- Al menos 1 número
- Al menos 1 carácter especial
```

#### 3.3. 2FA (Two-Factor Authentication)
```typescript
// Ya tienes estructura para 2FA ✅
// Implementar:
- Código TOTP (Google Authenticator)
- Código SMS (opcional)
- Código Email (backup)
```

#### 3.4. Sesiones Concurrentes
```typescript
// Limitar número de sesiones activas
- Máximo 3 dispositivos por usuario
- Invalidar sesiones antiguas al iniciar nueva
```

#### 3.5. IP Whitelist (Opcional)
```typescript
// Para usuarios críticos (ADMIN)
- Lista de IPs permitidas
- Alertas cuando se accede desde IP nueva
```

---

## 4. Funcionalidades Adicionales

### ✅ **IMPORTANTE: Funcionalidades Útiles**

#### 4.1. Permisos Granulares (Futuro)
```typescript
// En lugar de solo roles, permisos específicos
enum Permission {
  NOTICIAS_CREAR = 'noticias:crear',
  NOTICIAS_EDITAR = 'noticias:editar',
  NOTICIAS_ELIMINAR = 'noticias:eliminar',
  GALERIA_SUBIR = 'galeria:subir',
  GALERIA_ELIMINAR = 'galeria:eliminar',
  // etc.
}

// Usuario puede tener múltiples permisos
model User {
  permissions Permission[] @default([])
}
```

#### 4.2. Notificaciones de Seguridad
```typescript
// Alertas automáticas:
- Login desde IP nueva
- Cambio de contraseña
- Cambio de rol
- Múltiples intentos fallidos
- Acceso a rutas no permitidas
```

#### 4.3. Dashboard de Seguridad
```
/app/admin/seguridad/
├── page.tsx                    # Vista general
├── components/
│   ├── security-stats.tsx       # Estadísticas
│   ├── recent-logins.tsx        # Últimos accesos
│   ├── failed-attempts.tsx      # Intentos fallidos
│   └── active-sessions.tsx      # Sesiones activas
```

#### 4.4. Exportación de Logs
```typescript
// Exportar logs de auditoría:
- CSV para análisis
- PDF para reportes
- JSON para integraciones
```

#### 4.5. Políticas de Contraseñas
```typescript
// Configuración de políticas:
- Expiración de contraseñas (90 días)
- Historial de contraseñas (no repetir últimas 5)
- Forzar cambio en primer login
```

---

## 5. Mejores Prácticas

### ✅ **Recomendaciones Generales**

#### 5.1. Principio de Menor Privilegio
- ✅ Usuarios solo tienen acceso a lo necesario
- ✅ Roles específicos (no genéricos)
- ✅ Permisos mínimos requeridos

#### 5.2. Separación de Responsabilidades
- ✅ ADMIN: Gestión completa
- ✅ EDITOR: Solo contenido (noticias/galería)
- ✅ VIEWER: Solo lectura (futuro)

#### 5.3. Validación en Múltiples Capas
- ✅ Frontend: UX (ocultar/mostrar)
- ✅ Backend: Seguridad real (guards)
- ✅ Base de Datos: Constraints si es necesario

#### 5.4. Documentación
- ✅ Documentar cada rol y sus permisos
- ✅ Guía de uso para administradores
- ✅ Changelog de cambios de seguridad

#### 5.5. Testing
- ✅ Tests unitarios para guards
- ✅ Tests de integración para endpoints
- ✅ Tests E2E para flujos completos

---

## 📊 Prioridades de Implementación

### 🔴 **ALTA PRIORIDAD (Implementar primero)**
1. ✅ **Gestión de Usuarios** - Página admin para crear/editar usuarios
2. ✅ **Auditoría Básica** - Logs de acciones importantes
3. ✅ **Validación de Contraseñas** - Reglas de seguridad

### 🟡 **MEDIA PRIORIDAD (Próximos pasos)**
4. ✅ **Dashboard de Seguridad** - Vista de actividad
5. ✅ **Notificaciones de Seguridad** - Alertas automáticas
6. ✅ **Sesiones Concurrentes** - Control de dispositivos

### 🟢 **BAJA PRIORIDAD (Mejoras futuras)**
7. ✅ **Permisos Granulares** - Sistema más flexible
8. ✅ **IP Whitelist** - Para usuarios críticos
9. ✅ **Exportación de Logs** - Reportes avanzados

---

## 🎯 Checklist de Implementación

### Fase 1: Gestión de Usuarios
- [ ] Crear módulo `usuarios` en backend
- [ ] Crear página `/admin/usuarios` en frontend
- [ ] Implementar CRUD de usuarios
- [ ] Agregar validación de roles
- [ ] Agregar cambio de contraseña

### Fase 2: Auditoría
- [ ] Crear modelo `AuditLog` en Prisma
- [ ] Crear servicio de auditoría
- [ ] Implementar decorador `@Audit`
- [ ] Crear página `/admin/auditoria`
- [ ] Agregar logs a acciones críticas

### Fase 3: Seguridad
- [ ] Implementar validación de contraseñas
- [ ] Agregar rate limiting avanzado
- [ ] Implementar 2FA (opcional)
- [ ] Crear dashboard de seguridad

---

## 📚 Recursos Adicionales

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [NestJS Security Best Practices](https://docs.nestjs.com/security/authentication)
- [Prisma Security](https://www.prisma.io/docs/guides/performance-and-optimization/connection-management)

---

**Última actualización**: Diciembre 2025
**Versión**: 1.0.0

