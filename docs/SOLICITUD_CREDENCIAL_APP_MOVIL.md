# Solicitud de credencial desde la app móvil – Por qué fallaba y qué se hizo

## Qué pasaba

Al enviar la solicitud de credencial (pastor, pastora, obispo, etc.) desde la app móvil aparecía **Error de validación** (400) y no se creaba la solicitud.

## Posibles causas del 400

1. **Propiedades extra en el body (`forbidNonWhitelisted`)**  
   El backend tiene `ValidationPipe` con `forbidNonWhitelisted: true`. Si el body trae alguna propiedad que no está en el DTO (por ejemplo por un proxy o por cómo se serializa el body), Nest devuelve 400.

2. **Body no parseado cuando corre el middleware**  
   En Nest/Express el body parser a veces corre *después* de los middlewares registrados con `app.use()`. Si el middleware de sanitización se ejecutaba antes de que existiera `req.body`, no podía limpiar nada y el body podía llegar con algo inesperado o vacío.

3. **Campos requeridos**  
   Si no se envían `tipo`, `dni`, `nombre` y `apellido` correctamente, la validación falla.

## Cambios realizados

### Backend

1. **Interceptor `SanitizeSolicitudBodyInterceptor`**  
   - Se ejecuta **solo** en `POST /api/solicitudes-credenciales`.  
   - Deja en `req.body` únicamente las claves permitidas por el DTO:  
     `tipo`, `dni`, `nombre`, `apellido`, `nacionalidad`, `tipoPastor`, `fechaNacimiento`, `motivo`.  
   - Cualquier otra propiedad se descarta, así que `forbidNonWhitelisted` no falla por props extra.  
   - Se aplica en el controlador con `@UseInterceptors(SanitizeSolicitudBodyInterceptor)` en el método `create`.

2. **DTO**  
   - `tipo` se normaliza con `@Transform` (trim + minúsculas).  
   - `dni`, `nombre`, `apellido` con trim.  
   - Opcionales con `@ValidateIf` para no validar cuando vienen vacíos.

3. **Middleware en `main.ts`**  
   - Sigue existiendo un middleware que sanitiza el body para la misma ruta por si el body ya viene parseado antes.

4. **Respuesta de error**  
   - La excepción de validación envía `details` con los errores de class-validator para poder ver en cliente/logs qué falló.

### App móvil

1. **Cliente API**  
   - `tipo` se envía siempre en minúsculas (`ministerial` / `capellania`).  
   - Para credencial ministerial se envía siempre `tipoPastor` (por defecto `PASTOR` si no se elige otro).  
   - Validación antes de enviar: si faltan DNI, nombre o apellido, no se hace la petición y se muestra error claro.

2. **Modal**  
   - Si falta DNI, nombre o apellido al pulsar “Enviar”, se muestra un Alert indicando qué completar.

## Qué hacer para que funcione

1. **Desplegar/reiniciar el backend** con estos cambios (sobre todo el interceptor y el DTO).
2. En la app, completar **Tipo de credencial**, **Tipo de pastor** (Pastor, Pastora, Obispo, Obispa, etc.), **DNI**, **Nombre** y **Apellido** y pulsar **Enviar solicitud**.

Si sigue habiendo 400, en los **logs del backend** debería aparecer:

- `Body sanitizado para crear solicitud: {...}` (lo que llega al controlador).
- `ValidationPipe: Error de validación` y la lista de errores.

Con eso se ve si falla por un campo concreto (formato, obligatorio, etc.) o por otra razón.

---

## Las solicitudes no aparecen en AMVA Digital (admin)

### Qué pasaba

En la app móvil la solicitud se creaba y aparecía como "Pendiente", y en el panel llegaban notificaciones "Nueva Solicitud de Credencial", pero en **Credenciales Pastorales** la lista "Solicitudes Pendientes" salía vacía (0 solicitudes).

### Causa

El backend usa `ValidationPipe` con `whitelist: true`. En el GET de solicitudes el controlador usaba `@Query() query: PaginationDto & { estado?, tipo? }`. `PaginationDto` solo define `page` y `limit`, así que **`estado` y `tipo` se eliminaban** al validar y el servicio recibía `undefined` para ambos. Además, si por algún motivo el filtro no se aplicaba bien, la lista podía no coincidir con lo esperado.

### Cambio realizado

- Se creó **`FindAllSolicitudesQueryDto`** con `page`, `limit`, `estado` y `tipo` (todos opcionales), de modo que el pipe no elimine `estado` ni `tipo`.
- El controlador pasa a usar `@Query() query: FindAllSolicitudesQueryDto` y se añadió log: `GET solicitudes: page=..., tipo=...`.
- En el servicio se añadió log de `findAll` (where, total, cantidad devuelta) para depurar.

### Comprobar que admin y app usan el mismo backend

Si el admin (AMVA Digital) y la app móvil no usan la **misma URL de API**, verán bases de datos distintas:

- **Web (admin):** `NEXT_PUBLIC_API_URL` en el build (ej. `https://amva.org.es/api`).
- **App móvil:** `EXPO_PUBLIC_API_URL` o la URL por defecto (ej. `https://amva.org.es/api`).

Si el admin apunta a `http://localhost:4000/api` y la app a producción, en el admin no se verán las solicitudes creadas desde la app. Hay que desplegar el admin con `NEXT_PUBLIC_API_URL` apuntando al mismo backend que usa la app.
