# 📱 Plan Completo: Notificaciones Push para App Móvil

## 🔍 Análisis de la Situación Actual

### ✅ Lo que YA funciona:

1. **Backend tiene sistema de notificaciones push**:
   - Usa Expo Push Notification Service
   - Métodos para registrar tokens de dispositivo (`registerInvitadoDeviceToken`)
   - Envía push notifications cuando se validan pagos
   - Busca tokens de dispositivo antes de enviar

2. **App móvil tiene hook de notificaciones**:
   - `useNotifications.tsx` registra tokens
   - Maneja notificaciones recibidas
   - Navegación desde notificaciones

### ❌ Lo que FALTA:

1. **Endpoint para invitados registrar tokens**:
   - Solo existe `/notifications/register` para pastores
   - Falta endpoint para invitados con `InvitadoJwtAuthGuard`

2. **Registro automático de token después de login**:
   - El hook `useNotifications` no registra tokens de invitados
   - Solo registra para pastores

3. **Push notification al crear inscripción**:
   - El backend envía email pero NO push notification
   - Falta enviar push cuando se crea inscripción

4. **Recordatorios de pagos pendientes**:
   - Existe evento `PagoRecordatorioEvent` pero no se envía automáticamente
   - Falta job/tarea programada para enviar recordatorios

5. **Firebase para Android** (opcional pero recomendado):
   - Firebase no está configurado
   - Android necesita FCM para notificaciones push confiables

## 🎯 Plan de Implementación

### Fase 1: Endpoint para Invitados (CRÍTICO)

**Backend**: Crear endpoint `/notifications/register/invitado`

```typescript
@Post('register/invitado')
@UseGuards(InvitadoJwtAuthGuard)
async registerInvitadoToken(
  @Req() req: AuthenticatedInvitadoRequest,
  @Body() body: { token: string; platform: string; deviceId?: string }
)
```

**App móvil**: Actualizar `useNotifications` para registrar tokens de invitados

### Fase 2: Push Notification al Crear Inscripción

**Backend**: Modificar `inscripciones.service.ts` para enviar push notification después de crear inscripción

```typescript
// Después de crear inscripción, buscar tokens del invitado y enviar push
const invitado = await this.prisma.invitado.findUnique({
  where: { email: inscripcion.email },
  include: { auth: { include: { deviceTokens: { where: { active: true } } } } }
})

if (invitado?.auth?.deviceTokens.length > 0) {
  // Enviar push notification
}
```

### Fase 3: Recordatorios de Pagos Pendientes

**Backend**: Crear job/tarea programada que:
1. Busque inscripciones con pagos pendientes
2. Envíe push notifications de recordatorio
3. Se ejecute periódicamente (ej: cada día a las 9 AM)

### Fase 4: Firebase para Android (Opcional)

**Configuración**:
1. Crear proyecto en Firebase Console
2. Agregar app Android
3. Descargar `google-services.json`
4. Configurar FCM credentials en Expo

## 📋 Checklist de Implementación

- [ ] Crear endpoint `/notifications/register/invitado` en backend
- [ ] Actualizar `useNotifications` para registrar tokens de invitados
- [ ] Enviar push notification al crear inscripción
- [ ] Crear job para recordatorios de pagos pendientes
- [ ] Configurar Firebase (opcional)
- [ ] Probar notificaciones en dispositivo físico
- [ ] Documentar configuración

## 🔗 Recursos

- [Expo Push Notifications](https://docs.expo.dev/push-notifications/push-notifications-setup/)
- [Firebase Cloud Messaging](https://docs.expo.dev/push-notifications/fcm-credentials/)
- [Expo Push Notification Service](https://docs.expo.dev/push-notifications/sending-notifications/)

