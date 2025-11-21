# Scripts SQL para Base de Datos

## Orden de Ejecución

Ejecuta estos scripts en el siguiente orden en tu consola de Neon:

### 1. Crear Tablas
\`\`\`bash
scripts/001_create_tables.sql
\`\`\`
Este script crea todas las tablas necesarias, índices y triggers.

### 2. Datos de Prueba (Opcional)
\`\`\`bash
scripts/002_seed_data.sql
\`\`\`
Este script inserta datos de prueba incluyendo:
- Usuario admin (email: admin@ministerio-amva.org, password: admin123)
- Una convención de ejemplo
- Tres pastores de ejemplo
- Tres imágenes de galería

## Cómo Ejecutar en Neon

1. Ve a tu dashboard de Neon: https://console.neon.tech
2. Selecciona tu proyecto
3. Ve a "SQL Editor"
4. Copia y pega el contenido de cada script
5. Haz clic en "Run" para ejecutar

## Verificar que funcionó

Ejecuta estas consultas para verificar:

\`\`\`sql
-- Ver todas las tablas
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';

-- Contar registros
SELECT 'users' as tabla, COUNT(*) FROM users
UNION ALL
SELECT 'convenciones', COUNT(*) FROM convenciones
UNION ALL
SELECT 'pastores', COUNT(*) FROM pastores
UNION ALL
SELECT 'galeria', COUNT(*) FROM galeria;
\`\`\`

## Credenciales del Admin

- Email: admin@ministerio-amva.org
- Password: admin123

⚠️ **IMPORTANTE**: Cambia esta contraseña en producción.
