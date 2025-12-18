# Configuración de Render.com

## Build Command

Configura el **Build Command** en Render.com a:

```bash
cd backend && npm ci && npx prisma generate && npx prisma migrate deploy && npm run build
```

**IMPORTANTE**: Render.com ejecuta desde la raíz del repositorio, por lo que necesitas `cd backend` primero.

### Alternativa: Usar el script render-build.sh

Si prefieres usar el script, el Build Command debe ser:

```bash
cd backend && bash render-build.sh
```

O si el script tiene permisos de ejecución:

```bash
cd backend && chmod +x render-build.sh && ./render-build.sh
```

## Start Command

El **Start Command** debe ser:

```bash
cd backend && npm run start:prod
```

## Variables de Entorno Requeridas

Asegúrate de tener configuradas estas variables de entorno en Render.com:

- `DATABASE_URL` - URL de conexión a PostgreSQL (Neon)
- `JWT_SECRET` - Secret para JWT (mínimo 32 caracteres)
- `JWT_EXPIRATION` - Tiempo de expiración del JWT (ej: 15m)
- `REFRESH_TOKEN_SECRET` - Secret para refresh tokens
- `REFRESH_TOKEN_EXPIRATION` - Tiempo de expiración del refresh token (ej: 7d)
- `GOOGLE_CLIENT_ID` - Client ID de Google OAuth (opcional)
- `GOOGLE_CLIENT_SECRET` - Client Secret de Google OAuth (opcional)
- `FRONTEND_URL` - URL del frontend (para CORS y redirects)
- `CLOUDINARY_CLOUD_NAME` - Nombre de la cuenta de Cloudinary
- `CLOUDINARY_API_KEY` - API Key de Cloudinary
- `CLOUDINARY_API_SECRET` - API Secret de Cloudinary
- `SENDGRID_API_KEY` - API Key de SendGrid (opcional)
- `REDIS_URL` - URL de Redis para Bull (opcional)

## Migraciones Automáticas

El script `render-build.sh` aplica automáticamente las migraciones de Prisma durante el build. Esto asegura que:

1. Las migraciones pendientes se apliquen antes del build
2. El cliente de Prisma se regenere con los últimos cambios del schema
3. La aplicación se compile con los tipos correctos

## Troubleshooting

### Error: "The column does not exist"

Si ves este error después del deploy:

1. Verifica que el Build Command incluya `npx prisma migrate deploy`
2. Revisa los logs del build en Render.com para ver si las migraciones se aplicaron
3. Ejecuta manualmente: `npx prisma migrate deploy` desde la consola de Render.com

### Error: "Migration failed"

Si una migración falla:

1. Revisa los logs del build para ver el error específico
2. Verifica que la base de datos esté accesible
3. Ejecuta `npx prisma migrate status` para ver el estado de las migraciones

