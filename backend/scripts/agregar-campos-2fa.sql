-- Script para agregar campos de 2FA a la tabla users
-- Ejecuta este script en tu base de datos (Neon, PostgreSQL, etc.)

-- Agregar columna two_factor_enabled
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN NOT NULL DEFAULT false;

-- Agregar columna two_factor_secret
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS two_factor_secret TEXT;

-- Verificar que se agregaron correctamente
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name IN ('two_factor_enabled', 'two_factor_secret');



















