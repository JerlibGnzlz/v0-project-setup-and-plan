# 📱 Guía de Integración para App Móvil - Vida Abundante

## 🎯 Arquitectura Recomendada

### Opción 1: React Native (Recomendada)

**Ventajas:**

- ✅ Código compartido entre iOS y Android
- ✅ Acceso a APIs nativas
- ✅ Excelente rendimiento
- ✅ Gran ecosistema de librerías
- ✅ Fácil integración con el backend existente

**Stack Tecnológico:**

- **Framework:** React Native (Expo o CLI)
- **Navegación:** React Navigation
- **Estado:** Zustand o Redux Toolkit
- **HTTP Client:** Axios (mismo que el frontend web)
- **Autenticación:** AsyncStorage + JWT
- **Notificaciones:** Expo Notifications / Firebase Cloud Messaging
- **Deep Linking:** React Navigation + Expo Linking

### Opción 2: Flutter

**Ventajas:**

- ✅ Excelente rendimiento
- ✅ UI nativa en ambas plataformas
- ✅ Lenguaje único (Dart)

**Desventajas:**

- ❌ Requiere aprender Dart
- ❌ Menos código compartido con el frontend web

### Opción 3: Ionic / Capacitor

**Ventajas:**

- ✅ Usa tecnologías web (React/Vue/Angular)
- ✅ Código compartido con web

**Desventajas:**

- ❌ Menor rendimiento que nativo
- ❌ Limitaciones en acceso a APIs nativas

---

## 🏗️ Estructura del Proyecto Recomendada

```
amva-mobile/
├── src/
│   ├── api/              # Cliente API (similar a lib/api/)
│   │   ├── client.ts
│   │   ├── auth.ts
│   │   ├── noticias.ts
│   │   ├── convenciones.ts
│   │   ├── inscripciones.ts
│   │   └── pastores.ts
│   ├── components/       # Componentes reutilizables
│   ├── screens/          # Pantallas de la app
│   │   ├── auth/
│   │   ├── home/
│   │   ├── noticias/
│   │   ├── convenciones/
│   │   ├── equipo/
│   │   └── perfil/
│   ├── navigation/        # Configuración de navegación
│   ├── store/            # Estado global (Zustand)
│   ├── hooks/             # Custom hooks
│   ├── utils/             # Utilidades
│   └── constants/          # Constantes
├── app.json               # Configuración Expo
└── package.json
```

---

## 🔐 Autenticación para Mobile

### 1. Refresh Tokens (Recomendado)

El backend actual usa JWT con expiración de 7 días. Para mobile, es mejor implementar refresh tokens:

**Ventajas:**

- ✅ Tokens de acceso cortos (15-30 min) = más seguro
- ✅ Refresh tokens largos (7-30 días) = mejor UX
- ✅ Puede revocarse si el dispositivo se pierde

### 2. Almacenamiento Seguro

**React Native:**

- `@react-native-async-storage/async-storage` para datos simples
- `react-native-keychain` o `expo-secure-store` para tokens

**Ejemplo:**

```typescript
import * as SecureStore from 'expo-secure-store'

// Guardar token
await SecureStore.setItemAsync('auth_token', token)

// Leer token
const token = await SecureStore.getItemAsync('auth_token')

// Eliminar token
await SecureStore.deleteItemAsync('auth_token')
```

---

## 🔗 Deep Linking

### Configuración en el Backend

El backend ya está preparado para deep linking. Solo necesitas:

1. **Registrar esquemas de URL:**
   - iOS: `amva-app://`
   - Android: `amva-app://` o `https://vidaabundante.org/`

2. **Rutas soportadas:**
   - `amva-app://convencion/{id}/inscripcion`
   - `amva-app://noticia/{slug}`
   - `amva-app://pastor/{id}`

### Implementación en React Native

```typescript
import * as Linking from 'expo-linking'

// Escuchar deep links
Linking.addEventListener('url', event => {
  const { path, queryParams } = Linking.parse(event.url)

  if (path === 'convencion' && queryParams?.id) {
    navigation.navigate('ConvencionInscripcion', {
      convencionId: queryParams.id,
    })
  }
})

// Abrir deep link
Linking.openURL('amva-app://convencion/123/inscripcion')
```

---

## 📡 API Client para Mobile

### Estructura Similar al Frontend Web

```typescript
// src/api/client.ts
import axios from 'axios'
import * as SecureStore from 'expo-secure-store'

const API_URL = 'https://api.vidaabundante.org/api' // Cambiar en producción

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor para agregar token
apiClient.interceptors.request.use(async config => {
  const token = await SecureStore.getItemAsync('auth_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Interceptor para manejar errores
apiClient.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
      // Token expirado - intentar refresh o logout
      await SecureStore.deleteItemAsync('auth_token')
      // Navegar a login
    }
    return Promise.reject(error)
  }
)
```

---

## 📱 Funcionalidades Específicas de Mobile

### 1. Notificaciones Push

