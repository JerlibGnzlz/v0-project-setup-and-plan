# 🔑 Cómo Obtener las Credenciales de Mercado Pago

Guía paso a paso para obtener tus credenciales de Mercado Pago.

---

## 📋 ¿Qué son las Credenciales?

Las credenciales de Mercado Pago son tokens que te permiten conectarte a su API. Hay dos tipos:

1. **Access Token** - Token de acceso (el más importante)
2. **Public Key** - Clave pública (opcional, para algunos casos)

---

## 🔍 El ID que tienes

El ID `662820140-b970bc51-3d8a-4542-a6fb-c44e688ac7ff` parece ser:
- Un **ID de preferencia de pago** (preference_id)
- O un **ID de pago** (payment_id)

**NO es una credencial**, es un identificador de una transacción.

---

## ✅ Cómo Obtener las Credenciales Reales

### Paso 1: Acceder al Panel de Desarrolladores

1. Ve a: **https://www.mercadopago.com.ar/developers/panel**
2. Inicia sesión con tu cuenta de Mercado Pago
3. Si no tienes cuenta, créala en: https://www.mercadopago.com.ar

### Paso 2: Seleccionar o Crear una Aplicación

1. En el panel, verás tus aplicaciones
2. Si no tienes una, haz clic en **"Crear aplicación"**
3. Completa el formulario:
   - **Nombre**: Ej: "AMVA Digital"
   - **Plataforma**: Web
   - **URL de producción**: Tu dominio (ej: `https://tu-dominio.vercel.app`)

### Paso 3: Obtener las Credenciales

1. Selecciona tu aplicación
2. Ve a la pestaña **"Credenciales"**
3. Verás dos secciones:

#### 🔵 Credenciales de Prueba (TEST)

```
Access Token: TEST-7464800925234011-120223-7d02abc7c21fe1264a3b62e4b0f84d83-662820140
Public Key: TEST-7299266230372562-120223-...
```

**Características:**
- Empiezan con `TEST-`
- Para desarrollo y pruebas
- No cobran dinero real
- Pagos ficticios

#### 🟢 Credenciales de Producción (PROD)

```
Access Token: PROD-APP_USR-7299266230372562-120916-1b829600b47a4de8b95de881fbf8d71a-662820140
Public Key: APP_USR-7299266230372562-120916-...
```

**Características:**
- Empiezan con `PROD-` o `APP_USR-`
- Para producción
- Cobran dinero real ⚠️
- Pagos reales

---

## ⚙️ Configurar en tu Proyecto

### Para Desarrollo (TEST)

En tu archivo `backend/.env`:

```env
MERCADO_PAGO_ACCESS_TOKEN=TEST-7464800925234011-120223-7d02abc7c21fe1264a3b62e4b0f84d83-662820140
MERCADO_PAGO_TEST_MODE=true
NODE_ENV=development
```

### Para Producción (PROD)

En tu plataforma de deployment (Railway/Render):

```env
MERCADO_PAGO_ACCESS_TOKEN=PROD-APP_USR-7299266230372562-120916-1b829600b47a4de8b95de881fbf8d71a-662820140
MERCADO_PAGO_TEST_MODE=false
NODE_ENV=production
FRONTEND_URL=https://tu-dominio.vercel.app
BACKEND_URL=https://tu-backend.railway.app
```

---

## 🔍 Verificar tus Credenciales Actuales

Puedes verificar qué credenciales tienes configuradas:

```bash
# Verificar estado de Mercado Pago
curl http://localhost:4000/api/mercado-pago/status
```

Respuesta:
```json
{
  "configured": true,
  "testMode": true
}
```

---

## ⚠️ Diferencias Importantes

| Tipo | Formato | Uso | Dinero Real |
|------|---------|-----|-------------|
| **TEST** | `TEST-xxxxx` | Desarrollo | ❌ No |
| **PROD** | `PROD-xxxxx` o `APP_USR-xxxxx` | Producción | ✅ Sí |

---

## 🆘 Problemas Comunes

### "No encuentro las credenciales"

**Solución:**
1. Asegúrate de estar en la pestaña correcta: **"Credenciales"**
2. Verifica que hayas creado una aplicación
3. Busca las secciones "Credenciales de prueba" y "Credenciales de producción"

### "Las credenciales no funcionan"

**Solución:**
1. Verifica que copiaste el token completo (son muy largos)
2. Asegúrate de que no haya espacios al inicio o final
3. Verifica que uses el token correcto (TEST para desarrollo, PROD para producción)

### "¿Dónde está el Public Key?"

**Solución:**
- El Public Key es opcional
- Solo necesitas el **Access Token** para la mayoría de casos
- Si necesitas Public Key, está en la misma sección de credenciales

---

## 📝 Resumen

1. **Ve a**: https://www.mercadopago.com.ar/developers/panel
2. **Selecciona** tu aplicación (o créala)
3. **Ve a** la pestaña "Credenciales"
4. **Copia** el Access Token (TEST- o PROD-)
5. **Configura** en tu `.env` o plataforma de deployment

---

## 🔗 Recursos

- [Panel de Desarrolladores](https://www.mercadopago.com.ar/developers/panel)
- [Documentación de Mercado Pago](https://www.mercadopago.com.ar/developers/es/docs)
- [Guía de Credenciales](./MERCADO_PAGO_CREDENCIALES.md)

---

**Última actualización**: Diciembre 2025
**Versión del proyecto**: v0.1.1

