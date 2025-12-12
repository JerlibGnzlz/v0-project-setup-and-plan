# 📊 Estado Actual del Proyecto AMVA Digital

**Última actualización**: Diciembre 2025  
**Versión**: v0.1.1

---

## 🎯 Resumen Ejecutivo

AMVA Digital es una plataforma completa para la gestión de convenciones, inscripciones, pagos y contenido del Ministerio Asociación Misionera Vida Abundante. El proyecto incluye:

- **Frontend Web**: Next.js 16 con React 19
- **Backend API**: NestJS 10 con Prisma ORM
- **App Móvil**: React Native (Expo) - En desarrollo
- **Base de Datos**: PostgreSQL (Neon)
- **Deployment**: Vercel (Frontend) + Render (Backend)

---

## 🛠️ Stack Tecnológico

### Frontend
- **Framework**: Next.js 16 (App Router)
- **React**: 19.2.1
- **TypeScript**: 5.9.3
- **UI Library**: shadcn/ui (Radix UI)
- **Estilos**: Tailwind CSS 4.1.9
- **Estado**: Zustand (auth), React Query (data fetching)
- **Formularios**: React Hook Form + Zod
- **Notificaciones**: Sonner (toast)
- **Iconos**: Lucide React
- **Temas**: Dark/Light mode con next-themes

### Backend
- **Framework**: NestJS 10.3.0
- **ORM**: Prisma 5.8.0
- **Base de Datos**: PostgreSQL (Neon)
- **Autenticación**: JWT (Passport.js)
- **Validación**: class-validator + class-transformer
- **Colas**: Bull + Redis (notificaciones)
- **WebSockets**: Socket.io (notificaciones en tiempo real)
- **Upload**: Cloudinary + Multer
- **Email**: SendGrid + Resend + Nodemailer (SMTP fallback)
- **Pagos**: Mercado Pago SDK

### Mobile
- **Framework**: React Native (Expo)
- **Estado**: En desarrollo

---

## 📁 Estructura del Proyecto

```
/
├── app/                    # Next.js App Router
│   ├── admin/             # Panel administrativo
│   │   ├── inscripciones/ # Gestión de inscripciones
│   │   ├── pagos/         # Gestión de pagos
│   │   ├── pastores/      # Gestión de pastores
│   │   ├── noticias/      # Gestión de noticias
│   │   ├── galeria/       # Gestión de galería
│   │   └── login/         # Autenticación admin
│   ├── convencion/         # Páginas públicas de convenciones
│   │   ├── inscripcion/   # Formulario de inscripción
│   │   ├── pago-exitoso/  # Confirmación de pago exitoso
│   │   ├── pago-pendiente/# Estado de pago pendiente
│   │   └── pago-fallido/  # Estado de pago fallido
│   ├── noticias/          # Páginas públicas de noticias
│   └── equipo/            # Página de equipo
│
├── components/            # Componentes React reutilizables
│   ├── admin/            # Componentes del panel admin
│   ├── convencion/       # Componentes de convenciones
│   ├── ui/               # Componentes UI base (shadcn/ui)
│   └── [feature]/        # Componentes por feature
│
├── lib/                  # Utilidades y configuraciones
│   ├── api/              # Clientes API (axios)
│   ├── hooks/            # Custom React hooks
│   └── utils/            # Funciones utilitarias
│
├── backend/              # Backend NestJS
│   ├── src/
│   │   ├── modules/      # Módulos NestJS
│   │   ├── common/       # Servicios y utilidades compartidas
│   │   └── prisma/       # Configuración Prisma
│   └── prisma/           # Schema y migraciones
│
└── amva-mobile/          # App móvil React Native
```

---

## 🎯 Funcionalidades Principales

### 1. Autenticación y Autorización

#### Tres Tipos de Usuarios:
- **Admin**: Panel administrativo (`/admin/*`)
  - Autenticación JWT
  - Refresh tokens
  - Logout con blacklist de tokens
  
- **Pastor**: App móvil (endpoints `/auth/pastor/*`)
  - Autenticación JWT específica
  - Refresh tokens independientes
  
