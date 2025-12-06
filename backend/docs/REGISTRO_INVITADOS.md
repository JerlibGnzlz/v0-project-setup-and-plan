# Registro de Invitados

## Flujo para Invitados

Los invitados pueden registrarse desde la web para:

1. Crear su cuenta de autenticación (usar app móvil)
2. Inscribirse a convenciones

### Registro de Autenticación (`/api/auth/pastor/register-complete`)

**Comportamiento:**

- Si el email NO existe: Crea pastor con `activo=false` + cuenta de autenticación
- Si el email YA existe: Crea solo la cuenta de autenticación

**Resultado:**

- Invitados (`activo=false`) pueden autenticarse normalmente
- Invitados (`activo=false`) NO aparecen en `/admin/pastores`
- Invitados pueden usar la app móvil sin problemas

### Inscripción a Convención (`/api/inscripciones`)

**Comportamiento:**

- Crea SOLO inscripción en tabla `inscripciones`
- NO crea pastor automáticamente
- `origenRegistro: 'web'` o `'dashboard'`

**Resultado:**

- Invitado aparece en lista de inscripciones
- NO aparece en estructura organizacional

## Separación Clave

| Característica               | Invitado (`activo=false`) | Pastor Organizacional (`activo=true`) |
| ---------------------------- | ------------------------- | ------------------------------------- |
| Puede autenticarse           | ✅ Sí                     | ✅ Sí                                 |
| Aparece en `/admin/pastores` | ❌ No                     | ✅ Sí                                 |
| Aparece en inscripciones     | ✅ Sí (si se inscribe)    | ✅ Sí (si se inscribe)                |
| Puede usar app móvil         | ✅ Sí                     | ✅ Sí                                 |
| Se muestra en landing        | ❌ No                     | ✅ Solo si `mostrarEnLanding=true`    |

## Flujos Completos

### Flujo 1: Invitado quiere usar app móvil

```
1. Invitado usa register-complete desde web/app
   ↓
2. Se crea pastor con activo=false
   ↓
3. Se crea cuenta de autenticación
   ↓
4. Puede iniciar sesión y usar app móvil
   ↓
5. NO aparece en /admin/pastores
```

### Flujo 2: Invitado quiere inscribirse a convención

```
1. Invitado completa formulario en landing page
   ↓
2. Se crea inscripción con origenRegistro='web'
   ↓
3. Aparece en lista de inscripciones
   ↓
4. NO aparece en estructura organizacional
   ↓
5. Si quiere usar app móvil, debe usar register-complete después
```

### Flujo 3: Invitado quiere ambas cosas

```
1. Invitado usa register-complete (crea cuenta)
   ↓
2. Invitado se inscribe a convención (crea inscripción)
   ↓
3. Puede autenticarse, usar app móvil, y está inscrito
   ↓
4. NO aparece en estructura organizacional
```

## Notas Importantes

- Los invitados se crean con `activo=false` automáticamente
- El servicio `PastoresService.findAll()` solo retorna `activo=true`
- Los invitados pueden ser promovidos a organizacionales cambiando `activo=true` desde admin
- Las inscripciones son independientes de la estructura organizacional
