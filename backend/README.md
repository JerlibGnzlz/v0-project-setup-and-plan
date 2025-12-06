# Backend API - Ministerio AMVA

Backend NestJS con Prisma y autenticación JWT para el sistema del Ministerio.

## Pasos para iniciar el backend

### 1. Instalar dependencias

\`\`\`bash
cd backend
npm install
\`\`\`

### 2. Configurar variables de entorno

El archivo `.env` ya está configurado con la conexión a Neon.

### 3. Generar cliente de Prisma

\`\`\`bash
npm run prisma:generate
\`\`\`

### 4. Ejecutar migraciones

\`\`\`bash
npm run prisma:migrate
\`\`\`

### 5. Iniciar el servidor

\`\`\`bash

# Modo desarrollo

npm run start:dev

# Modo producción

npm run build
npm run start:prod
\`\`\`

El servidor estará disponible en `http://localhost:4000`

## Endpoints disponibles

### Autenticación

- POST `/auth/register` - Registrar nuevo usuario admin
- POST `/auth/login` - Iniciar sesión
- GET `/auth/me` - Obtener perfil (requiere token)

### Convenciones (públicas para GET, protegidas para POST/PATCH/DELETE)

- GET `/convenciones` - Listar todas
- GET `/convenciones/:id` - Ver una convención
- POST `/convenciones` - Crear convención (requiere JWT)
- PATCH `/convenciones/:id` - Actualizar (requiere JWT)
- DELETE `/convenciones/:id` - Eliminar (requiere JWT)

### Pastores (públicas para GET, protegidas para POST/PATCH/DELETE)

- GET `/pastores` - Listar todos
- GET `/pastores/:id` - Ver un pastor
- POST `/pastores` - Crear pastor (requiere JWT)
- PATCH `/pastores/:id` - Actualizar (requiere JWT)
- DELETE `/pastores/:id` - Desactivar pastor (requiere JWT)

## Autenticación JWT

Para usar endpoints protegidos, incluye el token en el header:
\`\`\`
Authorization: Bearer <tu-token-jwt>
\`\`\`

## Prisma Studio

Para visualizar y editar la base de datos:
\`\`\`bash
npm run prisma:studio