- **Invitado**: Web pública (endpoints `/auth/invitado/*`)
  - Autenticación JWT
  - **Google OAuth** integrado
  - Refresh tokens
  - Logout con limpieza de estado

#### Características:
- ✅ Autenticación con Google OAuth
- ✅ JWT con refresh tokens
- ✅ Token blacklist para logout seguro
- ✅ Guards específicos por tipo de usuario
- ✅ Manejo de sesiones y tokens en localStorage

### 2. Gestión de Convenciones

#### Funcionalidades:
- ✅ CRUD completo de convenciones
- ✅ Activar/desactivar convenciones
- ✅ Archivar convenciones antiguas
- ✅ Gestión de cupos máximos
- ✅ Fechas de inicio y fin
- ✅ Costos configurables
- ✅ Imágenes y galería asociada

#### Endpoints:
- `GET /convenciones` - Listar todas (público)
- `GET /convenciones/:id` - Ver una convención (público)
- `POST /convenciones` - Crear (admin)
- `PATCH /convenciones/:id` - Actualizar (admin)
- `DELETE /convenciones/:id` - Eliminar (admin)

### 3. Sistema de Inscripciones

#### Funcionalidades:
- ✅ Inscripción desde landing page (público)
- ✅ Inscripción desde panel admin
- ✅ Inscripción desde app móvil
- ✅ Código de referencia único por inscripción
- ✅ Gestión de múltiples cuotas (1, 2 o 3)
- ✅ Estados: `pendiente`, `confirmado`, `cancelado`
- ✅ Origen de registro: `web`, `dashboard`, `mobile`
- ✅ Validación de email único por convención
- ✅ Rehabilitación de inscripciones canceladas

#### Flujo de Inscripción:
1. Usuario se autentica (Google OAuth o email/password)
2. Completa formulario de inscripción
3. Se genera código de referencia único
4. Se crean pagos automáticamente (según número de cuotas)
5. Se envía notificación a admins
6. Usuario puede ver estado de su inscripción

#### Endpoints:
- `POST /inscripciones` - Crear inscripción (público)
- `GET /inscripciones` - Listar todas (admin)
- `GET /inscripciones/:id` - Ver una inscripción
- `PATCH /inscripciones/:id` - Actualizar (admin)
- `POST /inscripciones/:id/cancelar` - Cancelar (admin)
- `POST /inscripciones/:id/rehabilitar` - Rehabilitar (admin)
- `GET /inscripciones/check/:convencionId/:email` - Verificar si ya está inscrito

### 4. Sistema de Pagos

#### Funcionalidades:
- ✅ Gestión de pagos por cuotas
- ✅ Estados: `PENDIENTE`, `COMPLETADO`, `CANCELADO`, `RECHAZADO`, `REEMBOLSADO`
- ✅ Validación y rechazo de pagos (admin)
- ✅ Rehabilitación de pagos cancelados (admin)
- ✅ Subida de comprobantes (drag & drop)
- ✅ Validación de montos
- ✅ Confirmación automática cuando todas las cuotas están pagadas
- ✅ Código de referencia para transferencias
- ✅ Integración con Mercado Pago (opcional)

#### Métodos de Pago:
- **Transferencia bancaria**: Con código de referencia
- **Mercado Pago**: Integración completa con webhooks
- **Efectivo**: Para inscripciones manuales

#### Endpoints:
- `GET /pagos` - Listar todos (admin)
- `GET /pagos/:id` - Ver un pago
- `POST /pagos/:id/validar` - Validar pago (admin)
- `POST /pagos/:id/rechazar` - Rechazar pago (admin)
- `POST /pagos/:id/rehabilitar` - Rehabilitar pago (admin)
- `POST /pagos/validar-masivos` - Validar múltiples pagos (admin)

### 5. Sistema de Notificaciones

