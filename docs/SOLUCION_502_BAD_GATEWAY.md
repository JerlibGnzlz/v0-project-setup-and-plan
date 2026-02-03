# Solución 502 Bad Gateway - Nginx

## Causa

El 502 ocurre cuando Nginx no puede conectar con el backend (Node.js) o el frontend. Suele deberse a:

- Backend/frontend caídos o reiniciándose
- Timeouts cortos
- Conexiones sin keepalive

---

## Solución rápida (en el servidor)

```bash
# 1. Conectarte por SSH
ssh root@tu_ip_servidor

# 2. Ejecutar script de corrección
cd /var/www/amva-production
bash scripts/fix-502-bad-gateway.sh

# 3. Si persiste, reiniciar manualmente
pm2 restart all
sudo systemctl reload nginx
```

---

## Configuración Nginx recomendada

Se ha creado `nginx/amva.conf` con:

- **Upstream con keepalive** para mantener conexiones y reducir 502
- **Timeouts** adecuados (300s para API, 60s para frontend)
- **Rutas** para `/api`, `/privacy-policy`, `/terms-of-service`, `/uploads`

### Aplicar la nueva configuración

```bash
# En el servidor
cd /var/www/amva-production

# Copiar config (ajusta si certbot modificó el archivo)
sudo cp nginx/amva.conf /etc/nginx/sites-available/amva

# Si usas SSL con certbot, certbot ya habrá creado bloques server.
# Puedes fusionar manualmente: añade los upstream y ajusta proxy_pass a:
#   proxy_pass http://backend_node;
#   proxy_pass http://frontend_node;

# Activar
sudo ln -sf /etc/nginx/sites-available/amva /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Verificar y recargar
sudo nginx -t
sudo systemctl reload nginx
```

### Si ya tienes SSL (certbot)

Edita `/etc/nginx/sites-available/amva` y añade al inicio (antes de los `server`):

```nginx
upstream backend_node {
    server 127.0.0.1:4000;
    keepalive 32;
}

upstream frontend_node {
    server 127.0.0.1:3000;
    keepalive 32;
}
```

Y cambia en cada `location`:
- `proxy_pass http://localhost:4000;` → `proxy_pass http://backend_node;`
- `proxy_pass http://localhost:3000;` → `proxy_pass http://frontend_node;`

Añade también en cada bloque `location` que haga proxy:
```nginx
proxy_http_version 1.1;
proxy_set_header Connection "";
```

---

## Verificación

```bash
# Backend responde localmente
curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:4000/api/noticias/publicadas
# Debe devolver 200

# Frontend responde localmente
curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3000
# Debe devolver 200 o 304

# Nginx
sudo nginx -t
```

---

## Logs para diagnosticar

```bash
pm2 logs amva-backend --lines 100
pm2 logs amva-frontend --lines 100
sudo tail -100 /var/log/nginx/error.log
```
