-- Script para verificar si los campos de 2FA existen en la tabla users

-- Verificar si existen los campos
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name IN ('two_factor_enabled', 'two_factor_secret');

-- Si no existen, ejecutar esto:
-- ALTER TABLE users 
-- ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN NOT NULL DEFAULT false;
--
-- ALTER TABLE users 
-- ADD COLUMN IF NOT EXISTS two_factor_secret TEXT;
