#### Características:
- ✅ **Notificaciones en tiempo real** (WebSocket)
- ✅ **Notificaciones por email** (SendGrid/Resend/SMTP)
- ✅ **Push notifications** (Expo - móvil)
- ✅ **Notificaciones in-app** (campanita en header admin)
- ✅ **Historial de notificaciones** (NotificationHistory)
- ✅ **Contador de no leídas** en tiempo real
- ✅ **Templates de email personalizados** con nombres reales

#### Tipos de Notificaciones:
- `nueva_inscripcion`: Cuando se crea una inscripción nueva
- `pago_validado`: Cuando un admin valida un pago
- `pago_rechazado`: Cuando un admin rechaza un pago
- `pago_rehabilitado`: Cuando se rehabilita un pago rechazado
- `inscripcion_confirmada`: Cuando todas las cuotas están pagadas
- `pago_recordatorio`: Recordatorio de pagos pendientes

#### Procesamiento:
- **Cola de procesamiento**: Bull + Redis (opcional)
- **Fallback directo**: Si Redis no está disponible
- **WebSocket Gateway**: Notificaciones en tiempo real para admins
- **Email Service**: SendGrid → Resend → SMTP (fallback automático)

### 6. Gestión de Pastores

#### Funcionalidades:
- ✅ CRUD completo de pastores
- ✅ Estructura organizacional
- ✅ Autenticación específica para pastores
- ✅ Gestión de cargos y sedes
- ✅ Activar/desactivar pastores
- ✅ Biografías y fotos

#### Endpoints:
- `GET /pastores` - Listar todos (público)
- `GET /pastores/:id` - Ver un pastor (público)
- `POST /pastores` - Crear pastor (admin)
- `PATCH /pastores/:id` - Actualizar (admin)
- `DELETE /pastores/:id` - Desactivar (admin)

### 7. Gestión de Noticias

#### Funcionalidades:
- ✅ CRUD completo de noticias
- ✅ Publicación programada (`fechaPublicacion`)
- ✅ Fechas de creación y modificación
- ✅ Slug único para URLs amigables
- ✅ Contenido en markdown
- ✅ Imágenes destacadas
- ✅ Estados: `borrador`, `publicado`, `archivado`

#### Endpoints:
- `GET /noticias` - Listar todas (público)
- `GET /noticias/:slug` - Ver una noticia (público)
- `POST /noticias` - Crear (admin)
- `PATCH /noticias/:id` - Actualizar (admin)
- `DELETE /noticias/:id` - Eliminar (admin)

### 8. Galería de Medios

#### Funcionalidades:
- ✅ Subida de imágenes (Cloudinary)
- ✅ Subida de videos (Cloudinary)
- ✅ Gestión de galería por convención
- ✅ Eliminación de medios
- ✅ Organización y categorización

#### Endpoints:
- `GET /galeria` - Listar medios
- `POST /galeria` - Subir medio (admin)
- `DELETE /galeria/:id` - Eliminar medio (admin)

### 9. Panel Administrativo

#### Dashboard:
- ✅ Estadísticas generales
- ✅ Gráficos de inscripciones y pagos
- ✅ Acciones rápidas
- ✅ Lista de convenciones activas
- ✅ Notificaciones en tiempo real

#### Módulos:
- **Inscripciones**: Gestión completa con filtros, búsqueda, edición
- **Pagos**: Validación masiva, filtros avanzados, estadísticas
- **Pastores**: CRUD completo con búsqueda y filtros
- **Noticias**: Editor de noticias con preview
- **Galería**: Gestión de imágenes y videos
- **Configuración**: Seguridad y ajustes

#### Características:
- ✅ Filtros avanzados en todas las secciones
- ✅ Búsqueda en tiempo real
- ✅ Paginación optimizada
- ✅ Exportación a CSV
- ✅ Validación masiva de pagos
- ✅ Edición inline de inscripciones
- ✅ Modales y dialogs para acciones

### 10. Landing Page Pública

#### Secciones:
- ✅ Hero section con animaciones
- ✅ Sección de convenciones próximas
- ✅ Sección de noticias
- ✅ Sección de educación
- ✅ Sección de equipo/pastores
- ✅ Sección de sedes
- ✅ Formulario de inscripción
- ✅ Footer completo

