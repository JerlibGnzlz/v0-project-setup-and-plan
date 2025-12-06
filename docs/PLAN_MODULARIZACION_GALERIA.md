# Plan de Modularización - Galería

**Archivo:** `app/admin/galeria/page.tsx`  
**Líneas actuales:** 920  
**Objetivo:** Reducir a ~250-300 líneas (67-73% reducción)

---

## 📋 Análisis de Estructura

### **Secciones Identificadas:**

1. **Header** (líneas ~387-400)
   - Título "Galería Multimedia"
   - Botón "Volver"
   - Descripción

2. **Sección de Imágenes** (líneas ~400-500)
   - Card con título "Imágenes"
   - Badge con contador (X/4)
   - Botón "Agregar Imagen"
   - Grid de imágenes
   - Empty state
   - Dialog de upload de imagen

3. **Sección de Videos** (líneas ~500-650)
   - Card con título "Videos"
   - Badge con contador (X/2)
   - Botón "Agregar Video"
   - Grid de videos
   - Empty state
   - Dialog de upload de video

4. **Dialog de Editar Video** (líneas ~830-894)
   - VideoTrimmer para editar recorte
   - Botones de acción

5. **AlertDialog de Eliminación** (líneas ~896-916)
   - Confirmación de eliminación

---

## 🎯 Componentes a Crear

### **1. GaleriaHeader**
**Responsabilidad:** Header con título y botón volver  
**Props:**
- Ninguna (puede usar Link directamente)

---

### **2. GaleriaImagenesSection**
**Responsabilidad:** Sección completa de imágenes  
**Props:**
- `imagenes`: Array de imágenes
- `maxImagenes`: Número máximo (4)
- `onUploadClick`: Callback para abrir dialog
- `onDelete`: Callback para eliminar
- `isUploading`: Estado de carga

---

### **3. GaleriaVideosSection**
**Responsabilidad:** Sección completa de videos  
**Props:**
- `videos`: Array de videos
- `maxVideos`: Número máximo (2)
- `onUploadClick`: Callback para abrir dialog
- `onDelete`: Callback para eliminar
- `onEdit`: Callback para editar video
- `isUploading`: Estado de carga

---

### **4. GaleriaImagenItem**
**Responsabilidad:** Item individual de imagen en el grid  
**Props:**
- `imagen`: Objeto GaleriaImagen
- `onDelete`: Callback para eliminar

---

### **5. GaleriaVideoItem**
**Responsabilidad:** Item individual de video en el grid  
**Props:**
- `video`: Objeto GaleriaImagen
- `onDelete`: Callback para eliminar
- `onEdit`: Callback para editar

---

### **6. GaleriaUploadImagenDialog**
**Responsabilidad:** Dialog para subir imagen  
**Props:**
- `open`: Estado del dialog
- `onOpenChange`: Callback para cambiar estado
- `onSubmit`: Callback para subir imagen
- `isUploading`: Estado de carga
- `imageUrl`: URL de la imagen
- `setImageUrl`: Setter para URL
- `imageTitulo`: Título de la imagen
- `setImageTitulo`: Setter para título
- `imageDescripcion`: Descripción
- `setImageDescripcion`: Setter para descripción
- `onImageFileUpload`: Callback para subir archivo

---

### **7. GaleriaUploadVideoDialog**
**Responsabilidad:** Dialog para subir video  
**Props:**
- `open`: Estado del dialog
- `onOpenChange`: Callback para cambiar estado
- `onSubmit`: Callback para subir video
- `isUploading`: Estado de carga
- Estados de video (título, descripción, file, preview, trim options, thumbnail)
- `onVideoFileChange`: Callback para cambiar archivo
- `maxDuration`: Duración máxima

---

### **8. GaleriaEditVideoDialog**
**Responsabilidad:** Dialog para editar recorte de video  
**Props:**
- `open`: Estado del dialog (editingVideo !== null)
- `onOpenChange`: Callback para cambiar estado
- `video`: Video a editar
- `onSave`: Callback para guardar cambios
- `isSaving`: Estado de carga
- `maxDuration`: Duración máxima

---

### **9. GaleriaDeleteDialog**
**Responsabilidad:** AlertDialog para confirmar eliminación  
**Props:**
- `open`: Estado del dialog (deleteId !== null)
- `onOpenChange`: Callback para cambiar estado
- `onConfirm`: Callback para confirmar eliminación

---

## 🎣 Hooks a Crear (si es necesario)

### **1. useGaleriaUpload**
**Responsabilidad:** Manejar lógica de upload de imágenes y videos  
**Retorna:**
- Estados de upload
- Handlers para upload
- Helpers para limpiar previews

---

## 📁 Estructura Final

```
components/admin/galeria/
├── galeria-header.tsx
├── galeria-imagenes-section.tsx
├── galeria-videos-section.tsx
├── galeria-imagen-item.tsx
├── galeria-video-item.tsx
├── galeria-upload-imagen-dialog.tsx
├── galeria-upload-video-dialog.tsx
├── galeria-edit-video-dialog.tsx
├── galeria-delete-dialog.tsx
└── index.ts (barrel export)
```

---

## 📊 Estimación de Reducción

| Componente | Líneas Originales | Líneas Nuevas | Reducción |
|------------|-------------------|---------------|-----------|
| **Página Principal** | 920 | ~250-300 | **67-73%** |
| **Componentes** | 0 | ~650-700 | **+9 componentes** |

---

## ✅ Funcionalidades a Preservar

- ✅ Upload de imágenes (máx. 4)
- ✅ Upload de videos (máx. 2)
- ✅ Recorte de videos
- ✅ Edición de recorte de videos
- ✅ Eliminación de imágenes/videos
- ✅ Validaciones de tamaño y formato
- ✅ Preview de videos
- ✅ Thumbnails de videos
- ✅ Estados de carga
- ✅ Manejo de errores

---

**Fecha:** Diciembre 2024

