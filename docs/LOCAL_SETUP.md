# Configuración Local del Proyecto

## Variables de Entorno

### 1. Frontend (Next.js)

Copia las variables desde Vercel o desde el sidebar "Vars" de v0:

1. Ve al sidebar "Vars" en v0
2. Copia el valor de `DATABASE_URL` y las demás variables de Neon
3. Crea un archivo `.env.local` en la raíz del proyecto:

\`\`\`env
# Frontend Next.js
NEXT_PUBLIC_API_URL=http://localhost:4000/api

# Neon Database (copia desde Vercel/v0)
DATABASE_URL=postgresql://neondb_owner:npg_XXX@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require
POSTGRES_URL=postgresql://neondb_owner:npg_XXX@ep-xxx-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require
\`\`\`

### 2. Backend (NestJS)

Crea un archivo `.env` en la carpeta `backend/`:

\`\`\`env
# Database - USA EL MISMO DATABASE_URL del frontend
DATABASE_URL=postgresql://neondb_owner:npg_XXX@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require

# JWT Secret - Genera uno aleatorio
JWT_SECRET=mi-secreto-super-seguro-cambiar-en-produccion-12345

# Server Config
PORT=4000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
\`\`\`

## Pasos para Iniciar el Proyecto Localmente

### Backend (Terminal 1)

\`\`\`bash
# Ve a la carpeta del backend
cd backend

# Instala dependencias
npm install

# Genera el cliente de Prisma
npx prisma generate

# Inicia el servidor en modo desarrollo
npm run start:dev
\`\`\`

El backend estará corriendo en: `http://localhost:4000`
API docs (Swagger) en: `http://localhost:4000/api`

### Frontend (Terminal 2)

\`\`\`bash
# En la raíz del proyecto
npm install

# Inicia Next.js en modo desarrollo
npm run dev
\`\`\`

El frontend estará corriendo en: `http://localhost:3000`

## Verificar Conexión

1. **Backend**: Ve a `http://localhost:4000/api` - deberías ver la documentación de Swagger
2. **Frontend**: Ve a `http://localhost:3000` - deberías ver tu landing page
3. **Admin**: Ve a `http://localhost:3000/admin/login` - prueba con las credenciales de seed:
   - Email: `admin@ministerio-amva.org`
   - Password: `admin123`

## Obtener las Variables de Neon

### Opción 1: Desde v0 (Recomendado)
1. En v0, ve al sidebar izquierdo
2. Haz clic en "Vars"
3. Busca `DATABASE_URL` y copia su valor
4. Pégalo en tus archivos `.env.local` y `backend/.env`

### Opción 2: Desde Vercel Dashboard
1. Ve a https://vercel.com/dashboard
2. Selecciona tu proyecto
3. Ve a Settings → Environment Variables
4. Copia el valor de `DATABASE_URL`

### Opción 3: Desde Neon Dashboard
1. Ve a https://console.neon.tech
2. Selecciona tu proyecto
3. Ve a "Connection Details"
4. Copia el "Connection string"

## Troubleshooting

### Error: "Can't reach database server"
- Verifica que el `DATABASE_URL` sea correcto
- Asegúrate de tener conexión a internet

### Error: "JWT must be provided"
- Asegúrate de hacer login primero en `/admin/login`
- El token se guarda automáticamente en localStorage

### Backend no inicia
- Verifica que hayas ejecutado `npx prisma generate`
- Asegúrate de que el puerto 4000 no esté ocupado

### Frontend no se conecta al backend
- Verifica que el backend esté corriendo en `http://localhost:4000`
- Revisa que `NEXT_PUBLIC_API_URL` en `.env.local` apunte a `http://localhost:4000/api`
