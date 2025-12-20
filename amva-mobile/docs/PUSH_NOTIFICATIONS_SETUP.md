# Configuración de Notificaciones Push

## Problema: Firebase no inicializado

Si ves el error:
```
Default FirebaseApp is not initialized in this process
```

Significa que Firebase no está configurado para las notificaciones push en Android.

## Solución: Configurar Firebase Cloud Messaging (FCM)

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

## Nota importante

- **Sin Firebase**: La app funcionará normalmente, pero las notificaciones push no estarán disponibles
- **Con Firebase**: Las notificaciones push funcionarán completamente
- El código maneja automáticamente el caso cuando Firebase no está configurado

## Referencias

- [Guía oficial de Expo Push Notifications](https://docs.expo.dev/push-notifications/push-notifications-setup/)
- [Configuración de credenciales FCM](https://docs.expo.dev/push-notifications/fcm-credentials/)
- [Firebase Console](https://console.firebase.google.com/)

