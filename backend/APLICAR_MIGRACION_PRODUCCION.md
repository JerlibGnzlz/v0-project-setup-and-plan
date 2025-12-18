# Aplicar Migración de DNI en Producción

## Problema
La columna `dni` no existe en la base de datos de producción, causando errores en las queries de Prisma.

## Solución

### Opción 1: Aplicar Migración Manualmente (Recomendado)

Si tienes acceso SSH a Render.com o puedes ejecutar comandos en producción:

```bash
cd backend
npx prisma migrate deploy
npx prisma generate
```

### Opción 2: Configurar Build Command en Render.com

En Render.com, configura el "Build Command" para incluir las migraciones:

```bash
npm install && npx prisma generate && npm run build
```

Y el "Start Command":

```bash
npm run start:prod
```

### Opción 3: Ejecutar SQL Directamente

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

## Notas

- Las migraciones ya están creadas en `backend/prisma/migrations/`
- El schema de Prisma ya incluye el campo `dni`
- Solo falta aplicar la migración en producción

