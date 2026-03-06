# Migraciones en producción (solicitudes de credenciales)

Si al enviar una **solicitud de credencial** desde AMVA móvil aparece **"Error de validación del servidor"** o un mensaje que indica que la base de datos no está actualizada, suele deberse a que en el servidor (por ejemplo amva.org.es) **no se han ejecutado las migraciones de Prisma**.

La tabla `solicitudes_credenciales` necesita la columna `tipo_pastor` (añadida en la migración `20260129000000_add_tipo_pastor_to_solicitud_credencial`).

## Qué hacer en el servidor

1. En el servidor donde corre el backend (o desde tu máquina con `DATABASE_URL` apuntando a la BD de producción):

```bash
cd backend
npx prisma migrate deploy
```

2. Reinicia el backend para que use el schema actualizado.

## Comprobar que la columna existe (opcional)

En PostgreSQL:

```sql
SELECT column_name FROM information_schema.columns
WHERE table_name = 'solicitudes_credenciales' AND column_name = 'tipo_pastor';
```

Si devuelve una fila, la migración está aplicada.
