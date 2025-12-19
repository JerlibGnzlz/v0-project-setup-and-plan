# Mejoras en Google OAuth para React Native

## Cambios Implementados

### 1. **LoginScreen.tsx** - Manejo Mejorado de Google OAuth

#### Mejoras:
- ✅ **Eliminado Alert después del login exitoso**: Ya no bloquea la navegación automática
- ✅ **Mejor manejo de errores**: Mensajes específicos según el tipo de error (400, 401, 500)
- ✅ **Mejor logging**: Logs detallados para debugging
- ✅ **Manejo de estados mejorado**: Uso de `isMounted` para prevenir actualizaciones en componentes desmontados
- ✅ **Mejor feedback visual**: Indicador de carga con texto "Autenticando..." durante el proceso
- ✅ **Validación mejorada**: Verifica que `request` esté listo antes de iniciar el flujo

#### Cambios Clave:
```typescript
// ANTES: Alert bloqueaba la navegación
Alert.alert('¡Bienvenido!', 'Has iniciado sesión exitosamente', [{ text: 'OK' }], 'success')

// AHORA: Navegación automática sin bloqueos
// El hook actualiza el estado y AppNavigator detecta el cambio automáticamente
```

### 2. **useInvitadoAuth.tsx** - Estado Mejorado

#### Mejoras:
- ✅ **Actualización de estado optimizada**: El invitado se establece ANTES de `setLoading(false)`
- ✅ **Limpieza de tokens en caso de error**: Si falla el login, limpia los tokens automáticamente
- ✅ **Delay para propagación de estado**: Pequeño delay para asegurar que el estado se propague
- ✅ **Mejor logging**: Logs detallados del proceso de autenticación

### 3. **AppNavigator.tsx** - Detección de Cambios

#### Mejoras:
- ✅ **Logging de estado**: Logs para debugging de navegación
- ✅ **Detección automática**: Detecta cambios en `invitado` y actualiza la navegación automáticamente

## Flujo Mejorado

```
1. Usuario presiona "Continuar con Google"
   ↓
2. promptAsync() inicia el flujo de Google OAuth
   ↓
3. Usuario autoriza en Google
   ↓
4. Google retorna id_token
   ↓
5. loginWithGoogle(id_token) envía token al backend
   ↓
6. Backend valida token y retorna access_token + refresh_token
   ↓
7. Tokens se guardan en SecureStore
   ↓
8. Estado de invitado se actualiza
   ↓
9. AppNavigator detecta el cambio automáticamente
   ↓
10. Navegación se actualiza a MainTabs (sin Alert bloqueante)
```

## Comparación con Web

### Web (Next.js)
- Usa Passport Google Strategy con redirects
- Maneja callbacks en `/api/auth/invitado/google/callback`
- Redirige a frontend con tokens en URL params

### Mobile (React Native)
- Usa `expo-auth-session/providers/google` con `useIdTokenAuthRequest`
- Obtiene `idToken` directamente sin redirects
- Envía `idToken` a `/api/auth/invitado/google/mobile`
- Backend valida el token y retorna `access_token` + `refresh_token`

## Recomendaciones para Reestructuración

### Si necesitas hacer cambios mayores:

#### 1. **Separar Lógica de Autenticación**
```
amva-mobile/src/
├── auth/
│   ├── hooks/
│   │   ├── useGoogleAuth.ts        # Hook específico para Google OAuth
│   │   └── useInvitadoAuth.ts      # Hook general de invitado
│   ├── services/
│   │   └── googleAuthService.ts     # Servicio para manejar Google OAuth
│   └── types/
│       └── googleAuth.types.ts      # Tipos específicos de Google OAuth
```

#### 2. **Crear Componente Reutilizable de Botón Google**
```
components/
└── auth/
    └── GoogleSignInButton.tsx      # Botón reutilizable con toda la lógica
```

#### 3. **Manejo Centralizado de Errores**
```
lib/
└── errors/
    ├── googleAuthErrors.ts         # Mapeo de errores de Google OAuth
    └── errorMessages.ts            # Mensajes de error centralizados
```

#### 4. **Configuración Centralizada**
```
config/
└── googleOAuth.config.ts           # Configuración de Google OAuth centralizada
```

### Estructura Propuesta (Opcional)

Si decides reestructurar completamente:

```
amva-mobile/src/
├── features/
│   └── auth/
│       ├── components/
│       │   ├── LoginForm.tsx
│       │   ├── GoogleSignInButton.tsx
│       │   └── RegisterForm.tsx
│       ├── hooks/
│       │   ├── useGoogleAuth.ts
│       │   └── useInvitadoAuth.ts
│       ├── services/
│       │   ├── googleAuthService.ts
│       │   └── invitadoAuthService.ts
│       └── screens/
│           └── LoginScreen.tsx
```

## Troubleshooting

### Problema: El botón no responde
- ✅ Verificar que `googleClientId` esté configurado en `app.json`
- ✅ Verificar que `request` esté listo antes de llamar `promptAsync()`
- ✅ Revisar logs en consola para ver errores específicos

### Problema: Login exitoso pero no navega
- ✅ Verificar que `invitado` se esté actualizando en `useInvitadoAuth`
- ✅ Verificar que `AppNavigator` esté detectando cambios en `invitado`
- ✅ Revisar logs de `AppNavigator` para ver el estado de autenticación

### Problema: Error 400/401 en backend
- ✅ Verificar que `GOOGLE_CLIENT_ID` en backend coincida con el de `app.json`
- ✅ Verificar que el token de Google sea válido (no expirado)
- ✅ Verificar configuración de OAuth consent screen en Google Cloud Console

## Próximos Pasos Sugeridos

1. **Agregar Analytics**: Trackear eventos de login con Google
2. **Mejorar UX**: Agregar skeleton loading durante autenticación
3. **Error Recovery**: Implementar retry automático en caso de errores de red
4. **Testing**: Agregar tests unitarios para el flujo de Google OAuth

