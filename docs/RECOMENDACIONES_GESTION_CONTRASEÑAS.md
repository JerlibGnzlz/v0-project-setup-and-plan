# Recomendaciones: Gestión de Contraseñas en el Admin

## 📋 Situación Actual

### ✅ Lo que existe:
- Modelo `PasswordResetToken` en Prisma ✅
- Sistema de reset de password para **Pastores** ✅
- Carpetas creadas pero vacías: `/admin/forgot-password` y `/admin/reset-password`

### ❌ Lo que falta:
- Endpoints de reset de password para **Admins**
- Páginas de forgot/reset password para admins
- Cambio de contraseña desde el perfil (cuando estás logueado)
- Cambio de contraseña de otros usuarios (solo ADMIN)

---

## 🎯 Recomendaciones

### ✅ **SÍ es recomendable implementar:**

#### 1. **Cambio de Contraseña desde el Perfil** (ALTA PRIORIDAD)
**Cuándo se usa:**
- Usuario logueado quiere cambiar su propia contraseña
- Por seguridad periódica
- Si sospecha que su cuenta fue comprometida

**Dónde implementar:**
- En el header del admin (menú de usuario → "Cambiar Contraseña")
- O en una página de perfil `/admin/perfil`

**Funcionalidades:**
- ✅ Validar contraseña actual
- ✅ Nueva contraseña con validación fuerte
- ✅ Confirmar nueva contraseña
- ✅ Reglas de contraseña: mínimo 8 caracteres, mayúsculas, números, caracteres especiales

---

#### 2. **Recuperación de Contraseña (Forgot Password)** (ALTA PRIORIDAD)
**Cuándo se usa:**
- Usuario olvidó su contraseña
- No puede hacer login
- Necesita resetear su contraseña

**Flujo recomendado:**
1. Usuario va a `/admin/login`
2. Click en "¿Olvidaste tu contraseña?"
3. Ingresa su email
4. Recibe email con link de reset (válido por 1 hora)
5. Click en link → va a `/admin/reset-password?token=xxx`
6. Ingresa nueva contraseña
7. Puede hacer login con nueva contraseña

**Seguridad:**
- ✅ Token único y seguro
- ✅ Expiración de 1 hora
- ✅ Token solo se puede usar una vez
- ✅ Rate limiting (máximo 3 intentos por hora)
- ✅ Email de confirmación cuando se cambia la contraseña

---

#### 3. **Cambio de Contraseña de Otros Usuarios (Solo ADMIN)** (MEDIA PRIORIDAD)
**Cuándo se usa:**
- ADMIN necesita resetear contraseña de otro usuario
- Usuario perdió acceso y no puede usar forgot password
- Por seguridad (cuenta comprometida)

**Dónde implementar:**
- En página de gestión de usuarios `/admin/usuarios`
- Botón "Resetear Contraseña" en cada usuario
- Opción de generar contraseña temporal o enviar link de reset

**Funcionalidades:**
- ✅ Solo ADMIN puede hacer esto
- ✅ Opción 1: Generar contraseña temporal y mostrarla (usuario debe cambiarla en primer login)
- ✅ Opción 2: Enviar link de reset por email
- ✅ Auditoría: registrar quién reseteó la contraseña de quién

---

## 🔒 Seguridad y Mejores Prácticas

### Validación de Contraseñas
```typescript
// Reglas recomendadas:
- Mínimo 8 caracteres
- Al menos 1 mayúscula
- Al menos 1 minúscula
- Al menos 1 número
- Al menos 1 carácter especial (!@#$%^&*)
- No puede ser igual a la contraseña anterior (últimas 5)
```

### Tokens de Reset
```typescript
// Características:
- Token único y aleatorio (32+ caracteres)
- Expiración: 1 hora
- Solo se puede usar una vez
- Invalidar todos los tokens anteriores al crear uno nuevo
- Rate limiting: máximo 3 solicitudes por hora por email
```

### Notificaciones
```typescript
// Enviar email cuando:
- Se solicita reset de contraseña
- Se cambia la contraseña exitosamente
- Se cambia la contraseña desde otro dispositivo/IP
- ADMIN resetea la contraseña de un usuario
```

---

## 📊 Comparación de Opciones

### Opción 1: Solo Forgot Password (Básico)
**Pros:**
- ✅ Simple de implementar
- ✅ Cubre el caso más común (olvidé mi clave)

**Contras:**
- ❌ No permite cambio preventivo
- ❌ ADMIN no puede ayudar a otros usuarios

**Recomendación:** ⭐⭐⭐ (Buena para empezar)

---

