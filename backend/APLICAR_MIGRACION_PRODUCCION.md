# Aplicar Migración de DNI en Producción

## Problema
La columna `dni` no existe en la base de datos de producción, causando errores en las queries de Prisma.

## Solución Automática (Recomendado)

### Configurar Build Command en Render.com

1. Ve a tu servicio en Render.com
2. En la sección **"Settings"** → **"Build & Deploy"**
3. Actualiza el **"Build Command"** a:

```bash
cd backend && chmod +x scripts/build-production.sh && ./scripts/build-production.sh
```

O si prefieres usar npm directamente:

```bash
cd backend && npm ci && npx prisma migrate deploy && npx prisma generate && npm run build
```

4. El **"Start Command"** debe ser:

```bash
cd backend && npm run start:prod
```

5. Guarda los cambios y Render.com aplicará las migraciones automáticamente en el próximo deploy

## Solución Manual (Si la automática no funciona)

### Opción 1: Aplicar Migración Manualmente

Si tienes acceso SSH a Render.com o puedes ejecutar comandos en producción:

```bash
cd backend
npx prisma migrate deploy
npx prisma generate
```

### Opción 2: Ejecutar SQL Directamente

Si tienes acceso a la base de datos directamente, ejecuta:

```sql
ALTER TABLE inscripciones ADD COLUMN IF NOT EXISTS dni VARCHAR(20);
CREATE INDEX IF NOT EXISTS idx_inscripciones_dni ON inscripciones(dni);
```

Luego regenera el cliente de Prisma:

```bash
npx prisma generate
```

## Verificación

Después de aplicar la migración, verifica que la columna existe:

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'inscripciones' AND column_name = 'dni';
```

O desde la consola de Render.com:

```bash
cd backend
npx prisma migrate status
```

## Notas

- Las migraciones ya están creadas en `backend/prisma/migrations/`
- El schema de Prisma ya incluye el campo `dni`
- El script `build-production.sh` aplica migraciones automáticamente
- El `package.json` ya tiene `postinstall` que ejecuta `prisma generate`

