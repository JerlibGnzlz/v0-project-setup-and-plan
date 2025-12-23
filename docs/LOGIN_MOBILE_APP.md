# 📱 Cómo Hacer Login en la App Móvil AMVA

## 🔐 Datos para Login

### Opción 1: Usar Pastor de Prueba (Rápido)

Ejecuta este comando en el backend:

```bash
cd backend
npm run create-test-pastor
```

Esto creará un pastor de prueba con estos datos:

```
Email:    pastor.test@ministerio.org
Password: Test1234
```

**Requisitos de la contraseña:**

- Mínimo 8 caracteres
- Al menos una mayúscula
- Al menos una minúscula
- Al menos un número

---

### Opción 2: Crear tu Propio Pastor

#### Paso 1: Crear Pastor en el Dashboard

1. Ve a `http://localhost:3000/admin/pastores`
2. Haz login como admin (si no tienes cuenta admin, usa el seed)
3. Crea un nuevo pastor con:
   - Nombre y apellido
   - **Email** (obligatorio para autenticación)
   - Asegúrate de que esté **activo** ✅

#### Paso 2: Registrarse desde la App Móvil

1. Abre la app móvil
2. En la pantalla de Login, busca el botón "Registrarse" o "Crear cuenta"
3. Ingresa:
   - **Email**: El mismo email del pastor que creaste
   - **Password**: Crea una contraseña (mínimo 8 caracteres, con mayúscula, minúscula y número)
4. Si el email existe en la BD y el pastor está activo, se creará tu cuenta
5. Luego podrás hacer login con ese email y contraseña

---

### Opción 3: Usar Pastor Existente del Seed

Si ejecutaste el seed (`npm run seed`), tienes estos pastores:

- `juan.perez@ministerio.org`
- `maria.gonzalez@ministerio.org`
- `carlos.rodriguez@ministerio.org`

**Pero estos pastores NO tienen cuenta de autenticación todavía.**

Para usarlos:

1. **Regístrate desde la app móvil** usando uno de esos emails
2. O ejecuta el script para crear cuenta de autenticación:

```bash
# Edita el script y cambia el email a uno de los pastores del seed
# Luego ejecuta:
npm run create-test-pastor
```

---

## ⚠️ Errores Comunes

### "Tu email no está registrado en nuestro sistema"

- **Causa**: El email no existe en la tabla `Pastores`
- **Solución**: Crea el pastor primero desde el dashboard

### "Tu cuenta de pastor está inactiva"

- **Causa**: El pastor existe pero `activo: false`
- **Solución**: Ve al dashboard y activa el pastor

### "Ya existe una cuenta registrada con este email"

- **Causa**: Ya te registraste antes
- **Solución**: Usa "Iniciar Sesión" en lugar de "Registrarse"

### "Credenciales inválidas"

- **Causa**: Email o contraseña incorrectos
- **Solución**: Verifica que estés usando el email correcto y la contraseña que creaste

---

## 🧪 Probar Login

### Desde la App Móvil:

1. Abre la app
2. Ingresa:
   - Email: `pastor.test@ministerio.org`
   - Password: `Test1234`
3. Toca "Iniciar Sesión"
4. Deberías ver las pestañas: Inicio, Convenciones, Noticias, Perfil

### Desde Postman/Thunder Client:

```bash
POST http://localhost:4000/api/auth/pastor/login
Content-Type: application/json

{
  "email": "pastor.test@ministerio.org",
  "password": "Test1234"
}
```

---

## 📝 Notas

- **Los pastores y los admins son diferentes**:
  - Admins usan `/api/auth/login` (para dashboard)
  - Pastores usan `/api/auth/pastor/login` (para app móvil)

- **El email debe existir en Pastores antes de registrarse**
- **El pastor debe estar activo** para poder autenticarse
- **La contraseña se guarda hasheada** (bcrypt) en la BD

---

## 🔄 Resetear Contraseña

Si olvidaste tu contraseña, por ahora necesitas:

1. Contactar a un admin
2. O eliminar el registro de `PastorAuth` y registrarte de nuevo

(La funcionalidad de recuperación de contraseña está preparada pero no implementada aún)



















