# ⏰ ¿Cuándo Configurar SSL/HTTPS?

## ✅ Respuesta Corta

**Puedes dejar la configuración de SSL/HTTPS para cuando despliegues en Digital Ocean.**

---

## 📋 ¿Por qué?

### SSL/HTTPS se configura en el SERVIDOR, no en el código

SSL/HTTPS es parte de la **infraestructura del servidor**, no del código de tu aplicación.

**Se configura**:
- ✅ **En el servidor de Digital Ocean** (cuando ya tengas el Droplet)
- ✅ **Con Certbot** (instalado en el servidor)
- ✅ **En Nginx** (corriendo en el servidor)

**NO se configura**:
- ❌ En el código del proyecto
- ❌ En los Dockerfiles
- ❌ En docker-compose.yml

---

## 🎯 Lo que SÍ necesitas ahora

### 1. **Template de Nginx** (Opcional pero útil)

Puedes crear un `nginx.conf` template básico **sin SSL** para tener una referencia:

```nginx
# nginx.conf (template básico - sin SSL todavía)
events {
    worker_connections 1024;
}

http {
    upstream backend {
        server backend:4000;
    }

    upstream frontend {
        server frontend:3000;
    }

    server {
        listen 80;  # HTTP temporal (se cambiará a HTTPS después)
        server_name tudominio.com;

        # API Backend
        location /api {
            proxy_pass http://backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }

        # Frontend
        location / {
            proxy_pass http://frontend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }
    }
}
```

**Este template**:
- ✅ Funciona para desarrollo/testing
- ✅ Se puede usar antes de configurar SSL
- ✅ Se actualiza automáticamente cuando Certbot configura SSL

---

## 📅 Plan Recomendado

### Fase 1: Ahora (Preparación)

1. ✅ Crear Dockerfiles
2. ✅ Crear docker-compose.yml
3. ✅ Crear template básico de nginx.conf (sin SSL)
4. ✅ Preparar variables de entorno

**SSL/HTTPS**: ⏸️ **Se deja para después**

---

### Fase 2: Cuando despliegues en Digital Ocean

1. ✅ Crear Droplet
2. ✅ Configurar dominio y DNS
3. ✅ Instalar Nginx
4. ✅ Instalar Certbot
5. ✅ **Configurar SSL/HTTPS** ← Aquí es cuando lo haces
6. ✅ Obtener certificados con Certbot
7. ✅ Configurar renovación automática

---

## 🔧 Cómo se configura SSL cuando despliegues

### Paso 1: Instalar Certbot en el servidor

```bash
# En tu servidor Digital Ocean
sudo apt update
sudo apt install certbot python3-certbot-nginx
```

### Paso 2: Obtener certificados SSL

```bash
# Certbot obtiene certificados y configura Nginx automáticamente
sudo certbot --nginx -d tudominio.com -d www.tudominio.com
```

**Qué hace Certbot**:
- ✅ Obtiene certificados de Let's Encrypt
- ✅ Instala certificados en `/etc/letsencrypt/live/tudominio.com/`
- ✅ **Actualiza automáticamente** tu `nginx.conf` con SSL
- ✅ Configura redirección HTTP → HTTPS

### Paso 3: Verificar renovación automática

```bash
# Certbot crea un cron job automáticamente
sudo certbot renew --dry-run
```

---

## ✅ Resumen

| Aspecto | Cuándo se hace | Dónde se hace |
|---------|----------------|---------------|
| **Dockerfiles** | ✅ Ahora | En el código del proyecto |
| **docker-compose.yml** | ✅ Ahora | En el código del proyecto |
| **nginx.conf template** | ✅ Ahora (opcional) | En el código del proyecto |
| **SSL/HTTPS** | ⏸️ Cuando despliegues | En el servidor Digital Ocean |
| **Certbot** | ⏸️ Cuando despliegues | En el servidor Digital Ocean |
| **Certificados SSL** | ⏸️ Cuando despliegues | En el servidor Digital Ocean |

---

## 🎯 Conclusión

**SÍ, puedes dejar SSL/HTTPS para cuando despliegues.**

**Lo importante ahora**:
- ✅ Dockerfiles
- ✅ docker-compose.yml
- ✅ Variables de entorno
- ✅ Scripts de deployment

**SSL/HTTPS se configura después**:
- ⏸️ Cuando tengas el servidor en Digital Ocean
- ⏸️ Con Certbot (5 minutos de trabajo)
- ⏸️ Automáticamente (Certbot lo hace todo)

---

**¿Necesitas ayuda con los Dockerfiles y docker-compose ahora?** Esos sí son críticos para poder desplegar.

