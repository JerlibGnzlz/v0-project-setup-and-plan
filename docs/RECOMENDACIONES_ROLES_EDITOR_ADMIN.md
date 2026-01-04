# Recomendaciones para Roles EDITOR y ADMINISTRADOR

## 📋 Resumen del Flujo Actual

El sistema maneja usuarios con credenciales por defecto de la siguiente manera:

### 1. **Creación de Usuarios con Credenciales por Defecto**

Cuando un administrador crea un nuevo usuario con credenciales por defecto:

- **Email**: Se genera automáticamente basado en el nombre (ej: `nombre@ministerio-amva.org`)
- **Contraseña**: `Cambiar123!` (temporal)
- **hasChangedPassword**: `false` (por defecto)
- **Rol**: Puede ser `ADMIN`, `EDITOR` o `VIEWER`

### 2. **Primer Login del Usuario**

Cuando el usuario inicia sesión por primera vez:

1. El sistema detecta que tiene email `@ministerio-amva.org` y `hasChangedPassword = false`
2. Redirige automáticamente a `/admin/setup-credentials`
3. El usuario debe cambiar su contraseña temporal por una personalizada
4. Después de cambiar la contraseña, `hasChangedPassword` se marca como `true`
5. Se hace logout y redirige al login
6. El usuario puede iniciar sesión con su nueva contraseña

### 3. **Redirección Después del Login**

Después de un login exitoso, el sistema redirige según:

- **Si tiene credenciales por defecto Y no ha cambiado contraseña**: → `/admin/setup-credentials`
- **Si es EDITOR**: → `/admin/noticias`
- **Si es ADMIN**: → `/admin` (dashboard)

## ✅ Mejoras Implementadas

### 1. **Campo `hasChangedPassword`**

- Se agregó el campo `hasChangedPassword` al modelo `User`
- Se marca como `true` cuando el usuario cambia su contraseña desde `setup-credentials`
- Se resetea a `false` cuando un admin resetea la contraseña del usuario

### 2. **Creación de Usuarios**

- Los usuarios nuevos con credenciales por defecto tienen `hasChangedPassword = false` automáticamente
- Esto asegura que sean redirigidos a `setup-credentials` en su primer login

### 3. **Reset de Contraseña por Admin**

- Cuando un admin resetea la contraseña de un usuario, `hasChangedPassword` se resetea a `false`
- Esto asegura que el usuario tenga que cambiar su contraseña nuevamente

### 4. **Mensajes Informativos**

- Se agregaron mensajes en `setup-credentials` que indican qué acceso tendrá cada rol después de configurar su contraseña

## 🎯 Recomendaciones para Uso Correcto

### Para Administradores que Crean Usuarios

1. **Usar Credenciales por Defecto**:
   - ✅ Marcar el checkbox "Usar credenciales por defecto" al crear usuarios nuevos
   - ✅ El sistema generará automáticamente el email y la contraseña temporal
   - ✅ El usuario recibirá estas credenciales y deberá cambiarlas en su primer login

2. **Comunicar Credenciales**:
   - ✅ Proporcionar al usuario su email generado (ej: `nombre@ministerio-amva.org`)
   - ✅ Proporcionar la contraseña temporal (`Cambiar123!`)
   - ✅ Informar que debe cambiar la contraseña en su primer login

3. **Reset de Contraseña**:
   - ✅ Si un usuario olvida su contraseña, usar "Resetear Contraseña" desde el panel admin
   - ✅ Esto establecerá la contraseña temporal nuevamente
   - ✅ El usuario será redirigido a `setup-credentials` para cambiar su contraseña

### Para Usuarios EDITOR

1. **Primer Login**:
   - ✅ Iniciar sesión con el email proporcionado por el admin
   - ✅ Usar la contraseña temporal `Cambiar123!`
   - ✅ Será redirigido automáticamente a configurar su contraseña

2. **Después de Configurar Contraseña**:
   - ✅ Será redirigido a `/admin/noticias` (su página principal)
   - ✅ Tendrá acceso solo a Noticias y Galería Multimedia
   - ✅ No podrá acceder al dashboard ni a otras secciones

### Para Usuarios ADMIN

