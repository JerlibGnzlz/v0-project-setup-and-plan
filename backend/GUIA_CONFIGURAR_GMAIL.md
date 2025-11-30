# 📧 Guía para Configurar Gmail SMTP

## ⚠️ IMPORTANTE: Necesitas una App Password

Gmail **NO acepta tu contraseña normal**. Necesitas generar una **App Password** especial.

---

## 📋 Pasos para Generar App Password de Gmail

### Paso 1: Activar Verificación en 2 Pasos

1. Ve a: https://myaccount.google.com/security
2. Busca "Verificación en 2 pasos"
3. Si NO está activada:
   - Haz clic en "Activar"
   - Sigue los pasos para configurarla
   - **ES OBLIGATORIO** tener esto activado

### Paso 2: Generar App Password

1. Ve a: https://myaccount.google.com/apppasswords
   - Si no ves esta opción, primero activa la verificación en 2 pasos
   
2. Selecciona:
   - **Aplicación**: "Correo"
   - **Dispositivo**: "Otro (nombre personalizado)"
   - Escribe: "AMVA Backend"
   - Haz clic en "Generar"

3. **COPIA LA CONTRASEÑA** que aparece (16 caracteres, sin espacios)
   - Formato: `xxxx xxxx xxxx xxxx` (cópiala SIN espacios)
   - Ejemplo: `abcd efgh ijkl mnop` → usa `abcdefghijklmnop`

### Paso 3: Actualizar el `.env`

Abre el archivo `backend/.env` y actualiza:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=tu-email@gmail.com
SMTP_PASSWORD=tu-app-password-de-16-caracteres-sin-espacios
```

**Ejemplo:**
```env
SMTP_USER=jerlibgnzlz@gmail.com
SMTP_PASSWORD=abcdefghijklmnop
```

### Paso 4: Probar

```bash
cd backend
node test-email-simple.js
```

---

## ✅ Verificación

Si todo está bien, deberías ver:
```
✅ Conexión SMTP verificada correctamente
✅ Email enviado exitosamente!
```

---

## ❌ Errores Comunes

### Error: "Username and Password not accepted"
- **Causa**: No estás usando una App Password
- **Solución**: Genera una App Password nueva

### Error: "Verification in 2 steps is not enabled"
- **Causa**: No tienes verificación en 2 pasos activada
- **Solución**: Actívala primero en https://myaccount.google.com/security

### Error: "Less secure app access"
- **Causa**: Gmail bloqueó el acceso
- **Solución**: Usa App Password (no "less secure apps")

---

## 🔒 Seguridad

- ✅ **SÍ**: Usar App Password (recomendado)
- ❌ **NO**: Usar tu contraseña normal de Gmail
- ❌ **NO**: Compartir tu App Password
- ✅ **SÍ**: Guardar el `.env` en `.gitignore` (ya está configurado)

---

## 📞 Soporte

Si tienes problemas:
1. Verifica que la verificación en 2 pasos esté activada
2. Genera una App Password nueva
3. Asegúrate de copiarla SIN espacios
4. Reinicia el backend después de actualizar el `.env`

