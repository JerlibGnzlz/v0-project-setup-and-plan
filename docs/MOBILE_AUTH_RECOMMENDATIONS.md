# 📱 Recomendaciones para App Móvil de Pastores

## 🎯 Contexto Actual

### Situación Actual:

- ✅ **Modelo Pastor** existe con `email` (opcional, único)
- ✅ **Modelo User** solo para admins del dashboard
- ✅ **Inscripciones** no están vinculadas a Pastores (solo tienen email)
- ✅ **Noticias** son públicas (no requieren autenticación)

### Necesidades:

1. App móvil **solo para pastores**
2. Inscribirse a convenciones
3. Ver noticias (mismas que la web)
4. Autenticación segura
5. Botón en landing page para descargar app

---

## 🔐 Opción 1: Autenticación con Email + Password (RECOMENDADA)

### ✅ Ventajas:

- **Control total**: Tú gestionas las cuentas
- **Simplicidad**: No depende de terceros (Google)
- **Privacidad**: Los datos no salen de tu sistema
- **Costo**: Gratis, sin límites de usuarios
- **Flexibilidad**: Puedes agregar validaciones personalizadas
- **Offline**: Funciona sin conexión a servicios externos

### ❌ Desventajas:

- Usuarios deben recordar contraseña
- Necesitas sistema de recuperación de contraseña
- Más código para mantener

### Implementación:

```typescript
// 1. Agregar password al modelo Pastor (o crear tabla separada)
// 2. Endpoint: POST /api/auth/pastor/register
// 3. Endpoint: POST /api/auth/pastor/login
// 4. Verificar que el email existe en la tabla Pastores
```

---

## 🔐 Opción 2: Google OAuth (Alternativa)

### ✅ Ventajas:

- **UX mejorada**: Login con un clic
- **Seguridad**: Google maneja las contraseñas
- **Menos fricción**: No crear cuenta nueva
- **Verificación automática**: Email verificado por Google

### ❌ Desventajas:

- **Dependencia externa**: Si Google falla, no funciona
- **Configuración compleja**: OAuth setup, client IDs, etc.
- **Costo potencial**: Si superas límites de Google
- **Privacidad**: Google tiene acceso a datos de login
- **Validación manual**: Debes verificar que el email pertenece a un pastor

### Implementación:

```typescript
// 1. Configurar Google OAuth en Google Cloud Console
// 2. Instalar: @react-native-google-signin/google-signin
// 3. Backend: Verificar token de Google
// 4. Verificar que el email existe en Pastores
```

---

## 🏆 RECOMENDACIÓN FINAL: **Híbrida (Email + Password + Google OAuth Opcional)**

### Estrategia:

1. **Principal**: Email + Password (obligatorio)
2. **Opcional**: Google OAuth como alternativa rápida
3. **Validación**: El email DEBE existir en la tabla Pastores

### Flujo de Registro:

```
1. Pastor ingresa su email
2. Sistema verifica si el email existe en tabla Pastores
3. Si existe → Permitir registro/login
4. Si no existe → Mostrar mensaje: "Tu email no está registrado. Contacta a la administración."
5. Opción: "¿Tienes cuenta de Google? Inicia sesión con Google"
```

### Flujo de Login:

```
1. Email + Password (principal)
2. O Google OAuth (alternativa)
3. Ambos verifican que el email está en Pastores
```

---

## 🗄️ Cambios Necesarios en Base de Datos

### Opción A: Agregar password al modelo Pastor (Simple)

```prisma
model Pastor {
  // ... campos existentes
  email    String? @unique
  password String? // Hash de bcrypt
  emailVerificado Boolean @default(false)
  ultimoLogin DateTime?
}
```

**Ventajas:**

- ✅ Simple, todo en una tabla
- ✅ Fácil de implementar

**Desventajas:**

- ❌ Mezcla datos de perfil con autenticación
- ❌ Si un pastor no tiene email, no puede autenticarse

### Opción B: Tabla separada PastorAuth (Recomendada)

```prisma
model Pastor {
  // ... campos existentes (sin cambios)
  email    String? @unique
  auth     PastorAuth?
}

model PastorAuth {
  id        String   @id @default(uuid())
  pastorId  String   @unique
  email     String   @unique // Debe coincidir con Pastor.email
  password  String   // Hash de bcrypt
  googleId  String?  @unique // Si usa Google OAuth
  emailVerificado Boolean @default(false)
  ultimoLogin DateTime?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  pastor Pastor @relation(fields: [pastorId], references: [id], onDelete: Cascade)

  @@map("pastor_auth")
}
```

**Ventajas:**

- ✅ Separación de responsabilidades
- ✅ Más flexible (puede tener Google OAuth y password)
- ✅ No modifica modelo Pastor existente
- ✅ Mejor para escalar

**Desventajas:**

- ❌ Más complejo (2 tablas)

---

