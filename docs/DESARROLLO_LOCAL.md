# Desarrollo local - Variables de entorno + flujo

Guía para levantar el proyecto completo en tu PC sin afectar producción.

---

## Requisitos previos

- Node.js 18+
- PostgreSQL (local o Neon)
- Redis (opcional para notificaciones; puede fallar sin él pero el resto funciona)

---

## 1. Configurar variables de entorno

### Frontend (raíz del proyecto)

Crea o edita `.env.local`:

```bash
# URL del sitio (local)
NEXT_PUBLIC_SITE_URL="http://localhost:3000"

# API del backend (local)
NEXT_PUBLIC_API_URL="http://localhost:4000/api"

# APK (opcional, para descarga)
NEXT_PUBLIC_APK_DOWNLOAD_URL="https://expo.dev/artifacts/..."
```

### Backend

Copia un backup como base y edita `backend/.env`:

```bash
cd backend
cp .env.bak .env   # o cp env.example.txt .env
```

Variables mínimas para local:

```bash
# Base de datos (PostgreSQL local o Neon)
DATABASE_URL="postgresql://usuario:password@localhost:5432/ministerio_amva"

# JWT
JWT_SECRET="clave_secreta_para_desarrollo_minimo_32_chars"
JWT_EXPIRES_IN="7d"

# CORS - debe coincidir con el puerto del frontend
FRONTEND_URL="http://localhost:3000"

# Servidor
PORT=4000
NODE_ENV="development"

# Redis (local o vacío)
REDIS_HOST="localhost"
REDIS_PORT="6379"
REDIS_PASSWORD=""
REDIS_DB="0"

# Email (Brevo o SMTP - usa credenciales de prueba)
EMAIL_PROVIDER="brevo-api"
BREVO_API_KEY="tu_api_key"
SMTP_FROM_EMAIL="noreply@tudominio.com"
SMTP_FROM_NAME="AMVA Digital"
```

---

## 2. Levantar el proyecto

### Opción A: Dos terminales

**Terminal 1 - Backend:**
```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev   # si hay migraciones pendientes
npm run start:dev
```

**Terminal 2 - Frontend:**
```bash
npm install
npm run dev
```

### Opción B: Script automático

```bash
./scripts/start-local.sh
```

---

## 3. URLs locales

| Servicio | URL |
|----------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:4000/api |
| Admin | http://localhost:3000/admin |

---

## 4. Antes de subir a producción

1. **Probar build:**
   ```bash
   npm run build
   cd backend && npm run build
   ```

2. **Probar en modo producción local:**
   ```bash
   npm run build && npm run start
   # En otra terminal: cd backend && npm run start:prod
   ```

3. **Commit y push** solo cuando todo funcione.

---

## 5. Producción vs local

| Variable | Local | Producción |
|----------|-------|------------|
| NEXT_PUBLIC_SITE_URL | http://localhost:3000 | https://amva.org.es |
| NEXT_PUBLIC_API_URL | http://localhost:4000/api | https://amva.org.es/api |
| FRONTEND_URL (backend) | http://localhost:3000 | https://amva.org.es |
| DATABASE_URL | BD local o Neon dev | BD de producción |

**Importante:** El servidor de producción tiene su propio `.env`. Los cambios en tu `.env.local` y `backend/.env` no afectan a producción.
