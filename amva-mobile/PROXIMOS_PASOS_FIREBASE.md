# ✅ Firebase Configurado - Próximos Pasos

## 🎉 ¡Excelente! Ya configuraste las credenciales de Firebase en EAS

---

## 📋 Paso 1: Verificar Credenciales (Opcional)

Para verificar que todo está bien configurado:

```bash
cd /home/jerlibgnzlz/Escritorio/v0-project-setup-and-plan/amva-mobile
eas credentials
```

Selecciona Android y verifica que aparezca la configuración de FCM.

---

## 🚀 Paso 2: Rebuild la App con EAS

Ahora necesitas rebuild la app para que use las credenciales de Firebase:

```bash
cd /home/jerlibgnzlz/Escritorio/v0-project-setup-and-plan/amva-mobile
eas build --platform android --profile production
```

**O si quieres probar primero con preview:**

```bash
eas build --platform android --profile preview
```

Esto:
- ✅ Compilará la app con las credenciales de Firebase configuradas
- ✅ Generará un APK o AAB según el perfil
- ✅ Subirá el build a EAS (puedes descargarlo desde la web)

---

## 📱 Paso 3: Instalar en Dispositivo Físico

1. **Descarga el APK/AAB** desde: https://expo.dev/accounts/[tu-usuario]/builds
2. **Instala en tu dispositivo Android físico** (las notificaciones push solo funcionan en dispositivos físicos, no en emuladores)
3. **Abre la app** e inicia sesión como invitado

---

## 🔔 Paso 4: Probar Notificaciones Push

### Prueba 1: Registro de Token
1. Inicia sesión en la app como invitado
2. Verifica en los logs del backend que aparezca: `✅ Token registrado en el backend para invitado`

### Prueba 2: Notificación de Inscripción
1. Crea una inscripción a una convención desde la app
2. Deberías recibir una notificación push inmediatamente

### Prueba 3: Notificación de Pago Validado
1. Sube un comprobante de pago desde la app
2. Un admin valida el pago desde el dashboard web
3. Deberías recibir una notificación push

### Prueba 4: Recordatorio de Pagos Pendientes
1. Si tienes pagos pendientes, recibirás un recordatorio diario (cron job)

---

## 🐛 Si Algo No Funciona

### Verificar Logs del Backend
```bash
# En el backend, verifica los logs cuando se registra un token
# Deberías ver: "✅ Token registrado en el backend para invitado"
```

### Verificar Logs de la App
- Abre la app y revisa los logs en la consola
- Busca mensajes relacionados con notificaciones push

### Verificar Firebase Console
1. Ve a Firebase Console: https://console.firebase.google.com/
2. Selecciona tu proyecto
3. Ve a **Cloud Messaging** → **Send test message**
4. Ingresa el token del dispositivo (debería estar en los logs del backend)

---

## 📋 Checklist Final

- [x] Credenciales de Firebase configuradas en EAS
- [ ] App rebuild con EAS
- [ ] App instalada en dispositivo físico
- [ ] Token registrado en backend (verificar logs)
- [ ] Notificación de inscripción recibida
- [ ] Notificación de pago validado recibida

---

## 🎯 Comando Rápido para Rebuild

```bash
cd /home/jerlibgnzlz/Escritorio/v0-project-setup-and-plan/amva-mobile
eas build --platform android --profile production
```

Este proceso puede tomar 10-20 minutos. EAS te dará un enlace para descargar el APK/AAB cuando termine.

