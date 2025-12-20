# 🎉 Build Completado - Próximos Pasos

## ✅ Build Exitoso

Tu app se compiló correctamente. El archivo AAB está disponible en:
**https://expo.dev/artifacts/eas/smC9qi1iePqeCcuCUfEBCQ.aab**

---

## 📱 Paso 1: Descargar el AAB

1. Abre el enlace en tu navegador
2. Descarga el archivo `.aab`
3. Guárdalo en un lugar accesible

---

## 📲 Paso 2: Instalar en Dispositivo Android

### Opción A: Convertir AAB a APK (Para Instalación Directa)

El AAB es para Play Store. Para instalar directamente en tu dispositivo, puedes:

1. **Usar bundletool** (herramienta de Google):
   ```bash
   # Descargar bundletool
   wget https://github.com/google/bundletool/releases/download/1.15.6/bundletool-all-1.15.6.jar
   
   # Convertir AAB a APK
   java -jar bundletool-all-1.15.6.jar build-apks \
     --bundle=smC9qi1iePqeCcuCUfEBCQ.aab \
     --output=amva-movil.apks \
     --mode=universal
   
   # Extraer APK universal
   unzip amva-movil.apks -d apks/
   # El APK estará en apks/universal.apk
   ```

2. **O usar EAS Build con perfil preview** (más fácil):
   ```bash
   eas build --platform android --profile preview
   ```
   Esto genera un APK directamente que puedes instalar.

### Opción B: Subir a Play Store Internal Testing

Si tienes acceso a Play Console:
1. Ve a Play Console → Internal Testing
2. Sube el AAB
3. Instala desde Play Store (Internal Testing)

---

## 🔔 Paso 3: Probar Notificaciones Push

Una vez instalada la app en tu dispositivo físico:

### Prueba 1: Registro de Token
1. Abre la app
2. Inicia sesión como invitado
3. Verifica en los logs del backend que aparezca:
   ```
   ✅ Token registrado en el backend para invitado
   ```

### Prueba 2: Notificación de Inscripción
1. Crea una inscripción a una convención desde la app
2. Deberías recibir una notificación push inmediatamente
3. Verifica que la notificación aparezca en la barra de notificaciones

### Prueba 3: Notificación de Pago Validado
1. Sube un comprobante de pago desde la app
2. Un admin valida el pago desde el dashboard web
3. Deberías recibir una notificación push

### Prueba 4: Recordatorio de Pagos Pendientes
1. Si tienes pagos pendientes, recibirás un recordatorio diario (cron job)

---

## 🐛 Si las Notificaciones No Funcionan

### Verificar Logs del Backend
```bash
# En el backend, busca logs relacionados con:
# - "Token registrado"
# - "Enviando notificación push"
# - Errores de Firebase
```

### Verificar Firebase Console
1. Ve a Firebase Console: https://console.firebase.google.com/
2. Selecciona tu proyecto
3. Ve a **Cloud Messaging** → **Send test message**
4. Ingresa el token del dispositivo (debería estar en los logs del backend)
5. Envía un mensaje de prueba

### Verificar Configuración
- ✅ `google-services.json` está en `android/app/google-services.json`
- ✅ Credenciales de Firebase configuradas en EAS
- ✅ Server Key configurado: `AIzaSyDuvI7czRjhAdkoZQnWdgh42VRHwe910bA`
- ✅ Sender ID configurado: `804089781668`

---

## 📋 Checklist Final

- [x] Build completado exitosamente
- [ ] AAB descargado
- [ ] App instalada en dispositivo físico Android
- [ ] Token registrado en backend (verificar logs)
- [ ] Notificación de inscripción recibida
- [ ] Notificación de pago validado recibida
- [ ] Notificaciones push funcionando correctamente

---

## 🚀 Próximos Pasos para Producción

1. **Probar exhaustivamente** en dispositivo físico
2. **Verificar todas las funcionalidades**:
   - Login/Registro
   - Inscripciones
   - Pagos
   - Notificaciones push
3. **Subir a Play Store** cuando todo funcione correctamente
4. **Configurar Internal Testing** en Play Console
5. **Publicar en producción** después de pruebas

---

## 📚 Recursos Útiles

- **EAS Build Dashboard**: https://expo.dev/accounts/jerlibgnzlz/projects/amva-movil/builds
- **Firebase Console**: https://console.firebase.google.com/
- **Play Console**: https://play.google.com/console/

