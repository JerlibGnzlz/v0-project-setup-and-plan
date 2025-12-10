# 🔧 Configurar Redis Upstash en Render

## 📋 Información de tu Redis

Tu URL de Redis de Upstash es:
```
rediss://default:ARplAAImcDE0MGQ5Zjc1ZmI5NmM0YWQ2OGEyODVhMmM3OGEzZjcxZHAxNjc1Nw@striking-filly-6757.upstash.io:6379
```

## ✅ Pasos para Configurar en Render

### 1. Ir a tu Servicio en Render

1. Ve a tu dashboard de Render: https://dashboard.render.com
2. Selecciona tu servicio del backend (`ministerio-backend`)
3. Ve a la sección **"Environment"** en el menú lateral

### 2. Agregar Variable de Entorno

1. Haz clic en **"Add Environment Variable"**
2. Configura:
   - **Key**: `REDIS_URL`
   - **Value**: `rediss://default:ARplAAImcDE0MGQ5Zjc1ZmI5NmM0YWQ2OGEyODVhMmM3OGEzZjcxZHAxNjc1Nw@striking-filly-6757.upstash.io:6379`
3. Haz clic en **"Save Changes"**

### 3. Reiniciar el Servicio

Después de agregar la variable:
1. Ve a la pestaña **"Events"** o **"Logs"**
2. Haz clic en **"Manual Deploy"** → **"Deploy latest commit"**
   - O simplemente espera a que Render detecte el cambio y reinicie automáticamente

## 🔍 Verificar que Funciona

Después de reiniciar, deberías ver en los logs:

```
✅ Conectado a Redis para token blacklist
✅ Token blacklist service inicializado
```

En lugar de:
```
⚠️ Redis no configurado, token blacklist deshabilitado
```

## 📝 Notas Importantes

1. **Seguridad**: Esta URL contiene la contraseña de Redis. No la compartas públicamente.
2. **Formato**: El código ya está preparado para manejar URLs `rediss://` (Redis con TLS).
3. **Opcional**: Si Redis no está disponible, la aplicación seguirá funcionando sin blacklist de tokens.

## 🐛 Si No Funciona

### Verificar la URL

Asegúrate de que la URL esté completa y correcta:
- Debe empezar con `rediss://` (con doble 's' para TLS)
- Debe incluir la contraseña después de `default:`
- Debe incluir el host y puerto al final

### Verificar Logs

Revisa los logs del backend en Render. Deberías ver:
- `✅ Conectado a Redis para token blacklist` si funciona
- `⚠️ Redis no disponible` si hay problemas de conexión

### Probar Conexión

Puedes probar la conexión desde tu terminal local:

```bash
# Instalar redis-cli si no lo tienes
# macOS: brew install redis
# Ubuntu: sudo apt-get install redis-tools

# Probar conexión (reemplaza con tu URL)
redis-cli -u "rediss://default:ARplAAImcDE0MGQ5Zjc1ZmI5NmM0YWQ2OGEyODVhMmM3OGEzZjcxZHAxNjc1Nw@striking-filly-6757.upstash.io:6379" ping
```

Deberías recibir: `PONG`

## ✅ Checklist

- [ ] Variable `REDIS_URL` agregada en Render
- [ ] Servicio reiniciado después de agregar la variable
- [ ] Logs muestran "✅ Conectado a Redis para token blacklist"
- [ ] No hay errores de conexión a Redis en los logs

## 🔗 Documentación Relacionada

- `docs/CONFIGURAR_REDIS_PRODUCCION.md` - Guía general de Redis
- `docs/UPSTASH_REDIS_PASSWORD.md` - Información sobre credenciales de Upstash

