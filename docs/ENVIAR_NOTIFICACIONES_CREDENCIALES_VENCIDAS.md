# 📱 Enviar Notificaciones Push de Credenciales Vencidas

## ✅ Funcionalidad Implementada

El sistema permite enviar notificaciones push automáticas a usuarios que tienen credenciales vencidas o por vencer, recordándoles que deben renovar sus credenciales.

## 🎯 Características

- ✅ **Notificaciones Push**: Se envían directamente a los teléfonos de los usuarios
- ✅ **Filtros por Tipo**: Puedes enviar a usuarios con credenciales vencidas, por vencer, o ambas
- ✅ **Solo Usuarios Activos**: Solo se envían a usuarios que tienen la app móvil instalada y tokens activos
- ✅ **Prueba Individual**: Puedes probar enviando a un usuario específico por documento
- ✅ **Diagnóstico**: Verifica el estado del sistema antes de enviar

## 📋 Cómo Usar

### Desde el Dashboard Admin

1. **Accede al Dashboard Admin**
   - Ve a `/admin` y autentícate

2. **Abre el Dialog de Notificaciones**
   - Busca el botón o componente que abre el dialog de "Enviar Notificaciones Push"
   - Generalmente está en la sección de credenciales o notificaciones

3. **Ver Diagnóstico (Opcional)**
   - Haz clic en "Ver diagnóstico del sistema"
   - Esto te mostrará:
     - Tokens activos totales
     - Tokens por plataforma (Android/iOS)
     - Credenciales vencidas/por vencer
     - Usuarios con tokens activos
     - Usuarios sin tokens activos

4. **Probar con un Usuario Específico (Opcional)**
   - Ingresa el número de documento del usuario
   - Haz clic en "Probar"
   - Verás si el usuario tiene tokens activos y si se puede enviar

5. **Seleccionar Tipo de Credenciales**
   - **Vencidas**: Solo credenciales que ya vencieron
   - **Por vencer**: Credenciales que vencen en los próximos 30 días
   - **Ambas**: Credenciales vencidas y por vencer

6. **Enviar Notificaciones**
   - Haz clic en "Enviar Notificaciones"
   - El sistema procesará todas las credenciales y enviará notificaciones
   - Verás un resumen con:
     - Número de notificaciones enviadas exitosamente
     - Número de errores
     - Detalles de cada usuario (éxito o error)

## 🔧 Endpoint API

Si prefieres usar la API directamente:

```bash
POST /api/notifications/push/credenciales-vencidas
Authorization: Bearer <token_admin>

Body:
{
  "tipo": "vencidas" | "por_vencer" | "ambas"
}
```

**Respuesta:**
```json
{
  "enviadas": 5,
  "errores": 2,
  "detalles": [
    {
      "email": "usuario@example.com",
      "nombre": "Juan Pérez",
      "estado": "vencida",
      "exito": true
    },
    {
      "email": "usuario2@example.com",
      "nombre": "María García",
      "estado": "por vencer",
      "exito": false,
      "error": "No se encontraron tokens de dispositivo activos"
    }
  ]
}
```

## 📱 Mensaje de Notificación

Los usuarios recibirán una notificación push con:

**Título**: `Credencial Vencida` o `Credencial Por Vencer`

**Mensaje**: 
- `Tu credencial ministerial está vencida (vence hace X días). Por favor, renueva tu credencial.`
- O: `Tu credencial de capellanía está por vencer (vence en X días). Por favor, renueva tu credencial.`

## ⚠️ Requisitos para que Funcione

1. **Usuario debe tener credencial activa**
   - La credencial debe estar marcada como `activa: true`
   - La credencial debe tener un `invitadoId` asignado

2. **Usuario debe tener la app móvil instalada**
   - El usuario debe haber descargado e instalado la app móvil
   - El usuario debe haber iniciado sesión al menos una vez

3. **Usuario debe tener tokens activos**
   - El usuario debe tener tokens de dispositivo registrados y activos
   - Los tokens se registran automáticamente cuando el usuario inicia sesión

## 🔍 Troubleshooting

### No se envían notificaciones

**Posibles causas:**
1. Los usuarios no tienen tokens activos
   - **Solución**: Los usuarios deben abrir la app móvil e iniciar sesión

2. Las credenciales no tienen `invitadoId`
   - **Solución**: Asigna un invitado a las credenciales desde el dashboard

3. Las credenciales no cumplen los criterios de fecha
   - **Solución**: Verifica que las fechas de vencimiento sean correctas

### Error: "No se encontraron tokens de dispositivo activos"

**Causa**: El usuario no tiene la app móvil instalada o no ha iniciado sesión recientemente.

**Solución**: 
- El usuario debe instalar la app móvil
- El usuario debe iniciar sesión en la app
- Los tokens se registran automáticamente al iniciar sesión

### Error: "Credencial no tiene invitadoId"

**Causa**: La credencial no está asociada a un usuario (invitado).

**Solución**:
- Asigna un invitado a la credencial desde el dashboard
- O el sistema intentará asignarlo automáticamente buscando por documento en inscripciones

## 🚀 Programar Envío Automático (Futuro)

Para programar el envío automático de notificaciones, puedes usar:

1. **Cron Job en el Backend**
   - Crear un servicio que ejecute el método periódicamente
   - Ejemplo: Todos los lunes a las 9 AM

2. **Servicio Externo**
   - Usar un servicio como cron-job.org o similar
   - Configurar para que llame al endpoint periódicamente

3. **Render Cron Jobs** (si usas Render)
   - Configurar un cron job en Render
   - Ejecutar el endpoint periódicamente

## 📊 Estadísticas

El diagnóstico del sistema muestra:
- Total de tokens activos
- Tokens por plataforma (Android/iOS)
- Tokens por tipo de usuario (admin/pastor/invitado)
- Credenciales vencidas/por vencer
- Usuarios con tokens activos
- Usuarios sin tokens activos

## ✅ Mejoras Implementadas

- ✅ Carga de tokens junto con invitados (evita consultas redundantes)
- ✅ Uso directo de tokens ya cargados
- ✅ Mejor manejo de errores
- ✅ Desactivación automática de tokens inválidos
- ✅ Logging mejorado para debugging
- ✅ Componente frontend completo y funcional

---

**Última actualización**: Diciembre 2025

