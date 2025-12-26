# Script de Prueba: Solicitud de Credenciales

Este script prueba el flujo completo de solicitud de credenciales desde la app móvil hasta AMVA Digital.

## 🎯 Qué prueba

1. **Login de invitado** - Autenticación desde la app móvil
2. **Crear solicitud** - Creación de solicitud de credencial (ministerial o capellanía)
3. **Obtener mis solicitudes** - Verificación de que la solicitud se puede obtener
4. **Login de admin** - Autenticación de admin (opcional)
5. **Verificar notificaciones** - Verificación de que las notificaciones llegaron a AMVA Digital
6. **Conteo de no leídas** - Verificación del contador de notificaciones no leídas

## 📋 Requisitos

- Node.js instalado
- TypeScript instalado (`npm install -g typescript ts-node`)
- Credenciales de prueba configuradas

## 🚀 Uso

### Opción 1: Con variables de entorno

```bash
cd backend
API_BASE_URL=https://ministerio-backend-wdbj.onrender.com/api \
TEST_INVITADO_EMAIL=jerlibgv@gmail.com \
TEST_INVITADO_PASSWORD=tu_password \
TEST_ADMIN_EMAIL=admin@example.com \
TEST_ADMIN_PASSWORD=admin_password \
npm run test:solicitud-credencial
```

### Opción 2: Con valores por defecto

El script usa valores por defecto si no se configuran variables de entorno:

- `API_BASE_URL`: `https://ministerio-backend-wdbj.onrender.com/api`
- `TEST_INVITADO_EMAIL`: `jerlibgv@gmail.com`
- `TEST_INVITADO_PASSWORD`: `test123`
- `TEST_ADMIN_EMAIL`: `admin@example.com`
- `TEST_ADMIN_PASSWORD`: `admin123`

```bash
cd backend
npm run test:solicitud-credencial
```

### Opción 3: Ejecutar directamente

```bash
cd backend
ts-node scripts/test-solicitud-credencial.ts
```

## 📊 Salida del script

El script muestra:

- ✅ **Paso exitoso**: Con detalles de la operación
- ❌ **Paso fallido**: Con el error específico
- 📊 **Resumen final**: Con estadísticas de pruebas exitosas/fallidas

### Ejemplo de salida exitosa:

```
🚀 Iniciando prueba de flujo completo de solicitud de credenciales

📍 API Base URL: https://ministerio-backend-wdbj.onrender.com/api
👤 Invitado Email: jerlibgv@gmail.com

🔐 Paso 1: Login de invitado...
✅ Login de invitado: Login exitoso para jerlibgv@gmail.com

📝 Paso 2: Crear solicitud de credencial...
✅ Crear solicitud: Solicitud creada exitosamente

📋 Paso 3: Obtener mis solicitudes...
✅ Obtener mis solicitudes: Se encontraron 1 solicitud(es)

🔐 Paso 4: Login de admin (para verificar notificaciones)...
✅ Login de admin: Login exitoso para admin@example.com

🔔 Paso 5: Verificar notificaciones en AMVA Digital...
✅ Verificar notificaciones: Notificación encontrada en AMVA Digital

📊 Paso 6: Verificar conteo de no leídas...
✅ Verificar conteo de no leídas: Conteo de no leídas: 1

============================================================
📊 RESUMEN DE PRUEBAS
============================================================

✅ Exitosas: 6/6
❌ Fallidas: 0/6

============================================================
🎉 ¡Todas las pruebas pasaron exitosamente!
```

## 🔧 Solución de problemas

### Error: "No se pudo completar el login de invitado"

- Verifica que las credenciales sean correctas
- Verifica que el usuario invitado exista en la base de datos
- Verifica que la API esté disponible

### Error: "No se pudo crear la solicitud"

- Verifica que el token de invitado sea válido
- Verifica que no haya una solicitud pendiente con el mismo DNI
- Revisa los logs del backend para más detalles

### Error: "No se encontró notificación"

- Espera unos segundos (las notificaciones se procesan de forma asíncrona)
- Verifica que el admin tenga acceso a las notificaciones
- Revisa los logs del backend para ver si se enviaron las notificaciones

## 📝 Notas

- El script genera un DNI único para cada ejecución (`TEST${timestamp}`)
- Las notificaciones pueden tardar unos segundos en procesarse
- El script espera 2 segundos antes de verificar notificaciones
- Si el login de admin falla, el script continúa pero omite la verificación de notificaciones

## 🔄 Próximos pasos

Después de ejecutar el script:

1. Verifica en AMVA Digital que la notificación aparezca en tiempo real
2. Verifica que al hacer click en la notificación navegue a la página de solicitudes
3. Verifica que el scroll y highlight funcionen correctamente

