# 🔐 Cómo Funciona 2FA - Explicación Completa

## 📋 Resumen

`twoFactorEnabled: false` es el **estado por defecto** que indica que un usuario **NO tiene** autenticación de dos factores habilitada.

---

## 🎯 Estados de 2FA

### Estado 1: `twoFactorEnabled: false` (Por Defecto)

**¿Cuándo se usa?**

- ✅ **Todos los usuarios nuevos** tienen este valor
- ✅ **Usuarios existentes** que no han habilitado 2FA
- ✅ **Después de deshabilitar** 2FA

**¿Qué significa?**

- El usuario puede hacer login **solo con email y contraseña**
- **NO se solicita** código 2FA
- El login funciona normalmente

**Flujo de Login:**

```
1. Usuario ingresa email y contraseña
2. Sistema verifica: twoFactorEnabled = false
3. ✅ Login exitoso (sin pedir código 2FA)
```

---

### Estado 2: `twoFactorEnabled: true` (Habilitado)

**¿Cuándo se usa?**

- ✅ **Después de que el usuario habilita 2FA** desde el panel de seguridad
- ✅ El usuario escaneó el QR code y verificó el código

**¿Qué significa?**

- El usuario **DEBE ingresar código 2FA** además de email/password
- El código cambia cada 30 segundos
- Mayor seguridad

**Flujo de Login:**

```
1. Usuario ingresa email y contraseña
2. Sistema verifica: twoFactorEnabled = true
3. ⚠️ Sistema solicita código 2FA
4. Usuario ingresa código de 6 dígitos de su app
5. Sistema verifica código
6. ✅ Login exitoso (si código es válido)
```

---

## 🔄 Flujo Completo de 2FA

### Paso 1: Estado Inicial (Sin 2FA)

```typescript
// En la base de datos (cuando agregues los campos):
{
  twoFactorEnabled: false,  // ← Por defecto
  twoFactorSecret: null    // ← No hay secreto aún
}

// En el código:
const user = await prisma.user.findUnique(...)
// Si los campos no existen, se asignan valores por defecto:
user.twoFactorEnabled = false  // ← Se asigna automáticamente
user.twoFactorSecret = null
```

**Resultado:** Login funciona normalmente, sin código 2FA.

---

### Paso 2: Usuario Quiere Habilitar 2FA

1. **Usuario va a `/admin/configuracion/seguridad`**
2. **Hace clic en "Generar Código QR"**
   - Se genera un secreto temporal
   - Se muestra QR code
3. **Escanea QR con Google Authenticator**
4. **Ingresa código de 6 dígitos**
5. **Hace clic en "Habilitar 2FA"**

**Lo que pasa en el backend:**

```typescript
// Se guarda en la base de datos:
{
  twoFactorEnabled: true,   // ← Cambia a true
  twoFactorSecret: "JBSWY3DPEHPK3PXP..."  // ← Se guarda el secreto
}
```

---

### Paso 3: Próximo Login (Con 2FA Habilitado)

**Flujo:**

```
1. Usuario ingresa email: admin@ejemplo.com
2. Usuario ingresa contraseña: ********
3. Sistema verifica credenciales ✅
4. Sistema verifica: twoFactorEnabled = true
5. ⚠️ Sistema NO genera token aún
6. Sistema retorna error: "Código de autenticación de dos factores requerido"
7. Frontend muestra campo para código 2FA
8. Usuario abre Google Authenticator
9. Usuario ingresa código: 123456
10. Sistema verifica código con twoFactorSecret
11. ✅ Si código es válido → Genera token JWT
12. ✅ Login exitoso
```

**Código relevante:**

```typescript
// En auth.service.ts línea 113-114
const twoFactorEnabled = (user as any).twoFactorEnabled ?? false

if (twoFactorEnabled) {
  // ⚠️ Se requiere código 2FA
  if (!dto.twoFactorCode) {
    throw new BadRequestException({
      message: 'Código de autenticación de dos factores requerido',
      requiresTwoFactor: true,
    })
  }
  // Verificar código...
}
```

---

## 📊 Tabla de Estados

| Estado      | `twoFactorEnabled` | `twoFactorSecret` | Login Requiere                    |
| ----------- | ------------------ | ----------------- | --------------------------------- |
| **Sin 2FA** | `false`            | `null`            | Solo email/password               |
| **Con 2FA** | `true`             | `"JBSWY3..."`     | Email/password + código 6 dígitos |

---

## 🔍 Dónde se Usa `twoFactorEnabled`

