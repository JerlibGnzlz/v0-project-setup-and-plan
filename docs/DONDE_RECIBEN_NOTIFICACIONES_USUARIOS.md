# 📱 ¿Dónde Reciben las Notificaciones los Usuarios?

## 🎯 Resumen

Los usuarios (pastores) reciben notificaciones de **dos formas principales**:

1. **📱 Push Notifications** en la app móvil (si tienen la app instalada)
2. **📧 Email de respaldo** (si no hay push o si el push falla)

---

## 📱 1. Push Notifications (App Móvil)

### ¿Dónde las ven?

Los usuarios reciben las notificaciones push **directamente en su teléfono** cuando tienen la app móvil instalada.

### ¿Cómo funciona?

1. **Registro del token:**
   - Cuando el usuario inicia sesión en la app móvil, se registra automáticamente un token de dispositivo
   - Este token se guarda en la base de datos asociado al email del usuario

2. **Envío de notificación:**
   - Cuando validas un pago en el dashboard, el sistema busca tokens activos del usuario
   - Envía la notificación push usando **Expo Push Notification Service**
   - La notificación aparece en la pantalla del teléfono del usuario

3. **Dónde aparecen:**
   - **Android:** En la barra de notificaciones superior
   - **iOS:** En el centro de notificaciones
   - **Ambos:** Con sonido, vibración y badge en el icono de la app

### Ejemplo de notificación push:

```
📱 Notificación en el teléfono:

┌─────────────────────────────┐
│ ✅ Pago de Cuota 1 Validado │
│                             │
│ Tu pago de $50.000 ha sido  │
│ validado exitosamente. Has  │
│ pagado 1 de 3 cuotas.       │
└─────────────────────────────┘
```

---

## 📧 2. Email de Respaldo

### ¿Dónde las ven?

Los usuarios reciben emails en **su bandeja de entrada** (Gmail, Outlook, etc.)

### ¿Cuándo se envía?

El email se envía automáticamente como respaldo cuando:

- ❌ El usuario **no tiene** la app móvil instalada
- ❌ El usuario **no tiene** tokens de dispositivo registrados
- ❌ El push notification **falla** por alguna razón

### ¿Cómo funciona?

1. **Configuración SMTP:**
   - El sistema usa un servidor SMTP (configurado en variables de entorno)
   - Por defecto: Gmail SMTP (smtp.gmail.com:587)

2. **Envío automático:**
   - Si no hay push exitoso, se envía email automáticamente
   - El email tiene un diseño HTML profesional con el logo de AMVA

3. **Dónde aparecen:**
   - En la bandeja de entrada del email del usuario
   - Con asunto: "✅ Pago de Cuota X Validado" o "🎉 ¡Inscripción Confirmada!"

### Ejemplo de email:

```
📧 Email recibido:

De: AMVA Digital <noreply@vidaabundante.org>
Asunto: ✅ Pago de Cuota 1 Validado

┌─────────────────────────────────────┐
│         AMVA Digital                │
│                                     │
│  ✅ Pago de Cuota 1 Validado        │
│                                     │
│  Tu pago de $50.000 ha sido         │
│  validado exitosamente. Has         │
│  pagado 1 de 3 cuotas.             │
│                                     │
│  ┌─────────────────────────────┐  │
│  │ Progreso: Cuota 1 de 3      │  │
│  │ Monto: $50.000              │  │
│  │ Método: Transferencia        │  │
│  └─────────────────────────────┘  │
│                                     │
│  Asociación Misionera Vida         │
│  Abundante                          │
│  vidaabundante.org                  │
└─────────────────────────────────────┘
```

---

## 🔄 Flujo Completo de Notificaciones

### Escenario 1: Usuario con App Móvil Instalada

```
1. Admin valida pago en dashboard
   ↓
2. Sistema busca tokens del usuario
   ↓
3. Envía push notification
   ↓
4. ✅ Usuario recibe notificación en su teléfono
   ↓
5. (Email NO se envía porque push fue exitoso)
```

### Escenario 2: Usuario SIN App Móvil

```
1. Admin valida pago en dashboard
   ↓
2. Sistema busca tokens del usuario
   ↓
3. ❌ No encuentra tokens activos
   ↓
4. Envía email de respaldo automáticamente
   ↓
5. ✅ Usuario recibe email en su bandeja de entrada
```

### Escenario 3: Push Falla

