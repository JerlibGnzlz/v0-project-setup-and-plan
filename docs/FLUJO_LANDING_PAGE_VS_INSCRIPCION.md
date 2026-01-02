# Flujo: Landing Page vs Página de Inscripción

## 📋 Diferencia Clave

### **Landing Page** (`/` - `app/page.tsx`)

- **Propósito**: Página pública de presentación de AMVA Digital
- **Contenido**:
  - Información general de la organización
  - Secciones: Hero, Sedes, Misión, Directiva, Noticias, **Convenciones**, Galería, Educación
  - **Sección de Convenciones**: Muestra si hay convención activa o "Próximamente"
- **Acceso**: Público, sin autenticación requerida
- **Navegación**: Usuario puede hacer scroll por todas las secciones

### **Página de Inscripción** (`/convencion/inscripcion` - `app/convencion/inscripcion/page.tsx`)

- **Propósito**: Proceso de inscripción a una convención específica
- **Contenido**:
  - Paso 1: Autenticación (Google OAuth o Email/Password)
  - Paso 2: Formulario de inscripción
- **Acceso**: Requiere convención activa
- **Navegación**: Flujo guiado paso a paso (wizard)

---

## 🔄 Flujo Completo

### **Escenario 1: Sin Convención Activa**

```
Usuario visita Landing Page (/)
    ↓
Ve sección "Convenciones"
    ↓
Muestra: "Próximamente - Gran Convención"
    ↓
NO hay botón de inscripción visible
```

### **Escenario 2: Con Convención Activa**

```
Usuario visita Landing Page (/)
    ↓
Ve sección "Convenciones"
    ↓
Muestra: Card de invitación con detalles de la convención
    ↓
Botón: "Confirmar Asistencia"
    ↓
Redirige a: /convencion/inscripcion
    ↓
Página de Inscripción verifica:
    - ¿Hay convención activa? → SÍ
    - ¿Usuario autenticado? → NO
    ↓
Muestra: Paso 1 - Autenticación
    - Botón "Continuar con Google" ✅ DISPONIBLE
    - Opción Email/Password
    ↓
Usuario se autentica con Google
    ↓
Muestra: Información del usuario autenticado
    ↓
Avanza automáticamente a: Paso 2 - Formulario de Inscripción
    ↓
Usuario completa formulario
    ↓
Inscripción exitosa
```

---

## ✅ Implementación Actual

### **1. Landing Page (`components/conventions-section.tsx`)**

```typescript
// Verifica si hay convención activa
const { data: convencion } = useConvencionActiva()

if (!convencion || !convencion.activa) {
  return <ComingSoonAnnouncement /> // "Próximamente"
}

// Si hay convención activa, muestra card con botón
<Button onClick={() => window.location.href = '/convencion/inscripcion'}>
  Confirmar Asistencia
</Button>
```

### **2. Página de Inscripción (`app/convencion/inscripcion/page.tsx`)**

```typescript
// Verifica convención activa ANTES de mostrar contenido
const { data: convencion, isLoading } = useConvencionActiva()

if (!convencion || !convencion.activa) {
  return (
    <div>
      <h2>No hay convención activa</h2>
      <p>Las inscripciones estarán disponibles cuando se active la próxima convención anual.</p>
      <Button onClick={() => router.push('/#convenciones')}>
        Volver a la página principal
      </Button>
    </div>
  )
}

// Solo si hay convención activa, muestra el wizard de inscripción
<Step1Auth onComplete={handleStepComplete} />
```

### **3. Google OAuth Solo Disponible con Convención Activa**

**Lógica implementada:**

- ✅ La página `/convencion/inscripcion` verifica convención activa antes de renderizar
- ✅ Si NO hay convención activa → Muestra mensaje y botón para volver
- ✅ Si HAY convención activa → Muestra el wizard con Google OAuth habilitado
- ✅ Google OAuth solo aparece cuando hay convención activa (porque la página no se renderiza sin ella)

---

## 🎯 Ventajas de Este Flujo

1. **Seguridad**: Google OAuth solo disponible cuando hay convención activa
2. **UX Clara**: Usuario sabe inmediatamente si puede inscribirse o no
3. **Prevención de Errores**: No permite intentar inscribirse sin convención activa
4. **Mensajes Claros**: Explica por qué no puede inscribirse (no hay convención activa)

---

## 📝 Cómo Activar una Convención

1. **Admin Dashboard** → Sección "Convenciones"
2. Crear o editar una convención
3. Marcar campo `activa: true`
4. Guardar

**Resultado:**

- ✅ Landing page muestra card de invitación
- ✅ Botón "Confirmar Asistencia" aparece
- ✅ Página de inscripción permite Google OAuth
- ✅ Usuarios pueden inscribirse

---

## 🔍 Verificación del Flujo

### **Test 1: Sin Convención Activa**

```
1. Ir a / (landing page)
2. Scroll a sección "Convenciones"
3. Debe mostrar: "Próximamente"
4. NO debe haber botón de inscripción
```

### **Test 2: Con Convención Activa**

```
1. Admin activa convención
2. Ir a / (landing page)
3. Scroll a sección "Convenciones"
4. Debe mostrar: Card con detalles de convención
5. Debe haber botón: "Confirmar Asistencia"
6. Click en botón → Redirige a /convencion/inscripcion
7. Debe mostrar: Paso 1 con botón "Continuar con Google"
```

### **Test 3: Acceso Directo sin Convención**

```
1. Ir directamente a /convencion/inscripcion (sin convención activa)
2. Debe mostrar: "No hay convención activa"
3. Debe mostrar botón: "Volver a la página principal"
4. NO debe mostrar: Botón de Google OAuth
```

---

## 🚀 Próximos Pasos Recomendados

1. ✅ **Implementado**: Verificación de convención activa antes de mostrar Google OAuth
2. ✅ **Implementado**: Mensaje claro cuando no hay convención activa
3. ✅ **Implementado**: Redirección a landing page si no hay convención
4. 🔄 **Opcional**: Notificación push cuando se active una convención (futuro)
5. 🔄 **Opcional**: Email masivo cuando se active convención (futuro)

---

## 📞 Soporte

Si tienes dudas sobre el flujo:

1. Revisa este documento
2. Verifica que la convención esté marcada como `activa: true` en el admin
3. Revisa los logs del backend para verificar que la API `/convenciones/active` retorna la convención correcta




























