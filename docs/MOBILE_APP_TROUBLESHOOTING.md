# 🔧 Solución de Problemas - App Móvil AMVA

## ❌ Problema: "No acepta el correo de prueba"

### ✅ Solución 1: Verificar que el backend esté corriendo

```bash
cd backend
npm run start:dev
```

El backend debe estar en `http://localhost:4000`

### ✅ Solución 2: Configurar la URL del API correctamente

**El problema más común:** La app móvil usa `localhost:4000` que **NO funciona** en dispositivos físicos o emuladores.

#### Para Emulador Android:

```typescript
// En amva-mobile/src/api/client.ts
const API_URL = 'http://10.0.2.2:4000/api'
```

#### Para Emulador iOS:

```typescript
// En amva-mobile/src/api/client.ts
const API_URL = 'http://localhost:4000/api'
```

#### Para Dispositivo Físico:

1. Encuentra la IP de tu máquina:

   ```bash
   # Linux
   hostname -I

   # Mac
   ipconfig getifaddr en0

   # Windows
   ipconfig
   # Busca "IPv4 Address" (ej: 192.168.1.100)
   ```

2. Actualiza `amva-mobile/src/api/client.ts`:

   ```typescript
   const API_URL = 'http://TU_IP:4000/api'
   // Ejemplo: 'http://192.168.1.100:4000/api'
   ```

3. **IMPORTANTE:** Asegúrate de que tu dispositivo móvil y tu computadora estén en la **misma red WiFi**.

4. Verifica que el firewall no esté bloqueando el puerto 4000:

   ```bash
   # Linux
   sudo ufw allow 4000

   # Mac (si usas firewall)
   # System Preferences > Security & Privacy > Firewall
   ```

### ✅ Solución 3: Usar variables de entorno (Recomendado)

1. Crea un archivo `.env` en `amva-mobile/`:

   ```bash
   cd amva-mobile
   echo "EXPO_PUBLIC_API_URL=http://TU_IP:4000/api" > .env
   ```

2. Reinicia Expo:
   ```bash
   # Detén Expo (Ctrl+C) y vuelve a iniciar
   npx expo start --clear
   ```

### ✅ Solución 4: Verificar credenciales

**Datos de prueba:**

```
Email:    pastor.test@ministerio.org
Password: Test1234
```

Si no funcionan, crea un nuevo pastor de prueba:

```bash
cd backend
npm run create-test-pastor
```

### ✅ Solución 5: Ver logs de la app

En la terminal de Expo, busca errores como:

- `Network Error` → Problema de conexión/URL
- `401 Unauthorized` → Credenciales incorrectas
- `404 Not Found` → URL incorrecta

### ✅ Solución 6: Probar el endpoint directamente

```bash
curl -X POST http://localhost:4000/api/auth/pastor/login \
  -H "Content-Type: application/json" \
  -d '{"email":"pastor.test@ministerio.org","password":"Test1234"}'
```

Si esto funciona, el problema es la configuración de la URL en la app móvil.

---

## ❌ Problema: "101 problemas de TypeScript"

### ✅ Solución: Estos son falsos positivos del IDE

Los errores de JSX en React Native (View, Text, etc.) son **falsos positivos** porque el IDE está usando la configuración de TypeScript del proyecto web.

**Solución:**

1. El proyecto `amva-mobile` tiene su propio `tsconfig.json`
2. Expo maneja la compilación correctamente
3. **Ignora estos errores** - la app funcionará correctamente

Si quieres ocultarlos:

- En VS Code/Cursor: Cierra la carpeta `amva-mobile` del workspace
- O agrega `amva-mobile` a `.vscode/settings.json` en `files.exclude`

---

## 🔍 Verificar que todo funciona

1. **Backend corriendo:**

   ```bash
   curl http://localhost:4000/api/noticias/publicadas
   ```

2. **Pastor de prueba existe:**

   ```bash
   cd backend
   npm run create-test-pastor
   ```

3. **Login funciona:**

   ```bash
   curl -X POST http://localhost:4000/api/auth/pastor/login \
     -H "Content-Type: application/json" \
     -d '{"email":"pastor.test@ministerio.org","password":"Test1234"}'
   ```

4. **App móvil puede conectarse:**
   - Abre la app
   - Intenta hacer login
   - Revisa los logs en la terminal de Expo

---

## 📱 Configuración rápida para desarrollo

1. **Encuentra tu IP:**

   ```bash
   # Linux/Mac
   hostname -I | awk '{print $1}'
   ```

2. **Actualiza `amva-mobile/src/api/client.ts`:**

   ```typescript
   const API_URL = 'http://TU_IP:4000/api'
   ```

3. **Reinicia Expo:**

   ```bash
   cd amva-mobile
   npx expo start --clear
   ```

4. **Prueba el login:**
   - Email: `pastor.test@ministerio.org`
   - Password: `Test1234`

---

## 🆘 Si nada funciona

1. Verifica que el backend esté corriendo en el puerto 4000
2. Verifica que tu dispositivo y computadora estén en la misma red WiFi
3. Verifica que el firewall no esté bloqueando el puerto 4000
4. Revisa los logs de Expo para ver el error exacto
5. Prueba el endpoint directamente con `curl` (ver arriba)




















