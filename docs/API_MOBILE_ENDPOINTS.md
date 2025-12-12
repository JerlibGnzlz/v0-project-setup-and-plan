# 📡 Endpoints API para Mobile

## 🔐 Autenticación

### POST `/api/auth/login/mobile`

Login específico para mobile que retorna access token y refresh token.

**Request:**

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "nombre": "Usuario",
    "avatar": "https://...",
    "rol": "ADMIN"
  }
}
```

### POST `/api/auth/refresh`

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

### POST `/api/auth/device/register`

Registrar dispositivo para notificaciones push (requiere autenticación).

**Headers:**

```
Authorization: Bearer {access_token}
```

**Request:**

```json
{
  "deviceToken": "ExponentPushToken[...]",
  "deviceType": "ios",
  "deviceId": "unique-device-id"
}
```

---

## 📝 Inscripciones

### POST `/api/inscripciones`

Crear nueva inscripción. **Importante:** Establecer `origenRegistro: 'mobile'`.

**Request:**

```json
{
  "convencionId": "uuid",
  "nombre": "Juan",
  "apellido": "Pérez",
  "email": "juan@example.com",
  "telefono": "+54 11 1234-5678",
  "sede": "Capital",
  "numeroCuotas": 3,
  "origenRegistro": "mobile",
  "notas": "Notas opcionales"
}
```

**Response:**

```json
{
  "id": "uuid",
  "convencionId": "uuid",
  "nombre": "Juan",
  "apellido": "Pérez",
  "email": "juan@example.com",
  "telefono": "+54 11 1234-5678",
  "sede": "Capital",
  "numeroCuotas": 3,
  "estado": "pendiente",
  "origenRegistro": "mobile",
  "fechaInscripcion": "2025-01-15T10:30:00Z"
}
```

---

## 📰 Noticias

### GET `/api/noticias/publicadas`

Obtener todas las noticias publicadas.

**Response:**

```json
[
  {
    "id": "uuid",
    "titulo": "Título de la noticia",
    "extracto": "Extracto...",
    "contenido": "Contenido completo...",
    "categoria": "ANUNCIO",
    "imagenUrl": "https://...",
    "fechaPublicacion": "2025-01-15T10:30:00Z",
    "vistas": 150,
    "autor": "Autor",
    "slug": "titulo-de-la-noticia"
  }
]
```

### GET `/api/noticias/slug/:slug`

Obtener noticia por slug.

### POST `/api/noticias/:slug/incrementar-vista`

Incrementar contador de vistas (no requiere autenticación).

---

## 🎯 Convenciones

### GET `/api/convenciones`

Obtener todas las convenciones.

**Query Params:**

- `includeArchived`: boolean (opcional)

**Response:**

```json
[
  {
    "id": "uuid",
    "titulo": "Convención 2025",
    "descripcion": "Descripción...",
    "fechaInicio": "2025-06-01T00:00:00Z",
    "fechaFin": "2025-06-05T00:00:00Z",
    "ubicacion": "Buenos Aires",
    "costo": 50000,
    "activa": true,
    "archivada": false
  }
]
```

### GET `/api/convenciones/:id`

Obtener convención por ID.

---

## 👥 Pastores

### GET `/api/pastores/active`

Obtener todos los pastores activos.

**Response:**

```json
[
  {
    "id": "uuid",
    "nombre": "Juan",
    "apellido": "Pérez",
    "cargo": "Pastor",
    "tipo": "PASTOR",
    "fotoUrl": "https://...",
    "sede": "Capital",
    "region": "Buenos Aires",
    "pais": "Argentina"
  }
]
```

---

## 💰 Pagos

### POST `/api/pagos`

Crear nuevo pago (requiere autenticación).

**Request:**

```json
{
  "inscripcionId": "uuid",
  "monto": "16666.67",
  "metodoPago": "transferencia",
  "numeroCuota": 1,
  "referencia": "TRF-123456",
  "comprobanteUrl": "https://...",
  "notas": "Notas opcionales"
}
```

---

## 🔔 Notificaciones (Futuro)

### POST `/api/notifications/send`

Enviar notificación push (solo admin).

### GET `/api/notifications/history`

Obtener historial de notificaciones.

---

## ⚠️ Errores Comunes

### 401 Unauthorized

- Token expirado: usar `/auth/refresh`
- Token inválido: hacer login nuevamente

### 403 Forbidden

- Usuario no tiene permisos para la acción

### 400 Bad Request

- Validación fallida: revisar campos requeridos
- Formato incorrecto: revisar tipos de datos

### 500 Internal Server Error

- Error del servidor: contactar soporte

---

## 📝 Notas Importantes

1. **Origen de Registro:** Siempre usar `origenRegistro: 'mobile'` en inscripciones desde la app
2. **Tokens:** Guardar access_token y refresh_token de forma segura (SecureStore)
3. **Refresh:** El access token expira en 15-30 min, usar refresh token para renovar
4. **CORS:** El backend ya está configurado para aceptar requests de mobile
5. **Rate Limiting:** Implementar retry con exponential backoff





