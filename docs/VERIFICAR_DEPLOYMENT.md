# 🔍 Verificar Deployment Completo

Guía para verificar que Render (Backend) y Vercel (Frontend) estén correctamente conectados.

---

## 🚀 Verificación Rápida

### Script Automático

```bash
# Configurar URLs (opcional, usa valores por defecto si no se configuran)
export BACKEND_URL="https://tu-backend.onrender.com"
export FRONTEND_URL="https://v0-ministerio-amva.vercel.app"

# Ejecutar verificación
scripts/verificar-deployment-completo.sh
```

---

## 📋 Verificación Manual

### 1. Backend (Render)

#### Verificar que está online:

```bash
curl https://tu-backend.onrender.com/api
```

**Resultado esperado:** Debe responder (puede ser 404, pero debe responder)

#### Verificar Mercado Pago:

```bash
curl https://tu-backend.onrender.com/api/mercado-pago/status
```

**Resultado esperado:**
```json
{
  "configured": true,
  "testMode": false
}
```

#### Verificar Webhook:

```bash
curl https://tu-backend.onrender.com/api/mercado-pago/webhook
```

**Resultado esperado:** Información del endpoint de webhook

---

### 2. Frontend (Vercel)

#### Verificar que está online:

```bash
curl https://v0-ministerio-amva.vercel.app
```

**Resultado esperado:** Debe retornar HTML (código 200)

#### Verificar en el navegador:

1. Abre: https://v0-ministerio-amva.vercel.app
2. Debe cargar la página sin errores
3. Abre la consola del navegador (F12)
4. No debe haber errores de conexión al backend

---

### 3. Conexión Frontend ↔ Backend

#### Verificar que el frontend puede conectarse al backend:

1. Abre el frontend en el navegador
2. Abre la consola del navegador (F12)
3. Ve a la pestaña **Network**
4. Intenta hacer login o cualquier acción que llame al backend
5. Verifica que las requests lleguen al backend correcto

**URL esperada de las requests:**
```
https://tu-backend.onrender.com/api/...
```

**NO debe ser:**
```
http://localhost:4000/api/...
```

---

## ⚙️ Variables de Entorno a Verificar

### Backend (Render)

Ve a **Render Dashboard** → **Tu Servicio** → **Environment** y verifica:

```env
# ✅ OBLIGATORIAS
DATABASE_URL=postgresql://... (Neon o Render)
MERCADO_PAGO_ACCESS_TOKEN=PROD-... (no TEST-)
MERCADO_PAGO_TEST_MODE=false
FRONTEND_URL=https://v0-ministerio-amva.vercel.app
BACKEND_URL=https://tu-backend.onrender.com
JWT_SECRET=... (mínimo 32 caracteres)
NODE_ENV=production
PORT=4000

# ✅ OPCIONALES (pero recomendadas)
SENDGRID_API_KEY=...
EMAIL_FROM=...
REDIS_URL=...
```

### Frontend (Vercel)

Ve a **Vercel Dashboard** → **Tu Proyecto** → **Settings** → **Environment Variables** y verifica:

```env
# ✅ OBLIGATORIAS
NEXT_PUBLIC_API_URL=https://tu-backend.onrender.com/api
NEXT_PUBLIC_SITE_URL=https://v0-ministerio-amva.vercel.app

# ✅ OPCIONALES
DATABASE_URL=postgresql://... (si Next.js necesita acceso directo)
```

---

## 🔍 Checklist de Verificación

### Backend (Render)

- [ ] Servicio está "Live" en Render Dashboard
- [ ] Responde en: `https://tu-backend.onrender.com/api`
- [ ] Mercado Pago configurado: `GET /api/mercado-pago/status` retorna `{"configured": true, "testMode": false}`
- [ ] Webhook endpoint disponible: `GET /api/mercado-pago/webhook` responde
- [ ] Variables de entorno configuradas correctamente
- [ ] Root Directory configurado como `backend`
- [ ] Build Command correcto
- [ ] Start Command correcto

