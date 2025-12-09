# 🔗 Integración Neon + Render

Guía específica para usar tu base de datos Neon con Render.

## ✅ Respuesta Rápida

**Sí, puedes usar Neon perfectamente con Render.** No hay integración automática como en Railway, pero es muy fácil de configurar. Solo necesitas agregar la variable `DATABASE_URL` de Neon en las variables de entorno de Render.

---

## 🚀 Pasos para Integrar Neon con Render

### 1. Obtener Connection String de Neon

1. Ve a https://console.neon.tech
2. Selecciona tu proyecto
3. Ve a **"Connection Details"** o **"Dashboard"**
4. Copia el **Connection String** completo:

```
postgresql://usuario:password@ep-xxx-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require
```

**⚠️ IMPORTANTE**: Asegúrate de que incluya `?sslmode=require` al final.

### 2. Crear Servicio Web en Render

1. Ve a https://render.com
2. Haz clic en **"New"** → **"Web Service"**
3. Conecta tu repositorio de GitHub
4. Configura:
   - **Name**: `ministerio-backend` (o el nombre que prefieras)
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build && npx prisma generate`
   - **Start Command**: `npm run start:prod`
   - **Plan**: Elige el plan que prefieras (Free, Starter, etc.)

### 3. Agregar Variable DATABASE_URL de Neon

1. En Render, ve a tu servicio web
2. Haz clic en **"Environment"** en el menú lateral
3. Haz clic en **"Add Environment Variable"**
4. Agrega:

   - **Key**: `DATABASE_URL`
   - **Value**: Pega el Connection String completo de Neon

   ```
   DATABASE_URL=postgresql://usuario:password@ep-xxx-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require
   ```

5. Haz clic en **"Save Changes"**

### 4. Agregar Resto de Variables de Entorno

Agrega todas las demás variables necesarias (ver `env.production.example`):

```env
# JWT
JWT_SECRET=tu-clave-secreta-super-segura-minimo-32-caracteres
JWT_EXPIRES_IN=7d

# Servidor
PORT=4000
NODE_ENV=production

# Frontend URL (se configurará después)
FRONTEND_URL=https://tu-proyecto.vercel.app

# Cloudinary
CLOUDINARY_CLOUD_NAME=tu-cloud-name
CLOUDINARY_API_KEY=tu-api-key
CLOUDINARY_API_SECRET=tu-api-secret

# Redis (Upstash recomendado)
REDIS_HOST=tu-redis-host.upstash.io
REDIS_PORT=6379
REDIS_PASSWORD=tu-redis-password
REDIS_DB=0

# Email
SENDGRID_API_KEY=tu-sendgrid-api-key
# O SMTP:
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASSWORD=tu-app-password
```

### 5. Deployar

1. Render comenzará automáticamente el deploy
2. Puedes ver el progreso en la pestaña **"Logs"**
3. Una vez completado, obtendrás una URL como:

```
https://ministerio-backend.onrender.com
```

### 6. Ejecutar Migraciones

Después del primer deploy, ejecuta las migraciones de Prisma:

```bash
# Desde tu máquina local
cd backend
export DATABASE_URL="tu-database-url-de-neon"
npx prisma generate
npx prisma migrate deploy
```

O si prefieres hacerlo desde Render (si tienes acceso SSH):

```bash
# Conéctate al servicio
render ssh

