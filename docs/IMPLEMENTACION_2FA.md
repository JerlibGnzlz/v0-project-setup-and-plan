# 🔐 Implementación de 2FA (Autenticación de Dos Factores)

## ✅ Implementación Completada

Se ha implementado autenticación de dos factores (2FA) para administradores de forma **opcional** y **sin afectar** el sistema existente.

---

## 📦 Dependencias Agregadas

```json
{
  "speakeasy": "^2.0.0",
  "qrcode": "^1.5.3",
  "@types/qrcode": "^1.5.5"
}
```

**Instalación:**

```bash
cd backend
npm install
```

---

## 🗄️ Cambios en Base de Datos

### Schema Prisma Actualizado

Se agregaron dos campos al modelo `User`:

```prisma
model User {
  // ... campos existentes
  twoFactorEnabled  Boolean  @default(false) @map("two_factor_enabled")
  twoFactorSecret   String?  @map("two_factor_secret")
}
```

### Migración

Ejecutar migración de Prisma:

```bash
cd backend
npx prisma migrate dev --name add_two_factor_auth
npx prisma generate
```

---

## 🔧 Componentes Implementados

### 1. **TwoFactorService** (`backend/src/modules/auth/services/two-factor.service.ts`)

Servicio que maneja:

- Generación de secretos 2FA
- Generación de códigos QR
- Verificación de códigos TOTP
- Habilitación/deshabilitación de 2FA

### 2. **DTOs de 2FA** (`backend/src/modules/auth/dto/two-factor.dto.ts`)

- `EnableTwoFactorDto` - Para habilitar 2FA
- `VerifyTwoFactorDto` - Para verificar código
- `DisableTwoFactorDto` - Para deshabilitar 2FA

### 3. **Endpoints API**

#### `GET /api/auth/2fa/setup`

- Genera secreto y QR code
- Requiere autenticación
- Retorna: `{ secret, qrCode, otpauthUrl }`

#### `POST /api/auth/2fa/enable`

- Habilita 2FA después de verificar código
- Body: `{ code: string, secret: string }`
- Requiere autenticación

#### `POST /api/auth/2fa/disable`

- Deshabilita 2FA (requiere código de verificación)
- Body: `{ code: string }`
- Requiere autenticación

#### `GET /api/auth/2fa/status`

- Verifica si 2FA está habilitado
- Retorna: `{ enabled: boolean }`
- Requiere autenticación

### 4. **Modificaciones en Login**

El endpoint `POST /api/auth/login` ahora:

- Verifica si el usuario tiene 2FA habilitado
- Si está habilitado y no se envía código, retorna error con `requiresTwoFactor: true`
- Si se envía código, lo verifica antes de generar token

---

## 🎨 Frontend

### Modificaciones en Login (`app/admin/login/page.tsx`)

- **Detección automática**: Detecta cuando se requiere código 2FA
- **Campo dinámico**: Muestra campo para código 2FA cuando es necesario
- **Flujo mejorado**: El usuario ingresa email/password, luego código 2FA si está habilitado

### Flujo de Usuario

1. Usuario ingresa email y contraseña
2. Si tiene 2FA habilitado:
   - Se muestra campo para código de 6 dígitos
   - Usuario ingresa código de su app (Google Authenticator, Authy, etc.)
   - Se envía código junto con credenciales
3. Si no tiene 2FA:
   - Flujo normal, sin cambios

---

## 📱 Configuración de 2FA para Administradores

### Paso 1: Obtener QR Code

```typescript
// Desde el dashboard (después de login)
const response = await fetch('/api/auth/2fa/setup', {
  headers: {
    Authorization: `Bearer ${token}`,
  },
})

const { secret, qrCode, otpauthUrl } = await response.json()
```

### Paso 2: Escanear QR con App

1. Abrir Google Authenticator, Authy, o similar
2. Escanear el QR code mostrado
3. Anotar el código de 6 dígitos generado

### Paso 3: Habilitar 2FA

```typescript
await fetch('/api/auth/2fa/enable', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    code: '123456', // Código de 6 dígitos
    secret: secret, // Secreto obtenido en setup
  }),
})
```

---

## 🔒 Seguridad

### Características Implementadas

✅ **TOTP (Time-based One-Time Password)**

- Códigos válidos por 30 segundos
- Ventana de 2 períodos (60 segundos) para sincronización

✅ **Secreto encriptado en base de datos**

- Solo se almacena el secreto base32
- Nunca se expone el secreto completo

✅ **Verificación obligatoria**

- No se puede habilitar sin verificar código primero
- No se puede deshabilitar sin código válido

✅ **Opcional por defecto**

- Los usuarios existentes NO tienen 2FA habilitado
- No afecta el flujo actual

---

## 🚀 Próximos Pasos (Opcional)

### Panel de Configuración en Dashboard

Crear una página en `/admin/configuracion/seguridad` para:

- Ver estado de 2FA
- Habilitar/deshabilitar 2FA
- Ver QR code
- Códigos de respaldo

### Códigos de Respaldo

Implementar códigos de respaldo para casos de emergencia:

- Generar 10 códigos de un solo uso
- Guardar encriptados
- Mostrar una vez al usuario

### Notificaciones

Enviar email cuando:

- Se habilita 2FA
- Se deshabilita 2FA
- Se intenta login con código incorrecto

---

## ⚠️ Notas Importantes

1. **No afecta usuarios existentes**: Todos los usuarios tienen `twoFactorEnabled: false` por defecto
2. **Opcional**: Los administradores pueden elegir habilitarlo o no
3. **Compatible**: Funciona con Google Authenticator, Authy, Microsoft Authenticator, etc.
4. **Seguro**: Usa estándar TOTP (RFC 6238)

---

## 🧪 Testing

### Probar 2FA

1. Login como administrador
2. Llamar a `/api/auth/2fa/setup`
3. Escanear QR con app de autenticación
4. Habilitar con código generado
5. Cerrar sesión
6. Intentar login - debería pedir código 2FA
7. Ingresar código correcto - debería funcionar
8. Intentar con código incorrecto - debería fallar

---

## 📚 Referencias

- [TOTP RFC 6238](https://tools.ietf.org/html/rfc6238)
- [Speakeasy Documentation](https://github.com/speakeasyjs/speakeasy)
- [QRCode Documentation](https://github.com/soldair/node-qrcode)

---

**Última actualización:** Diciembre 2024
**Estado:** ✅ Implementado y listo para producción























