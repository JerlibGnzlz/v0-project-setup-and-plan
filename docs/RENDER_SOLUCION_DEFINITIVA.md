# 🔧 Solución Definitiva: Error "nest: not found" en Render

## ❌ Error

```
> ministerio-backend@1.0.0 build
> nest build
sh: 1: nest: not found
==> Build failed 😞
```

## 🔍 Causas

1. **`@nestjs/cli` está en `devDependencies`**: Render no instala devDependencies por defecto en producción
2. **Root Directory no configurado**: Render ejecuta el build desde la raíz en lugar de `backend/`

---

## ✅ Solución Aplicada

### 1. Mover `@nestjs/cli` a `dependencies`

**Cambio realizado:**
- `@nestjs/cli` movido de `devDependencies` a `dependencies`
- Esto asegura que `nest` esté disponible durante el build

### 2. Configurar Root Directory en Render

**IMPORTANTE:** Debes configurar esto manualmente en Render Dashboard.

---

## 🚀 Pasos para Corregir en Render

### Paso 1: Configurar Root Directory

1. Ve a: https://dashboard.render.com
2. Selecciona: **ministerio-backend-wdbj**
3. Ve a **Settings** → **Build & Deploy**
4. Busca **"Root Directory"**
5. Cambia a: `backend` (exactamente, sin comillas)
6. **Guarda los cambios**

### Paso 2: Verificar Build Command

El Build Command debe ser:

```bash
npm install --legacy-peer-deps && npm run build && npx prisma generate
```

### Paso 3: Verificar Start Command

El Start Command debe ser:

```bash
npm run start:prod
```

### Paso 4: Configurar Variable de Entorno (Opcional pero Recomendado)

Para asegurar que las devDependencies se instalen:

1. Ve a **Environment** en Render
2. Agrega:
   ```
   NPM_CONFIG_PRODUCTION=false
   ```

Esto asegura que todas las dependencias se instalen, incluyendo `@nestjs/cli`.

### Paso 5: Deployar

1. Guarda todos los cambios
2. Haz clic en **"Manual Deploy"** → **"Deploy latest commit"**
3. O espera a que Render detecte los cambios automáticamente

---

## 📋 Configuración Completa

### En Render Dashboard:

| Campo | Valor |
|-------|-------|
| **Root Directory** | `backend` |
| **Build Command** | `npm install --legacy-peer-deps && npm run build && npx prisma generate` |
| **Start Command** | `npm run start:prod` |
| **Environment** | `Node` |
| **Node Version** | `22.16.0` (o superior) |

### Variables de Entorno (Opcional):

```env
NPM_CONFIG_PRODUCTION=false
```

---

## ✅ Verificación

Después del deploy, en los logs deberías ver:

```
==> Running build command 'npm install --legacy-peer-deps && npm run build && npx prisma generate'...
added 372 packages...
> ministerio-backend@1.0.0 build
> nest build
✅ Build completed successfully
```

**NO deberías ver:**
```
> my-v0-project@0.1.0 build
> next build
```

O:
```
> nest build
sh: 1: nest: not found
```

---

## 🔄 Cambios Realizados en el Código

1. ✅ `@nestjs/cli` movido a `dependencies` en `backend/package.json`
2. ✅ `render.yaml` actualizado con configuración correcta
3. ✅ Documentación creada

---

## 🐛 Si Sigue Fallando

### Opción A: Usar Build Command con `cd`

Si el Root Directory no funciona, cambia el Build Command a:

```bash
cd backend && npm install --legacy-peer-deps && npm run build && npx prisma generate
```

Y el Start Command a:

```bash
cd backend && npm run start:prod
```

### Opción B: Verificar que `@nestjs/cli` esté instalado

En los logs del build, busca:

```
added 372 packages...
```

Si ves menos paquetes, puede que `@nestjs/cli` no se esté instalando. En ese caso:

1. Agrega `NPM_CONFIG_PRODUCTION=false` en variables de entorno
2. O verifica que `@nestjs/cli` esté en `dependencies` (ya está hecho)

---

## 📝 Notas

1. **Root Directory es CRÍTICO:**
   - Sin esto, Render ejecuta desde la raíz
   - El comando `nest` no existe en la raíz
   - Debe ser exactamente `backend` (sin comillas, sin puntos)

2. **`@nestjs/cli` en dependencies:**
   - Asegura que `nest` esté disponible durante el build
   - Ya está movido a `dependencies` en el código

3. **`NPM_CONFIG_PRODUCTION=false`:**
   - Opcional pero recomendado
   - Asegura que todas las dependencias se instalen

---

## 🎯 Resumen

**Problemas:**
1. Root Directory no configurado → Render ejecuta desde raíz
2. `@nestjs/cli` en devDependencies → No se instala en producción

**Soluciones aplicadas:**
1. ✅ `@nestjs/cli` movido a `dependencies`
2. ⚠️ **TÚ DEBES:** Configurar Root Directory = `backend` en Render

**Acción requerida:**
- Ve a Render Dashboard → Settings → Build & Deploy
- Configura Root Directory = `backend`
- Guarda y deploya

---

**Última actualización**: Diciembre 2025

