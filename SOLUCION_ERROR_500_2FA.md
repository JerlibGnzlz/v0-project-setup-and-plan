# 🔧 Solución: Error 500 al Habilitar 2FA

## ❌ Error Encontrado

```
[HTTP/1.1 500 Internal Server Error]
```

**Causa:** Los campos `two_factor_enabled` y `two_factor_secret` **no existen** en la base de datos.

---

## ✅ Solución

### Paso 1: Agregar Campos a la Base de Datos

Ejecuta este SQL en tu base de datos:

```sql
ALTER TABLE users
ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE users
ADD COLUMN IF NOT EXISTS two_factor_secret TEXT;
```

**Dónde ejecutarlo:**

- **Neon Console**: Ve a tu proyecto → SQL Editor → Pega el SQL → Ejecutar
- **Prisma Studio**: `npx prisma studio` → Ejecutar SQL
- **Cualquier cliente SQL**: DBeaver, pgAdmin, etc.

**O usa el script:**

```bash
# El script está en:
backend/scripts/agregar-campos-2fa.sql
```

---

### Paso 2: Descomentar Campos en Schema (Opcional)

Si quieres que Prisma reconozca los campos:

```prisma
// En backend/prisma/schema.prisma
twoFactorEnabled  Boolean  @default(false) @map("two_factor_enabled")
twoFactorSecret   String?  @map("two_factor_secret")
```

Luego regenera Prisma:

```bash
cd backend
npx prisma generate
```

---

### Paso 3: Reiniciar Backend

```bash
cd backend
npm run start:dev
```

---

## 🔍 Verificar que Funciona

1. **Ejecuta el SQL** en tu base de datos
2. **Reinicia el backend**
3. **Intenta habilitar 2FA nuevamente**
   - Debería funcionar sin error 500

---

## 📝 Cambios Aplicados

### 1. Manejo de Errores Mejorado

El backend ahora detecta cuando los campos no existen y retorna un mensaje claro:

```typescript
// En two-factor.service.ts
if (error.message?.includes('two_factor_enabled')) {
  throw new Error('Los campos de 2FA no existen en la base de datos...')
}
```

### 2. Frontend Muestra Mensaje Claro

El frontend ahora muestra un mensaje específico cuando faltan los campos:

```
⚠️ Campos 2FA no configurados en la base de datos
Ejecuta el SQL en backend/scripts/agregar-campos-2fa.sql
```

---

## 🚀 Después de Agregar los Campos

Una vez que agregues los campos a la BD:

1. ✅ El error 500 desaparecerá
2. ✅ Podrás habilitar 2FA normalmente
3. ✅ El código QR se generará correctamente
4. ✅ El login requerirá código 2FA cuando esté habilitado

---

## ⚠️ Nota Importante

**El código ya está preparado** para funcionar con o sin los campos en la BD:

- ✅ Login funciona sin los campos (2FA deshabilitado por defecto)
- ✅ Panel de seguridad funciona (muestra estado)
- ⚠️ Habilitar 2FA requiere los campos en la BD

---

**¿Necesitas ayuda para ejecutar el SQL?** Puedo guiarte paso a paso.

