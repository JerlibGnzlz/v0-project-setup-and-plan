# Configuración de Build Command en Render.com

## Problema

El error indica que Render.com no puede encontrar el directorio `backend`:
```
==> Running build command 'cd backend && chmod +x '...
bash: line 1: cd: backend: No such file or directory
```

## Solución

### Paso 1: Verificar Root Directory en Render.com

1. Ve a [Render.com Dashboard](https://dashboard.render.com)
2. Selecciona tu servicio de backend
3. Ve a la pestaña "Settings"
4. Verifica que **Root Directory** esté configurado como:
   - **`backend`** (si Render.com debe ejecutar desde el directorio backend)
   - **O vacío** (si Render.com debe ejecutar desde la raíz del repositorio)

### Paso 2: Configurar Build Command

Dependiendo de cómo esté configurado el Root Directory:

#### Opción A: Root Directory = `backend` (Recomendado)

Si el Root Directory está configurado como `backend`, el Build Command debe ser:

```bash
npm ci && npx prisma generate && npx prisma migrate deploy && npm run build
```

#### Opción B: Root Directory = vacío (raíz del repositorio)

Si el Root Directory está vacío (raíz), el Build Command debe ser:

```bash
cd backend && npm ci && npx prisma generate && npx prisma migrate deploy && npm run build
```

### Paso 3: Configurar Start Command

El **Start Command** debe ser:

```bash
cd backend && npm run start:prod
```

O si el Root Directory está configurado como `backend`:

```bash
npm run start:prod
```

## Configuración Recomendada

### Root Directory
```
backend
```

### Build Command
```bash
npm ci && npx prisma generate && npx prisma migrate deploy && npm run build
```

### Start Command
```bash
npm run start:prod
```

## Verificación

Después de configurar, Render.com debería:

1. ✅ Instalar dependencias (`npm ci`)
2. ✅ Generar cliente de Prisma (`npx prisma generate`)
3. ✅ Aplicar migraciones (`npx prisma migrate deploy`)
4. ✅ Compilar la aplicación (`npm run build`)
5. ✅ Iniciar el servidor (`npm run start:prod`)

## Troubleshooting

### Error: "cd: backend: No such file or directory"

**Causa**: El Root Directory está mal configurado o el Build Command intenta hacer `cd backend` cuando ya está en ese directorio.

**Solución**: 
- Configura Root Directory como `backend`
- O elimina `cd backend` del Build Command si Root Directory está vacío

### Error: "Cannot find module"

**Causa**: Las dependencias no se instalaron correctamente.

**Solución**: Verifica que `npm ci` esté en el Build Command.

### Error: "Migration failed"

**Causa**: Las migraciones de Prisma fallaron.

**Solución**: Verifica que `npx prisma migrate deploy` esté en el Build Command y que `DATABASE_URL` esté configurada correctamente.

## Notas

- El script `render-build.sh` está disponible pero no es necesario si usas el Build Command directo
- El `package.json` ya incluye `prisma generate` y `prisma migrate deploy` en el script `build`
- Render.com ejecuta los comandos en el orden especificado

