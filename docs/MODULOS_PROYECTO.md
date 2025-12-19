# 📦 Módulos del Proyecto AMVA Digital

## 📊 Resumen General

Tu proyecto tiene **8 módulos principales** en el frontend y **7 módulos** en el backend, más módulos de soporte.

---

## 🎨 MÓDULOS FRONTEND (Next.js)

### 1. **🏠 Landing Page** (`/app/page.tsx`)

- **Ruta:** `/`
- **Descripción:** Página principal pública del sitio
- **Componentes:**
  - `components/hero-section.tsx`
  - `components/about-section.tsx`
  - `components/conventions-section.tsx`
  - `components/pastores-section.tsx`
  - `components/news-section.tsx`
  - `components/gallery-section.tsx`
  - `components/educacion-section.tsx`
  - `components/sedes-section.tsx`
  - `components/footer.tsx`
  - `components/navbar.tsx`

### 2. **👨‍💼 AMVA Digital (Admin)** (`/app/admin/`)

- **Ruta:** `/admin/*`
- **Layout:** `app/admin/layout.tsx`
- **Descripción:** Panel de administración completo
- **Submódulos:**
  - **Dashboard** (`/admin`) - Vista general
  - **Inscripciones** (`/admin/inscripciones`) - Gestión de inscripciones
  - **Pagos** (`/admin/pagos`) - Gestión de pagos
  - **Pastores** (`/admin/pastores`) - Gestión de estructura organizacional
  - **Noticias** (`/admin/noticias`) - Gestión de noticias
  - **Galería** (`/admin/galeria`) - Gestión de multimedia
  - **Login** (`/admin/login`) - Autenticación de administradores
  - **Forgot Password** (`/admin/forgot-password`) - Recuperación de contraseña
  - **Reset Password** (`/admin/reset-password`) - Restablecimiento de contraseña

- **Componentes:**
  - `components/admin/admin-sidebar.tsx`
  - `components/admin/inscripcion-pago-wizard.tsx`
  - `components/admin/editar-inscripcion-dialog.tsx`
  - `components/admin/pago-wizard.tsx`
  - `components/admin/inscripcion-success-modal.tsx`
  - `components/admin/notifications-bell.tsx`
  - `components/admin/stats-charts.tsx`
  - `components/admin/quick-pago-dialog.tsx`

### 3. **📝 Convenciones** (`/app/convencion/`)

- **Ruta:** `/convencion/inscripcion`
- **Descripción:** Formulario público de inscripción a convenciones
- **Componentes:**
  - `components/convencion/step1-auth.tsx` - Autenticación
  - `components/convencion/step2-convencion-info.tsx` - Información de convención
  - `components/convencion/step3-formulario.tsx` - Formulario de datos
  - `components/convencion/step4-resumen.tsx` - Resumen y confirmación
  - `components/convencion/unified-inscription-form.tsx` - Formulario unificado
  - `components/convencion/inscripcion-existente-card.tsx` - Card de inscripción existente

### 4. **📰 Noticias (Público)** (`/app/noticias/`)

- **Ruta:** `/noticias` y `/noticias/[slug]`
- **Layout:** `app/noticias/layout.tsx`
- **Descripción:** Visualización pública de noticias
- **Páginas:**
  - Lista de noticias (`/noticias`)
  - Detalle de noticia (`/noticias/[slug]`)

### 5. **👥 Equipo** (`/app/equipo/`)

- **Ruta:** `/equipo`
- **Layout:** `app/equipo/layout.tsx`
- **Descripción:** Visualización del equipo organizacional

### 6. **👤 Mi Cuenta** (`/app/mi-cuenta/`)

- **Ruta:** `/mi-cuenta`
- **Descripción:** Perfil del usuario autenticado (pastores)
- **Funcionalidades:**
  - Ver información personal
  - Ver inscripciones
  - Ver estado de pagos
  - Cerrar sesión

### 7. **🔐 Autenticación (Público)**

- **Rutas:**
  - Login unificado (en `/convencion/inscripcion`)
  - Google OAuth callback
  - Registro de pastores
  - Registro de invitados

### 8. **📱 Mobile App** (`/amva-mobile/`)

- **Descripción:** Aplicación móvil React Native
- **Estructura:**
  - `src/screens/` - Pantallas de la app
  - `src/api/` - Clientes API
  - `src/hooks/` - Hooks personalizados
  - `src/navigation/` - Navegación
  - `src/types/` - Tipos TypeScript
  - `src/utils/` - Utilidades

