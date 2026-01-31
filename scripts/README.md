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

## Scripts adicionales (ejecutar una vez si aplica)

### Invitado en la invitación (landing)

Si usas la función **"Invitado en la invitación"** en Editar Convención (nombre y foto del invitado en la tarjeta de la landing), ejecuta una vez:

**Neon:** SQL Editor → pegar y ejecutar el contenido de:

`scripts/sql/add-convencion-invitado-columns.sql`

Añade las columnas `invitado_nombre` e `invitado_foto_url` a la tabla `convenciones`. Sin esto, el dashboard y la landing no mostrarán/guardarán esos datos.

## Verificar que funcionó

Ejecuta estas consultas para verificar:

\`\`\`sql
-- Ver todas las tablas
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public';

-- Contar registros
SELECT 'users' as tabla, COUNT(_) FROM users
UNION ALL
SELECT 'convenciones', COUNT(_) FROM convenciones
UNION ALL
SELECT 'pastores', COUNT(_) FROM pastores
UNION ALL
SELECT 'galeria', COUNT(_) FROM galeria;
\`\`\`

## Credenciales del Admin

- Email: admin@ministerio-amva.org
- Password: admin123

⚠️ **IMPORTANTE**: Cambia esta contraseña en producción.