### 1. **En el Login** (`auth.service.ts`)

```typescript
// Línea 113-114
const twoFactorEnabled = (user as any).twoFactorEnabled ?? false

if (twoFactorEnabled) {
  // Solicitar código 2FA
} else {
  // Login normal, sin código 2FA
}
```

**Propósito:** Decidir si solicitar código 2FA o no.

---

### 2. **En el Panel de Seguridad** (`/admin/configuracion/seguridad`)

```typescript
// useTwoFactorStatus hook
const { data: status } = useTwoFactorStatus()
const isEnabled = status?.enabled ?? false

// Muestra diferentes opciones según el estado:
if (isEnabled) {
  // Mostrar opción para deshabilitar
} else {
  // Mostrar opción para habilitar
}
```

**Propósito:** Mostrar la interfaz correcta (habilitar o deshabilitar).

---

### 3. **En la Respuesta del Login**

```typescript
// Línea 165
return {
  access_token: token,
  user: {
    id: user.id,
    email: user.email,
    // ...
    twoFactorEnabled: twoFactorEnabled, // ← Se incluye en la respuesta
  },
}
```

**Propósito:** El frontend puede saber si el usuario tiene 2FA habilitado.

---

## 🎬 Ejemplo Práctico

### Escenario: Usuario Nuevo

1. **Usuario se registra:**

   ```sql
   INSERT INTO users (email, password, ...) VALUES (...)
   -- twoFactorEnabled = false (por defecto)
   -- twoFactorSecret = NULL
   ```

2. **Usuario hace login:**
   - ✅ Ingresa email/password
   - ✅ Login exitoso (sin código 2FA)
   - `twoFactorEnabled: false` en la respuesta

3. **Usuario habilita 2FA:**
   - Va a panel de seguridad
   - Escanea QR
   - Verifica código
   - `twoFactorEnabled` cambia a `true`

4. **Próximo login:**
   - ✅ Ingresa email/password
   - ⚠️ Sistema solicita código 2FA
   - ✅ Ingresa código
   - ✅ Login exitoso

---

## 🔧 Cómo Cambiar el Estado

### Habilitar 2FA

```typescript
// En two-factor.service.ts
await this.twoFactorService.enableTwoFactor(userId, secret)

// Actualiza en BD:
// twoFactorEnabled = true
// twoFactorSecret = "JBSWY3..."
```

### Deshabilitar 2FA

```typescript
// En two-factor.service.ts
await this.twoFactorService.disableTwoFactor(userId)

// Actualiza en BD:
// twoFactorEnabled = false
// twoFactorSecret = NULL
```

---

## ⚠️ Estado Actual de tu Proyecto

**Situación:**

- ✅ Código implementado y funcionando
- ⚠️ Campos 2FA **comentados** en el schema (para evitar errores)
- ⚠️ Campos **NO existen** en la base de datos aún

**Comportamiento Actual:**

- `twoFactorEnabled` siempre es `false` (valor por defecto en código)
- Login funciona normalmente
- 2FA **no está disponible** hasta que agregues los campos a la BD

---

## 🚀 Para Activar 2FA Completamente

### Paso 1: Agregar Campos a la Base de Datos

```sql
ALTER TABLE users
ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE users
ADD COLUMN IF NOT EXISTS two_factor_secret TEXT;
```

### Paso 2: Descomentar Campos en Schema

```prisma
// En prisma/schema.prisma
twoFactorEnabled  Boolean  @default(false) @map("two_factor_enabled")
twoFactorSecret   String?  @map("two_factor_secret")
```

### Paso 3: Regenerar Prisma Client

```bash
npx prisma generate
```

### Paso 4: Reiniciar Backend

```bash
npm run start:dev
```

---

## 📝 Resumen

| Pregunta                                      | Respuesta                                           |
| --------------------------------------------- | --------------------------------------------------- |
| **¿Cuándo se usa `twoFactorEnabled: false`?** | Por defecto, cuando el usuario no ha habilitado 2FA |
| **¿Qué pasa si es `false`?**                  | Login funciona solo con email/password              |
| **¿Qué pasa si es `true`?**                   | Login requiere código 2FA adicional                 |
| **¿Dónde se guarda?**                         | En la base de datos, columna `two_factor_enabled`   |
| **¿Cómo cambia?**                             | Desde el panel `/admin/configuracion/seguridad`     |

---

**¿Tienes más preguntas sobre cómo funciona 2FA?** Puedo explicarte cualquier parte específica.