---

## ⚙️ MÓDULOS BACKEND (NestJS)

### 1. **🔐 Auth Module** (`backend/src/modules/auth/`)

- **Endpoints:**
  - `/api/auth/login` - Login admin
  - `/api/auth/register` - Registro admin
  - `/api/auth/me` - Perfil actual
  - `/api/auth/logout` - Cerrar sesión
  - `/api/auth/pastor/*` - Autenticación de pastores
  - `/api/auth/invitado/*` - Autenticación de invitados
  - `/api/auth/login/unified` - Login unificado
  - `/api/auth/google` - Google OAuth

- **Funcionalidades:**
  - JWT tokens
  - Refresh tokens
  - Token blacklisting (Redis)
  - Google OAuth
  - Password reset
  - Password hashing (bcrypt)

### 2. **📝 Inscripciones Module** (`backend/src/modules/inscripciones/`)

- **Endpoints:**
  - `/api/inscripciones` - CRUD de inscripciones
  - `/api/inscripciones/:id` - Obtener/actualizar inscripción
  - `/api/inscripciones/check` - Verificar inscripción existente
  - `/api/inscripciones/:id/cancelar` - Cancelar inscripción
  - `/api/inscripciones/:id/rehabilitar` - Rehabilitar inscripción
  - `/api/inscripciones/recordatorios` - Enviar recordatorios de pago
  - `/api/pagos` - CRUD de pagos
  - `/api/pagos/:id` - Obtener/actualizar pago
  - `/api/pagos/reporte-ingresos` - Reporte de ingresos

- **Funcionalidades:**
  - Gestión completa de inscripciones
  - Gestión de pagos
  - Códigos de referencia únicos
  - Envío de emails de confirmación
  - Recordatorios de pago
  - Reportes de ingresos

### 3. **📅 Convenciones Module** (`backend/src/modules/convenciones/`)

- **Endpoints:**
  - `/api/convenciones` - CRUD de convenciones
  - `/api/convenciones/:id` - Obtener/actualizar convención
  - `/api/convenciones/activa` - Obtener convención activa

- **Funcionalidades:**
  - Gestión de convenciones
  - Convención activa
  - Fechas y ubicaciones

### 4. **👥 Pastores Module** (`backend/src/modules/pastores/`)

- **Endpoints:**
  - `/api/pastores` - CRUD de pastores
  - `/api/pastores/:id` - Obtener/actualizar pastor
  - `/api/pastores/landing` - Pastores para landing page

- **Funcionalidades:**
  - Gestión de estructura organizacional
  - Tipos de pastores (DIRECTIVA, SUPERVISOR, PRESIDENTE, PASTOR)
  - Mostrar en landing page
  - Regiones y ministerios

### 5. **📰 Noticias Module** (`backend/src/modules/noticias/`)

- **Endpoints:**
  - `/api/noticias` - CRUD de noticias
  - `/api/noticias/:id` - Obtener/actualizar noticia
  - `/api/noticias/publicas` - Noticias públicas

- **Funcionalidades:**
  - Gestión de noticias
  - Categorías (ANUNCIO, EVENTO, ACTIVIDAD, etc.)
  - Publicación/despublicación
  - Noticias destacadas

### 6. **🖼️ Galería Module** (`backend/src/modules/galeria/`)

- **Endpoints:**
  - `/api/galeria` - CRUD de elementos de galería
  - `/api/galeria/:id` - Obtener/actualizar elemento

- **Funcionalidades:**
  - Gestión de multimedia
  - Imágenes y videos
  - Categorías

### 7. **📤 Upload Module** (`backend/src/modules/upload/`)

- **Endpoints:**
  - `/api/upload` - Subir archivos
  - `/api/upload/image` - Subir imágenes
  - `/api/upload/document` - Subir documentos

- **Funcionalidades:**
  - Subida de archivos a Cloudinary
  - Validación de tipos
  - Optimización de imágenes

### 8. **📧 Notifications Module** (`backend/src/modules/notifications/`)

- **Funcionalidades:**
  - Envío de emails (Nodemailer/SendGrid)
  - Cola de notificaciones (BullMQ + Redis)
  - Templates de email
  - Notificaciones push (preparado)