**Backend:** Agregar endpoint para registrar tokens de dispositivo

**Frontend Mobile:**

```typescript
import * as Notifications from 'expo-notifications'

// Registrar dispositivo
const token = await Notifications.getExpoPushTokenAsync()
await apiClient.post('/notifications/register', { token })
```

### 2. Offline Support

- Usar `@tanstack/react-query` con cache persistente
- Implementar sincronización cuando vuelva la conexión

### 3. Cámara para Comprobantes

```typescript
import * as ImagePicker from 'expo-image-picker'

const pickImage = async () => {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    quality: 0.8,
  })

  if (!result.canceled) {
    return result.assets[0]
  }
}
```

---

## 🚀 Pasos de Implementación

### Fase 1: Preparación del Backend

1. ✅ Agregar refresh tokens
2. ✅ Endpoint para notificaciones push
3. ✅ Mejorar CORS para mobile
4. ✅ Rate limiting
5. ✅ Documentación API (Swagger)

### Fase 2: Setup de React Native

1. ✅ Crear proyecto con Expo
2. ✅ Configurar navegación
3. ✅ Setup de API client
4. ✅ Implementar autenticación
5. ✅ Deep linking básico

### Fase 3: Pantallas Principales

1. ✅ Login/Registro
2. ✅ Home/Dashboard
3. ✅ Noticias
4. ✅ Convenciones
5. ✅ Inscripciones
6. ✅ Equipo Pastoral

### Fase 4: Funcionalidades Avanzadas

1. ✅ Notificaciones push
2. ✅ Modo offline
3. ✅ Sincronización de datos
4. ✅ Compartir contenido
5. ✅ Analytics

---

## 🔒 Seguridad para Mobile

### 1. Certificate Pinning (Producción)

Prevenir ataques man-in-the-middle:

```typescript
import { fetch } from 'react-native-ssl-pinning'

// Solo en producción
const response = await fetch(url, {
  method: 'POST',
  sslPinning: {
    certs: ['cert1', 'cert2'], // Certificados del servidor
  },
})
```

### 2. Obfuscación de Código

- Usar ProGuard (Android)
- Usar obfuscación de JavaScript (React Native)

### 3. Detección de Root/Jailbreak

```typescript
import * as Device from 'expo-device'

if (Device.isRootedExperimentalAsync()) {
  // Bloquear acceso o mostrar advertencia
}
```

---

## 📊 Analytics y Monitoreo

### Recomendaciones:

- **Sentry:** Para tracking de errores
- **Firebase Analytics:** Para métricas de uso
- **Mixpanel:** Para análisis de comportamiento

---

## 🧪 Testing

### Estrategia:

1. **Unit Tests:** Jest + React Native Testing Library
2. **Integration Tests:** Detox (E2E)
3. **Manual Testing:** TestFlight (iOS) + Internal Testing (Android)

---

## 📦 Distribución

### iOS:

- **TestFlight:** Para beta testing
- **App Store:** Para producción

### Android:

- **Google Play Internal Testing:** Para beta
- **Google Play:** Para producción

---

## 🔄 Sincronización con Backend

### El campo `origenRegistro` ya está implementado:

```typescript
// Al crear inscripción desde mobile
await apiClient.post('/inscripciones', {
  ...datosInscripcion,
  origenRegistro: 'mobile', // ✅ Ya implementado
})
```

El dashboard automáticamente mostrará:

- **Web/Dashboard:** Inscripciones desde web o dashboard
- **App Móvil:** Inscripciones desde la app

---

## 📝 Checklist de Implementación

### Backend

- [ ] Agregar refresh tokens
- [ ] Endpoint para notificaciones push
- [ ] Mejorar CORS para mobile
- [ ] Rate limiting
- [ ] Documentación API (Swagger/OpenAPI)
- [ ] Health check endpoint

### Mobile App

- [ ] Setup proyecto React Native
- [ ] Configurar navegación
- [ ] Implementar autenticación
- [ ] API client con interceptors
- [ ] Deep linking
- [ ] Pantallas principales
- [ ] Notificaciones push
- [ ] Modo offline
- [ ] Testing
- [ ] CI/CD

---

## 🆘 Soporte y Recursos

### Documentación Útil:

- [React Native Docs](https://reactnative.dev/)
- [Expo Docs](https://docs.expo.dev/)
- [React Navigation](https://reactnavigation.org/)
- [TanStack Query](https://tanstack.com/query/latest)

### Comunidad:

- React Native Community
- Expo Forums
- Stack Overflow

---

## 💡 Próximos Pasos

1. **Decidir tecnología:** React Native (recomendado) o Flutter
2. **Setup inicial:** Crear proyecto y configurar estructura
3. **Implementar autenticación:** Login, registro, refresh tokens
4. **Pantallas básicas:** Home, noticias, convenciones
5. **Integrar con backend:** Usar APIs existentes
6. **Testing:** Probar en dispositivos reales
7. **Distribución:** Beta testing con TestFlight/Play Console




























