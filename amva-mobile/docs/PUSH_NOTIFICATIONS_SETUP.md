# Configuración de Notificaciones Push (Opcional)

## ⚠️ IMPORTANTE: Firebase NO es necesario para que la app funcione

**La aplicación funciona perfectamente sin Firebase.** Firebase solo es necesario si deseas habilitar **notificaciones push** en dispositivos Android.

### ¿Qué funciona sin Firebase?
✅ Toda la funcionalidad principal de la app
✅ Inscripciones a convenciones
✅ Subir comprobantes de pago
✅ Ver estado de inscripciones
✅ Perfil de usuario
✅ Noticias
✅ Todas las demás características

### ¿Qué NO funciona sin Firebase?
❌ Notificaciones push en Android (las notificaciones push en iOS funcionan sin Firebase)
❌ Recibir notificaciones cuando se valida un pago
❌ Recibir notificaciones cuando se confirma una inscripción

## Problema: Firebase no inicializado

Si ves el error:
```
Default FirebaseApp is not initialized in this process
```

**Esto es normal y no afecta la funcionalidad de la app.** Solo significa que las notificaciones push no estarán disponibles en Android.

## Solución: Configurar Firebase Cloud Messaging (FCM) - Solo si necesitas notificaciones push

### Paso 1: Crear proyecto en Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Agrega una aplicación Android:
   - **Nombre del paquete**: `org.vidaabundante.app` (debe coincidir con `app.json`)
   - Descarga el archivo `google-services.json`

### Paso 2: Configurar credenciales en Expo

1. Coloca el archivo `google-services.json` en la raíz del proyecto `amva-mobile/`
2. Sube las credenciales a Expo usando EAS CLI:

```bash
cd amva-mobile
eas credentials:push
```

3. Sigue las instrucciones para subir el archivo `google-services.json`

### Paso 3: Reconstruir la aplicación

Después de configurar las credenciales, reconstruye la app:

```bash
eas build -p android --profile production
```

O para desarrollo:

```bash
eas build -p android --profile development
```

### Paso 4: Verificar configuración

Una vez reconstruida la app, las notificaciones push deberían funcionar correctamente.

## Resumen

### Sin Firebase (Estado actual)
- ✅ **La app funciona perfectamente**
- ✅ Todas las funcionalidades principales disponibles
- ✅ Notificaciones push funcionan en iOS
- ❌ Notificaciones push NO funcionan en Android
- ✅ El código maneja automáticamente el caso sin Firebase

### Con Firebase (Opcional)
- ✅ Todo lo anterior
- ✅ Notificaciones push funcionan también en Android
- ✅ Los usuarios pueden recibir notificaciones cuando se valida un pago
- ✅ Los usuarios pueden recibir notificaciones cuando se confirma una inscripción

## Conclusión

**Firebase NO es necesario para que la aplicación funcione.** Es una característica opcional que mejora la experiencia del usuario con notificaciones push en Android. Si no necesitas notificaciones push inmediatamente, puedes continuar usando la app sin configurar Firebase.

## Referencias

- [Guía oficial de Expo Push Notifications](https://docs.expo.dev/push-notifications/push-notifications-setup/)
- [Configuración de credenciales FCM](https://docs.expo.dev/push-notifications/fcm-credentials/)
- [Firebase Console](https://console.firebase.google.com/)