---

## 🔌 MÓDULOS DE API (Frontend)

### Clientes API (`lib/api/`)

1. **`auth.ts`** - Autenticación admin
2. **`pastor-auth.ts`** - Autenticación pastores
3. **`invitado-auth.ts`** - Autenticación invitados
4. **`unified-auth.ts`** - Autenticación unificada
5. **`inscripciones.ts`** - Inscripciones y pagos
6. **`convenciones.ts`** - Convenciones
7. **`pastores.ts`** - Pastores
8. **`noticias.ts`** - Noticias
9. **`galeria.ts`** - Galería
10. **`upload.ts`** - Subida de archivos
11. **`client.ts`** - Cliente Axios base

---

## 🎣 MÓDULOS DE HOOKS (Frontend)

### Hooks Personalizados (`lib/hooks/`)

1. **`use-auth.ts`** - Autenticación admin
2. **`use-pastor-auth.ts`** - Autenticación pastores
3. **`use-invitado-auth.ts`** - Autenticación invitados
4. **`use-unified-auth.ts`** - Autenticación unificada
5. **`use-inscripciones.ts`** - Hooks de inscripciones
6. **`use-pagos.ts`** - Hooks de pagos
7. **`use-convencion.ts`** - Hooks de convenciones
8. **`use-pastores.ts`** - Hooks de pastores
9. **`use-noticias.ts`** - Hooks de noticias
10. **`use-galeria.ts`** - Hooks de galería
11. **`use-smart-sync.ts`** - Sincronización entre pestañas
12. **`use-query-provider.tsx`** - Provider de React Query

---

## 🧩 MÓDULOS DE COMPONENTES UI

### Componentes Base (`components/ui/`)

- Shadcn UI components:
  - `button.tsx`, `input.tsx`, `label.tsx`
  - `card.tsx`, `dialog.tsx`, `select.tsx`
  - `badge.tsx`, `skeleton.tsx`, `toast.tsx`
  - `checkbox.tsx`, `textarea.tsx`, `tooltip.tsx`
  - `alert.tsx`, `popover.tsx`, `sheet.tsx`
  - `scroll-area.tsx`, `slider.tsx`, `switch.tsx`
  - `comprobante-upload.tsx`, `image-upload.tsx`

---

## 📊 Resumen por Categoría

### **Módulos Principales:**

1. ✅ Landing Page
2. ✅ AMVA Digital (Admin)
3. ✅ Convenciones
4. ✅ Noticias
5. ✅ Equipo
6. ✅ Mi Cuenta
7. ✅ Autenticación
8. ✅ Mobile App

### **Módulos Backend:**

1. ✅ Auth
2. ✅ Inscripciones
3. ✅ Convenciones
4. ✅ Pastores
5. ✅ Noticias
6. ✅ Galería
7. ✅ Upload
8. ✅ Notifications

### **Módulos de Soporte:**

- ✅ API Clients (11 módulos)
- ✅ Hooks (12 módulos)
- ✅ UI Components (20+ componentes)
- ✅ Utils y Validations

---

## 🎯 Estado de Implementación

| Módulo               | Frontend | Backend | Estado      |
| -------------------- | -------- | ------- | ----------- |
| Landing Page         | ✅       | N/A     | ✅ Completo |
| Admin (AMVA Digital) | ✅       | ✅      | ✅ Completo |
| Convenciones         | ✅       | ✅      | ✅ Completo |
| Inscripciones        | ✅       | ✅      | ✅ Completo |
| Pagos                | ✅       | ✅      | ✅ Completo |
| Pastores             | ✅       | ✅      | ✅ Completo |
| Noticias             | ✅       | ✅      | ✅ Completo |
| Galería              | ✅       | ✅      | ✅ Completo |
| Autenticación        | ✅       | ✅      | ✅ Completo |
| Mobile App           | ✅       | ✅      | ✅ Completo |
| Upload               | ✅       | ✅      | ✅ Completo |
| Notificaciones       | ✅       | ✅      | ✅ Completo |

---

## 📈 Estadísticas

- **Total Módulos Frontend:** 8 principales
- **Total Módulos Backend:** 8 principales
- **Total Endpoints API:** ~50+
- **Total Componentes:** 50+
- **Total Hooks:** 12
- **Total Clientes API:** 11

---

**Última actualización:** Diciembre 2024













