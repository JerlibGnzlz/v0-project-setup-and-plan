-- Script para agregar campos de seguridad a la tabla users
-- Ejecuta este script en tu base de datos (Neon, PostgreSQL, etc.)

-- Agregar columna para intentos fallidos de login
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS failed_login_attempts INTEGER NOT NULL DEFAULT 0;

-- Agregar columna para fecha de bloqueo
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS locked_until TIMESTAMP;

-- Verificar que se agregaron correctamente
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name IN ('failed_login_attempts', 'locked_until');






