1. **Primer Login**:
   - ✅ Iniciar sesión con el email proporcionado por el admin
   - ✅ Usar la contraseña temporal `Cambiar123!`
   - ✅ Será redirigido automáticamente a configurar su contraseña

2. **Después de Configurar Contraseña**:
   - ✅ Será redirigido a `/admin` (dashboard)
   - ✅ Tendrá acceso completo a todos los módulos
   - ✅ Podrá gestionar usuarios, noticias, galería, auditoría, etc.

## 🔍 Verificación del Flujo

### Checklist para Crear un Usuario Nuevo

- [ ] Crear usuario con checkbox "Usar credenciales por defecto" marcado
- [ ] Verificar que el email generado termine en `@ministerio-amva.org`
- [ ] Verificar que `hasChangedPassword = false` en la base de datos
- [ ] Proporcionar credenciales al usuario (email + `Cambiar123!`)
- [ ] El usuario puede iniciar sesión y es redirigido a `setup-credentials`
- [ ] El usuario cambia su contraseña exitosamente
- [ ] El usuario puede iniciar sesión con su nueva contraseña
- [ ] El usuario es redirigido según su rol (EDITOR → noticias, ADMIN → dashboard)

### Checklist para Resetear Contraseña

- [ ] Admin resetea la contraseña del usuario desde el panel
- [ ] Verificar que `hasChangedPassword = false` después del reset
- [ ] El usuario puede iniciar sesión con `Cambiar123!`
- [ ] El usuario es redirigido a `setup-credentials`
- [ ] El usuario cambia su contraseña exitosamente
- [ ] El usuario puede iniciar sesión con su nueva contraseña

## 🐛 Solución de Problemas

### Problema: Usuario no es redirigido a setup-credentials

**Causa**: El campo `hasChangedPassword` está en `true` cuando debería estar en `false`

**Solución**:
1. Verificar en la base de datos: `SELECT email, has_changed_password FROM users WHERE email = 'usuario@ministerio-amva.org'`
2. Si `has_changed_password = true`, actualizar: `UPDATE users SET has_changed_password = false WHERE email = 'usuario@ministerio-amva.org'`
3. El usuario será redirigido a `setup-credentials` en su próximo login

### Problema: Usuario queda atrapado en setup-credentials

**Causa**: El campo `hasChangedPassword` no se está actualizando correctamente

**Solución**:
1. Verificar que el método `changePassword` en `usuarios.service.ts` actualiza `hasChangedPassword = true`
2. Verificar los logs del backend para ver si hay errores
3. Si el problema persiste, verificar que la migración de `hasChangedPassword` se aplicó correctamente

### Problema: Usuario EDITOR es redirigido al dashboard en lugar de noticias

**Causa**: La lógica de redirección no está verificando el rol correctamente

**Solución**:
1. Verificar que el usuario tiene el rol `EDITOR` en la base de datos
2. Verificar que la lógica en `app/admin/login/page.tsx` y `app/admin/layout.tsx` está verificando el rol correctamente
3. Verificar que después de cambiar la contraseña, el usuario es redirigido según su rol

## 📝 Notas Importantes

1. **Email No Modificable**: Los usuarios con email `@ministerio-amva.org` NO pueden cambiar su email, solo su contraseña
2. **Contraseña Temporal**: La contraseña temporal `Cambiar123!` es segura pero debe ser cambiada inmediatamente
3. **Redirección Automática**: El sistema redirige automáticamente según el estado del usuario y su rol
4. **Logout Después de Cambiar Contraseña**: Después de cambiar la contraseña, se hace logout automáticamente para que el usuario inicie sesión con su nueva contraseña

## 🚀 Próximas Mejoras Sugeridas

1. **Email de Bienvenida**: Enviar un email automático cuando se crea un usuario con credenciales por defecto
2. **Recordatorio de Contraseña**: Enviar recordatorios si el usuario no ha cambiado su contraseña después de X días
3. **Historial de Cambios**: Registrar en auditoría cuando un usuario cambia su contraseña
4. **Política de Contraseñas**: Configurar políticas más estrictas según el rol (ej: ADMIN requiere contraseñas más complejas)

