# 🔧 Solución: Error de Build en Render

## ❌ Error Actual

```
sh: 1: nest: not found
==> Build failed 😞
```

## 🔍 Causa del Problema

Render está ejecutando el build desde la **raíz del proyecto** en lugar de desde `backend/`. El comando `nest` solo está disponible en `backend/node_modules/.bin/`.

---

## ✅ Solución

### Opción 1: Configurar Root Directory (RECOMENDADO)

1. Ve a tu servicio en Render
2. Ve a **Settings** → **Build & Deploy**
3. Configura:

   **Root Directory:**
   ```
   backend
   ```

   **Build Command:**
   ```
   npm install && npm run build && npx prisma generate
   ```

   **Start Command:**
   ```
   npm run start:prod
   ```

### Opción 2: Cambiar Build Command (Alternativa)

Si no puedes cambiar el Root Directory, usa este comando:

**Build Command:**
```bash
cd backend && npm install --legacy-peer-deps && npm run build && npx prisma generate
```

**Nota:** Usamos `--legacy-peer-deps` para evitar conflictos de dependencias.

**Start Command:**
```bash
cd backend && npm run start:prod
```

---

## 📋 Configuración Completa para Render

### 1. Root Directory
```
backend
```

### 2. Build Command
```bash
npm install --legacy-peer-deps && npm run build && npx prisma generate
```

**Nota:** Usamos `--legacy-peer-deps` para evitar conflictos de dependencias con React 19.

### 3. Start Command
```bash
npm run start:prod
```

### 4. Environment
```
Node
```

### 5. Node Version (Opcional)
```
22.16.0
```

---

## 🔄 Pasos para Corregir

1. **Ve a Render Dashboard**
   - https://dashboard.render.com

2. **Selecciona tu servicio**

3. **Ve a Settings → Build & Deploy**

4. **Configura Root Directory:**
   - Cambia de `.` (raíz) a `backend`

5. **Verifica Build Command:**
   ```
   npm install && npm run build && npx prisma generate
   ```

6. **Verifica Start Command:**
   ```
   npm run start:prod
   ```

7. **Guarda los cambios**

8. **Haz un nuevo deploy:**
   - Render debería detectar los cambios automáticamente
   - O haz clic en "Manual Deploy"

---

## ✅ Verificación

Después del deploy, verifica:

1. **El build debe completarse sin errores**
2. **El servicio debe estar "Live"**
3. **Prueba el endpoint:**
   ```bash
   curl https://tu-backend.onrender.com/api/mercado-pago/status
   ```
   Debe retornar:
   ```json
   {
     "configured": true,
     "testMode": false
   }
   ```

---

## 🐛 Si Sigue Fallando

### Verificar que Prisma esté instalado

Si ves errores de Prisma, asegúrate de que el Build Command incluya:

```bash
npm install && npm run build && npx prisma generate
```

### Verificar que las dependencias estén instaladas

El comando `npm install` debe ejecutarse **antes** de `npm run build`.

### Verificar Node Version

Asegúrate de que Render esté usando Node.js 18 o superior:

1. Ve a **Settings → Environment**
2. Verifica **Node Version**: `22.16.0` o superior

---

## 📝 Notas

- **Root Directory** es CRÍTICO: debe ser `backend`, no `.` (raíz)
- El comando `nest` solo está disponible después de `npm install` en `backend/`
- `npx prisma generate` es necesario para generar el cliente de Prisma

---

## 🎯 Resumen

**El problema:** Render ejecuta el build desde la raíz, pero `nest` está en `backend/`

**La solución:** Configurar **Root Directory** como `backend` en Render

---

**Última actualización**: Diciembre 2025

