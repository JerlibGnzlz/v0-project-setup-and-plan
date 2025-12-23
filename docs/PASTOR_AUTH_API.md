# 🔐 API de Autenticación para Pastores

## Endpoints Disponibles

### 1. POST `/api/auth/pastor/register`

Registrar un nuevo pastor en el sistema. **IMPORTANTE:** El email debe existir previamente en la tabla `Pastores`.

**Request:**

```json
{
  "email": "pastor@example.com",
  "password": "Password123",
  "nombre": "Juan", // Opcional
  "apellido": "Pérez" // Opcional
}
```

**Validaciones:**

- Email debe ser válido
- Password mínimo 8 caracteres
- Password debe contener: mayúscula, minúscula y número
- **Email DEBE existir en la tabla Pastores**
- Pastor debe estar activo

**Response (Éxito):**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "pastor": {
    "id": "uuid",
    "nombre": "Juan",
    "apellido": "Pérez",
    "email": "pastor@example.com",
    "tipo": "PASTOR",
    "cargo": "Pastor Principal",
    "ministerio": "Ministerio de Jóvenes",
    "sede": "Capital",
    "region": "Buenos Aires",
    "pais": "Argentina",
    "fotoUrl": "https://..."
  }
}
```

**Errores:**

- `400`: Email no existe en Pastores
- `400`: Pastor inactivo
- `400`: Ya existe una cuenta con este email
- `400`: Validación de campos fallida

---

### 2. POST `/api/auth/pastor/login`

Iniciar sesión como pastor.

**Request:**

```json
{
  "email": "pastor@example.com",
  "password": "Password123"
}
```

**Response (Éxito):**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "pastor": {
    "id": "uuid",
    "nombre": "Juan",
    "apellido": "Pérez",
    "email": "pastor@example.com",
    "tipo": "PASTOR",
    "cargo": "Pastor Principal",
    "ministerio": "Ministerio de Jóvenes",
    "sede": "Capital",
    "region": "Buenos Aires",
    "pais": "Argentina",
    "fotoUrl": "https://..."
  }
}
```

**Errores:**

- `401`: Credenciales inválidas
- `401`: Pastor inactivo

---

### 3. POST `/api/auth/pastor/refresh`

Refrescar access token usando refresh token.

**Request:**

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**

```json
{
  "access_token": "nuevo_token...",
  "refresh_token": "nuevo_refresh_token..."
}
```

**Errores:**

- `401`: Refresh token inválido o expirado
- `401`: Pastor no encontrado o inactivo

---

### 4. GET `/api/auth/pastor/me`

Obtener perfil del pastor autenticado (requiere autenticación).

**Headers:**

```
Authorization: Bearer {access_token}
```

**Response:**

```json
{
  "id": "uuid",
  "nombre": "Juan",
  "apellido": "Pérez",
  "email": "pastor@example.com",
  "tipo": "PASTOR",
  "cargo": "Pastor Principal",
  "ministerio": "Ministerio de Jóvenes",
  "sede": "Capital",
  "region": "Buenos Aires",
  "pais": "Argentina",
  "fotoUrl": "https://..."
}
```

**Errores:**

- `401`: No autenticado
- `401`: Token inválido o expirado

---

### 5. POST `/api/auth/pastor/forgot-password`

Solicitar recuperación de contraseña (en desarrollo).

**Request:**

```json
{
  "email": "pastor@example.com"
}
```

**Response:**

```json
{
  "message": "Si el email existe, recibirás instrucciones para recuperar tu contraseña."
}
```

---

### 6. POST `/api/auth/pastor/reset-password`

Resetear contraseña con token (en desarrollo).

**Request:**

```json
{
  "token": "reset_token",
  "newPassword": "NewPassword123"
}
```

---

## 🔒 Seguridad

### Tokens:

- **Access Token:** Expira en 15 minutos
- **Refresh Token:** Expira en 30 días
- Tokens incluyen: `sub` (pastor ID), `email`, `role`, `type`

### Validaciones:

1. Email debe existir en tabla `Pastores`
2. Pastor debe estar activo (`activo: true`)
3. Password mínimo 8 caracteres con mayúscula, minúscula y número
4. Rate limiting recomendado (máximo 5 intentos por minuto)

---

## 📱 Uso en App Móvil

### Ejemplo de Login:

```typescript
import axios from 'axios'

const login = async (email: string, password: string) => {
  const response = await axios.post('https://api.vidaabundante.org/api/auth/pastor/login', {
    email,
    password,
  })

  const { access_token, refresh_token, pastor } = response.data

  // Guardar tokens de forma segura
  await SecureStore.setItemAsync('access_token', access_token)
  await SecureStore.setItemAsync('refresh_token', refresh_token)

  return pastor
}
```

### Ejemplo de Refresh Token:

```typescript
const refreshToken = async () => {
  const refreshToken = await SecureStore.getItemAsync('refresh_token')

  const response = await axios.post('https://api.vidaabundante.org/api/auth/pastor/refresh', {
    refreshToken,
  })

  const { access_token, refresh_token: newRefreshToken } = response.data

  await SecureStore.setItemAsync('access_token', access_token)
  await SecureStore.setItemAsync('refresh_token', newRefreshToken)
}
```

---

## ⚠️ Notas Importantes

1. **El email DEBE existir en Pastores antes de registrar**
2. **Solo pastores activos pueden autenticarse**
3. **Los tokens son específicos para pastores (no se mezclan con admin)**
4. **Refresh tokens deben guardarse de forma segura**

---

## 🚀 Próximos Pasos

- [ ] Implementar recuperación de contraseña con email
- [ ] Agregar verificación de email
- [ ] Implementar Google OAuth (opcional)
- [ ] Agregar rate limiting
- [ ] Agregar logging de intentos de login



















