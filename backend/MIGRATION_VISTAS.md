# Migración: Agregar campo vistas a Noticias

## Pasos para aplicar la migración:

### 1. Actualizar datos existentes (si hay noticias con categorías antiguas)

Si tienes noticias con categorías `DEVOCIONAL` o `TESTIMONIO`, primero actualízalas:

```sql
-- Actualizar categorías antiguas a nuevas
UPDATE noticias
SET categoria = 'ACTIVIDAD'
WHERE categoria = 'DEVOCIONAL';

UPDATE noticias
SET categoria = 'OPORTUNIDADES'
WHERE categoria = 'TESTIMONIO';
```

### 2. Aplicar el cambio del schema

```bash
cd backend
npx prisma db push --accept-data-loss
```

O crear una migración:

```bash
npx prisma migrate dev --name add_vistas_to_noticias
```

### 3. Verificar

```bash
npx prisma studio
```

Deberías ver el campo `vistas` en la tabla `noticias` con valor por defecto 0.

## Nota

El campo `vistas` se inicializa en 0 para todas las noticias existentes. Las nuevas vistas se contarán desde ahora.