#### Características:
- ✅ Diseño responsive (mobile-first)
- ✅ Dark/Light mode
- ✅ Animaciones suaves
- ✅ Scroll progress indicator
- ✅ Back to top button
- ✅ SEO optimizado (robots.txt, sitemap.xml)

---

## 🔧 Módulos Backend Implementados

### 1. AuthModule
- Autenticación JWT para admins
- Autenticación JWT para pastores
- Autenticación JWT para invitados
- Google OAuth Strategy
- Token blacklist service
- Refresh tokens

### 2. ConvencionesModule
- CRUD completo
- Repository pattern
- Validación de fechas y cupos

### 3. InscripcionesModule
- CRUD completo
- Gestión de pagos asociados
- Generación de códigos de referencia
- Validación de emails únicos
- Cancelación y rehabilitación
- Recordatorios de pago automáticos

### 4. PagosModule (dentro de InscripcionesModule)
- Validación y rechazo
- Rehabilitación
- Validación masiva
- Gestión de comprobantes

### 5. PastoresModule
- CRUD completo
- BaseService pattern
- Búsqueda y filtros

### 6. NoticiasModule
- CRUD completo
- Gestión de fechas de publicación
- Slug generation

### 7. GaleriaModule
- Subida de imágenes y videos
- Integración con Cloudinary
- Gestión por convención

### 8. NotificationsModule
- Email service (SendGrid/Resend/SMTP)
- WebSocket gateway
- Push notifications (Expo)
- Templates personalizados
- Historial de notificaciones
- Cola de procesamiento (Bull + Redis)

### 9. MercadoPagoModule
- Creación de preferencias de pago
- Webhooks para actualización de estado
- Consulta de estado de pagos
- Integración completa

### 10. UploadModule
- Subida a Cloudinary
- Validación de archivos
- Soporte para imágenes y videos

---

## 🎨 Mejoras de Accesibilidad (WCAG)

### Implementadas Recientemente:
- ✅ **Principios WCAG aplicados** al código de referencia de pagos
- ✅ **Roles ARIA** (`region`, `group`)
- ✅ **aria-labelledby** y **aria-label** descriptivos
- ✅ **Focus states** mejorados para navegación por teclado
- ✅ **Contraste de colores** mejorado
- ✅ **Instrucciones claras y estructuradas** (lista numerada)
- ✅ **Screen reader friendly**

---

## 📧 Sistema de Email

### Proveedores Configurados:
1. **SendGrid** (Principal - Producción)
2. **Resend** (Fallback)
3. **Gmail SMTP** (Fallback final)

### Características:
- ✅ Fallback automático entre proveedores
- ✅ Templates personalizados con nombres reales
- ✅ Manejo robusto de errores
- ✅ Logging detallado
- ✅ Retry automático en SMTP

### Templates Disponibles:
- `getPagoValidadoTemplate`
- `getPagoRechazadoTemplate`
- `getPagoRehabilitadoTemplate`
- `getPagoRecordatorioTemplate`
- `getInscripcionCreadaTemplate`
- `getInscripcionConfirmadaTemplate`
- `getInscripcionCanceladaTemplate`
- `getInscripcionActualizadaTemplate`

---

## 🔐 Seguridad

### Implementado:
- ✅ JWT con expiración corta (15-30 min)
- ✅ Refresh tokens con expiración larga (7-30 días)
- ✅ Token blacklist para logout seguro
- ✅ Rate limiting (ThrottlerModule)
- ✅ Validación en frontend (Zod) y backend (class-validator)
- ✅ Sanitización de inputs
- ✅ CORS configurado
- ✅ Helmet para headers de seguridad
- ✅ Bcrypt para hashing de passwords

---

## 🚀 Deployment

### Frontend:
- **Plataforma**: Vercel
- **URL**: `https://v0-ministerio-amva.vercel.app`
- **Build**: Automático desde GitHub
- **Environment**: Production

