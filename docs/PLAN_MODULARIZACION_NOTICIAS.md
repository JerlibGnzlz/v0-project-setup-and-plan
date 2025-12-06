# Plan de Modularización - Noticias

**Archivo:** `app/admin/noticias/page.tsx`  
**Líneas actuales:** 636  
**Objetivo:** Reducir a ~200-250 líneas (61-69% reducción)

---

## 📋 Análisis de Estructura

### **Secciones Identificadas:**

1. **Header** (líneas ~150-170)
   - Título "Gestión de Noticias"
   - Botón "Volver"
   - Botón "Nueva Noticia"

2. **Filtros** (líneas ~200-250)
   - Búsqueda por texto
   - Filtro por estado (publicadas/borradores)
   - Ordenamiento

3. **Lista de Noticias** (líneas ~250-500)
   - Cards o lista de noticias
   - Información de cada noticia
   - Acciones (editar, eliminar, publicar)

4. **Dialog Crear/Editar Noticia** (líneas ~500-600)
   - Formulario con título, contenido, imagen
   - Editor de texto
   - Publicación

5. **AlertDialog Eliminar** (líneas ~600-636)
   - Confirmación de eliminación

---

## 🎯 Componentes a Crear

### **1. NoticiasHeader**
**Responsabilidad:** Header con título y botón nueva noticia  
**Props:**
- `onAddClick`: Callback para abrir dialog

---

### **2. NoticiasFilters**
**Responsabilidad:** Filtros de búsqueda y estado  
**Props:**
- `searchTerm`: Valor de búsqueda
- `onSearchChange`: Callback para cambiar búsqueda
- `statusFilter`: Filtro de estado
- `onStatusFilterChange`: Callback para cambiar estado
- `sortBy`: Ordenamiento
- `onSortChange`: Callback para cambiar orden

---

### **3. NoticiasList**
**Responsabilidad:** Lista de noticias  
**Props:**
- `noticias`: Array de noticias
- `onEdit`: Callback para editar
- `onDelete`: Callback para eliminar
- `onTogglePublish`: Callback para publicar/despublicar

---

### **4. NoticiaItem**
**Responsabilidad:** Item individual de noticia  
**Props:**
- `noticia`: Objeto Noticia
- `onEdit`: Callback para editar
- `onDelete`: Callback para eliminar
- `onTogglePublish`: Callback para publicar/despublicar

---

### **5. NoticiasDialog**
**Responsabilidad:** Dialog para crear/editar noticia  
**Props:**
- `open`: Estado del dialog
- `onOpenChange`: Callback para cambiar estado
- `noticia`: Noticia a editar (null para crear)
- `onSubmit`: Callback para guardar
- `isSubmitting`: Estado de carga

---

### **6. NoticiasDeleteDialog**
**Responsabilidad:** AlertDialog para confirmar eliminación  
**Props:**
- `open`: Estado del dialog
- `onOpenChange`: Callback para cambiar estado
- `noticia`: Noticia a eliminar
- `onConfirm`: Callback para confirmar

---

## 📁 Estructura Final

```
components/admin/noticias/
├── noticias-header.tsx
├── noticias-filters.tsx
├── noticias-list.tsx
├── noticia-item.tsx
├── noticias-dialog.tsx
├── noticias-delete-dialog.tsx
└── index.ts (barrel export)
```

---

## 📊 Estimación de Reducción

| Componente | Líneas Originales | Líneas Nuevas | Reducción |
|------------|-------------------|---------------|-----------|
| **Página Principal** | 636 | ~200-250 | **61-69%** |
| **Componentes** | 0 | ~400-450 | **+6 componentes** |

---

## ✅ Funcionalidades a Preservar

- ✅ Búsqueda de noticias
- ✅ Filtros por estado
- ✅ Ordenamiento
- ✅ Crear nueva noticia
- ✅ Editar noticia existente
- ✅ Eliminar noticia
- ✅ Publicar/despublicar noticia
- ✅ Upload de imagen
- ✅ Editor de texto
- ✅ Validaciones del formulario
- ✅ Estados de carga
- ✅ Manejo de errores

---

**Fecha:** Diciembre 2024

