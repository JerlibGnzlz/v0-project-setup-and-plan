# 🔧 Solución: "Access blocked: Authorization Error" - Login con Google en amva.org.es

## 🎯 Problema

Al hacer clic en "Continuar con Google" en la landing de la convención, aparece:
```
Access blocked: Authorization Error
```

## ✅ Solución: Configurar Google Cloud Console

### Paso 1: Ir a Google Cloud Console

1. Ve a **https://console.cloud.google.com/apis/credentials**
2. Selecciona el proyecto correcto (ej: el que tiene el Client ID `378853205278-...`)

### Paso 2: Editar el cliente OAuth (Web application)

1. Busca el cliente de tipo **"Web application"** con tu Client ID
2. Haz clic en el nombre del cliente para editarlo

### Paso 3: Agregar Authorized JavaScript origins

En **"Authorized JavaScript origins"**, haz clic en **"+ ADD URI"** y agrega:

```
https://amva.org.es
https://www.amva.org.es
```

*(Opcional para desarrollo: `http://localhost:3000`)*

### Paso 4: Agregar Authorized redirect URIs

En **"Authorized redirect URIs"**, haz clic en **"+ ADD URI"** y agrega:

```
https://amva.org.es/api/auth/invitado/google/callback
https://www.amva.org.es/api/auth/invitado/google/callback
```

*(Opcional para desarrollo: `http://localhost:4000/api/auth/invitado/google/callback`)*

### Paso 5: Guardar

Haz clic en **"SAVE"** al final de la página.

### Paso 6: OAuth Consent Screen (si está en "Testing")

1. Ve a **https://console.cloud.google.com/apis/credentials/consent**
2. Si el estado es **"Testing"**:
   - **Opción A:** Haz clic en **"PUBLISH APP"** para que cualquier usuario pueda hacer login
   - **Opción B:** Si prefieres mantener Testing, ve a **"Test users"** → **"ADD USERS"** y agrega los emails que pueden probar (ej: jerlibgnzlz@gmail.com)

### Paso 7: Verificar BACKEND_URL en el servidor

En el servidor, el `.env` del backend debe tener:

```env
BACKEND_URL=https://amva.org.es
```

*(Sin /api al final - el callback path ya lo incluye)*

Reinicia el backend después de cambiar:
```bash
pm2 restart amva-backend
```

### Paso 8: Esperar propagación

Los cambios en Google Cloud Console pueden tardar **5-10 minutos** en aplicarse. Espera y prueba de nuevo.

---

## 📋 Checklist

- [ ] `https://amva.org.es` en Authorized JavaScript origins
- [ ] `https://amva.org.es/api/auth/invitado/google/callback` en Authorized redirect URIs
- [ ] OAuth Consent Screen publicado O usuarios de prueba agregados
- [ ] BACKEND_URL=https://amva.org.es en el servidor
- [ ] pm2 restart amva-backend
- [ ] Esperar 5-10 minutos
- [ ] Probar login con Google en https://amva.org.es

---

## 🔗 URLs que debes tener en Google Cloud Console

| Tipo | URL |
|------|-----|
| JavaScript origin | `https://amva.org.es` |
| JavaScript origin | `https://www.amva.org.es` |
| Redirect URI | `https://amva.org.es/api/auth/invitado/google/callback` |
| Redirect URI | `https://www.amva.org.es/api/auth/invitado/google/callback` |
