# 📱 AMVA Mobile App

App móvil para pastores de la Asociación Misionera Vida Abundante.

## 🚀 Inicio Rápido

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar URL del API

**IMPORTANTE:** La app necesita conectarse al backend. Edita `src/api/client.ts`:

#### Para Emulador Android:

```typescript
const LOCAL_IP = '10.0.2.2' // IP especial para Android Emulator
```

#### Para Emulador iOS:

```typescript
const LOCAL_IP = 'localhost'
```

#### Para Dispositivo Físico:

1. Encuentra la IP de tu computadora:

   ```bash
   # Linux
   hostname -I

   # Mac
   ipconfig getifaddr en0

   # Windows
   ipconfig
   ```

2. Actualiza `src/api/client.ts`:

   ```typescript
   const LOCAL_IP = '192.168.0.33' // Tu IP local
   ```

3. **Asegúrate de que tu dispositivo y computadora estén en la misma red WiFi.**

### 3. Iniciar la app

```bash
npx expo start
```

Luego escanea el QR con:

- **iOS**: Cámara nativa
- **Android**: Expo Go app

## 🔐 Login de Prueba

```
Email:    pastor.test@ministerio.org
Password: Test1234
```

Si no funciona, crea un nuevo pastor de prueba:

```bash
cd ../backend
npm run create-test-pastor
```

## 🛠️ Desarrollo

### Estructura del proyecto

```
src/
  api/          # Clientes API
  hooks/        # React hooks
  screens/      # Pantallas de la app
  navigation/   # Configuración de navegación
```

### Variables de entorno

Crea un archivo `.env` (opcional):

```
EXPO_PUBLIC_API_URL=http://TU_IP:4000/api
```

## 📚 Documentación

- [Troubleshooting](./docs/MOBILE_APP_TROUBLESHOOTING.md)
- [API Endpoints](./docs/API_MOBILE_ENDPOINTS.md)
- [Login Guide](./docs/LOGIN_MOBILE_APP.md)

## ⚠️ Problemas Comunes

### "No acepta el correo de prueba"

1. Verifica que el backend esté corriendo: `http://localhost:4000`
2. Verifica la URL del API en `src/api/client.ts`
3. Asegúrate de estar en la misma red WiFi (si usas dispositivo físico)
4. Verifica las credenciales: `pastor.test@ministerio.org` / `Test1234`

### "101 problemas de TypeScript"

Estos son falsos positivos del IDE. La app funciona correctamente. Expo maneja la compilación.

### "Network Error"

- Verifica que el backend esté corriendo
- Verifica la URL del API (no uses `localhost` en dispositivo físico)
- Verifica que el firewall no esté bloqueando el puerto 4000

## 🔗 Enlaces Útiles

- [Expo Documentation](https://docs.expo.dev/)
- [React Navigation](https://reactnavigation.org/)
- [Expo Secure Store](https://docs.expo.dev/versions/latest/sdk/securestore/)
