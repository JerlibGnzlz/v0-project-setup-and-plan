# ✅ Redirect URIs Correctos para Google OAuth

## 📋 Los 3 Redirect URIs que DEBEN Existir

### 1. **Producción - Backend Proxy** (NUEVO)
```
https://ministerio-backend-wdbj.onrender.com/api/auth/invitado/google/callback-proxy
```
**Uso:** Para el Backend Proxy que acabamos de implementar (móvil)

### 2. **Desarrollo Local - Passport** (Ya existe)
```
http://localhost:4000/api/auth/invitado/google/callback
```
**Uso:** Para desarrollo local con Passport (web)

### 3. **Producción - Passport** (Ya existe, pero verificar)
```
https://ministerio-backend-wdbj.onrender.com/api/auth/invitado/google/callback
```
**Uso:** Para producción con Passport (web)

---

## 🔧 Corrección Necesaria

Veo que en tu configuración actual tienes:
- ❌ `https://ministerio-backend-wdbj.onrender.com/api/auth/invitado/goog` (INCOMPLETO)

**Debe ser:**
- ✅ `https://ministerio-backend-wdbj.onrender.com/api/auth/invitado/google/callback-proxy`

---

## 📝 Pasos para Corregir

1. **Edita el URI 1** que está incompleto:
   - Cambia: `https://ministerio-backend-wdbj.onrender.com/api/auth/invitado/goog`
   - Por: `https://ministerio-backend-wdbj.onrender.com/api/auth/invitado/google/callback-proxy`

2. **Verifica que el URI 2 esté correcto:**
   - Debe ser: `http://localhost:4000/api/auth/invitado/google/callback`

3. **Agrega el URI 3 si no existe:**
   - Debe ser: `https://ministerio-backend-wdbj.onrender.com/api/auth/invitado/google/callback`

4. **Guarda los cambios**

---

## ✅ Lista Final de Redirect URIs

Después de corregir, deberías tener estos 3 URIs:

1. `https://ministerio-backend-wdbj.onrender.com/api/auth/invitado/google/callback-proxy` (Backend Proxy - móvil)
2. `http://localhost:4000/api/auth/invitado/google/callback` (Desarrollo local - web)
3. `https://ministerio-backend-wdbj.onrender.com/api/auth/invitado/google/callback` (Producción - web)

---

## 🔍 Diferencia entre los URIs

- **`/callback-proxy`**: Usado por el Backend Proxy (móvil) - nuevo método
- **`/callback`**: Usado por Passport (web) - método tradicional

Ambos métodos pueden coexistir sin problemas.

