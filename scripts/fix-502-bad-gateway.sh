#!/bin/bash
# Script para diagnosticar y corregir 502 Bad Gateway
# Ejecutar en el servidor: cd /var/www/amva-production && bash scripts/fix-502-bad-gateway.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="${APP_DIR:-$(cd "$SCRIPT_DIR/.." && pwd)}"
if [ ! -d "$APP_DIR" ]; then
  APP_DIR="/var/www/amva-production"
fi
NGINX_SITE="/etc/nginx/sites-available/amva"

echo "🔧 DIAGNÓSTICO Y CORRECCIÓN 502 BAD GATEWAY"
echo "============================================"
echo ""

# 1. Verificar si backend y frontend están corriendo
echo "1️⃣ Verificando procesos PM2..."
if command -v pm2 &>/dev/null; then
    pm2 status || true
    echo ""
    
    # Reiniciar si están caídos
    if ! pm2 describe amva-backend &>/dev/null 2>&1; then
        echo "⚠️  Backend no encontrado. Iniciando..."
        cd "$APP_DIR" && pm2 start ecosystem.config.js --only amva-backend 2>/dev/null || true
    elif ! pm2 ping &>/dev/null 2>&1; then
        pm2 restart amva-backend 2>/dev/null || true
    fi

    if ! pm2 describe amva-frontend &>/dev/null 2>&1; then
        echo "⚠️  Frontend no encontrado. Iniciando..."
        cd "$APP_DIR" && pm2 start ecosystem.config.js --only amva-frontend 2>/dev/null || true
    elif ! pm2 ping &>/dev/null 2>&1; then
        pm2 restart amva-frontend 2>/dev/null || true
    fi
else
    echo "⚠️  PM2 no instalado. Verifica manualmente que Node esté corriendo en puertos 3000 y 4000."
fi

echo ""

# 2. Probar conectividad local
echo "2️⃣ Probando conectividad local..."
BACKEND_OK=false
FRONTEND_OK=false

if curl -s -o /dev/null -w "%{http_code}" --connect-timeout 3 http://127.0.0.1:4000/api/noticias/publicadas 2>/dev/null | grep -q "200"; then
    echo "   ✅ Backend (puerto 4000): OK"
    BACKEND_OK=true
else
    echo "   ❌ Backend (puerto 4000): NO RESPONDE"
fi

if curl -s -o /dev/null -w "%{http_code}" --connect-timeout 3 http://127.0.0.1:3000 2>/dev/null | grep -qE "200|304"; then
    echo "   ✅ Frontend (puerto 3000): OK"
    FRONTEND_OK=true
else
    echo "   ❌ Frontend (puerto 3000): NO RESPONDE"
fi

echo ""

# 3. Si algo falla, reiniciar todo
if [ "$BACKEND_OK" = false ] || [ "$FRONTEND_OK" = false ]; then
    echo "3️⃣ Reiniciando servicios..."
    cd "$APP_DIR" 2>/dev/null && pm2 restart all 2>/dev/null || true
    sleep 3
    echo "   Reinicio completado. Espera 10 segundos y prueba de nuevo."
fi

echo ""

# 4. Verificar configuración nginx
echo "4️⃣ Verificando Nginx..."
if [ -f "$NGINX_SITE" ]; then
    if sudo nginx -t 2>/dev/null; then
        echo "   ✅ Configuración Nginx válida"
        echo "   Recargando Nginx..."
        sudo systemctl reload nginx 2>/dev/null || sudo service nginx reload 2>/dev/null || true
    else
        echo "   ❌ Error en configuración Nginx. Ejecuta: sudo nginx -t"
    fi
else
    echo "   ⚠️  Archivo $NGINX_SITE no encontrado"
    echo "   Copia la config: sudo cp $APP_DIR/nginx/amva.conf $NGINX_SITE"
    echo "   Luego: sudo ln -sf $NGINX_SITE /etc/nginx/sites-enabled/amva"
fi

echo ""
echo "============================================"
echo "📋 PRÓXIMOS PASOS SI PERSISTE EL 502:"
echo "   1. pm2 logs amva-backend"
echo "   2. pm2 logs amva-frontend"
echo "   3. sudo tail -50 /var/log/nginx/error.log"
echo "   4. Verifica DATABASE_URL en backend/.env"
echo "   5. Verifica que el build exista: ls $APP_DIR/backend/dist/src/main.js"
echo ""
