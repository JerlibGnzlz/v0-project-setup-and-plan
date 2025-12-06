# ✅ Pasos para Activar 2FA - Guía Simple

## 🎯 Opción 1: Usando Prisma Migrate (Recomendado)

```bash
cd backend

# 1. Instalar dependencias (si no lo has hecho)
npm install

# 2. Regenerar cliente de Prisma (importante)
npx prisma generate

# 3. Aplicar cambios a la base de datos
# Si la migración falla, usa la Opción 2
npx prisma migrate dev --name add_two_factor_auth
```

---

## 🎯 Opción 2: SQL Directo (Si la migración falla)

Si tienes problemas con Prisma migrate, ejecuta el SQL directamente:

### Paso 1: Conectar a tu base de datos

Puedes usar:

- **Prisma Studio**: `npx prisma studio`
- **psql** (si tienes acceso directo)
- **Neon Console** (si usas Neon)
- **Cualquier cliente SQL** (DBeaver, pgAdmin, etc.)

### Paso 2: Ejecutar el script SQL

El archivo `backend/scripts/add-2fa-fields.sql` contiene el SQL necesario.

**O ejecuta directamente:**

```sql
-- Agregar campo two_factor_enabled
ALTER TABLE users
ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN NOT NULL DEFAULT false;

-- Agregar campo two_factor_secret
ALTER TABLE users
ADD COLUMN IF NOT EXISTS two_factor_secret TEXT;
```

### Paso 3: Regenerar Prisma Client

```bash
cd backend
npx prisma generate
```

---

## ✅ Verificar que Funciona

### 1. Reiniciar el Backend

```bash
cd backend
npm run start:dev
```

### 2. Probar Login Normal

1. Ir a `http://localhost:3000/admin/login`
2. Login con cualquier administrador
3. **Debería funcionar normalmente** (sin pedir código 2FA)

### 3. Habilitar 2FA (Usando API)

#### Paso A: Obtener Token de Autenticación

```bash
# Login y obtener token
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "tu_email@ejemplo.com",
    "password": "tu_password"
  }'
```

Copia el `access_token` de la respuesta.

#### Paso B: Obtener QR Code para Configurar

```bash
curl -X GET http://localhost:3001/api/auth/2fa/setup \
  -H "Authorization: Bearer TU_ACCESS_TOKEN_AQUI"
```

Esto retorna:

```json
{
  "secret": "JBSWY3DPEHPK3PXP...",
  "qrCode": "data:image/png;base64,iVBORw0KG...",
  "otpauthUrl": "otpauth://totp/..."
}
```

#### Paso C: Escanear QR Code

1. Abre **Google Authenticator** o **Authy** en tu teléfono
2. Agrega nueva cuenta
3. Escanea el QR code (o ingresa manualmente el secreto)
4. Anota el código de 6 dígitos que aparece

#### Paso D: Habilitar 2FA

```bash
curl -X POST http://localhost:3001/api/auth/2fa/enable \
  -H "Authorization: Bearer TU_ACCESS_TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "123456",
    "secret": "JBSWY3DPEHPK3PXP..."
  }'
```

Reemplaza:

- `TU_ACCESS_TOKEN_AQUI` con el token del Paso A
- `123456` con el código de 6 dígitos de tu app
- `JBSWY3DPEHPK3PXP...` con el secreto del Paso B

#### Paso E: Probar Login con 2FA

1. Cierra sesión
2. Ve a `/admin/login`
3. Ingresa email y contraseña
4. **Ahora debería aparecer un campo para código 2FA**
5. Abre tu app de autenticación
6. Ingresa el código de 6 dígitos
7. ¡Debería hacer login exitosamente! ✅

---

## 🎨 Opción 3: Crear Panel de Configuración (Recomendado)

Puedo crear una página en el dashboard (`/admin/configuracion/seguridad`) para:

- ✅ Ver si 2FA está habilitado
- ✅ Mostrar QR code visualmente
- ✅ Habilitar/deshabilitar 2FA con un clic
- ✅ Ver estado de seguridad

**¿Quieres que la cree?** Sería mucho más fácil que usar la API directamente.

---

## 🔧 Solución de Problemas

### Error: "twoFactorEnabled is not defined"

```bash
cd backend
npx prisma generate
# Reiniciar backend
```

### Error: "Cannot find module 'speakeasy'"

```bash
cd backend
npm install speakeasy qrcode @types/qrcode
```

### El código 2FA no funciona

1. Verifica que el código no haya expirado (válido 30 segundos)
2. Intenta con el código siguiente (hay ventana de 60 segundos)
3. Verifica que el reloj del servidor esté sincronizado

### La migración falla

Usa la **Opción 2** (SQL directo) - es más simple y funciona igual.

---

## 📱 Apps para 2FA

- **Google Authenticator** (iOS/Android) - Gratis
- **Authy** (iOS/Android/Desktop) - Gratis, con respaldo
- **Microsoft Authenticator** (iOS/Android) - Gratis

---

## ✅ Checklist Final

- [ ] Dependencias instaladas (`npm install`)
- [ ] Campos agregados a base de datos (migración o SQL)
- [ ] Prisma Client regenerado (`npx prisma generate`)
- [ ] Backend reiniciado
- [ ] Login normal funciona
- [ ] 2FA configurado para un admin
- [ ] Login con 2FA funciona

---

**¿Necesitas ayuda con algún paso?** Solo dime cuál y te ayudo.