### Backend:
- **Plataforma**: Render
- **URL**: `https://ministerio-backend-wdbj.onrender.com`
- **Environment**: Production
- **Base de Datos**: Neon PostgreSQL

### Base de Datos:
- **Proveedor**: Neon
- **Tipo**: PostgreSQL
- **Conexión**: Connection pooling habilitado

---

## 📊 Estadísticas del Proyecto

### Archivos:
- **Frontend**: ~150+ componentes
- **Backend**: ~87 archivos TypeScript
- **Módulos Backend**: 10 módulos principales
- **Documentación**: 105+ archivos .md

### Funcionalidades:
- ✅ 10 módulos backend completos
- ✅ 3 tipos de autenticación
- ✅ 6 tipos de notificaciones
- ✅ 8 templates de email
- ✅ 3 métodos de pago
- ✅ 5 estados de pago
- ✅ 3 estados de inscripción

---

## 🔄 Flujos Principales

### Flujo de Inscripción:
1. Usuario visita landing page
2. Se autentica (Google OAuth o email/password)
3. Completa formulario de inscripción
4. Se genera código de referencia único
5. Se crean pagos automáticamente (1-3 cuotas)
6. Se envía notificación a admins
7. Usuario puede ver estado y subir comprobantes

### Flujo de Validación de Pago:
1. Usuario sube comprobante de pago
2. Admin revisa el pago en panel
3. Admin valida o rechaza el pago
4. Se envía notificación al usuario (email + in-app)
5. Se envía notificación a todos los admins
6. Si todas las cuotas están pagadas → inscripción confirmada

### Flujo de Notificaciones:
1. Evento se emite (EventEmitter2)
2. Listener procesa el evento
3. Se intenta agregar a cola (Bull + Redis)
4. Si Redis no disponible → procesamiento directo
5. Se envía email (SendGrid → Resend → SMTP)
6. Se envía push notification (si aplica)
7. Se actualiza WebSocket para admins
8. Se guarda en historial (NotificationHistory)

---

## 🎯 Características Recientes

### Implementadas en Diciembre 2025:
- ✅ **Google OAuth** para invitados
- ✅ **Rehabilitación de inscripciones** canceladas
- ✅ **Rehabilitación de pagos** cancelados
- ✅ **Deshabilitar botón Editar** cuando pagos completados
- ✅ **Avatar y logout** en página de inscripción
- ✅ **Mejora UX** para usuarios ya registrados
- ✅ **Validación mejorada** para nombres cortos y apellidos vacíos
- ✅ **Fechas de noticias** corregidas y consistentes
- ✅ **Principios WCAG** aplicados al código de referencia
- ✅ **Manejo de errores mejorado** en rehabilitación

---

## 📝 Próximos Pasos Sugeridos

### Corto Plazo:
- [ ] Completar app móvil React Native
- [ ] Implementar más tests
- [ ] Mejorar documentación de API
- [ ] Optimizar imágenes y assets

### Mediano Plazo:
- [ ] Dashboard de analytics avanzado
- [ ] Exportación de reportes (PDF)
- [ ] Integración con WhatsApp Business API
- [ ] Sistema de cupones y descuentos

### Largo Plazo:
- [ ] Multi-idioma (i18n)
- [ ] Sistema de permisos granulares
- [ ] API pública para integraciones
- [ ] App móvil nativa (iOS/Android)

---

## 📚 Documentación

El proyecto incluye documentación extensa en `/docs`:
- Guías de configuración
- Troubleshooting
- Mejores prácticas
- Checklists de deployment
- Guías de integración

---

## ✅ Estado General

**El proyecto está en producción y funcionando correctamente.**

- ✅ Frontend desplegado en Vercel
- ✅ Backend desplegado en Render
- ✅ Base de datos en Neon
- ✅ Sistema de notificaciones operativo
- ✅ Emails funcionando (SendGrid)
- ✅ WebSockets funcionando
- ✅ Autenticación completa
- ✅ Gestión de pagos e inscripciones operativa

---

**Última actualización**: Diciembre 2025  
**Versión del proyecto**: v0.1.1
