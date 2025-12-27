-- Script para agregar campos de 2FA a la tabla users
-- Ejecutar directamente en la base de datos si la migración falla

-- Agregar columna two_factor_enabled (si no existe)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'two_factor_enabled'
    ) THEN
        ALTER TABLE users 
        ADD COLUMN two_factor_enabled BOOLEAN NOT NULL DEFAULT false;
    END IF;
END $$;

-- Agregar columna two_factor_secret (si no existe)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'two_factor_secret'
    ) THEN
        ALTER TABLE users 
        ADD COLUMN two_factor_secret TEXT;
    END IF;
END $$;

-- Verificar que se agregaron correctamente
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name IN ('two_factor_enabled', 'two_factor_secret');
























