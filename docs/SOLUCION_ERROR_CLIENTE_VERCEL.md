# 🔧 Solución: Error de Aplicación del Lado del Cliente en Vercel

## 📋 Problema

Error al cargar la aplicación en Vercel:
```
Application error: a client-side exception has occurred while loading v0-ministerio-amva.vercel.app
```

## 🔍 Causas Comunes

### 1. **ReactQueryDevtools en Producción**
- `ReactQueryDevtools` puede causar errores en producción
- Solo debe cargarse en desarrollo

### 2. **Variables de Entorno Faltantes**
- `NEXT_PUBLIC_API_URL` no configurada en Vercel
- `NEXT_PUBLIC_SITE_URL` no configurada

### 3. **Errores de Hidratación**
- Diferencias entre servidor y cliente
- Uso de `window` o `localStorage` durante SSR

### 4. **Errores en Componentes**
- Componentes que fallan al cargar
- Imports faltantes o incorrectos

## ✅ Soluciones Aplicadas

### 1. QueryProvider Mejorado

**Cambios:**
- ✅ `ReactQueryDevtools` solo se carga en desarrollo
- ✅ Manejo de errores en queries y mutations
- ✅ Try/catch para importación de devtools

### 2. Manejo de Errores en HomePage

**Cambios:**
- ✅ Try/catch en `restoreScrollPosition`
- ✅ Verificación de `typeof window !== 'undefined'`
- ✅ Event listeners con cleanup
- ✅ Error boundaries para capturar errores

### 3. Verificación de Variables de Entorno

**Verificar en Vercel:**
1. Ve a **Vercel Dashboard** → Tu Proyecto → **Settings** → **Environment Variables**
2. Verifica que tengas:
   - `NEXT_PUBLIC_API_URL` = URL de tu backend (ej: `https://tu-backend.render.com/api`)
   - `NEXT_PUBLIC_SITE_URL` = URL de tu frontend (ej: `https://v0-ministerio-amva.vercel.app`)

## 🔍 Diagnóstico

### Paso 1: Verificar Logs de Vercel

1. Ve a **Vercel Dashboard** → Tu Proyecto → **Deployments**
2. Haz clic en el deployment más reciente
3. Revisa los **Build Logs** y **Runtime Logs**
4. Busca errores específicos

### Paso 2: Verificar Variables de Entorno

```bash
# En Vercel Dashboard → Settings → Environment Variables
# Debe tener:
NEXT_PUBLIC_API_URL=https://tu-backend.render.com/api
NEXT_PUBLIC_SITE_URL=https://v0-ministerio-amva.vercel.app
```

### Paso 3: Verificar Consola del Navegador

1. Abre la aplicación en el navegador
2. Abre **DevTools** (F12)
3. Ve a la pestaña **Console**
4. Busca errores específicos

### Paso 4: Verificar Network

1. En **DevTools**, ve a la pestaña **Network**
2. Busca requests que fallen (rojos)
3. Verifica que `NEXT_PUBLIC_API_URL` esté configurada correctamente

## 🛠️ Soluciones Adicionales

### Si el Error Persiste

1. **Limpiar Build Cache:**
   - Vercel Dashboard → Settings → General
   - Haz clic en "Clear Build Cache"
   - Redeploy

2. **Verificar Dependencias:**
   ```bash
   npm install
   npm run build
   ```

3. **Verificar TypeScript:**
   ```bash
   npm run build
   # Si hay errores, corregirlos
   ```

4. **Verificar Next.js Config:**
   - `next.config.mjs` debe tener `ignoreBuildErrors: true` temporalmente
   - O corregir todos los errores de TypeScript

## 📊 Checklist de Verificación

- [ ] Variables de entorno configuradas en Vercel
- [ ] `NEXT_PUBLIC_API_URL` apunta al backend correcto
- [ ] `NEXT_PUBLIC_SITE_URL` apunta al frontend correcto
- [ ] Build exitoso en Vercel (verificar logs)
- [ ] No hay errores en la consola del navegador
- [ ] Backend está funcionando y accesible
- [ ] CORS configurado correctamente en el backend

## 🎯 Solución Rápida

1. **Verificar Variables de Entorno en Vercel:**
   ```
   NEXT_PUBLIC_API_URL=https://tu-backend.render.com/api
   NEXT_PUBLIC_SITE_URL=https://v0-ministerio-amva.vercel.app
   ```

2. **Redeploy:**
   - Vercel Dashboard → Deployments
   - Haz clic en "Redeploy" en el último deployment

3. **Verificar Logs:**
   - Revisa los logs del deployment
   - Busca errores específicos

## 🔍 Errores Comunes y Soluciones

### Error: "Cannot read property of undefined"
- **Causa:** Variable de entorno no configurada
- **Solución:** Agregar `NEXT_PUBLIC_API_URL` en Vercel

### Error: "Network Error" o "CORS Error"
- **Causa:** Backend no accesible o CORS mal configurado
- **Solución:** Verificar que el backend esté funcionando y CORS permita el dominio de Vercel

### Error: "Hydration Error"
- **Causa:** Diferencias entre servidor y cliente
- **Solución:** Usar `suppressHydrationWarning` o verificar uso de `window`/`localStorage`

### Error: "Module not found"
- **Causa:** Dependencia faltante o import incorrecto
- **Solución:** Verificar `package.json` y reinstalar dependencias

---

**Última actualización:** Diciembre 2025

