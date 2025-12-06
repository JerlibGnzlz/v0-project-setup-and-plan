# 🔧 Solución de Errores TypeScript - 2FA

## ❌ Errores Encontrados

Los errores indican que:

1. **Prisma Client no tiene los campos de 2FA** - Necesita regenerarse
2. **Dependencias no instaladas** - `speakeasy` y `qrcode` no están en `node_modules`

---

## ✅ Solución Paso a Paso

### Paso 1: Agregar Campos a la Base de Datos

**Opción A - SQL Directo (Recomendado):**

Ejecuta este SQL en tu base de datos:

```sql
ALTER TABLE users
ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE users
ADD COLUMN IF NOT EXISTS two_factor_secret TEXT;
```

**Opción B - Prisma Migrate:**

```bash
cd backend
npx prisma migrate dev --name add_two_factor_auth
```

### Paso 2: Instalar Dependencias

Las dependencias ya están en `package.json`, pero necesitas instalarlas:

**Opción A - Usar el script:**

```bash
cd backend
chmod +x INSTALAR_DEPENDENCIAS_2FA.sh
./INSTALAR_DEPENDENCIAS_2FA.sh
```

**Opción B - Manual:**

```bash
cd backend

# Si npm funciona:
npm install

# Si npm falla, intenta:
npm install --legacy-peer-deps

# O con yarn:
yarn install
```

**Opción C - Instalar solo las dependencias de 2FA:**

```bash
cd backend

# Con npm:
npm install speakeasy qrcode @types/qrcode

# O con yarn:
yarn add speakeasy qrcode @types/qrcode
```

### Paso 3: Regenerar Prisma Client

```bash
cd backend
npx prisma generate
```

Esto actualizará los tipos de TypeScript para incluir `twoFactorEnabled` y `twoFactorSecret`.

### Paso 4: Verificar que Funciona

```bash
cd backend
npm run build
```

Si no hay errores, ¡está listo!

---

## 🔍 Verificación

### Verificar que Prisma tiene los campos:

```bash
cd backend
npx prisma studio
```

Abre la tabla `users` y verifica que tenga las columnas:

- `two_factor_enabled`
- `two_factor_secret`

### Verificar que las dependencias están instaladas:

```bash
cd backend
ls node_modules | grep -E "speakeasy|qrcode"
```

Deberías ver:

- `speakeasy`
- `qrcode`
- `@types/qrcode` (en node_modules/@types)

---

## 🚨 Si los Errores Persisten

### Error: "Cannot find module 'speakeasy'"

1. Verifica que esté en `package.json`:

   ```bash
   grep speakeasy package.json
   ```

2. Si no está, agrégalo manualmente:

   ```json
   "speakeasy": "^2.0.0",
   "qrcode": "^1.5.3",
   "@types/qrcode": "^1.5.5"
   ```

3. Luego instala:
   ```bash
   npm install
   ```

### Error: "Property 'twoFactorEnabled' does not exist"

1. Verifica que el schema tenga los campos:

   ```bash
   grep twoFactor backend/prisma/schema.prisma
   ```

2. Regenera Prisma Client:

   ```bash
   npx prisma generate
   ```

3. Reinicia el servidor TypeScript:
   - Si usas `npm run start:dev`, detén y reinicia
   - Si usas VS Code, recarga la ventana (Ctrl+Shift+P → "Reload Window")

### Error: "npm error Cannot read properties of null"

Este es un problema conocido de npm. Soluciones:

1. **Limpiar cache:**

   ```bash
   npm cache clean --force
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Usar yarn:**

   ```bash
   yarn install
   ```

3. **Instalar manualmente:**
   ```bash
   # Descargar e instalar manualmente las dependencias
   ```

---

## ✅ Checklist Final

- [ ] Campos agregados a la base de datos
- [ ] Dependencias instaladas (`speakeasy`, `qrcode`, `@types/qrcode`)
- [ ] Prisma Client regenerado (`npx prisma generate`)
- [ ] Backend compila sin errores (`npm run build`)
- [ ] TypeScript no muestra errores

---

## 🎯 Comandos Rápidos (Todo en Uno)

```bash
cd backend

# 1. Agregar campos a BD (ejecutar SQL o migración)
# 2. Instalar dependencias
npm install speakeasy qrcode @types/qrcode || yarn add speakeasy qrcode @types/qrcode

# 3. Regenerar Prisma
npx prisma generate

# 4. Verificar
npm run build
```

---

**Si después de estos pasos aún hay errores, comparte el mensaje de error completo y te ayudo a resolverlo.**

