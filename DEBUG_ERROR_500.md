# 🔍 Debug: Error 500 al Habilitar 2FA

## 📋 Pasos para Diagnosticar

### 1. Verificar Logs del Backend

Revisa la terminal donde corre el backend y busca el error específico. Deberías ver algo como:

```
[Nest] ERROR [TwoFactorService] ❌ Error habilitando 2FA: ...
```

**Comparte el error completo** que aparece en los logs.

---

### 2. Verificar que los Campos Existen en la BD

Ejecuta este SQL para verificar:

```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'users'
AND column_name IN ('two_factor_enabled', 'two_factor_secret');
```

**Si no aparecen resultados**, los campos no existen y necesitas ejecutar:

```sql
ALTER TABLE users
ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE users
ADD COLUMN IF NOT EXISTS two_factor_secret TEXT;
```

---

### 3. Verificar el Endpoint que Falla

El error puede estar en:

1. **`POST /api/auth/2fa/generate`** - Generar código QR
2. **`POST /api/auth/2fa/enable`** - Habilitar 2FA

**¿En cuál paso falla?**

- Al generar el QR → Problema con `generateSecret`
- Al habilitar → Problema con `enableTwoFactor`

---

### 4. Verificar la Consola del Navegador

Abre las DevTools (F12) → Pestaña "Network" → Busca la petición que falla → Ver la respuesta.

**¿Qué mensaje de error aparece en la respuesta?**

---

## 🔧 Soluciones Aplicadas

### 1. Manejo de Errores Mejorado

Ahora el backend:

- ✅ Detecta cuando los campos no existen
- ✅ Retorna código **400** (Bad Request) en lugar de 500
- ✅ Incluye instrucciones SQL en la respuesta

### 2. Mensajes Más Claros

El frontend ahora debería mostrar:

```
⚠️ Campos 2FA no configurados en la base de datos
Ejecuta el SQL en backend/scripts/agregar-campos-2fa.sql
```

---

## 🚀 Solución Rápida

### Opción 1: Agregar Campos a la BD (Recomendado)

```sql
ALTER TABLE users
ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE users
ADD COLUMN IF NOT EXISTS two_factor_secret TEXT;
```

### Opción 2: Verificar Logs

Comparte el error completo de los logs del backend para diagnosticar mejor.

---

## 📝 Información Necesaria

Para ayudarte mejor, comparte:

1. **Error completo de los logs del backend**
2. **¿En qué paso falla?** (generar QR o habilitar)
3. **¿Los campos existen en la BD?** (resultado del SQL de verificación)
4. **Mensaje en la consola del navegador** (DevTools → Network)

---

**Con esta información podré darte una solución más específica.**