### Frontend (Vercel)

- [ ] Proyecto está deployado en Vercel
- [ ] Responde en: `https://v0-ministerio-amva.vercel.app`
- [ ] No hay errores en la consola del navegador
- [ ] Variables de entorno configuradas correctamente
- [ ] `NEXT_PUBLIC_API_URL` apunta al backend correcto

### Conexión

- [ ] Frontend puede hacer requests al backend
- [ ] CORS configurado correctamente
- [ ] No hay errores de CORS en la consola
- [ ] Las requests llegan al backend correcto (no localhost)

---

## 🐛 Troubleshooting

### Backend no responde

1. **Verifica en Render Dashboard:**
   - ¿El servicio está "Live"?
   - ¿Hay errores en los logs?
   - ¿El build se completó correctamente?

2. **Verifica la configuración:**
   - Root Directory: `backend`
   - Build Command: `npm install --legacy-peer-deps && npm run build && npx prisma generate`
   - Start Command: `npm run start:prod`

3. **Revisa los logs:**
   - Ve a **Render Dashboard** → **Tu Servicio** → **Logs**
   - Busca errores de inicio

### Frontend no se conecta al backend

1. **Verifica `NEXT_PUBLIC_API_URL`:**
   ```bash
   # En Vercel, debe ser:
   NEXT_PUBLIC_API_URL=https://tu-backend.onrender.com/api
   ```

2. **Verifica en el navegador:**
   - Abre la consola (F12)
   - Ve a Network
   - Verifica que las requests vayan al backend correcto

3. **Verifica CORS:**
   - El backend debe permitir requests desde el frontend
   - Revisa `backend/src/main.ts` para configuración de CORS

### Mercado Pago no funciona

1. **Verifica credenciales:**
   ```bash
   curl https://tu-backend.onrender.com/api/mercado-pago/status
   ```
   - Debe retornar: `{"configured": true, "testMode": false}`

2. **Verifica variables de entorno:**
   - `MERCADO_PAGO_ACCESS_TOKEN` debe empezar con `PROD-`
   - `MERCADO_PAGO_TEST_MODE=false`

3. **Verifica webhook:**
   - Configurado en Mercado Pago (modo productivo)
   - URL: `https://tu-backend.onrender.com/api/mercado-pago/webhook`

---

## 📊 Ejemplo de Verificación Exitosa

```bash
$ scripts/verificar-deployment-completo.sh

🔍 VERIFICACIÓN DE DEPLOYMENT COMPLETO
======================================

📋 URLs configuradas:
   Backend (Render): https://tu-backend.onrender.com
   Frontend (Vercel): https://v0-ministerio-amva.vercel.app

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1️⃣  BACKEND (RENDER)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔍 Verificando Backend está online... ✅ PASS
🔍 Verificando Mercado Pago configurado... ✅ PASS
🔍 Verificando Webhook endpoint disponible... ✅ PASS
   ✅ Modo PRODUCCIÓN

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
2️⃣  FRONTEND (VERCEL)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔍 Verificando Frontend está online... ✅ PASS
🔍 Verificando conexión Frontend → Backend... ✅ Frontend carga correctamente

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
3️⃣  CONEXIÓN FRONTEND ↔ BACKEND
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔍 Verificando CORS... ✅ PASS

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 RESUMEN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Total de verificaciones: 6
✅ Exitosas: 6
❌ Fallidas: 0

✅ ¡Todo está funcionando correctamente!
```

---

## 🎯 Próximos Pasos

Una vez que todo esté verificado:

1. **Configurar webhook en Mercado Pago:**
   - URL: `https://tu-backend.onrender.com/api/mercado-pago/webhook`
   - Modo: Productivo

2. **Probar con un pago pequeño:**
   - Crear una preferencia
   - Completar el pago
   - Verificar que el webhook funcione

3. **Monitorear logs:**
   - Revisar logs de Render regularmente
   - Revisar logs de Vercel regularmente

---

**Última actualización**: Diciembre 2025

