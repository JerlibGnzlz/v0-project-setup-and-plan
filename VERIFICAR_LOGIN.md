# 🔍 GUÍA PARA VERIFICAR Y ARREGLAR EL LOGIN ADMIN

## ✅ PASO 1: Verificar que el backend esté corriendo

```bash
cd backend
pnpm start:dev
```

El backend debe estar corriendo en: `http://localhost:4000`

## ✅ PASO 2: Verificar que existe un usuario admin

### Opción A: Usar el script de creación

```bash
cd backend
pnpm ts-node scripts/create-admin-user.ts
```

### Opción B: Verificar manualmente en la base de datos

```bash
cd backend
pnpm prisma studio
```

Busca en la tabla `users` un usuario con email: `admin@ministerio-amva.org`

## ✅ PASO 3: Crear usuario admin si no existe

### Credenciales por defecto:

- **Email**: `admin@ministerio-amva.org`
- **Password**: `admin123`

### Crear usuario:

```bash
cd backend
pnpm ts-node scripts/create-admin-user.ts
```

## ✅ PASO 4: Verificar variables de entorno

### Backend (.env):

```env
DATABASE_URL=postgresql://...
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

### Frontend (.env.local):

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
```

## ✅ PASO 5: Probar el login

1. Abre el navegador en: `http://localhost:3000/admin/login`
2. Ingresa las credenciales:
   - Email: `admin@ministerio-amva.org`
   - Password: `admin123`
3. Revisa la consola del navegador (F12) para ver los logs
4. Revisa la consola del backend para ver los logs

## 🐛 PROBLEMAS COMUNES Y SOLUCIONES

### Problema 1: "Credenciales inválidas"

**Solución**: Verifica que el usuario existe y la contraseña es correcta

### Problema 2: "Network Error" o "CORS Error"

**Solución**:

- Verifica que el backend esté corriendo en puerto 4000
- Verifica que `NEXT_PUBLIC_API_URL` esté configurado correctamente

### Problema 3: "Token inválido" después del login

**Solución**:

- Verifica que `JWT_SECRET` esté configurado en el backend
- Limpia el localStorage: `localStorage.clear()` en la consola

### Problema 4: El login se queda cargando

**Solución**:

- Verifica la consola del navegador para errores
- Verifica que el backend esté respondiendo
- Prueba hacer una petición directa: `curl http://localhost:4000/api/auth/login`

## 📝 LOGS A REVISAR

### En el navegador (Consola):

- `[Login Page] onSubmit llamado con: ...`
- `[useAuth] Iniciando proceso de login...`
- `[authApi] Enviando petición de login: ...`
- `[useAuth] Respuesta del servidor recibida: ...`

### En el backend (Terminal):

- `[AuthService] Intentando login para: ...`
- `[AuthService] Usuario encontrado: ...`
- `[AuthService] Comparación de contraseña: ...`
- `[AuthService] Login exitoso para: ...`