# Ejecuta las migraciones
cd backend
npx prisma migrate deploy
```

---

## ✅ Ventajas de Usar Neon con Render

1. **Gratis hasta cierto límite**: Neon ofrece un tier gratuito generoso
2. **Mejor rendimiento**: Neon suele tener mejor rendimiento que PostgreSQL de Render en el plan gratuito
3. **Connection Pooling**: Neon incluye connection pooling automático
4. **Escalabilidad**: Fácil de escalar cuando tu proyecto crece
5. **Portabilidad**: Puedes usar la misma base de datos desde cualquier plataforma

---

## ⚠️ Consideraciones Importantes

### Render Free Tier

- **Servicios "duermen"**: Los servicios gratuitos de Render se "duermen" después de 15 minutos de inactividad
- **Primera petición lenta**: La primera petición después de "dormir" puede tardar 30-60 segundos
- **Solución**: Considera el plan Starter ($7/mes) o usa Railway para evitar esto

### Neon Free Tier

- **Límite de almacenamiento**: 0.5 GB en el plan gratuito
- **Límite de compute**: 0.5 vCPU
- **Suficiente para desarrollo y proyectos pequeños**

### Connection Pooling

Neon incluye connection pooling automático. Si necesitas más control, puedes usar:

```
# Connection string con pooler
postgresql://usuario:password@ep-xxx-xxx-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require
```

---

## 🔍 Verificar la Conexión

### 1. Verificar desde Render

1. Ve a tu servicio en Render
2. Haz clic en **"Logs"**
3. Busca mensajes como:
   - `✅ Database connection established`
   - `✅ Prisma Client generated successfully`

### 2. Verificar desde tu Máquina Local

```bash
# Conecta a Neon directamente
cd backend
export DATABASE_URL="tu-database-url-de-neon"
npx prisma studio
```

Esto abrirá Prisma Studio y podrás ver tus tablas.

### 3. Probar Endpoint

```bash
# Prueba un endpoint público
curl https://tu-backend.onrender.com/api/convenciones
```

---

## 🆘 Troubleshooting

### Error: "Cannot connect to database"

**Solución**:
1. Verifica que `DATABASE_URL` esté correctamente configurada en Render
2. Asegúrate de que la URL incluya `?sslmode=require`
3. Verifica que Neon permita conexiones desde cualquier IP (por defecto sí)
4. Revisa los logs de Render para ver el error específico

### Error: "Prisma Client not generated"

**Solución**:
1. Verifica que el Build Command incluya `npx prisma generate`
2. Revisa los logs de build en Render
3. Asegúrate de que `DATABASE_URL` esté disponible durante el build

### Error: "Migration failed"

**Solución**:
1. Ejecuta las migraciones manualmente desde tu máquina local
2. Verifica que la base de datos esté accesible
3. Revisa el estado con `npx prisma migrate status`

### Servicio "duerme" en Render Free

**Solución**:
1. Usa un servicio de "ping" como UptimeRobot para mantener el servicio activo
2. O considera el plan Starter de Render ($7/mes)
3. O usa Railway que no tiene este problema

---

## 📊 Comparación: Neon vs PostgreSQL de Render

| Característica | Neon | Render PostgreSQL |
|---------------|------|-------------------|
| Plan Gratuito | ✅ Sí (0.5 GB) | ✅ Sí (90 días) |
| Connection Pooling | ✅ Incluido | ⚠️ Solo en planes pagos |
| Escalabilidad | ✅ Excelente | ✅ Buena |
| Portabilidad | ✅ Sí (cualquier plataforma) | ⚠️ Solo Render |
| Performance | ✅ Muy bueno | ✅ Bueno |
| Precio | ✅ Generoso free tier | ⚠️ Limitado free tier |

**Recomendación**: Para este proyecto, Neon es una excelente opción, especialmente si planeas usar múltiples plataformas o necesitas mejor rendimiento en el plan gratuito.

---

## 📚 Recursos Adicionales

- [Documentación de Neon](https://neon.tech/docs)
- [Documentación de Render](https://render.com/docs)
- [Neon Connection Pooling](https://neon.tech/docs/connect/connection-pooling)
- [Render Environment Variables](https://render.com/docs/environment-variables)

---

## ✅ Checklist

Antes de considerar la integración completa:

- [ ] Connection String de Neon obtenido
- [ ] Servicio web creado en Render
- [ ] `DATABASE_URL` agregada en Render
- [ ] Resto de variables de entorno configuradas
- [ ] Build Command incluye `npx prisma generate`
- [ ] Migraciones ejecutadas
- [ ] Conexión verificada desde logs
- [ ] Endpoints probados y funcionando

---

**Última actualización**: Diciembre 2025
**Versión del proyecto**: v0.1.1