### Opción 2: Forgot Password + Cambio desde Perfil (Recomendado)
**Pros:**
- ✅ Cubre todos los casos comunes
- ✅ Permite cambio preventivo
- ✅ Mejor experiencia de usuario

**Contras:**
- ⚠️ Un poco más complejo

**Recomendación:** ⭐⭐⭐⭐⭐ (Ideal)

---

### Opción 3: Completo (Forgot + Perfil + Admin Reset)
**Pros:**
- ✅ Máxima flexibilidad
- ✅ ADMIN puede ayudar a usuarios
- ✅ Mejor para equipos grandes

**Contras:**
- ⚠️ Más complejo de implementar
- ⚠️ Requiere página de gestión de usuarios

**Recomendación:** ⭐⭐⭐⭐ (Excelente si tienes gestión de usuarios)

---

## 🎯 Recomendación Final

### **Implementar en 2 Fases:**

#### **Fase 1 (Inmediata):**
1. ✅ **Cambio de contraseña desde perfil** (cuando estás logueado)
2. ✅ **Forgot Password** (recuperación vía email)

**Por qué:**
- Cubre el 95% de los casos de uso
- Relativamente simple de implementar
- Mejora significativamente la experiencia

#### **Fase 2 (Cuando tengas gestión de usuarios):**
3. ✅ **Reset de contraseña desde admin** (para otros usuarios)

**Por qué:**
- Requiere tener página de gestión de usuarios primero
- Útil para equipos grandes
- Puede esperar si no es crítico

---

## 📝 Casos de Uso

### Caso 1: Usuario olvidó su contraseña
**Flujo actual:** ❌ No puede hacer nada, necesita contacto con ADMIN
**Flujo propuesto:** ✅ Usa "Forgot Password" → recibe email → resetea

### Caso 2: Usuario quiere cambiar su contraseña por seguridad
**Flujo actual:** ❌ No puede hacerlo desde el admin
**Flujo propuesto:** ✅ Va a su perfil → "Cambiar Contraseña" → cambia

### Caso 3: ADMIN necesita resetear contraseña de usuario
**Flujo actual:** ❌ Debe hacerlo manualmente en BD o crear nuevo usuario
**Flujo propuesto:** ✅ Va a gestión de usuarios → "Resetear Contraseña" → envía link o genera temporal

---

## 🚀 Plan de Implementación

### Paso 1: Backend - Endpoints
```typescript
// Endpoints necesarios:
POST /auth/forgot-password      // Solicitar reset
POST /auth/reset-password       // Resetear con token
POST /auth/change-password      // Cambiar cuando estás logueado (requiere JWT)
POST /auth/admin/reset-password // ADMIN resetea contraseña de otro usuario
```

### Paso 2: Frontend - Páginas
```typescript
// Páginas necesarias:
/admin/forgot-password          // Solicitar reset
/admin/reset-password           // Resetear con token
/admin/perfil                   // Perfil con opción de cambiar contraseña
```

### Paso 3: Integración
- Agregar link "¿Olvidaste tu contraseña?" en login
- Agregar "Cambiar Contraseña" en menú de usuario
- Enviar emails de notificación

---

## ✅ Checklist de Implementación

### Backend
- [ ] Crear DTOs: `ForgotPasswordDto`, `ResetPasswordDto`, `ChangePasswordDto`
- [ ] Implementar `forgotPassword()` en `AuthService`
- [ ] Implementar `resetPassword()` en `AuthService`
- [ ] Implementar `changePassword()` en `AuthService`
- [ ] Agregar endpoints en `AuthController`
- [ ] Agregar validación de contraseñas fuertes
- [ ] Implementar rate limiting
- [ ] Enviar emails de notificación

### Frontend
- [ ] Crear página `/admin/forgot-password`
- [ ] Crear página `/admin/reset-password`
- [ ] Crear componente de cambio de contraseña
- [ ] Agregar link en página de login
- [ ] Agregar opción en menú de usuario
- [ ] Agregar validación de formularios
- [ ] Manejar errores y estados de carga

### Testing
- [ ] Probar flujo completo de forgot password
- [ ] Probar cambio de contraseña desde perfil
- [ ] Probar validaciones de contraseña
- [ ] Probar rate limiting
- [ ] Probar expiración de tokens

---

## 📚 Referencias

- [OWASP Password Guidelines](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [NestJS Security Best Practices](https://docs.nestjs.com/security/authentication)
- [Email Security Best Practices](https://www.owasp.org/index.php/Email_Verification_Cheat_Sheet)

---

**Última actualización**: Diciembre 2025
**Versión**: 1.0.0



