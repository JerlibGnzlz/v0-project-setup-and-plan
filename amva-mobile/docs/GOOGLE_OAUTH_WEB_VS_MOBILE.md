# Google OAuth: Web vs Mobile - Cómo Funcionan Juntos

## ✅ Respuesta Corta

**NO dañarás nada**. Puedes tener **AMBOS clientes OAuth funcionando simultáneamente**:
- 🔵 **Cliente Web** → Para la landing page (ya funciona)
- 🟢 **Cliente Android** → Para la app móvil (nuevo)

**Ambos se conectan a las mismas tablas** porque usan el mismo backend.

---

## 🏗️ Arquitectura

```
┌─────────────────┐         ┌──────────────────┐         ┌──────────────┐
│  Landing Page   │         │     Backend       │         │   Database   │
│   (Web)         │────────▶│  NestJS + Prisma  │────────▶│  PostgreSQL  │
│                 │         │                   │         │              │
│ Cliente OAuth   │         │  GOOGLE_CLIENT_ID │         │  Mismas      │
│ Tipo: Web       │         │  (Compartido)     │         │  Tablas      │
└─────────────────┘         └──────────────────┘         └──────────────┘
                                      ▲
┌─────────────────┐                  │
│  App Móvil      │──────────────────┘
│  (React Native) │
│                 │
│ Cliente OAuth   │
│ Tipo: Android   │
└─────────────────┘
```

---

## 🔑 Cómo Funciona

### 1. **Cliente OAuth Web** (Landing Page)
- **Tipo**: "Aplicación web"
- **Uso**: Landing page (`/convencion/inscripcion`)
- **Flujo**: 
  ```
  Usuario → Google OAuth → Redirect → Backend → Guarda en DB
  ```
- **Endpoint Backend**: `/api/auth/invitado/google/callback`
- **NO necesita SHA-1** (solo URIs de redirect)

### 2. **Cliente OAuth Android** (App Móvil)
- **Tipo**: "Android"
- **Uso**: App React Native
- **Flujo**:
  ```
  Usuario → Google Sign-In SDK → idToken → Backend → Guarda en DB
  ```
- **Endpoint Backend**: `/api/auth/invitado/google/mobile`
- **SÍ necesita SHA-1** (para verificar que la app es legítima)

### 3. **Backend Compartido**
- **Mismo `GOOGLE_CLIENT_ID`**: Ambos clientes verifican tokens con el mismo ID
- **Mismo método**: Ambos terminan llamando `googleAuth()` que guarda en las mismas tablas
- **Mismas tablas**: `Invitado`, `InvitadoAuth`, etc.

---

## 📋 Configuración Recomendada

### En Google Cloud Console:

1. **Cliente Web** (Ya existe - NO TOCAR):
   - Tipo: "Aplicación web"
   - Nombre: "AMVA Web Client"
   - URIs de redirect configurados
   - ✅ **Dejar como está**

2. **Cliente Android** (Crear nuevo):
   - Tipo: "Android"
   - Nombre: "AMVA Android Client"
   - Package name: `org.vidaabundante.app`
   - SHA-1: `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25`
   - ✅ **Crear este nuevo**

### En el Backend:

- **`GOOGLE_CLIENT_ID`**: Usa el mismo Client ID del cliente Web
- **Funciona para ambos**: El backend verifica tokens de ambos clientes con el mismo ID

### En la App Móvil:

- **`webClientId`**: Usa el mismo `GOOGLE_CLIENT_ID` del backend
- **Configuración**: Ya está en `useGoogleAuth.ts`

---

## 🔍 Verificación Técnica

### Backend - `invitado-auth.service.ts`:

```typescript
// Para Web (redirect)
async googleAuth(googleId, email, nombre, apellido, fotoUrl) {
  // Guarda en las mismas tablas
  return await this.prisma.invitado.create(...)
}

// Para Mobile (idToken)
async googleAuthMobile(idToken: string) {
  // Verifica token con GOOGLE_CLIENT_ID
  const ticket = await this.googleClient.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID, // ← Mismo ID
  })
  
  // Llama al mismo método googleAuth()
  return await this.googleAuth(googleId, email, nombre, apellido, fotoUrl)
}
```

**Conclusión**: Ambos guardan en las mismas tablas usando el mismo método.

---

## ✅ Checklist de Configuración

### Cliente Web (Ya existe):
- [x] Tipo: "Aplicación web"
- [x] URIs de redirect configurados
- [x] Funcionando en landing page
- [x] **NO modificar**

### Cliente Android (Crear nuevo):
- [ ] Tipo: "Android"
- [ ] Nombre: "AMVA Android Client"
- [ ] Package: `org.vidaabundante.app`
- [ ] SHA-1: `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25`
- [ ] **Crear este nuevo**

### Backend:
- [x] `GOOGLE_CLIENT_ID` configurado (mismo que cliente Web)
- [x] Endpoint `/auth/invitado/google` (web)
- [x] Endpoint `/auth/invitado/google/mobile` (mobile)
- [x] Ambos usan mismo método `googleAuth()`

### App Móvil:
- [x] `webClientId` configurado (mismo que backend)
- [x] Hook `useGoogleAuth` listo
- [x] Pantallas actualizadas

---

## 🎯 Resumen

1. **NO dañarás nada**: Los clientes OAuth son independientes
2. **Mismo backend**: Ambos usan el mismo `GOOGLE_CLIENT_ID`
3. **Mismas tablas**: Ambos guardan en las mismas tablas de la DB
4. **Crear nuevo cliente**: Crea un cliente Android nuevo, NO modifiques el Web
5. **Funcionan juntos**: Web sigue funcionando, Mobile funcionará también

---

## 🚀 Próximos Pasos

1. ✅ Crear cliente Android en Google Cloud Console
2. ✅ Agregar SHA-1 al cliente Android
3. ✅ Probar landing page (debe seguir funcionando)
4. ✅ Probar app móvil (debe funcionar con Google Sign-In)

**¡Ambos funcionarán perfectamente juntos!** 🎉

