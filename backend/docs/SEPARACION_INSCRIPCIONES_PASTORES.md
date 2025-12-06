# Separación entre Inscripciones y Pastores

## Conceptos Separados

Este documento explica la separación clara entre dos conceptos diferentes en el sistema:

### 1. **Pastores (Estructura Organizacional)**

- **Ubicación**: Tabla `pastores` en la base de datos
- **Propósito**: Representa a los pastores que forman parte de la estructura organizacional del ministerio
- **Gestión**: Solo se crean/editan desde `app/admin/pastores`
- **Uso**:
  - Mostrar en la landing page (si `mostrarEnLanding: true`)
  - Estructura organizacional del ministerio
  - Directiva pastoral
  - Equipo de liderazgo

### 2. **Inscripciones (Participantes de Convenciones)**

- **Ubicación**: Tabla `inscripciones` en la base de datos
- **Propósito**: Registro de participantes (pastores o invitados) que se inscriben a convenciones
- **Gestión**: Se crean desde:
  - Landing page (`origenRegistro: 'web'`)
  - Admin dashboard (`origenRegistro: 'dashboard'`)
  - App móvil (`origenRegistro: 'mobile'`)
- **Uso**:
  - Control de participantes en convenciones
  - Gestión de pagos
  - Seguimiento de inscripciones

## Reglas Importantes

### ✅ Lo que SÍ debe pasar:

1. **Crear inscripción desde landing page**:
   - Se guarda SOLO en `inscripciones`
   - `origenRegistro: 'web'`
   - NO crea pastor en estructura organizacional
   - Invitados van SOLO a inscripciones, NO a estructura organizacional

2. **Crear inscripción desde admin**:
   - Se guarda SOLO en `inscripciones`
   - `origenRegistro: 'dashboard'`
   - NO crea pastor en estructura organizacional
   - Invitados registrados manualmente van SOLO a inscripciones

3. **Crear pastor desde gestión de pastores**:
   - Se guarda SOLO en `pastores`
   - NO crea inscripción automáticamente
   - Solo para estructura organizacional (directiva, supervisores, pastores del equipo)

4. **Registro de autenticación para app móvil** (`/api/auth/pastor/register-complete`):
   - **Pastores organizacionales**: Si ya existen, crea solo la cuenta de autenticación
   - **Invitados**: Si NO existen, crea pastor con `activo=false` + cuenta de autenticación
   - Los invitados (`activo=false`) NO aparecen en estructura organizacional (`/admin/pastores`)
   - Los invitados pueden autenticarse y usar la app móvil normalmente

### ❌ Lo que NO debe pasar:

1. ❌ Crear un pastor cuando se crea una inscripción
2. ❌ Crear una inscripción cuando se crea un pastor
3. ❌ Mezclar los datos de ambas tablas
4. ❌ Invitados (`activo=false`) apareciendo en estructura organizacional (`/admin/pastores`)
5. ❌ Pastores organizacionales creados con `activo=false`

### ✅ Comportamiento correcto:

1. ✅ Invitados pueden registrarse con `register-complete` → Se crean con `activo=false`
2. ✅ Invitados (`activo=false`) pueden autenticarse y usar la app móvil
3. ✅ Invitados (`activo=false`) NO aparecen en `/admin/pastores` (solo `activo=true`)
4. ✅ Pastores organizacionales se crean desde `/admin/pastores` con `activo=true`
5. ✅ Pastores organizacionales aparecen en estructura organizacional

## Flujo de Registro

### Desde Landing Page:

```
Usuario completa formulario
    ↓
POST /api/inscripciones
    ↓
InscripcionesService.createInscripcion()
    ↓
Se crea SOLO en tabla 'inscripciones'
    ↓
origenRegistro: 'web'
```

### Desde Admin Dashboard:

```
Admin completa formulario manual
    ↓
POST /api/inscripciones
    ↓
InscripcionesService.createInscripcion()
    ↓
Se crea SOLO en tabla 'inscripciones'
    ↓
origenRegistro: 'dashboard'
```

### Crear Pastor (Estructura Organizacional):

```
Admin va a /admin/pastores
    ↓
Completa formulario de pastor
    ↓
POST /api/pastores
    ↓
PastoresService.create()
    ↓
Se crea SOLO en tabla 'pastores'
```

## Validaciones Implementadas

1. **En `createInscripcion`**:
   - Valida que `origenRegistro` sea válido ('web', 'mobile', 'dashboard')
   - NO crea pastores automáticamente
   - Logs explícitos indicando que NO se crea pastor

2. **En el frontend**:
   - Landing page siempre envía `origenRegistro: 'web'`
   - Admin siempre envía `origenRegistro: 'dashboard'`

## Casos de Uso

### Caso 1: Invitado se registra desde la web para usar app móvil

- Usa `register-complete` desde la web/app móvil
- Se crea pastor con `activo=false` (invitado)
- Se crea cuenta de autenticación
- Puede autenticarse y usar la app móvil
- NO aparece en estructura organizacional (`/admin/pastores`)

### Caso 2: Invitado se inscribe a convención desde landing page

- Se crea inscripción con `origenRegistro: 'web'`
- NO se crea pastor automáticamente
- Si quiere usar la app móvil, debe usar `register-complete` primero

### Caso 3: Admin registra invitado manualmente

- Se crea inscripción con `origenRegistro: 'dashboard'`
- `tipoInscripcion: 'invitado'`
- NO se crea pastor en estructura organizacional
- Si el invitado quiere usar la app móvil, debe usar `register-complete`

### Caso 4: Admin agrega pastor a estructura organizacional

- Se crea pastor en tabla `pastores` con `activo=true`
- Aparece en `/admin/pastores` (estructura organizacional)
- NO se crea inscripción automáticamente
- El pastor puede usar `register-complete` para crear su cuenta de autenticación
- El pastor puede inscribirse después a convenciones si lo desea

## Mantenimiento

Si en el futuro necesitas relacionar pastores con inscripciones:

1. **Opción 1**: Agregar campo `pastorId` opcional en `inscripciones`
2. **Opción 2**: Crear tabla de relación `pastor_inscripciones`
3. **Opción 3**: Buscar por email cuando sea necesario

**IMPORTANTE**: Nunca crear pastores automáticamente desde inscripciones.
