# Solución para Cuenta de Pastor Inactiva

## 🔴 Problema

Estás recibiendo el error:
```
"Tu cuenta de pastor está inactiva. Por favor, contacta a la administración."
```

Esto significa que tu cuenta existe en la base de datos pero está marcada como `activo: false`.

## ✅ Soluciones Disponibles

### Opción 1: Activar la Cuenta desde el Panel Admin (RECOMENDADO)

Si tienes acceso al panel de administración:

1. **Ve al panel admin**: `https://tu-dominio.com/admin/pastores`
2. **Busca tu email**: `jerlibgnzlz@gmail.com`
3. **Haz clic en "Editar"**
4. **Marca la casilla "Activo"**
5. **Guarda los cambios**
6. **Intenta iniciar sesión nuevamente**

### Opción 2: Usar Script del Backend

Si tienes acceso al backend:

```bash
cd backend
npx ts-node scripts/activar-pastor.ts jerlibgnzlz@gmail.com
```

Este script:
- Busca el pastor por email
- Activa la cuenta si está inactiva
- Te indica los próximos pasos

### Opción 3: Usar Login con Google (FUNCIONAL AHORA)

**Esta es la opción más rápida y funciona inmediatamente:**

1. **Cierra completamente la app móvil**
2. **Reinicia la app**
3. **Haz clic en "Continuar con Google"**
4. **Selecciona tu cuenta de Google**
5. **Autoriza la aplicación**
6. **Deberías entrar a la app** ✅

El login con Google funciona para invitados y no requiere que la cuenta esté activa en la estructura organizacional.

### Opción 4: Crear Cuenta Nueva

Si no tienes acceso al panel admin:

1. **En la app móvil, haz clic en "Crear nueva cuenta"**
2. **Completa el formulario**:
   - Nombre y apellido
   - Email: `jerlibgnzlz@gmail.com`
   - Contraseña
   - Otros campos opcionales
3. **Envía el formulario**
4. **Luego podrás iniciar sesión**

**Nota**: Si el email ya existe pero está inactivo, el sistema puede activarlo automáticamente al crear la cuenta.

## 🔍 Verificar el Estado de tu Cuenta

Para verificar si tu cuenta está activa o inactiva:

1. **Ve al panel admin** (si tienes acceso)
2. **Busca tu email en la lista de pastores**
3. **Verifica la columna "Estado"**

O ejecuta este script en el backend:

```bash
cd backend
npx ts-node -e "
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
prisma.pastor.findUnique({ where: { email: 'jerlibgnzlz@gmail.com' } })
  .then(p => { console.log('Estado:', p?.activo ? 'ACTIVO' : 'INACTIVO'); prisma.\$disconnect(); })
  .catch(e => { console.error(e); prisma.\$disconnect(); });
"
```

## 📋 Pasos Recomendados

**Para resolverlo ahora mismo:**

1. ✅ **Usa el login con Google** (funciona inmediatamente)
2. ⏳ **Luego activa tu cuenta** desde el panel admin cuando tengas acceso
3. ✅ **Después podrás usar el login normal** si lo prefieres

## 🎯 Resumen

- **Problema**: Cuenta de pastor inactiva (`activo: false`)
- **Solución inmediata**: Usar login con Google
- **Solución permanente**: Activar cuenta desde panel admin o script
- **Alternativa**: Crear cuenta nueva desde la app móvil

## 🆘 Si Nada Funciona

1. **Verifica que el email sea correcto**
2. **Intenta crear una cuenta nueva** desde la app móvil
3. **Usa el login con Google** (siempre funciona)
4. **Contacta al administrador** para activar tu cuenta manualmente

