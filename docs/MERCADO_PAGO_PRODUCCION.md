# 🚀 Mercado Pago en Producción - Guía Completa

## ✅ Sí, puedes usar Mercado Pago en producción

Tu arquitectura puede ser:
- **Frontend:** Vercel (`https://v0-ministerio-amva.vercel.app`)
- **Backend:** Render o Vercel
- **Base de Datos:** Render (PostgreSQL) o Neon (que ya tienes)
- **Mercado Pago:** Modo Producción

---

## 📋 Paso 1: Obtener Credenciales de Producción de Mercado Pago

1. Ve a: https://www.mercadopago.com.ar/developers/panel
2. Selecciona tu aplicación
3. Ve a **"Credenciales"**
4. Busca las credenciales de **PRODUCCIÓN** (no TEST):
   - **Access Token** (`PROD-xxxxx`) ← IMPORTANTE: debe empezar con `PROD-`
   - **Public Key** (si la necesitas en el futuro)

⚠️ **IMPORTANTE:**
- NO uses las credenciales de TEST en producción
- Las credenciales de PRODUCCIÓN son diferentes a las de TEST
- Guarda estas credenciales de forma segura

---

## 📋 Paso 2: Configurar Variables de Entorno en Producción

### Backend (Render o Vercel)

```env
# Mercado Pago - PRODUCCIÓN
MERCADO_PAGO_ACCESS_TOKEN=PROD-tu-token-de-produccion-aqui
MERCADO_PAGO_TEST_MODE=false

# URLs
FRONTEND_URL=https://v0-ministerio-amva.vercel.app
BACKEND_URL=https://tu-backend.render.com
# O si está en Vercel:
# BACKEND_URL=https://v0-ministerio-amva.vercel.app

# Base de Datos
DATABASE_URL=postgresql://user:password@host.render.com:5432/dbname
# O si usas Neon:
# DATABASE_URL=postgresql://neondb_owner:npg_XXX@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require

# JWT
JWT_SECRET=tu-clave-secreta-super-segura-minimo-32-caracteres
JWT_EXPIRES_IN=7d

# Otros
PORT=4000
NODE_ENV=production
```

### Frontend (Vercel)

```env
# URLs
NEXT_PUBLIC_SITE_URL=https://v0-ministerio-amva.vercel.app
NEXT_PUBLIC_API_URL=https://tu-backend.render.com/api
# O si está en Vercel:
# NEXT_PUBLIC_API_URL=https://v0-ministerio-amva.vercel.app/api

# Base de Datos (si Next.js necesita acceso directo)
DATABASE_URL=postgresql://user:password@host.render.com:5432/dbname
```

---

## 📋 Paso 3: Configurar Webhook en Modo Productivo

1. Ve a Mercado Pago → Panel → **Webhooks**
2. Cambia a la pestaña **"Modo productivo"**
3. Configura la URL:
   ```
   https://tu-backend.render.com/api/mercado-pago/webhook
   ```
   (O `https://v0-ministerio-amva.vercel.app/api/mercado-pago/webhook` si está en Vercel)
4. Selecciona el evento: **"Pagos"**
5. Guarda

---

## 📋 Paso 4: Base de Datos en Render (Opcional)

Si quieres usar Render para la base de datos:

1. Ve a Render: https://render.com
2. Crea un nuevo **"PostgreSQL"** database
3. Render te dará una URL de conexión:
   ```
   postgresql://user:password@host.render.com:5432/dbname
   ```
4. Actualiza `DATABASE_URL` en tu backend

⚠️ **NOTA:** Ya tienes Neon configurado, puedes seguir usándolo. Render es una alternativa, pero Neon también funciona bien.

### Migrar desde Neon a Render (si lo necesitas)

1. Exporta los datos de Neon:
   ```bash
   pg_dump -h ep-xxx.us-east-1.aws.neon.tech -U neondb_owner -d neondb > backup.sql
   ```

2. Importa a Render:
   ```bash
   psql -h host.render.com -U user -d dbname < backup.sql
   ```

---

## 📋 Paso 5: Backend en Render (Opcional)

Si quieres deployar el backend en Render:

1. Ve a Render: https://render.com
2. Crea un nuevo **"Web Service"**
3. Conecta tu repositorio de GitHub
4. Configura:
   - **Build Command:** `cd backend && npm install && npm run build`
   - **Start Command:** `cd backend && npm run start:prod`
   - **Environment:** Node
5. Agrega todas las variables de entorno
6. Render asignará una URL: `https://tu-backend.onrender.com`

