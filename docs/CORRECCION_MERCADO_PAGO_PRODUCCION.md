# 🔧 Corrección de Problemas de Mercado Pago en Producción

Este documento explica los problemas encontrados en el commit `a8256c8` y las correcciones aplicadas.

---

## 🐛 Problemas Identificados

### 1. Lógica de Detección de Modo TEST vs PRODUCCIÓN Incorrecta

**Problema Original:**
```typescript
this.isTestMode = process.env.MERCADO_PAGO_TEST_MODE === 'true' || !this.accessToken
```

**Problemas:**
- No detecta automáticamente si el token es de TEST (`TEST-`) o PRODUCCIÓN (`PROD-`)
- Si `MERCADO_PAGO_TEST_MODE` no está configurado, asume TEST incluso con token de PRODUCCIÓN
- No valida que en producción se use un token de PRODUCCIÓN

**Solución Aplicada:**
```typescript
// Determinar modo basado en el token y la variable de entorno
if (!this.accessToken) {
    this.isTestMode = true // Por defecto TEST si no hay token
} else if (this.accessToken.startsWith('TEST-')) {
    this.isTestMode = true
} else if (this.accessToken.startsWith('PROD-')) {
    // En producción, verificar que MERCADO_PAGO_TEST_MODE no sea 'true'
    this.isTestMode = process.env.MERCADO_PAGO_TEST_MODE === 'true'
} else {
    // Token con formato desconocido, usar MERCADO_PAGO_TEST_MODE o asumir TEST
    this.isTestMode = process.env.MERCADO_PAGO_TEST_MODE !== 'false'
}

// Validación crítica en producción
if (process.env.NODE_ENV === 'production' && this.accessToken.startsWith('TEST-')) {
    this.logger.error('❌ ERROR CRÍTICO: Usando token de TEST en producción!')
    throw new Error('MERCADO_PAGO_ACCESS_TOKEN de TEST no puede usarse en producción')
}
```

### 2. Falta de Validación de URLs en Producción

**Problema Original:**
```typescript
const baseUrl = (process.env.FRONTEND_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').trim()
const backendUrl = (process.env.BACKEND_URL || 'http://localhost:4000').trim()
```

**Problemas:**
- Permite localhost en producción
- No valida que FRONTEND_URL esté configurado en producción
- No advierte sobre uso de HTTP en lugar de HTTPS

**Solución Aplicada:**
```typescript
// Validación crítica en producción
if (process.env.NODE_ENV === 'production') {
    if (!process.env.FRONTEND_URL) {
        this.logger.error('❌ ERROR: FRONTEND_URL no está configurado en producción')
        throw new BadRequestException('FRONTEND_URL debe estar configurado en producción')
    }
    if (baseUrl.includes('localhost') || baseUrl.includes('127.0.0.1')) {
        this.logger.error('❌ ERROR: FRONTEND_URL no puede ser localhost en producción')
        throw new BadRequestException('FRONTEND_URL no puede ser localhost en producción')
    }
    if (!baseUrl.startsWith('https://')) {
        this.logger.warn('⚠️ ADVERTENCIA: FRONTEND_URL debería usar HTTPS en producción')
    }
}
```

---

## ✅ Correcciones Aplicadas

### Archivo Modificado
- `backend/src/modules/mercado-pago/mercado-pago.service.ts`

### Cambios Realizados

1. **Detección Automática de Modo:**
   - Detecta automáticamente si el token es TEST o PRODUCCIÓN
   - Valida que en producción no se use token de TEST
   - Mejora el logging para debugging

2. **Validación de URLs:**
   - Rechaza localhost en producción
   - Requiere FRONTEND_URL en producción
   - Advierte sobre uso de HTTP en lugar de HTTPS

3. **Mejor Logging:**
   - Muestra información del token (sin exponerlo completo)
   - Logs más descriptivos para debugging

---

## 🔍 Cómo Verificar que Funciona

### 1. Verificar Variables de Entorno

En producción, asegúrate de tener:

