# 📋 Plan de Modularización - Dashboard (app/admin/page.tsx)

**Archivo:** `app/admin/page.tsx`  
**Líneas actuales:** 1,192  
**Objetivo:** Reducir a ~400-500 líneas (60-65% reducción)

---

## 🔍 Análisis de Estructura

### **Secciones Identificadas:**

1. **Header del Dashboard** (~50 líneas)
   - Título con gradiente
   - Información de convención activa
   - Indicador de sistema activo

2. **Estado Sin Convención** (~200 líneas)
   - Mensaje cuando no hay convención
   - Dialog para crear nueva convención

3. **Control de Convención** (~150 líneas)
   - Card con controles de visibilidad
   - Dialog para editar convención
   - Switches y configuraciones

4. **Estadísticas (Stats Cards)** (~200 líneas)
   - Tarjetas de estadísticas (pastores, inscripciones, pagos)
   - Cálculos de totales y porcentajes
   - Enlaces a secciones relacionadas

5. **Lista de Convenciones** (~300 líneas)
   - Filtros (año, archivadas)
   - Lista de convenciones
   - Acciones (archivar, desarchivar, eliminar)

6. **Quick Actions** (~250 líneas)
   - Tarjetas de acceso rápido
   - Enlaces a diferentes secciones del admin

7. **Lógica y Hooks** (~50 líneas)
   - Manejo de estado
   - Mutaciones
   - Handlers

---

## 📦 Componentes a Crear

### **1. DashboardHeader**
**Responsabilidad:** Encabezado principal con título y convención activa  
**Props:**
- `convencionActiva`: Convención activa o null
- `isLoading`: Estado de carga

**Ubicación:** `components/admin/dashboard/dashboard-header.tsx`

---

### **2. DashboardEmptyState**
**Responsabilidad:** Estado cuando no hay convención activa  
**Props:**
- `onCreateConvencion`: Callback para crear convención
- `createDialogOpen`: Estado del dialog
- `setCreateDialogOpen`: Setter del estado

**Ubicación:** `components/admin/dashboard/dashboard-empty-state.tsx`

---

### **3. DashboardConvencionControl**
**Responsabilidad:** Card de control de convención con edición  
**Props:**
- `convencionActiva`: Convención activa
- `onUpdate`: Callback para actualizar
- `onToggleVisibility`: Callback para cambiar visibilidad
- `dialogOpen`: Estado del dialog
- `setDialogOpen`: Setter del estado

**Ubicación:** `components/admin/dashboard/dashboard-convencion-control.tsx`

---

### **4. DashboardStats**
**Responsabilidad:** Tarjetas de estadísticas  
**Props:**
- `stats`: Objeto con todas las estadísticas
- `isLoading`: Estado de carga

**Ubicación:** `components/admin/dashboard/dashboard-stats.tsx`

---

### **5. DashboardConvencionesList**
**Responsabilidad:** Lista de convenciones con filtros  
**Props:**
- `convenciones`: Array de convenciones
- `convencionActiva`: Convención activa (para excluir de la lista)
- `mostrarArchivadas`: Estado del filtro
- `setMostrarArchivadas`: Setter del filtro
- `filtroAno`: Estado del filtro de año
- `setFiltroAno`: Setter del filtro de año
- `onArchivar`: Callback para archivar
- `onDesarchivar`: Callback para desarchivar
- `onDelete`: Callback para eliminar

**Ubicación:** `components/admin/dashboard/dashboard-convenciones-list.tsx`

---

### **6. DashboardQuickActions**
**Responsabilidad:** Tarjetas de acceso rápido  
**Props:**
- `stats`: Estadísticas para mostrar en las tarjetas
- `isLoading`: Estado de carga

**Ubicación:** `components/admin/dashboard/dashboard-quick-actions.tsx`

---

### **7. ConvencionCreateDialog**
**Responsabilidad:** Dialog para crear nueva convención  
**Props:**
- `open`: Estado del dialog
- `onOpenChange`: Callback para cambiar estado
- `onSubmit`: Callback para crear convención

**Ubicación:** `components/admin/dashboard/convencion-create-dialog.tsx`

---

### **8. ConvencionEditDialog**
**Responsabilidad:** Dialog para editar convención  
**Props:**
- `open`: Estado del dialog
- `onOpenChange`: Callback para cambiar estado
- `convencion`: Convención a editar
- `onSubmit`: Callback para actualizar convención

**Ubicación:** `components/admin/dashboard/convencion-edit-dialog.tsx`

---

## 🎣 Hooks a Crear

### **1. useDashboardStats**
**Responsabilidad:** Calcular estadísticas del dashboard  
**Retorna:**
- `stats`: Objeto con todas las estadísticas
- `isLoading`: Estado de carga

**Ubicación:** `lib/hooks/use-dashboard-stats.ts`

---

## 📁 Estructura Final

```
components/admin/dashboard/
├── dashboard-header.tsx
├── dashboard-empty-state.tsx
├── dashboard-convencion-control.tsx
├── dashboard-stats.tsx
├── dashboard-convenciones-list.tsx
├── dashboard-quick-actions.tsx
├── convencion-create-dialog.tsx
├── convencion-edit-dialog.tsx
└── index.ts (barrel export)

lib/hooks/
└── use-dashboard-stats.ts
```

---

## 📊 Estimación de Reducción

| Sección | Líneas Actuales | Líneas Después | Reducción |
|---------|----------------|----------------|-----------|
| Header | ~50 | ~20 | 60% |
| Empty State | ~200 | ~80 | 60% |
| Convención Control | ~150 | ~60 | 60% |
| Stats | ~200 | ~80 | 60% |
| Convenciones List | ~300 | ~120 | 60% |
| Quick Actions | ~250 | ~100 | 60% |
| Lógica Principal | ~50 | ~50 | 0% |
| **Total** | **1,200** | **~510** | **57.5%** |

---

## ✅ Beneficios Esperados

1. **Mantenibilidad:** Cada componente con responsabilidad única
2. **Reutilización:** Componentes reutilizables en otras partes
3. **Testing:** Componentes más fáciles de testear
4. **Legibilidad:** Código más fácil de entender
5. **Colaboración:** Múltiples desarrolladores pueden trabajar en paralelo

---

## 🚀 Orden de Implementación

1. ✅ Crear estructura de carpetas
2. ✅ Crear hook `useDashboardStats`
3. ✅ Crear `DashboardHeader`
4. ✅ Crear `DashboardEmptyState` y `ConvencionCreateDialog`
5. ✅ Crear `DashboardConvencionControl` y `ConvencionEditDialog`
6. ✅ Crear `DashboardStats`
7. ✅ Crear `DashboardConvencionesList`
8. ✅ Crear `DashboardQuickActions`
9. ✅ Crear barrel export
10. ✅ Refactorizar página principal
11. ✅ Verificar funcionalidad

---

**Última actualización:** Diciembre 2024