### Configuración de Render para NestJS

**Build Command:**
```bash
cd backend && npm install && npm run build
```

**Start Command:**
```bash
cd backend && npm run start:prod
```

**Environment Variables:**
- Todas las variables del backend (ver Paso 2)

---

## ✅ Checklist para Producción

### Antes de pasar a producción:

- [ ] Obtener credenciales de PRODUCCIÓN de Mercado Pago (`PROD-xxxxx`)
- [ ] Cambiar `MERCADO_PAGO_TEST_MODE=false`
- [ ] Cambiar `MERCADO_PAGO_ACCESS_TOKEN` a credenciales de producción
- [ ] Configurar webhook en modo productivo
- [ ] Actualizar `FRONTEND_URL` con dominio de producción
- [ ] Actualizar `BACKEND_URL` con dominio de producción
- [ ] Verificar que `DATABASE_URL` esté configurado
- [ ] Verificar que `JWT_SECRET` sea seguro (mínimo 32 caracteres)
- [ ] Probar un pago pequeño en producción
- [ ] Verificar que el webhook funcione
- [ ] Verificar que los emails se envían correctamente
- [ ] Configurar monitoreo y alertas
- [ ] Revisar logs regularmente

---

## ⚠️ Diferencias entre TEST y Producción

### TEST (Desarrollo):
- Access Token: `TEST-xxxxx`
- `TEST_MODE=true`
- Pagos ficticios
- No se cobra dinero real
- Webhook en modo prueba

### PRODUCCIÓN:
- Access Token: `PROD-xxxxx`
- `TEST_MODE=false`
- Pagos reales
- Se cobra dinero real ⚠️
- Webhook en modo productivo

---

## 🔒 Seguridad en Producción

1. **NUNCA** expongas tus credenciales de producción
2. Usa variables de entorno, nunca hardcodees
3. Verifica que `JWT_SECRET` sea largo y seguro (mínimo 32 caracteres)
4. Habilita HTTPS (Vercel y Render lo hacen automáticamente)
5. Configura CORS correctamente
6. Revisa los logs regularmente
7. Implementa rate limiting
8. Usa secretos gestionados (Vercel Secrets, Render Secrets)

---

## 📊 Arquitectura Recomendada

### Opción 1: Todo en Vercel (Más Simple)
```
Frontend: Vercel
Backend: Vercel (API Routes o Serverless Functions)
Base de Datos: Neon (que ya tienes)
Mercado Pago: Producción
```

### Opción 2: Separado (Más Escalable)
```
Frontend: Vercel
Backend: Render
Base de Datos: Render PostgreSQL o Neon
Mercado Pago: Producción
```

### Opción 3: Híbrido
```
Frontend: Vercel
Backend: Vercel
Base de Datos: Render PostgreSQL
Mercado Pago: Producción
```

---

## 🧪 Probar en Producción

### Antes de hacer pagos reales:

1. **Prueba con montos pequeños:**
   - Haz un pago de prueba con un monto mínimo
   - Verifica que se procese correctamente
   - Verifica que el webhook funcione
   - Verifica que los emails se envíen

2. **Verifica el flujo completo:**
   - Usuario se inscribe
   - Usuario hace clic en "Pagar con Mercado Pago"
   - Usuario completa el pago
   - Webhook actualiza el estado
   - Email de confirmación se envía
   - Admin ve el pago en el panel

3. **Monitorea los logs:**
   - Revisa los logs de Vercel/Render
   - Verifica que no haya errores
   - Verifica que los webhooks lleguen correctamente

---

## 📝 Resumen

✅ **SÍ puedes usar Mercado Pago en producción**
✅ Puedes usar Render para base de datos o backend
✅ Puedes mantener Vercel para el frontend
✅ Necesitas cambiar de TEST a PRODUCCIÓN en Mercado Pago
✅ Necesitas configurar el webhook en modo productivo
✅ Necesitas credenciales de producción (`PROD-xxxxx`)

---

## 🆘 Soporte

Si tienes problemas:
1. Verifica que todas las variables estén configuradas
2. Verifica que uses credenciales de PRODUCCIÓN (no TEST)
3. Verifica que el webhook esté en modo productivo
4. Revisa los logs de Vercel/Render
5. Revisa el historial de webhooks en Mercado Pago

---

## 📚 Recursos

- [Mercado Pago Developers](https://www.mercadopago.com.ar/developers)
- [Render Documentation](https://render.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [Neon Documentation](https://neon.tech/docs)





















