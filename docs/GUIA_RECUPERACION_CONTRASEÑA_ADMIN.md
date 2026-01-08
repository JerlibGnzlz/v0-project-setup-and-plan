# Guía: ¿Qué hacer si el Administrador Olvida su Contraseña?

## 🎯 **Proceso Automático (Recomendado)**

### **Opción 1: Recuperación por Email (Ya Implementada ✅)**

El sistema tiene un proceso automático de recuperación de contraseña que funciona así:

#### **Paso 1: Solicitar Reset de Contraseña**
1. Ve a la página de login: `/admin/login`
2. Haz clic en **"¿Olvidaste tu contraseña?"** (en la parte inferior del formulario)
3. Ingresa tu **email de administrador**
4. Haz clic en **"Enviar Instrucciones"**

#### **Paso 2: Revisar Email**
1. Revisa tu bandeja de entrada (y spam si no aparece)
2. Busca el email de **"Recuperación de Contraseña - AMVA Digital"**
3. El email contiene un **link de recuperación** válido por **1 hora**

#### **Paso 3: Restablecer Contraseña**
1. Haz clic en el link del email (o cópialo y pégalo en el navegador)
2. Serás redirigido a `/admin/reset-password?token=xxx`
3. Ingresa tu **nueva contraseña** (debe cumplir requisitos de seguridad)
4. Confirma la nueva contraseña
5. Haz clic en **"Restablecer Contraseña"**

#### **Paso 4: Iniciar Sesión**
1. Una vez restablecida, vuelve a `/admin/login`
2. Inicia sesión con tu email y la **nueva contraseña**

---

## 🔒 **Requisitos de la Nueva Contraseña**

La nueva contraseña debe cumplir:
- ✅ Mínimo **8 caracteres**
- ✅ Al menos **1 mayúscula** (A-Z)
- ✅ Al menos **1 minúscula** (a-z)
- ✅ Al menos **1 número** (0-9)
- ✅ Al menos **1 carácter especial** (!@#$%^&*)

**Ejemplo válido:** `Admin123!`

---

## ⚠️ **Si el Proceso Automático No Funciona**

### **Problema 1: No recibes el email**

**Posibles causas:**
- Email en spam/correo no deseado
- Email incorrecto ingresado
- Problemas con el servidor de email
- El email del admin no está registrado en el sistema

**Soluciones:**
1. ✅ Revisar carpeta de spam
2. ✅ Verificar que el email sea correcto
3. ✅ Esperar unos minutos (puede haber delay)
4. ✅ Intentar nuevamente (máximo 3 veces por hora)

### **Problema 2: El token expiró**

**Causa:** El link de recuperación expira después de 1 hora

**Solución:**
1. ✅ Solicitar un nuevo link de recuperación
2. ✅ Ir a `/admin/forgot-password` nuevamente
3. ✅ Ingresar tu email y solicitar nuevo link

### **Problema 3: El token ya fue usado**

**Causa:** Los tokens son de un solo uso por seguridad

**Solución:**
1. ✅ Solicitar un nuevo link de recuperación
2. ✅ Ir a `/admin/forgot-password` nuevamente

---

## 🆘 **Alternativas si el Proceso Automático Falla**

### **Opción 2: Reset Manual por Otro Admin** (Si hay múltiples admins)

Si hay otro administrador con acceso:

1. **El otro admin debe:**
   - Iniciar sesión en `/admin/usuarios`
   - Buscar el usuario del admin que olvidó su contraseña
   - Hacer clic en **"Resetear Contraseña"**
   - Generar una contraseña temporal o enviar link de reset

2. **El admin que olvidó su contraseña:**
   - Recibe email con link de reset o contraseña temporal
   - Debe cambiar la contraseña en el primer login

### **Opción 3: Reset Directo en Base de Datos** (Último recurso)

**⚠️ SOLO si eres el único admin y no hay otra opción:**

1. **Acceder a la base de datos** (Neon Dashboard o Prisma Studio)
2. **Buscar el usuario admin** en la tabla `users`
3. **Generar hash de nueva contraseña:**
   ```bash
   # En el backend, ejecutar:
   node -e "const bcrypt = require('bcrypt'); bcrypt.hash('NuevaPassword123!', 10).then(hash => console.log(hash))"
   ```
4. **Actualizar el campo `password`** en la base de datos con el hash generado
5. **Iniciar sesión** con la nueva contraseña
6. **Cambiar la contraseña inmediatamente** desde el perfil

**⚠️ IMPORTANTE:** Este método debe usarse SOLO como último recurso y requiere acceso directo a la base de datos.

---

## 📋 **Checklist de Recuperación**

### **Primer Intento (Proceso Automático):**
- [ ] Ir a `/admin/login`
- [ ] Clic en "¿Olvidaste tu contraseña?"
- [ ] Ingresar email correcto
- [ ] Revisar email (incluyendo spam)
- [ ] Hacer clic en link de recuperación
- [ ] Crear nueva contraseña segura
- [ ] Iniciar sesión con nueva contraseña

### **Si No Funciona:**
- [ ] Verificar que el email sea correcto
- [ ] Esperar unos minutos y revisar spam
- [ ] Solicitar nuevo link (máximo 3 veces por hora)
- [ ] Si hay otro admin, pedirle que resetee la contraseña
- [ ] Como último recurso, reset directo en base de datos

---

## 🔐 **Prevención: Mejores Prácticas**

Para evitar olvidar contraseñas:

1. ✅ **Usar un gestor de contraseñas** (1Password, LastPass, Bitwarden)
2. ✅ **Cambiar contraseña periódicamente** (cada 3-6 meses)
3. ✅ **Usar contraseñas seguras pero memorables**
4. ✅ **Habilitar 2FA** si está disponible (futuro)
5. ✅ **Tener múltiples admins** para respaldo

---

## 📞 **Contacto de Soporte**

Si ninguna de las opciones funciona:

1. **Verificar logs del sistema** para ver errores
2. **Revisar configuración de email** en variables de entorno
3. **Contactar al desarrollador** con:
   - Email del admin afectado
   - Fecha y hora del problema
   - Mensajes de error (si los hay)
   - Logs del servidor

---

## ✅ **Resumen**

**Proceso Normal:**
1. `/admin/login` → "¿Olvidaste tu contraseña?"
2. Ingresar email → Recibir email con link
3. Clic en link → Restablecer contraseña
4. Iniciar sesión con nueva contraseña

**Si falla:**
- Verificar email y spam
- Solicitar nuevo link
- Pedir ayuda a otro admin
- Como último recurso: reset en base de datos

**El sistema está diseñado para que la recuperación sea segura y automática en la mayoría de los casos.**




