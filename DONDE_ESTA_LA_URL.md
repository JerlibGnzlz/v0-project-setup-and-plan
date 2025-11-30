# 🔍 Dónde está la URL del Login en el Código

## URL Completa: `http://localhost:4000/api/auth/login`

### 📍 FRONTEND (Next.js)

#### 1. Base URL del Cliente API
**Archivo:** `lib/api/client.ts`
**Línea 3:**
```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api"
```

Esta variable se lee de:
- `.env.local`: `NEXT_PUBLIC_API_URL=http://localhost:4000/api`
- O usa el valor por defecto si no existe

**Línea 5-6:**
```typescript
export const apiClient = axios.create({
  baseURL: API_URL,  // "http://localhost:4000/api"
})
```

#### 2. Endpoint de Login
**Archivo:** `lib/api/auth.ts`
**Línea 23:**
```typescript
const response = await apiClient.post<LoginResponse>("/auth/login", data)
```

**Cómo se construye:**
- `apiClient.baseURL` = `"http://localhost:4000/api"`
- `+ "/auth/login"`
- `= "http://localhost:4000/api/auth/login"`

---

### 📍 BACKEND (NestJS)

#### 1. Prefijo Global
**Archivo:** `backend/src/main.ts`
**Línea 34:**
```typescript
app.setGlobalPrefix("api")
```

Esto agrega `/api` a todas las rutas del backend.

#### 2. Controlador de Auth
**Archivo:** `backend/src/modules/auth/auth.controller.ts`
**Línea 6:**
```typescript
@Controller("auth")
```

Esto crea la ruta base `/auth`.

#### 3. Método Login
**Archivo:** `backend/src/modules/auth/auth.controller.ts`
**Línea 15-17:**
```typescript
@Post("login")
async login(@Body() dto: LoginDto) {
  return this.authService.login(dto)
}
```

Esto crea el endpoint `/login`.

**Cómo se construye en el backend:**
- Prefijo global: `/api`
- Controller: `/auth`
- Método: `/login`
- **Resultado:** `/api/auth/login`

---

## 🔄 Flujo Completo

1. **Frontend** (`lib/api/auth.ts`):
   - Llama a `authApi.login()`
   - Usa `apiClient.post("/auth/login", data)`

2. **Cliente Axios** (`lib/api/client.ts`):
   - Toma `baseURL` = `"http://localhost:4000/api"` (de `.env.local`)
   - Concatena con `"/auth/login"`
   - Hace petición a: `http://localhost:4000/api/auth/login`

3. **Backend** (`backend/src/main.ts` + `auth.controller.ts`):
   - Recibe petición en `/api/auth/login`
   - El prefijo global `/api` + controller `/auth` + método `/login`
   - Ejecuta `AuthService.login()`

---

## 📝 Para Cambiar la URL

### Cambiar el puerto o dominio:
Edita `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
# O en producción:
NEXT_PUBLIC_API_URL=https://tu-backend.com/api
```

### Cambiar el endpoint:
Edita `lib/api/auth.ts` línea 23:
```typescript
// Cambiar de:
const response = await apiClient.post<LoginResponse>("/auth/login", data)

// A:
const response = await apiClient.post<LoginResponse>("/auth/otro-endpoint", data)
```

### Cambiar el prefijo del backend:
Edita `backend/src/main.ts` línea 34:
```typescript
// Cambiar de:
app.setGlobalPrefix("api")

// A:
app.setGlobalPrefix("v1")  // Ahora sería /v1/auth/login
```

