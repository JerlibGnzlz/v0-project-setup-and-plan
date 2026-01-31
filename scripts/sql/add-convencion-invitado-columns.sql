-- Añade columnas para "Invitado en la invitación (landing)" en convenciones.
-- Ejecutar UNA VEZ en tu base de datos (Neon, psql, etc.) si no aplicaste la migración.
-- Las migraciones están en .gitignore, por eso este script está en el repo.

-- Si usas Neon: SQL Editor → pegar y ejecutar.
-- Si usas psql: psql $DATABASE_URL -f scripts/sql/add-convencion-invitado-columns.sql

ALTER TABLE "convenciones" ADD COLUMN IF NOT EXISTS "invitado_nombre" TEXT;
ALTER TABLE "convenciones" ADD COLUMN IF NOT EXISTS "invitado_foto_url" TEXT;
