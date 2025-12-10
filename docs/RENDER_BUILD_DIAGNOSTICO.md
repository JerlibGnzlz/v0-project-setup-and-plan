# 🔍 Diagnóstico de Build en Render

## Problema: `Cannot find module '/opt/render/project/src/backend/dist/main'`

Este error indica que el build no está generando el archivo `dist/main.js` correctamente.

## ✅ Soluciones Aplicadas

1. **Verificación de build**: El build command ahora verifica que `dist/main.js` exista después de compilar
2. **Script de verificación**: Agregado `build:verify` para debugging local

## 🔧 Pasos de Diagnóstico

### 1. Verificar Configuración en Render Dashboard

Ve a: https://dashboard.render.com → Tu servicio → Settings

**Verifica:**
- ✅ **Root Directory**: Debe ser `backend` (sin barra al final)
- ✅ **Build Command**: `npm install --legacy-peer-deps && npx prisma generate && npm run build && test -f dist/main.js || (echo "❌ Build failed - dist/main.js not found" && exit 1)`
- ✅ **Start Command**: `npm run start:prod`
- ✅ **Node Version**: 22.16.0 (o la versión que uses)

### 2. Revisar Logs de Build en Render

1. Ve a: https://dashboard.render.com → Tu servicio → Logs
2. Busca la sección **"Build Logs"**
3. Busca errores como:
   - `error TS...` (errores de TypeScript)
   - `Cannot find module...` (módulos faltantes)
   - `nest: not found` (CLI no instalado)

### 3. Errores Comunes y Soluciones

#### Error: `nest: not found`
**Causa**: `@nestjs/cli` no está instalado o no está en `dependencies`
**Solución**: Ya corregido - `@nestjs/cli` está en `dependencies`

#### Error: `Cannot find module '@prisma/client'`
**Causa**: Prisma no se generó antes del build
**Solución**: El build command ya incluye `npx prisma generate` antes de `npm run build`

#### Error: `error TS...` (múltiples errores de TypeScript)
**Causa**: Errores de tipos en el código
**Solución**: Revisa los logs y corrige los errores de TypeScript

#### Error: Build exitoso pero `dist/main.js` no existe
**Causa**: El build falló silenciosamente o el directorio de salida es incorrecto
**Solución**: 
- Verifica que `tsconfig.json` tenga `"outDir": "./dist"`
- Verifica que `nest-cli.json` esté configurado correctamente
- El build command ahora verifica que el archivo exista

### 4. Verificar Localmente

Para probar el build localmente:

```bash
cd backend
npm install --legacy-peer-deps
npx prisma generate
npm run build
ls -la dist/main.js  # Debe existir
```

Si el build funciona localmente pero falla en Render:
- Verifica que `Root Directory` esté configurado como `backend`
- Verifica que todas las dependencias estén en `dependencies` (no solo en `devDependencies`)

### 5. Verificar Variables de Entorno

Asegúrate de que estas variables estén configuradas en Render:
- `DATABASE_URL` (conexión a Neon)
- `JWT_SECRET` (mínimo 32 caracteres)
- `NODE_ENV=production`
- `PORT=4000`

### 6. Rebuild Manual

Si el build falla:
1. Ve a: https://dashboard.render.com → Tu servicio → Manual Deploy
2. Selecciona: **"Clear build cache & deploy"**
3. Esto forzará un rebuild completo

## 📋 Checklist de Verificación

- [ ] Root Directory configurado como `backend`
- [ ] Build Command incluye `npx prisma generate` antes de `npm run build`
- [ ] Build Command verifica que `dist/main.js` exista
- [ ] Start Command es `npm run start:prod`
- [ ] `@nestjs/cli` está en `dependencies` (no en `devDependencies`)
- [ ] `prisma` está en `dependencies` (no en `devDependencies`)
- [ ] `@types/bcrypt`, `@types/multer`, `@types/passport-jwt` están en `dependencies`
- [ ] `@nestjs/websockets` está en `dependencies`
- [ ] Variables de entorno configuradas correctamente
- [ ] Build funciona localmente (`cd backend && npm run build`)

## 🚨 Si el Build Sigue Fallando

1. **Copia los logs completos del build** de Render
2. **Verifica el último commit** que se está desplegando
3. **Prueba el build localmente** con los mismos comandos
4. **Revisa los errores de TypeScript** en los logs

## 📝 Comandos Útiles para Debugging

```bash
# Verificar estructura del proyecto
cd backend
ls -la

# Verificar que Prisma esté instalado
npx prisma --version

# Verificar que Nest CLI esté instalado
npx nest --version

# Generar Prisma Client
npx prisma generate

# Build manual
npm run build

# Verificar que dist/main.js existe
test -f dist/main.js && echo "✅ Existe" || echo "❌ No existe"

# Ver contenido de dist/
ls -la dist/
```

## 🔗 Referencias

- [Render Build Configuration](https://render.com/docs/build-commands)
- [NestJS Deployment](https://docs.nestjs.com/recipes/deployment)
- [Prisma Deployment](https://www.prisma.io/docs/guides/deployment)

