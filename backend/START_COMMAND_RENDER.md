# Start Command para Render.com

## ⚠️ IMPORTANTE

El Start Command debe ser **SOLO**:

```bash
npm run start:prod
```

## ❌ Errores Comunes

### Error 1: `backend: command not found`

**Causa**: El Start Command está configurado como `backend && npm run start:prod`

**Solución**: Cambiar a `npm run start:prod` (sin `backend &&`)

### Error 2: `cd: backend: No such file or directory`

**Causa**: El Start Command está configurado como `cd backend && npm run start:prod` cuando el Root Directory ya está configurado como `backend`

**Solución**: Cambiar a `npm run start:prod` (sin `cd backend &&`)

## Configuración Correcta

### Si Root Directory = `backend` (Recomendado)

- **Root Directory**: `backend`
- **Build Command**: `npm ci && npx prisma generate && npx prisma migrate deploy && npm run build`
- **Start Command**: `npm run start:prod` ✅

### Si Root Directory = vacío (raíz del repositorio)

- **Root Directory**: (vacío)
- **Build Command**: `cd backend && npm ci && npx prisma generate && npx prisma migrate deploy && npm run build`
- **Start Command**: `cd backend && npm run start:prod`

## Verificación

El Start Command correcto ejecutará:

```bash
npm run start:prod
```

Que internamente ejecuta:

```bash
node dist/src/main
```

Esto iniciará el servidor NestJS en producción.

## Pasos para Corregir en Render.com

1. Ve a [Render.com Dashboard](https://dashboard.render.com)
2. Selecciona tu servicio de backend
3. Ve a la pestaña **Settings**
4. Busca **Start Command**
5. Cambia el valor a: `npm run start:prod`
6. Guarda los cambios
7. Render.com reiniciará automáticamente el servicio

