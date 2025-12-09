# ✅ Checklist para Producción - Mercado Pago

Checklist completo para llevar el sistema a producción con Mercado Pago funcionando.

---

## 🔑 1. Credenciales de Mercado Pago (CRÍTICO)

### ✅ Obtener Credenciales de Producción

- [ ] Ir a: https://www.mercadopago.com.ar/developers/panel
- [ ] Seleccionar tu aplicación
- [ ] Ir a la pestaña **"Credenciales"**
- [ ] Copiar el **Access Token de PRODUCCIÓN** (debe empezar con `PROD-`)
- [ ] **NO usar** el Access Token de TEST (`TEST-...`)

### ⚠️ IMPORTANTE
- El token de producción es diferente al de test
- El token de producción debe empezar con `PROD-`
- Guarda estas credenciales de forma segura

---

## 🌐 2. Variables de Entorno en Producción

### Backend (Render/Railway/Vercel)

#### Variables OBLIGATORIAS:

```env
# ============================================
# MERCADO PAGO - PRODUCCIÓN (CRÍTICO)
# ============================================
MERCADO_PAGO_ACCESS_TOKEN=PROD-tu-token-de-produccion-aqui
MERCADO_PAGO_TEST_MODE=false

# ============================================
# URLs - PRODUCCIÓN (CRÍTICO)
# ============================================
FRONTEND_URL=https://v0-ministerio-amva.vercel.app
BACKEND_URL=https://tu-backend.onrender.com
# O si está en Vercel:
# BACKEND_URL=https://v0-ministerio-amva.vercel.app

# ============================================
# BASE DE DATOS
# ============================================
DATABASE_URL=postgresql://usuario:password@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require

# ============================================
# JWT - SEGURIDAD
# ============================================
JWT_SECRET=tu-clave-secreta-super-segura-minimo-32-caracteres
JWT_EXPIRES_IN=7d

# ============================================
# ENTORNO
# ============================================
NODE_ENV=production
PORT=4000

# ============================================
# EMAIL (SendGrid o Gmail)
# ============================================
SENDGRID_API_KEY=tu-api-key-de-sendgrid
EMAIL_FROM=noreply@amvadigital.com

# ============================================
# CLOUDINARY (Opcional)
# ============================================
CLOUDINARY_CLOUD_NAME=tu-cloud-name
CLOUDINARY_API_KEY=tu-api-key
CLOUDINARY_API_SECRET=tu-api-secret

# ============================================
# REDIS (Para colas de notificaciones)
# ============================================
REDIS_URL=redis://default:password@host:port
```

### Frontend (Vercel)

```env
# ============================================
# URLs
# ============================================
NEXT_PUBLIC_SITE_URL=https://v0-ministerio-amva.vercel.app
NEXT_PUBLIC_API_URL=https://tu-backend.onrender.com/api
# O si está en Vercel:
# NEXT_PUBLIC_API_URL=https://v0-ministerio-amva.vercel.app/api

# ============================================
# BASE DE DATOS (Si Next.js necesita acceso)
# ============================================
DATABASE_URL=postgresql://usuario:password@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require
```

### ✅ Checklist de Variables

- [ ] `MERCADO_PAGO_ACCESS_TOKEN` empieza con `PROD-` (no `TEST-`)
- [ ] `MERCADO_PAGO_TEST_MODE=false` (no `true`)
- [ ] `FRONTEND_URL` es una URL de producción (no `localhost`)
- [ ] `FRONTEND_URL` usa HTTPS (no HTTP)
- [ ] `BACKEND_URL` es una URL de producción (no `localhost`)
- [ ] `BACKEND_URL` usa HTTPS (no HTTP)
- [ ] `DATABASE_URL` está configurado
- [ ] `JWT_SECRET` tiene al menos 32 caracteres
- [ ] `NODE_ENV=production`

---

## 🔔 3. Configurar Webhook en Mercado Pago

### Paso 1: Acceder al Panel de Webhooks

- [ ] Ir a: https://www.mercadopago.com.ar/developers/panel
- [ ] Seleccionar tu aplicación
- [ ] Ir a la pestaña **"Webhooks"**
- [ ] Cambiar a **"Modo productivo"** (no modo prueba)

### Paso 2: Configurar URL del Webhook

- [ ] URL del webhook: `https://tu-backend.onrender.com/api/mercado-pago/webhook`
  - O si está en Vercel: `https://v0-ministerio-amva.vercel.app/api/mercado-pago/webhook`
- [ ] Evento: **"Pagos"** (payments)
- [ ] Guardar configuración

### Paso 3: Verificar Webhook

- [ ] Hacer un pago de prueba pequeño
- [ ] Verificar en los logs del backend que el webhook llegó
- [ ] Verificar en Mercado Pago → Webhooks → Historial que el webhook se envió

---

## 🗄️ 4. Base de Datos

### Opción A: Neon (Ya tienes)

- [ ] Verificar que `DATABASE_URL` de Neon esté configurado
- [ ] Ejecutar migraciones en producción:
  ```bash
  cd backend
  npx prisma migrate deploy
  ```
- [ ] Verificar que las tablas estén creadas

### Opción B: Render PostgreSQL (Alternativa)

- [ ] Crear base de datos en Render
- [ ] Copiar `DATABASE_URL` de Render
- [ ] Actualizar variable de entorno
- [ ] Ejecutar migraciones

---

## 🚀 5. Deployment

### Backend

#### Opción A: Render

- [ ] Crear nuevo Web Service en Render
- [ ] Conectar repositorio de GitHub
- [ ] Configurar:
  - **Root Directory:** `backend/`
  - **Build Command:** `cd backend && npm install && npm run build`
  - **Start Command:** `cd backend && npm run start:prod`
- [ ] Agregar todas las variables de entorno
- [ ] Deploy

