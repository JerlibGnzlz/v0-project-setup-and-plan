# 🚀 Guía Rápida: Activar 2FA en tu Proyecto

## 📋 Pasos para Activar 2FA

### Paso 1: Instalar Dependencias

Las dependencias ya están agregadas al `package.json`. Ejecuta:

```bash
cd backend
npm install
```

Si npm tiene problemas, puedes intentar:

```bash
npm install --legacy-peer-deps
```

O usar yarn:

```bash
yarn install
```

### Paso 2: Ejecutar Migración de Base de Datos

```bash
cd backend
npx prisma migrate dev --name add_two_factor_auth
```

Esto creará una nueva migración que agrega los campos:

- `two_factor_enabled` (Boolean, default: false)
- `two_factor_secret` (String, nullable)

### Paso 3: Regenerar Cliente de Prisma

```bash
npx prisma generate
```

### Paso 4: Reiniciar el Backend

```bash
# Si está corriendo, detenerlo (Ctrl+C) y reiniciar
npm run start:dev
```

---

## ✅ Verificar que Funciona

### 1. Probar Login Normal (Sin 2FA)

1. Ir a `/admin/login`
2. Ingresar email y contraseña de un administrador
3. Debería funcionar normalmente (sin pedir código 2FA)

### 2. Habilitar 2FA para un Administrador

#### Opción A: Usando API directamente

```bash
# 1. Login y obtener token
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@ejemplo.com","password":"tu_password"}'

# Guarda el access_token de la respuesta

# 2. Obtener QR code para configurar 2FA
curl -X GET http://localhost:3001/api/auth/2fa/setup \
  -H "Authorization: Bearer TU_ACCESS_TOKEN"

# Esto retorna:
# {
#   "secret": "JBSWY3DPEHPK3PXP",
#   "qrCode": "data:image/png;base64,...",
#   "otpauthUrl": "otpauth://totp/..."
# }

# 3. Escanear el QR code con Google Authenticator o Authy
# 4. Anotar el código de 6 dígitos que genera la app

# 5. Habilitar 2FA con el código
curl -X POST http://localhost:3001/api/auth/2fa/enable \
  -H "Authorization: Bearer TU_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "123456",
    "secret": "JBSWY3DPEHPK3PXP"
  }'
```

#### Opción B: Crear página de configuración (Recomendado)

Puedo crear una página en `/admin/configuracion/seguridad` para:

- Ver si 2FA está habilitado
- Mostrar QR code
- Habilitar/deshabilitar 2FA

¿Quieres que la cree?

### 3. Probar Login con 2FA

1. Cerrar sesión
2. Ir a `/admin/login`
3. Ingresar email y contraseña
4. **Ahora debería aparecer un campo para código 2FA**
5. Abrir Google Authenticator (o tu app)
6. Ingresar el código de 6 dígitos
7. Debería hacer login exitosamente

---

## 🔧 Solución de Problemas

### Error: "Cannot find module 'speakeasy'"

```bash
cd backend
rm -rf node_modules package-lock.json
npm install
```

### Error: "Migration failed"

```bash
# Verificar que la base de datos esté corriendo
# Verificar variables de entorno en .env
# Intentar migración manual:
npx prisma migrate reset  # ⚠️ CUIDADO: Esto borra datos
npx prisma migrate dev
```

### Error: "twoFactorEnabled is not defined"

```bash
# Regenerar cliente de Prisma
npx prisma generate
# Reiniciar backend
```

### El código 2FA no funciona

1. Verificar que el reloj del servidor esté sincronizado
2. Verificar que el código no haya expirado (válido por 30 segundos)
3. Intentar con el código siguiente (hay ventana de 2 períodos = 60 segundos)

---

## 📱 Apps Recomendadas para 2FA

- **Google Authenticator** (iOS/Android)
- **Authy** (iOS/Android/Desktop)
- **Microsoft Authenticator** (iOS/Android)
- **1Password** (si usas password manager)

---

## 🎯 Próximos Pasos Opcionales

1. **Panel de Configuración**: Crear página en dashboard para gestionar 2FA
2. **Códigos de Respaldo**: Generar códigos de emergencia
3. **Notificaciones**: Email cuando se habilita/deshabilita 2FA
4. **Logs de Seguridad**: Registrar todos los intentos de login con 2FA

¿Quieres que implemente alguno de estos?