```
1. Admin valida pago en dashboard
   ↓
2. Sistema busca tokens del usuario
   ↓
3. Intenta enviar push notification
   ↓
4. ❌ Push falla (token inválido, dispositivo apagado, etc.)
   ↓
5. Sistema detecta fallo y envía email de respaldo
   ↓
6. ✅ Usuario recibe email en su bandeja de entrada
```

---

## 📋 Tipos de Notificaciones que Reciben

### 1. ✅ Pago Validado

**Cuándo:** Cuando validas un pago individual (cuota)

**Mensaje Push/Email:**

- Título: "✅ Pago de Cuota X Validado"
- Mensaje: "Tu pago de $X ha sido validado exitosamente. Has pagado X de Y cuotas."

**Datos incluidos:**

- Número de cuota
- Monto pagado
- Progreso (cuotas pagadas/totales)
- Método de pago

---

### 2. 🎉 Inscripción Confirmada

**Cuándo:** Cuando todas las cuotas están pagadas y validadas

**Mensaje Push/Email:**

- Título: "🎉 ¡Inscripción Confirmada!"
- Mensaje: "Tu inscripción a '[Convención]' ha sido confirmada. Todos los pagos han sido validados exitosamente. ¡Te esperamos!"

**Datos incluidos:**

- Título de la convención
- Número total de cuotas pagadas
- Estado: Confirmado

---

## ⚙️ Configuración Necesaria

### Para Push Notifications:

✅ **Ya está configurado** - Usa Expo Push Notification Service

- No requiere configuración adicional
- Funciona automáticamente cuando el usuario instala la app

### Para Emails:

⚠️ **Requiere configuración** - Variables de entorno en `.env`:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=tu-email@gmail.com
SMTP_PASSWORD=tu-app-password
```

**Nota:** Para Gmail, necesitas usar una "App Password" (no tu contraseña normal).

---

## 🔍 Verificar si un Usuario Recibió la Notificación

### En el Dashboard Admin:

1. Ve a la sección de notificaciones (si está implementada)
2. Busca el historial de notificaciones del usuario
3. Verás:
   - ✅ `pushSuccess: true` - Push enviado exitosamente
   - ✅ `emailSuccess: true` - Email enviado exitosamente
   - 📱 `sentVia: 'push'` - Solo push
   - 📧 `sentVia: 'email'` - Solo email
   - 📱📧 `sentVia: 'both'` - Push y email

### En los Logs del Backend:

```bash
# Ver logs del backend
cd backend
npm run start:dev

# Buscar líneas como:
📬 Notificación de pago validado enviada a usuario@email.com (Cuota 1/3)
📱 Push a usuario@email.com: 1 exitosas, 0 fallidas
📧 Email de respaldo enviado a usuario@email.com
✅ Notificación procesada para usuario@email.com: push=true, email=false
```

---

## 💡 Recomendaciones

1. **Para usuarios con app móvil:**
   - Asegúrate de que tengan la app instalada y actualizada
   - Verifica que hayan iniciado sesión al menos una vez (para registrar el token)

2. **Para usuarios sin app móvil:**
   - El email se enviará automáticamente como respaldo
   - Asegúrate de que el email del usuario sea correcto

3. **Configuración de email:**
   - Configura las variables SMTP en producción
   - Usa un servicio de email confiable (Gmail, SendGrid, etc.)
   - Prueba el envío de emails antes de producción

4. **Monitoreo:**
   - Revisa los logs del backend para ver si las notificaciones se están enviando
   - Verifica el historial de notificaciones en la base de datos

---

## 🚀 Próximas Mejoras Sugeridas

1. **Panel de notificaciones en la app móvil:**
   - Ver historial de notificaciones dentro de la app
   - Marcar como leídas
   - Acciones rápidas desde las notificaciones

2. **Notificaciones en la web:**
   - Si el usuario está en la web, mostrar notificaciones en tiempo real
   - Usar WebSockets para notificaciones instantáneas

3. **Preferencias de notificación:**
   - Permitir que los usuarios elijan cómo quieren recibir notificaciones
   - Push, email, o ambos

---

## 📞 Soporte

Si un usuario reporta que no recibió una notificación:

1. ✅ Verifica que el email del usuario sea correcto
2. ✅ Revisa los logs del backend para ver si se intentó enviar
3. ✅ Verifica la configuración SMTP (para emails)
4. ✅ Verifica que el usuario tenga la app instalada (para push)
5. ✅ Revisa el historial de notificaciones en la base de datos
















