# 🚀 Guía de Integración de MercadoPago

## 📖 Documentación Disponible

He creado una guía completa paso a paso para integrar MercadoPago:

### 📄 Archivos de Documentación:

1. **`docs/GUIA_INTEGRACION_MERCADOPAGO.md`** ⭐
   - Guía completa paso a paso
   - Desde crear cuenta hasta producción
   - Incluye troubleshooting

2. **`docs/RESUMEN_INTEGRACION_MERCADOPAGO.md`**
   - Resumen rápido
   - Checklist
   - Referencias rápidas

3. **`docs/MERCADOPAGO_SETUP.md`**
   - Configuración técnica detallada
   - Variables de entorno
   - Ejemplos de código

4. **`docs/ARQUITECTURA_PAGOS.md`**
   - Arquitectura Webhooks + WebSockets
   - Flujos de datos
   - Decisiones técnicas

## 🎯 Inicio Rápido

### Paso 1: Obtener Access Token

1. Ve a: https://www.mercadopago.com.mx/developers/panel
2. Crea una aplicación
3. Copia el Access Token de prueba

### Paso 2: Configurar Variables

Edita `backend/.env`:

```env
MERCADOPAGO_ACCESS_TOKEN=TEST-tu_token_aqui
BACKEND_URL=http://localhost:4000
FRONTEND_URL=http://localhost:3000
```

### Paso 3: Reiniciar Backend

```bash
cd backend
pnpm run start:dev
```

### Paso 4: Verificar

Deberías ver en los logs:

```
✅ MercadoPago inicializado
```

## 📋 Próximos Pasos

1. Lee la guía completa: `docs/GUIA_INTEGRACION_MERCADOPAGO.md`
2. Configura el webhook (usa ngrok para desarrollo)
3. Prueba con tarjetas de prueba
4. Integra en el frontend usando `useMercadoPago`

## 🆘 ¿Necesitas Ayuda?

Revisa la sección de Troubleshooting en la guía completa.

¡Éxito con tu integración! 🎉
