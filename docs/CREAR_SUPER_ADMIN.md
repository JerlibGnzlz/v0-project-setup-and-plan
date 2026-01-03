# Guía para Crear Usuario SUPER_ADMIN

## 📋 Prerequisitos

1. ✅ Base de datos configurada y conectada
2. ✅ Migración ejecutada (agregar SUPER_ADMIN al enum)
3. ✅ Backend funcionando

## 🚀 Método 1: Script Automático (Recomendado)

### Paso 1: Ejecutar Migración

Primero, asegúrate de que el enum `UserRole` incluya `SUPER_ADMIN`:

```sql
-- Ejecutar en tu base de datos (Neon, Railway, etc.)
ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'SUPER_ADMIN';
```

### Paso 2: Crear Usuario SUPER_ADMIN

```bash
# Desde la carpeta backend
cd backend

# Ejecutar script
npx ts-node scripts/create-super-admin.ts <email> <password> <nombre>
```

**Ejemplo:**
```bash
npx ts-node scripts/create-super-admin.ts tech@ministerio-amva.org MiPasswordSeguro123 "Técnico AMVA"
```

### Paso 3: Verificar

El script mostrará:
```
✅ Usuario SUPER_ADMIN creado exitosamente:
   ID: uuid-del-usuario
   Email: tech@ministerio-amva.org
   Nombre: Técnico AMVA
   Rol: SUPER_ADMIN
   Activo: Sí
```

## 🔧 Método 2: Desde Prisma Studio

1. Abrir Prisma Studio:
   ```bash
   cd backend
   npx prisma studio
   ```

2. Ir a la tabla `users`
3. Click en "Add record"
4. Llenar los campos:
   - `email`: tu email profesional
   - `password`: hash de bcrypt (ver siguiente sección)
   - `nombre`: tu nombre
   - `rol`: `SUPER_ADMIN`
   - `activo`: `true`
   - `avatar`: (opcional) URL de avatar

### Generar Hash de Contraseña

```bash
# Opción 1: Usar Node.js
node -e "const bcrypt = require('bcrypt'); bcrypt.hash('TuPassword123', 10).then(h => console.log(h))"

# Opción 2: Usar script
cd backend
npx ts-node -e "import * as bcrypt from 'bcrypt'; bcrypt.hash('TuPassword123', 10).then(h => console.log(h))"
```

## 📝 Método 3: SQL Directo

```sql
-- Generar hash de contraseña primero (usar script de arriba)
-- Luego ejecutar:

INSERT INTO users (
  id,
  email,
  password,
  nombre,
  rol,
  activo,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'tech@ministerio-amva.org',
  '$2b$10$TU_HASH_AQUI', -- Reemplazar con hash real
  'Técnico AMVA',
  'SUPER_ADMIN',
  true,
  NOW(),
  NOW()
);
```

## ✅ Verificación

1. **Iniciar sesión** con las credenciales creadas
2. **Verificar que aparezca "Auditoría del Sistema"** en el menú lateral
3. **Verificar que puedas crear usuarios ADMIN**

## 🔐 Seguridad

### Credenciales Recomendadas

- **Email**: Usar email profesional dedicado (ej: `tech@ministerio-amva.org`)
- **Contraseña**: Mínimo 16 caracteres, mezcla de mayúsculas, minúsculas, números y símbolos
- **Ejemplo**: `AmvaTech2025!@#$`

### Almacenamiento

- ✅ Guardar credenciales en gestor de contraseñas seguro
- ✅ NO compartir con usuarios ADMIN operativos
- ✅ Cambiar contraseña periódicamente (cada 90 días)

## 🚨 Troubleshooting

### Error: "SUPER_ADMIN no existe en enum"

**Solución**: Ejecutar migración SQL:
```sql
ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'SUPER_ADMIN';
```

### Error: "Email ya existe"

**Solución**: 
- Si el usuario existe pero con otro rol, actualizar:
  ```sql
  UPDATE users SET rol = 'SUPER_ADMIN' WHERE email = 'tu-email@ejemplo.com';
  ```
- Si quieres crear uno nuevo, usar otro email

### Error: "No puedo ver Auditoría"

**Solución**: 
- Verificar que el rol sea exactamente `SUPER_ADMIN` (no `ADMIN`)
- Cerrar sesión y volver a iniciar
- Limpiar cache del navegador

## 📚 Próximos Pasos

Después de crear tu usuario SUPER_ADMIN:

1. ✅ Iniciar sesión y verificar acceso
2. ✅ Crear usuarios ADMIN para el equipo operativo
3. ✅ Verificar que ADMIN no ve "Auditoría"
4. ✅ Documentar credenciales de forma segura

---

**Última actualización**: Diciembre 2025
**Versión**: 1.0.0

