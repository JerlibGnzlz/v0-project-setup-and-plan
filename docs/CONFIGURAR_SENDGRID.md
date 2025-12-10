# 📧 Configurar SendGrid para Envío de Emails

## 🎯 ¿Por qué SendGrid?

Gmail SMTP desde Render puede tener problemas de timeout o bloqueos. SendGrid es un servicio profesional diseñado para envío de emails desde aplicaciones cloud, con:
- ✅ Mayor confiabilidad
- ✅ Mejor deliverability
- ✅ Tier gratuito generoso (100 emails/día)
- ✅ API simple y rápida
- ✅ Sin problemas de firewall

## 📋 Pasos para Configurar SendGrid

### 1. Crear Cuenta en SendGrid

1. Ve a https://signup.sendgrid.com/
2. Crea una cuenta gratuita
3. Verifica tu email

### 2. Crear API Key

1. Ve a Settings → API Keys
2. Haz clic en "Create API Key"
3. Nombre: "AMVA Backend"
4. Permisos: "Full Access" (o "Mail Send" mínimo)
5. Copia la API Key (solo se muestra una vez)

### 3. Verificar Sender Identity

1. Ve a Settings → Sender Authentication
2. Verifica un dominio o un email individual
3. Para empezar rápido, verifica un email individual:
   - Agrega tu email (ej: `admin@ministerio-amva.org`)
   - Verifica el email desde tu bandeja de entrada

### 4. Configurar en Render

Agrega estas variables de entorno en Render:

```
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
SENDGRID_FROM_EMAIL=admin@ministerio-amva.org
SENDGRID_FROM_NAME=AMVA Digital
```

**O si quieres seguir usando Gmail:**
```
EMAIL_PROVIDER=gmail
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=tu-email@gmail.com
SMTP_PASSWORD=tu-app-password
```

## 🔧 Instalación de SendGrid

El código ya está preparado para usar SendGrid. Solo necesitas:

1. Instalar el paquete (si no está instalado):
```bash
cd backend
npm install @sendgrid/mail
```

2. Configurar las variables de entorno en Render

## ✅ Verificación

Después de configurar, deberías ver en los logs:

```
✅ Servicio de email configurado (SendGrid)
📧 Provider: SendGrid
👤 From: admin@ministerio-amva.org
```

## 📊 Comparación de Proveedores

| Proveedor | Gratis | Confiabilidad | Facilidad |
|-----------|--------|---------------|-----------|
| **SendGrid** | 100 emails/día | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Resend** | 3,000 emails/mes | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Mailgun** | 5,000 emails/mes | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Gmail SMTP** | Ilimitado* | ⭐⭐ | ⭐⭐ |

*Gmail SMTP puede tener problemas desde cloud providers

## 🚀 Recomendación

**Para producción, recomiendo SendGrid** porque:
- ✅ Funciona perfectamente desde Render
- ✅ No tiene problemas de timeout
- ✅ Mejor deliverability (menos spam)
- ✅ Tier gratuito suficiente para empezar
- ✅ Fácil de escalar cuando crezcas

## 🔗 Alternativas

Si prefieres otra opción:

### Resend (Muy Recomendado)
- 3,000 emails/mes gratis
- API moderna y simple
- Excelente documentación
- https://resend.com

### Mailgun
- 5,000 emails/mes gratis
- Muy confiable
- https://www.mailgun.com

