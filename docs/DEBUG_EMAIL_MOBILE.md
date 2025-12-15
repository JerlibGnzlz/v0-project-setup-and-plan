# 🔍 Debug: Por qué los emails no llegan desde AMVA Digital

## Problema Identificado

Los emails **llegan cuando se hacen los tests**, pero **NO llegan cuando se envían desde AMVA Digital dinámicamente**.

## Posibles Causas

### 1. **NotificationsService no está disponible** (Más probable)

El `NotificationsService` está marcado como `@Optional()` en el constructor de `InscripcionesService`. Esto significa que puede ser `undefined` si hay problemas de inyección de dependencias circulares.

**Síntomas:**
- Los logs muestran: `❌ CRÍTICO: NotificationsService no disponible`
- El email NO se envía
- La inscripción se crea correctamente, pero sin email

**Solución:**
- Verificar que `NotificationsModule` esté importado correctamente en `InscripcionesModule`
- Verificar que `forwardRef()` esté funcionando correctamente
- Reiniciar el servidor en producción

### 2. **EmailService no está configurado correctamente**

El `EmailService` puede no estar configurado correctamente en producción (SendGrid/Resend/SMTP).

**Síntomas:**
- Los logs muestran: `❌ CRÍTICO: No se pudo enviar email de inscripción`
- `NotificationsService` está disponible, pero `EmailService` falla

**Solución:**
- Verificar variables de entorno en producción
- Usar el endpoint de diagnóstico: `GET /notifications/test-email/diagnostic`
- Revisar logs del backend para ver errores específicos

### 3. **El código no se está ejecutando**

El código de envío de email puede no estar ejecutándose si hay un error antes.

**Síntomas:**
- NO se ven logs de email en absoluto
- La inscripción se crea, pero no hay logs de `📧 Preparando email...`

**Solución:**
- Verificar que la app móvil esté enviando `origenRegistro: "mobile"`
- Verificar que el endpoint `POST /api/inscripciones` esté funcionando
- Revisar logs del backend para ver si hay errores antes del envío de email

## Cómo Debuggear

### 1. Usar el script de debug

```bash
npm run debug:email-mobile
```

Este script:
- Verifica la configuración de `EmailService`
- Verifica que `NotificationsService` esté disponible
- Simula una inscripción desde mobile y muestra logs detallados
- Identifica posibles problemas de inyección de dependencias

### 2. Revisar logs del backend en producción

Cuando se crea una inscripción desde mobile, busca estos mensajes en los logs:

#### ✅ Si el email se envió correctamente:
```
📧 Preparando email de confirmación para [email]...
   Origen: mobile
✅ Email de inscripción enviado exitosamente a [email] (origen: mobile)
```

#### ❌ Si NotificationsService no está disponible:
```
❌ CRÍTICO: NotificationsService no disponible, no se puede enviar email de inscripción
   Email que NO se envió: [email]
   Origen: mobile
   Esto puede pasar si hay problemas de inyección de dependencias
   Verifica que NotificationsModule esté importado correctamente en InscripcionesModule
```

#### ❌ Si EmailService falla:
```
❌ CRÍTICO: No se pudo enviar email de inscripción a [email]
   Origen: mobile
   Verifica la configuración de EmailService y los logs anteriores
   Revisa que EmailService esté configurado correctamente (SendGrid/Resend/SMTP)
```

#### ❌ Si hay un error crítico:
```
❌ CRÍTICO: Error en el proceso de envío de email de inscripción: [error]
   Email afectado: [email]
   Origen: mobile
   El email NO se envió debido a este error
```

### 3. Verificar configuración de módulos

Verifica que `InscripcionesModule` importe `NotificationsModule` correctamente:

```typescript
// backend/src/modules/inscripciones/inscripciones.module.ts
@Module({
  imports: [
    PrismaModule,
    forwardRef(() => NotificationsModule), // ← Debe estar aquí
    forwardRef(() => AuthModule),
  ],
  // ...
})
```

### 4. Verificar que NotificationsModule exporte NotificationsService

```typescript
// backend/src/modules/notifications/notifications.module.ts
@Module({
  // ...
  exports: [NotificationsService, NotificationsGateway, EmailService], // ← Debe exportar NotificationsService
})
```

## Soluciones

### Solución 1: Reiniciar el servidor

Si el problema es de inyección de dependencias, reiniciar el servidor puede solucionarlo:

```bash
# En producción (Render/Railway/etc)
# Reiniciar el servicio desde el dashboard
```

### Solución 2: Verificar variables de entorno

Asegúrate de que las variables de entorno estén configuradas correctamente:

```bash
# Verificar que estas variables estén configuradas:
EMAIL_PROVIDER=gmail  # o sendgrid, resend
SMTP_USER=tu_email@gmail.com
SMTP_PASSWORD=tu_app_password
# O para SendGrid:
SENDGRID_API_KEY=SG.tu_api_key
SENDGRID_FROM_EMAIL=noreply@tudominio.com
```

### Solución 3: Usar endpoint de diagnóstico

```bash
GET /notifications/test-email/diagnostic
```

Este endpoint muestra un reporte completo de la configuración de email.

## Checklist de Verificación

- [ ] Los logs muestran `📧 Preparando email...` cuando se crea una inscripción desde mobile
- [ ] Los logs muestran `✅ Email de inscripción enviado exitosamente` o un error específico
- [ ] `NotificationsService` está disponible (no aparece `❌ CRÍTICO: NotificationsService no disponible`)
- [ ] `EmailService` está configurado correctamente (variables de entorno)
- [ ] El servidor se reinició después de cambios en módulos
- [ ] La app móvil está enviando `origenRegistro: "mobile"` correctamente

## Próximos Pasos

1. **Ejecutar el script de debug**: `npm run debug:email-mobile`
2. **Revisar logs del backend** cuando se crea una inscripción desde mobile
3. **Identificar el problema específico** usando los mensajes de log críticos
4. **Aplicar la solución** según el problema identificado

## Notas Importantes

- Los emails se envían **directamente** usando `notificationsService.sendEmailToUser()` antes de emitir eventos
- Si `NotificationsService` no está disponible, el email **NO se enviará**
- Los logs críticos ahora muestran claramente qué está fallando
- El problema puede ser diferente en producción vs desarrollo (inyección de dependencias)

