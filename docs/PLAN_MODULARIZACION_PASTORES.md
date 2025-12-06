# Plan de Modularización - Pastores

**Archivo:** `app/admin/pastores/page.tsx`  
**Líneas actuales:** 856  
**Objetivo:** Reducir a ~250-300 líneas (65-70% reducción)

---

## 📋 Análisis de Estructura

### **Secciones Identificadas:**

1. **Header** (líneas ~296-310)
   - Título "Estructura Organizacional"
   - Botón "Volver"
   - Botón "Agregar Pastor"

2. **Filtros** (líneas ~604-667)
   - Búsqueda por texto
   - Filtro por tipo
   - Filtro por estado (todos/activos/inactivos)

3. **Tabla de Pastores** (líneas ~669-815)
   - Headers de columnas
   - Filas con datos de pastores
   - Acciones (ver, editar, activar/desactivar)

4. **Paginación** (líneas ~817-849)
   - Información de página actual
   - Botones anterior/siguiente

5. **Dialog Crear/Editar Pastor** (líneas ~310-601)
   - Formulario muy grande con múltiples secciones
   - Upload de foto
   - Validaciones

6. **AlertDialog Activar/Desactivar** (líneas ~760-806)
   - Confirmación de cambio de estado

---

## 🎯 Componentes a Crear

### **1. PastoresHeader**
**Responsabilidad:** Header con título y botón agregar  
**Props:**
- `onAddClick`: Callback para abrir dialog

---

### **2. PastoresFilters**
**Responsabilidad:** Filtros de búsqueda y estado  
**Props:**
- `searchTerm`: Valor de búsqueda
- `onSearchChange`: Callback para cambiar búsqueda
- `tipoFilter`: Filtro de tipo
- `onTipoFilterChange`: Callback para cambiar tipo
- `statusFilter`: Filtro de estado
- `onStatusFilterChange`: Callback para cambiar estado
- `counts`: Objeto con contadores (todos, activos, inactivos)

---

### **3. PastoresTable**
**Responsabilidad:** Tabla de pastores  
**Props:**
- `pastores`: Array de pastores
- `onEdit`: Callback para editar
- `onToggleActive`: Callback para activar/desactivar
- `tipoConfig`: Configuración de tipos

---

### **4. PastoresTableRow**
**Responsabilidad:** Fila individual de la tabla  
**Props:**
- `pastor`: Objeto Pastor
- `onEdit`: Callback para editar
- `onToggleActive`: Callback para activar/desactivar
- `tipoConfig`: Configuración de tipos

---

### **5. PastoresPagination**
**Responsabilidad:** Controles de paginación  
**Props:**
- `currentPage`: Página actual
- `onPageChange`: Callback para cambiar página
- `paginationMeta`: Metadata de paginación
- `isLoading`: Estado de carga

---

### **6. PastoresDialog**
**Responsabilidad:** Dialog para crear/editar pastor  
**Props:**
- `open`: Estado del dialog
- `onOpenChange`: Callback para cambiar estado
- `pastor`: Pastor a editar (null para crear)
- `onSubmit`: Callback para guardar
- `isSubmitting`: Estado de carga
- `tipoConfig`: Configuración de tipos

---

### **7. PastoresToggleActiveDialog**
**Responsabilidad:** AlertDialog para activar/desactivar  
**Props:**
- `open`: Estado del dialog
- `onOpenChange`: Callback para cambiar estado
- `pastor`: Pastor a modificar
- `onConfirm`: Callback para confirmar

---

## 📁 Estructura Final

```
components/admin/pastores/
├── pastores-header.tsx
├── pastores-filters.tsx
├── pastores-table.tsx
├── pastores-table-row.tsx
├── pastores-pagination.tsx
├── pastores-dialog.tsx
├── pastores-toggle-active-dialog.tsx
└── index.ts (barrel export)
```

---

## 📊 Estimación de Reducción

| Componente | Líneas Originales | Líneas Nuevas | Reducción |
|------------|-------------------|---------------|-----------|
| **Página Principal** | 856 | ~250-300 | **65-70%** |
| **Componentes** | 0 | ~550-600 | **+7 componentes** |

---

## ✅ Funcionalidades a Preservar

- ✅ Búsqueda de pastores
- ✅ Filtros por tipo y estado
- ✅ Paginación
- ✅ Crear nuevo pastor
- ✅ Editar pastor existente
- ✅ Activar/desactivar pastor
- ✅ Upload de foto
- ✅ Validaciones del formulario
- ✅ Estados de carga
- ✅ Manejo de errores

---

**Fecha:** Diciembre 2024

