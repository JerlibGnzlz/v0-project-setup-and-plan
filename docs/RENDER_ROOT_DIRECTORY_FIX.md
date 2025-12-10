# 🔧 Solución: Root Directory en Render

## ❌ Error

```
sh: 1: nest: not found
==> Build failed 😞
```

## 🔍 Causa

Render está ejecutando el build desde la **raíz del proyecto** en lugar de desde `backend/`. El comando `nest` solo está disponible en `backend/node_modules/.bin/`.

---

## ✅ Solución Paso a Paso

### Paso 1: Ir a Render Dashboard

1. Ve a: https://dashboard.render.com
2. Inicia sesión
3. Selecciona tu servicio: **ministerio-backend-wdbj**

### Paso 2: Configurar Root Directory

1. En tu servicio, haz clic en **"Settings"** (Configuración)
2. Ve a la sección **"Build & Deploy"**
3. Busca el campo **"Root Directory"**
4. **CRÍTICO:** Cambia el valor a:
   ```
   backend
   ```
   
   **⚠️ IMPORTANTE:**
   - Debe ser exactamente `backend` (sin comillas)
   - NO debe ser `.` (punto)
   - NO debe ser `/backend`
   - NO debe ser `./backend`
   - NO debe estar vacío

### Paso 3: Verificar Build Command

En la misma sección, verifica que el **Build Command** sea:

```bash
npm install --legacy-peer-deps && npm run build && npx prisma generate
```

### Paso 4: Verificar Start Command

Verifica que el **Start Command** sea:

```bash
npm run start:prod
```

### Paso 5: Guardar y Deployar

1. Haz clic en **"Save Changes"** (Guardar cambios)
2. Render debería detectar los cambios y hacer un nuevo deploy automáticamente
3. O ve a **"Manual Deploy"** → **"Deploy latest commit"**

---

## 📋 Configuración Completa

### Tabla de Configuración

| Campo | Valor Correcto | ❌ Incorrecto |
|-------|----------------|---------------|
| **Root Directory** | `backend` | `.` o `/backend` o vacío |
| **Build Command** | `npm install --legacy-peer-deps && npm run build && npx prisma generate` | `npm run build` |
| **Start Command** | `npm run start:prod` | `npm start` |
| **Environment** | `Node` | - |
| **Node Version** | `22.16.0` (o superior) | - |

---

## 🔍 Cómo Verificar que Está Correcto

### Antes del Fix (Incorrecto)

En los logs verás:
```
==> Running build command 'npm install --legacy-peer-deps && npm run build && npx prisma generate'...
> my-v0-project@0.1.0 build
> next build
```

O:
```
> nest build
sh: 1: nest: not found
```

### Después del Fix (Correcto)

En los logs verás:
```
==> Running build command 'npm install --legacy-peer-deps && npm run build && npx prisma generate'...
> ministerio-backend@1.0.0 build
> nest build
✅ Build completed successfully
```

---

## 🐛 Troubleshooting

### Si el Root Directory no aparece

1. Ve a **Settings** → **Build & Deploy**
2. Si no ves el campo "Root Directory", haz clic en **"Advanced"** o **"Show Advanced Options"**
3. El campo debería aparecer

### Si sigue fallando después de configurar Root Directory

1. **Verifica que el valor sea exacto:**
   - Debe ser `backend` (sin espacios, sin comillas)
   - NO debe tener puntos ni barras

2. **Verifica que guardaste los cambios:**
   - Debe aparecer un mensaje de confirmación
   - Los cambios se guardan automáticamente, pero verifica

3. **Haz un nuevo deploy:**
   - Ve a **"Manual Deploy"** → **"Deploy latest commit"**
   - O espera a que Render detecte los cambios automáticamente

4. **Revisa los logs:**
   - Ve a **"Logs"** en Render
   - Verifica que el build se ejecute desde `backend/`
   - Deberías ver: `> ministerio-backend@1.0.0 build`

### Si ves "Cannot find module '@tailwindcss/postcss'"

**Problema:** Render sigue intentando hacer build del frontend.

**Solución:** El Root Directory NO está configurado correctamente. Vuelve a verificar que sea exactamente `backend`.

---

## 📝 Notas Importantes

1. **Root Directory es CRÍTICO:**
   - Sin esto, Render no sabe dónde está el código del backend
   - Render intentará hacer build desde la raíz (frontend)
   - Esto causará errores porque `nest` no existe en la raíz

2. **El Build Command se ejecuta desde Root Directory:**
   - Si Root Directory = `backend`, entonces `npm run build` ejecuta `nest build` desde `backend/`
   - Si Root Directory = `.` (raíz), entonces `npm run build` ejecuta `next build` desde la raíz

3. **Verifica siempre los logs:**
   - Los logs muestran desde dónde se ejecuta el build
   - Si ves `> my-v0-project@0.1.0 build`, está mal (raíz)
   - Si ves `> ministerio-backend@1.0.0 build`, está bien (backend)

---

## 🎯 Resumen

**El problema:** Root Directory no está configurado como `backend`

**La solución:** Configurar Root Directory = `backend` en Render Settings

**Configuración necesaria:**
- Root Directory: `backend`
- Build Command: `npm install --legacy-peer-deps && npm run build && npx prisma generate`
- Start Command: `npm run start:prod`

---

## 📸 Imagen de Referencia

En Render Dashboard, el campo "Root Directory" debería verse así:

```
Settings → Build & Deploy

Root Directory: [backend]  ← Aquí debe decir "backend"
Build Command:  [npm install --legacy-peer-deps && npm run build && npx prisma generate]
Start Command:  [npm run start:prod]
```

---

**Última actualización**: Diciembre 2025