```env
# Token de PRODUCCIÓN (debe empezar con PROD-)
MERCADO_PAGO_ACCESS_TOKEN=PROD-tu-token-de-produccion-aqui

# Modo TEST debe ser false
MERCADO_PAGO_TEST_MODE=false

# URLs de producción (sin localhost)
FRONTEND_URL=https://tu-dominio.vercel.app
BACKEND_URL=https://tu-backend.railway.app
NODE_ENV=production
```

### 2. Verificar Logs al Iniciar

Al iniciar el backend, deberías ver:

```
✅ Mercado Pago inicializado (modo: PRODUCCIÓN)
   Token: PROD-12345... (150 caracteres)
```

Si ves `(modo: TEST)` en producción, hay un problema de configuración.

### 3. Probar Creación de Preferencia

Al crear una preferencia de pago, verifica que:
- No aparezcan errores sobre localhost
- Las URLs sean HTTPS
- El modo sea PRODUCCIÓN

---

## ⚠️ Errores Comunes y Soluciones

### Error: "Usando token de TEST en producción"

**Causa:** Tienes un token que empieza con `TEST-` en producción.

**Solución:**
1. Ve a https://www.mercadopago.com.ar/developers/panel
2. Obtén el token de PRODUCCIÓN (empieza con `PROD-`)
3. Actualiza `MERCADO_PAGO_ACCESS_TOKEN` en tu plataforma de deployment

### Error: "FRONTEND_URL no está configurado en producción"

**Causa:** La variable `FRONTEND_URL` no está configurada.

**Solución:**
1. Agrega `FRONTEND_URL` en Railway/Render
2. Usa la URL completa de tu frontend (ej: `https://tu-proyecto.vercel.app`)
3. Asegúrate de que no termine en `/`

### Error: "FRONTEND_URL no puede ser localhost en producción"

**Causa:** `FRONTEND_URL` está configurado como `http://localhost:3000`.

**Solución:**
1. Cambia `FRONTEND_URL` a la URL de producción
2. Usa HTTPS (ej: `https://tu-proyecto.vercel.app`)

### El modo sigue siendo TEST en producción

**Causa:** `MERCADO_PAGO_TEST_MODE=true` o el token no empieza con `PROD-`.

**Solución:**
1. Verifica que `MERCADO_PAGO_TEST_MODE=false`
2. Verifica que el token empiece con `PROD-`
3. Reinicia el servicio después de cambiar las variables

---

## 📋 Checklist de Verificación

Antes de usar Mercado Pago en producción, verifica:

- [ ] `MERCADO_PAGO_ACCESS_TOKEN` empieza con `PROD-`
- [ ] `MERCADO_PAGO_TEST_MODE=false`
- [ ] `FRONTEND_URL` está configurado (sin localhost)
- [ ] `FRONTEND_URL` usa HTTPS
- [ ] `NODE_ENV=production`
- [ ] Los logs muestran `(modo: PRODUCCIÓN)`
- [ ] El webhook está configurado en Mercado Pago (modo productivo)

---

## 🔄 Próximos Pasos

1. **Probar en Producción:**
   - Haz un pago de prueba con monto mínimo
   - Verifica que se procese correctamente
   - Verifica que el webhook funcione

2. **Monitorear Logs:**
   - Revisa los logs del backend
   - Verifica que no haya errores
   - Verifica que los webhooks lleguen correctamente

3. **Configurar Webhook:**
   - Ve a Mercado Pago → Panel → Webhooks
   - Configura la URL: `https://tu-backend.railway.app/api/mercado-pago/webhook`
   - Selecciona el evento "Pagos"
   - Asegúrate de estar en modo productivo

---

## 📚 Recursos

- [Guía de Credenciales de Mercado Pago](./MERCADO_PAGO_CREDENCIALES.md)
- [Guía de Producción de Mercado Pago](./MERCADO_PAGO_PRODUCCION.md)
- [Panel de Desarrolladores de Mercado Pago](https://www.mercadopago.com.ar/developers/panel)

---

**Última actualización**: Diciembre 2025
**Versión del proyecto**: v0.1.1

