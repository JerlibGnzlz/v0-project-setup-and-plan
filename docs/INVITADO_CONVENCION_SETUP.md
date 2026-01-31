# Invitado en la invitación (landing) – Configuración

La función **"Invitado en la invitación (landing)"** (nombre y foto del invitado en la tarjeta de convención) requiere que la base de datos tenga dos columnas en la tabla `convenciones`.

## Por qué no se ve

Las migraciones de Prisma están en `.gitignore`, así que la migración que añade esas columnas **no está en el repo**. Si no ejecutaste tú la migración localmente, la base de datos (p. ej. Neon) **no tiene** las columnas `invitado_nombre` e `invitado_foto_url`. Sin ellas:

- El backend puede fallar al leer o guardar convenciones.
- El formulario "Editar Convención" puede no mostrar o no guardar nombre/foto del invitado.
- La landing no puede mostrar el invitado en la tarjeta.

## Qué hacer (una sola vez)

Ejecuta el SQL que añade las columnas en tu base de datos.

### Opción 1: Neon

1. Entra en [Neon Console](https://console.neon.tech) → tu proyecto.
2. Abre **SQL Editor**.
3. Pega y ejecuta:

```sql
ALTER TABLE "convenciones" ADD COLUMN IF NOT EXISTS "invitado_nombre" TEXT;
ALTER TABLE "convenciones" ADD COLUMN IF NOT EXISTS "invitado_foto_url" TEXT;
```

4. Run.

### Opción 2: Archivo del repo

El mismo SQL está en:

`scripts/sql/add-convencion-invitado-columns.sql`

En Neon: SQL Editor → pegar contenido del archivo → Run.

### Opción 3: Prisma (si tienes la migración local)

Si en tu máquina tienes la carpeta de migración  
`backend/prisma/migrations/20260127000000_add_convencion_invitado_nombre_foto/`, puedes aplicar:

```bash
cd backend && npx prisma migrate deploy
```

(Necesitas `DATABASE_URL` en `.env`.)

## Después de ejecutar el SQL

1. Reinicia el backend si estaba corriendo.
2. En el dashboard: **Control de Convención** → **Editar Convención**.
3. En **"Invitado en la invitación (landing)"** rellena nombre y/o sube la foto → Guardar.
4. En la landing, sección **Convenciones**, la tarjeta mostrará el invitado cuando nombre o foto estén definidos.