#### Opción B: Railway

- [ ] Crear nuevo proyecto en Railway
- [ ] Conectar repositorio de GitHub
- [ ] Configurar:
  - **Root Directory:** `backend/`
  - **Start Command:** `cd backend && npm run start:prod`
- [ ] Agregar todas las variables de entorno
- [ ] Deploy

#### Opción C: Vercel

- [ ] Crear nuevo proyecto en Vercel
- [ ] Conectar repositorio de GitHub
- [ ] Configurar:
  - **Root Directory:** `backend/`
  - **Build Command:** `cd backend && npm install && npm run build`
  - **Output Directory:** `backend/dist`
- [ ] Agregar todas las variables de entorno
- [ ] Deploy

### Frontend

#### Vercel (Recomendado)

- [ ] Crear nuevo proyecto en Vercel
- [ ] Conectar repositorio de GitHub
- [ ] Configurar:
  - **Root Directory:** `.` (raíz del proyecto)
  - **Build Command:** `npm run build`
  - **Output Directory:** `.next`
- [ ] Agregar todas las variables de entorno
- [ ] Deploy

---

## ✅ 6. Verificaciones Post-Deployment

### Verificar Backend

- [ ] Backend responde en: `https://tu-backend.onrender.com/api`
- [ ] Endpoint de salud funciona: `GET /api/health` (si existe)
- [ ] Mercado Pago configurado: `GET /api/mercado-pago/status`
  - Debe retornar: `{"configured": true, "testMode": false}`
- [ ] Webhook endpoint disponible: `GET /api/mercado-pago/webhook`
  - Debe retornar información del endpoint

### Verificar Frontend

- [ ] Frontend carga correctamente
- [ ] Puede conectarse al backend
- [ ] Las páginas de pago funcionan
- [ ] Las redirecciones funcionan

### Verificar Mercado Pago

- [ ] Crear una preferencia de pago (pago pequeño de prueba)
- [ ] Verificar que la URL de checkout sea de producción (no sandbox)
- [ ] Completar el pago con una tarjeta real
- [ ] Verificar que el webhook llegue al backend
- [ ] Verificar que el estado del pago se actualice
- [ ] Verificar que se envíe el email de confirmación

---

## 🧪 7. Pruebas en Producción

### Prueba Completa del Flujo

- [ ] Usuario se inscribe desde el frontend
- [ ] Usuario hace clic en "Pagar con Mercado Pago"
- [ ] Se crea la preferencia correctamente
- [ ] Usuario es redirigido a Mercado Pago (producción)
- [ ] Usuario completa el pago con tarjeta real
- [ ] Mercado Pago redirige al frontend
- [ ] El webhook se procesa automáticamente
- [ ] El estado del pago se actualiza en la BD
- [ ] Se envía el email de confirmación
- [ ] El admin ve el pago en el panel

### Verificar Logs

- [ ] Revisar logs del backend después del pago
- [ ] Verificar que no haya errores
- [ ] Verificar que el webhook se procesó
- [ ] Verificar que el estado se actualizó

---

## 🔒 8. Seguridad

### Checklist de Seguridad

- [ ] `JWT_SECRET` tiene al menos 32 caracteres
- [ ] Todas las URLs usan HTTPS (no HTTP)
- [ ] No hay credenciales hardcodeadas en el código
- [ ] Variables de entorno están configuradas correctamente
- [ ] CORS está configurado correctamente
- [ ] Rate limiting está habilitado (si aplica)
- [ ] Logs no exponen información sensible

---

## 📊 9. Monitoreo

### Configurar Monitoreo

- [ ] Configurar alertas de errores (Sentry, LogRocket, etc.)
- [ ] Configurar monitoreo de uptime (UptimeRobot, etc.)
- [ ] Revisar logs regularmente
- [ ] Configurar alertas de webhooks fallidos

---

## 🐛 10. Troubleshooting

### Si el webhook no funciona:

1. Verificar que la URL del webhook sea correcta
2. Verificar que el webhook esté en modo productivo (no prueba)
3. Verificar los logs del backend
4. Verificar el historial de webhooks en Mercado Pago

### Si los pagos no se procesan:

1. Verificar que `MERCADO_PAGO_ACCESS_TOKEN` empiece con `PROD-`
2. Verificar que `MERCADO_PAGO_TEST_MODE=false`
3. Verificar que `FRONTEND_URL` y `BACKEND_URL` estén configurados
4. Verificar los logs del backend

### Si hay errores de validación:

1. Verificar que todas las variables de entorno estén configuradas
2. Verificar que las URLs sean válidas (HTTPS, no localhost)
3. Verificar los logs del backend para errores específicos

---

## 📝 Resumen

### ✅ Lo que YA está funcionando:

- ✅ Sistema de procesamiento automático de webhooks
- ✅ Detección de `preference_id` y `payment_id`
- ✅ Búsqueda de pagos por `external_reference`
- ✅ Actualización automática del estado
- ✅ Validaciones de producción
- ✅ Logging mejorado

### 🔧 Lo que FALTA hacer:

1. **Obtener credenciales de producción** de Mercado Pago
2. **Configurar variables de entorno** en producción
3. **Configurar webhook** en modo productivo
4. **Deployar backend y frontend** a producción
5. **Ejecutar migraciones** de base de datos
6. **Probar el flujo completo** con un pago real pequeño

---

## 🎯 Próximos Pasos

1. **Obtener credenciales de producción** de Mercado Pago
2. **Configurar variables de entorno** en tu plataforma de deployment
3. **Deployar backend y frontend**
4. **Configurar webhook** en Mercado Pago
5. **Probar con un pago pequeño** de prueba
6. **Verificar que todo funcione** correctamente

---

**Última actualización**: Diciembre 2025

