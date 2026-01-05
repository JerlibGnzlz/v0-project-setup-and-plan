# 💰 Estimación de Costos - Migración a Digital Ocean

## 📋 Resumen Ejecutivo

**Aplicación**: AMVA Digital (Landing + Panel Admin + App Móvil)  
**Fecha**: Enero 2025  
**Arquitectura**: Monorepo con Frontend (Next.js), Backend (NestJS), Base de Datos (PostgreSQL), y App Móvil (React Native)

---

## 🏗️ Arquitectura Actual

### Componentes Identificados:

1. **Frontend (Next.js 16)**
   - Panel administrativo completo
   - Landing page pública
   - Gestión de convenciones, noticias, galería
   - Sistema de notificaciones en tiempo real (WebSocket)

2. **Backend (NestJS 10)**
   - API REST completa
   - WebSockets (Socket.io)
   - Sistema de colas (Bull + Redis)
   - Autenticación JWT
   - Upload de archivos (Cloudinary)

3. **Base de Datos (PostgreSQL)**
   - Usuarios, roles, auditoría
   - Convenciones e inscripciones
   - Pagos y notificaciones
   - Credenciales ministeriales
   - Galería multimedia

4. **Servicios Externos**
   - Cloudinary (imágenes/videos)
   - SendGrid/Resend (emails)
   - Mercado Pago (pagos - opcional)

5. **App Móvil (React Native/Expo)**
   - Autenticación de pastores
   - Gestión de credenciales
   - Inscripciones a convenciones

---

## 💵 Costos Estimados en Digital Ocean

### Opción 1: Infraestructura Básica (Recomendada para empezar)

| Recurso | Especificaciones | Costo Mensual |
|---------|------------------|---------------|
| **Droplet Backend** | 2GB RAM, 1 vCPU, 50GB SSD | $12/mes |
| **Managed PostgreSQL** | 1GB RAM, 1 vCPU, 10GB storage | $15/mes |
| **Managed Redis** | 1GB RAM, 1 vCPU | $15/mes |
| **App Platform (Frontend)** | Basic Plan (512MB RAM) | $5/mes |
| **Load Balancer** | Opcional (para alta disponibilidad) | $12/mes |
| **Spaces (Storage)** | 250GB (para backups) | $5/mes |
| **Monitoring** | Incluido | $0/mes |
| **TOTAL MENSUAL** | | **$64/mes** |

### Opción 2: Infraestructura Escalada (Para mayor tráfico)

| Recurso | Especificaciones | Costo Mensual |
|---------|------------------|---------------|
| **Droplet Backend** | 4GB RAM, 2 vCPU, 80GB SSD | $24/mes |
| **Managed PostgreSQL** | 2GB RAM, 1 vCPU, 25GB storage | $25/mes |
| **Managed Redis** | 2GB RAM, 1 vCPU | $30/mes |
| **App Platform (Frontend)** | Professional Plan (1GB RAM) | $12/mes |
| **Load Balancer** | Requerido | $12/mes |
| **Spaces (Storage)** | 500GB | $10/mes |
| **Monitoring** | Incluido | $0/mes |
| **TOTAL MENSUAL** | | **$113/mes** |

### Opción 3: Infraestructura Premium (Alta disponibilidad)

| Recurso | Especificaciones | Costo Mensual |
|---------|------------------|---------------|
| **Droplet Backend (x2)** | 4GB RAM, 2 vCPU cada uno | $48/mes |
| **Managed PostgreSQL** | 4GB RAM, 2 vCPU, 50GB storage | $60/mes |
| **Managed Redis** | 4GB RAM, 2 vCPU | $60/mes |
| **App Platform (Frontend)** | Professional Plan (2GB RAM) | $24/mes |
| **Load Balancer** | Requerido | $12/mes |
| **Spaces (Storage)** | 1TB | $20/mes |
| **Monitoring** | Incluido | $0/mes |
| **TOTAL MENSUAL** | | **$224/mes** |

---

## 📊 Servicios Externos (Costos Adicionales)

| Servicio | Plan | Costo Mensual |
|----------|------|---------------|
| **Cloudinary** | Free tier (25GB storage, 25GB bandwidth) | $0/mes |
| **Cloudinary** | Plus Plan (100GB storage, 100GB bandwidth) | $99/mes |
| **SendGrid** | Free tier (100 emails/día) | $0/mes |
| **SendGrid** | Essentials Plan (40,000 emails/mes) | $19.95/mes |
| **Resend** | Free tier (3,000 emails/mes) | $0/mes |
| **Resend** | Pro Plan (50,000 emails/mes) | $20/mes |
| **Mercado Pago** | Comisiones por transacción | Variable |

