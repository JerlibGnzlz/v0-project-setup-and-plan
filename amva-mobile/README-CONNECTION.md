# 🔌 Guía de Conectividad - AMVA Mobile App

## Problema: Error de Conexión de Red

Si ves el error `ERR_NETWORK` o `Network Error`, sigue estos pasos:

### 1. Verificar que el Backend esté Corriendo

```bash
# Ir a la carpeta del backend
cd backend

# Iniciar el backend en modo desarrollo
npm run start:dev
```

Deberías ver algo como:
```
🚀 Backend running on http://localhost:4000/api
```

### 2. Verificar que el Backend Escuche en 0.0.0.0

El backend DEBE escuchar en `0.0.0.0` (no solo `localhost`) para que los dispositivos móviles puedan conectarse.

Verifica en `backend/src/main.ts` línea 177:
```typescript
await app.listen(port, '0.0.0.0')  // ✅ Correcto
// NO usar: await app.listen(port)  // ❌ Solo escucha en localhost
```

### 3. Verificar tu IP Local

```bash
# Linux
hostname -I | awk '{print $1}'

# O
ip addr show | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | cut -d/ -f1

# Mac
ipconfig getifaddr en0

# Windows
ipconfig
# Busca "IPv4 Address" en la interfaz de tu red WiFi
```

### 4. Actualizar la IP en la App Móvil

Si tu IP cambió, actualiza `amva-mobile/src/api/client.ts` línea 63:

```typescript
const LOCAL_IP = 'TU_IP_AQUI' // Ejemplo: '192.168.0.33'
```

### 5. Verificar Firewall (Linux)

```bash
# Permitir el puerto 4000
sudo ufw allow 4000

# O verificar si está bloqueado
sudo ufw status
```

### 6. Verificar que Estés en la Misma Red WiFi

- Tu computadora y tu dispositivo móvil DEBEN estar en la misma red WiFi
- No funcionará si uno está en WiFi y otro en datos móviles
- No funcionará si están en redes WiFi diferentes

### 7. Probar la Conexión Manualmente

Desde tu computadora:
```bash
# Probar conexión local
curl http://localhost:4000/api/noticias/publicadas

# Probar conexión con IP local
curl http://192.168.0.33:4000/api/noticias/publicadas
```

Si funciona desde tu computadora pero no desde el móvil:
- Verifica que ambos estén en la misma red
- Verifica el firewall
- Verifica que el backend escuche en 0.0.0.0

### 8. Usar el Script de Diagnóstico

```bash
cd amva-mobile
./scripts/check-connection.sh
```

Este script verificará automáticamente:
- Tu IP local
- Si el puerto está abierto
- Si la conexión HTTP funciona

## Solución Rápida

1. **Iniciar backend:**
   ```bash
   cd backend
   npm run start:dev
   ```

2. **Verificar IP:**
   ```bash
   hostname -I
   ```

3. **Actualizar IP en app** (si cambió):
   - Edita `amva-mobile/src/api/client.ts`
   - Cambia `LOCAL_IP` en línea 63

4. **Recargar app móvil:**
   - Presiona `r` en la terminal de Expo
   - O agita el dispositivo y selecciona "Reload"

## Para Producción

En producción, la app usa automáticamente:
```
https://ministerio-backend-wdbj.onrender.com/api
```

No necesitas configurar IP local en producción.

