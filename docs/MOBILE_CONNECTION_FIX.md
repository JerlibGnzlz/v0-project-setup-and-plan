# 🔧 Solución: Network Error en App Móvil

## ❌ Error: "Network Error"

Este error significa que la app móvil **NO puede conectarse** al backend. Sigue estos pasos para resolverlo:

---

## ✅ Paso 1: Verificar que el Backend esté Corriendo

```bash
cd backend
npm run start:dev
```

**Debe mostrar:**

```
🚀 Backend running on http://localhost:4000/api
```

Si no está corriendo, inícialo.

---

## ✅ Paso 2: Verificar la IP Local

```bash
# Linux
hostname -I

# Mac
ipconfig getifaddr en0

# Windows
ipconfig
# Busca "IPv4 Address"
```

**Anota tu IP** (ej: `192.168.0.33`)

---

## ✅ Paso 3: Actualizar la IP en client.ts

Edita `amva-mobile/src/api/client.ts` y actualiza:

```typescript
const LOCAL_IP = 'TU_IP_AQUI' // Ej: '192.168.0.33'
```

---

## ✅ Paso 4: Verificar que el Backend Escuche en Todas las Interfaces

El backend debe estar configurado para escuchar en `0.0.0.0`, no solo en `localhost`.

Verifica `backend/src/main.ts`:

```typescript
await app.listen(port, '0.0.0.0') // ✅ Correcto - escucha en todas las interfaces
// NO: await app.listen(port) // ❌ Solo escucha en localhost
```

Si solo dice `await app.listen(port)`, cámbialo a `await app.listen(port, '0.0.0.0')`.

---

## ✅ Paso 5: Verificar el Firewall

### Linux (ufw):

```bash
sudo ufw allow 4000
sudo ufw status
```

### Linux (firewalld):

```bash
sudo firewall-cmd --add-port=4000/tcp --permanent
sudo firewall-cmd --reload
```

### Mac:

1. System Preferences → Security & Privacy → Firewall
2. Click "Firewall Options"
3. Asegúrate de que el puerto 4000 esté permitido

### Windows:

1. Windows Defender Firewall → Advanced Settings
2. Inbound Rules → New Rule
3. Port → TCP → 4000 → Allow

---

## ✅ Paso 6: Probar la Conexión Manualmente

Desde tu computadora, prueba:

```bash
# Probar localhost
curl http://localhost:4000/api/noticias/publicadas

# Probar con tu IP
curl http://TU_IP:4000/api/noticias/publicadas
```

**Ambos deben funcionar.** Si `localhost` funciona pero la IP no, el problema es el firewall o la configuración del backend.

---

## ✅ Paso 7: Verificar que Estés en la Misma Red WiFi

**IMPORTANTE:** Tu computadora y tu dispositivo móvil deben estar en la **misma red WiFi**.

1. En tu computadora: `hostname -I` (anota la IP)
2. En tu dispositivo móvil: Configuración → WiFi → Ver detalles de la red
3. Verifica que ambas IPs estén en el mismo rango (ej: `192.168.0.x`)

---

## ✅ Paso 8: Reiniciar Todo

```bash
# 1. Detén el backend (Ctrl+C)

# 2. Reinicia el backend
cd backend
npm run start:dev

# 3. En otra terminal, reinicia Expo
cd amva-mobile
npx expo start --clear
```

---

## 🔍 Diagnóstico Avanzado

### Ver qué URL está usando la app:

Revisa los logs de Expo. Deberías ver:

```
🚀 API URL configurada: http://192.168.0.33:4000/api
```

Si ves una URL diferente, verifica `amva-mobile/src/api/client.ts`.

### Probar desde el dispositivo móvil:

1. Abre un navegador en tu dispositivo móvil
2. Ve a: `http://TU_IP:4000/api/noticias/publicadas`
3. Debe mostrar JSON (o un error del backend, pero NO "no se puede conectar")

Si no funciona desde el navegador del móvil, el problema es:

- Firewall
- Backend no escucha en `0.0.0.0`
- Redes diferentes

---

## 🆘 Si Nada Funciona

1. **Usa ngrok para crear un túnel:**

   ```bash
   # Instala ngrok
   npm install -g ngrok

   # Crea túnel
   ngrok http 4000

   # Usa la URL de ngrok en client.ts
   # Ej: https://abc123.ngrok.io/api
   ```

2. **O usa la IP de tu máquina en lugar de localhost:**
   - Asegúrate de que el backend escuche en `0.0.0.0`
   - Usa tu IP real en `client.ts`

---

## ✅ Checklist Final

- [ ] Backend corriendo en puerto 4000
- [ ] Backend escucha en `0.0.0.0` (no solo localhost)
- [ ] IP local correcta en `client.ts`
- [ ] Firewall permite puerto 4000
- [ ] Computadora y móvil en la misma WiFi
- [ ] `curl http://TU_IP:4000/api/noticias/publicadas` funciona
- [ ] Expo reiniciado con `--clear`

Si todo esto está correcto, debería funcionar. 🎉





