**Nota**: Los servicios externos pueden empezar en el tier gratuito y escalar según necesidades.

---

## 💼 Precio Recomendado al Cliente

### Estructura de Precios Sugerida:

#### **Opción A: Plan Básico** - $150/mes
- ✅ Infraestructura básica (Opción 1)
- ✅ Mantenimiento básico (4 horas/mes)
- ✅ Monitoreo y alertas
- ✅ Backups diarios
- ✅ Soporte por email
- ✅ Actualizaciones de seguridad

#### **Opción B: Plan Profesional** - $250/mes
- ✅ Infraestructura escalada (Opción 2)
- ✅ Mantenimiento extendido (8 horas/mes)
- ✅ Monitoreo 24/7
- ✅ Backups automáticos + restauración
- ✅ Soporte prioritario (email + chat)
- ✅ Actualizaciones de seguridad y features
- ✅ Optimización de rendimiento

#### **Opción C: Plan Enterprise** - $450/mes
- ✅ Infraestructura premium (Opción 3)
- ✅ Mantenimiento dedicado (16 horas/mes)
- ✅ Monitoreo avanzado + alertas SMS
- ✅ Backups en tiempo real + disaster recovery
- ✅ Soporte 24/7 (email + chat + teléfono)
- ✅ Desarrollo de nuevas features
- ✅ Consultoría técnica
- ✅ SLA garantizado (99.9% uptime)

---

## 📈 Desglose de Costos

### Costos Directos (Infraestructura):
- **Opción 1**: $64/mes
- **Opción 2**: $113/mes
- **Opción 3**: $224/mes

### Costos Indirectos (Servicios Externos):
- **Cloudinary Plus**: $99/mes (opcional, cuando se necesite)
- **SendGrid/Resend Pro**: $20/mes (opcional, cuando se necesite)
- **Mercado Pago**: Comisiones variables (solo si se usa)

### Margen de Ganancia Sugerido:
- **Plan Básico**: $150 - $64 = **$86/mes** (134% margen)
- **Plan Profesional**: $250 - $113 = **$137/mes** (121% margen)
- **Plan Enterprise**: $450 - $224 = **$226/mes** (101% margen)

**Nota**: Los márgenes incluyen tiempo de mantenimiento, soporte y gestión.

---

## 🎯 Recomendaciones

### Para Empezar:
1. **Opción 1 (Básica)** - $64/mes de infraestructura
2. **Plan Básico al Cliente** - $150/mes
3. Servicios externos en tier gratuito inicialmente

### Para Escalar:
1. **Opción 2 (Escalada)** - $113/mes de infraestructura
2. **Plan Profesional al Cliente** - $250/mes
3. Evaluar necesidad de Cloudinary Plus según uso

### Para Alta Disponibilidad:
1. **Opción 3 (Premium)** - $224/mes de infraestructura
2. **Plan Enterprise al Cliente** - $450/mes
3. Todos los servicios en planes profesionales

---

## 📋 Checklist de Migración

### Pre-Migración:
- [ ] Backup completo de base de datos actual
- [ ] Documentación de variables de entorno
- [ ] Lista de servicios externos y credenciales
- [ ] Plan de rollback en caso de problemas

### Durante la Migración:
- [ ] Crear recursos en Digital Ocean
- [ ] Configurar base de datos PostgreSQL
- [ ] Configurar Redis
- [ ] Desplegar backend en Droplet
- [ ] Desplegar frontend en App Platform
- [ ] Configurar DNS y SSL
- [ ] Migrar datos de base de datos
- [ ] Pruebas de funcionalidad completa

### Post-Migración:
- [ ] Monitoreo de rendimiento
- [ ] Optimización de recursos
- [ ] Documentación de nueva infraestructura
- [ ] Plan de mantenimiento

---

## 💡 Consideraciones Adicionales

### Factores que Pueden Afectar el Precio:

1. **Tráfico**: Más usuarios = más recursos necesarios
2. **Almacenamiento**: Más imágenes/videos = más Cloudinary o Spaces
3. **Emails**: Más notificaciones = plan de email más alto
4. **Backups**: Más frecuencia = más almacenamiento
5. **Soporte**: Más horas de mantenimiento = precio más alto

### Servicios Opcionales:

- **CDN**: Digital Ocean Spaces + CDN ($5-10/mes adicionales)
- **Monitoring Avanzado**: Datadog, New Relic ($15-30/mes)
- **Logging**: Papertrail, Logtail ($5-10/mes)
- **SSL Certificado**: Let's Encrypt (gratis) o certificado comercial ($50-200/año)

---

## 📞 Contacto y Soporte

Para más información sobre la migración o ajustes en los planes, contactar al equipo técnico.

---

**Última actualización**: Enero 2025  
**Versión**: 1.0