## 📱 Botón en Landing Page: Estrategia Inteligente

### Opción 1: Botón Inteligente con Detección (RECOMENDADA)

```typescript
// Detecta dispositivo y muestra opción apropiada
const handleDownloadApp = () => {
  const userAgent = navigator.userAgent.toLowerCase()
  const isIOS = /iphone|ipad|ipod/.test(userAgent)
  const isAndroid = /android/.test(userAgent)

  if (isIOS) {
    // Intentar abrir app, si no existe → App Store
    window.location.href = 'amva-app://home'
    setTimeout(() => {
      window.location.href = 'https://apps.apple.com/app/amva'
    }, 1000)
  } else if (isAndroid) {
    // Intentar abrir app, si no existe → Play Store
    window.location.href = 'amva-app://home'
    setTimeout(() => {
      window.location.href = 'https://play.google.com/store/apps/details?id=org.vidaabundante.app'
    }, 1000)
  } else {
    // Desktop: Mostrar QR code o links directos
    showQRCode()
  }
}
```

### Opción 2: Botón Simple con Links Directos

```tsx
<Button
  onClick={() => window.open('https://play.google.com/store/apps/details?id=org.vidaabundante.app')}
>
  <Smartphone className="w-5 h-5 mr-2" />
  Descargar App
</Button>
```

### Opción 3: QR Code para Desktop

```tsx
// Mostrar QR code que apunta a Play Store/App Store
// Usuarios escanean con su móvil
```

---

## 🎯 Plan de Implementación Recomendado

### Fase 1: Autenticación Básica (Email + Password)

1. ✅ Crear tabla `PastorAuth` en Prisma
2. ✅ Endpoints: `/api/auth/pastor/register`, `/api/auth/pastor/login`
3. ✅ Verificar que email existe en Pastores
4. ✅ Sistema de recuperación de contraseña
5. ✅ JWT tokens para mobile

### Fase 2: Google OAuth (Opcional, después)

1. Configurar Google Cloud Console
2. Implementar Google Sign-In en React Native
3. Backend: Verificar token de Google
4. Vincular con PastorAuth

### Fase 3: Landing Page

1. Botón inteligente con detección de dispositivo
2. Deep linking a la app
3. Fallback a Play Store/App Store
4. QR code para desktop

### Fase 4: App Móvil

1. Pantalla de login (email/password + Google opcional)
2. Verificación de email en Pastores
3. Pantalla de inscripciones
4. Pantalla de noticias
5. Perfil del pastor

---

## 🔒 Seguridad

### Validaciones Necesarias:

1. **Email debe existir en Pastores**: No permitir registro si el email no está en la BD
2. **Password mínimo 8 caracteres**: Con mayúsculas, números, símbolos
3. **Rate limiting**: Máximo 5 intentos de login por minuto
4. **JWT expiration**: Access token 15 min, refresh token 30 días
5. **Email verification**: Opcional pero recomendado

### Flujo de Seguridad:

```
1. Pastor intenta registrarse con email
2. Backend verifica: ¿Existe en Pastores?
   - Sí → Permitir registro
   - No → Rechazar con mensaje claro
3. Al hacer login, verificar:
   - Email existe en Pastores
   - Password correcto
   - Pastor está activo
```

---

## 📊 Comparación Final

| Característica    | Email + Password | Google OAuth | Híbrida |
| ----------------- | ---------------- | ------------ | ------- |
| **Simplicidad**   | ⭐⭐⭐           | ⭐⭐         | ⭐⭐    |
| **Control**       | ⭐⭐⭐           | ⭐           | ⭐⭐⭐  |
| **UX**            | ⭐⭐             | ⭐⭐⭐       | ⭐⭐⭐  |
| **Seguridad**     | ⭐⭐⭐           | ⭐⭐⭐       | ⭐⭐⭐  |
| **Costo**         | ⭐⭐⭐           | ⭐⭐         | ⭐⭐    |
| **Mantenimiento** | ⭐⭐             | ⭐⭐⭐       | ⭐⭐    |

---

## ✅ Recomendación Final

### **Implementar Email + Password PRIMERO**

- Más control
- Más simple de implementar
- No depende de terceros
- Funciona offline

### **Agregar Google OAuth DESPUÉS** (si es necesario)

- Como mejora de UX
- Opcional, no obligatorio
- Los pastores pueden elegir

### **Botón Inteligente en Landing**

- Detecta dispositivo
- Deep linking si tiene app
- Play Store/App Store si no tiene
- QR code para desktop

---

## 🚀 Próximos Pasos

1. **Decidir**: ¿Email+Password o Híbrida?
2. **Base de datos**: ¿Agregar password a Pastor o crear PastorAuth?
3. **Backend**: Implementar endpoints de autenticación
4. **Frontend**: Botón inteligente en landing
5. **Mobile**: Pantalla de login

¿Quieres que implemente alguna de estas opciones?






















