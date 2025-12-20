# 📱 Checklist para Publicar en Play Store

## ✅ Configuración Básica

### 1. EAS Build Configurado
- [x] `eas.json` creado con perfiles de desarrollo, preview y producción
- [ ] Instalar EAS CLI: `npm install -g eas-cli`
- [ ] Login en EAS: `eas login`
- [ ] Configurar proyecto: `eas build:configure`

### 2. Signing Keys (CRÍTICO)
- [ ] Generar keystore de producción:
  ```bash
  keytool -genkeypair -v -storetype PKCS12 -keystore amva-release-key.keystore -alias amva-key-alias -keyalg RSA -keysize 2048 -validity 10000
  ```
- [ ] Guardar keystore en lugar seguro (NO commitear)
- [ ] Configurar variables en `android/gradle.properties`:
  ```
  MYAPP_RELEASE_STORE_FILE=amva-release-key.keystore
  MYAPP_RELEASE_KEY_ALIAS=amva-key-alias
  MYAPP_RELEASE_STORE_PASSWORD=tu-password-seguro
  MYAPP_RELEASE_KEY_PASSWORD=tu-password-seguro
  ```
- [ ] Actualizar `build.gradle` para usar keystore de producción
- [ ] **IMPORTANTE**: Guardar backup del keystore en lugar seguro (si lo pierdes, no podrás actualizar la app)

### 3. Versioning
- [ ] Configurar `versionCode` en `app.json` y `build.gradle` (debe incrementarse en cada release)
- [ ] Configurar `versionName` (ej: "1.0.0")
- [ ] Considerar usar versioning automático con EAS

### 4. Variables de Entorno
- [ ] Configurar `.env` para producción (NO commitear)
- [ ] Usar `EXPO_PUBLIC_API_URL` para producción
- [ ] Configurar variables en EAS: `eas secret:create --scope project --name EXPO_PUBLIC_API_URL --value https://ministerio-backend-wdbj.onrender.com/api`

## 🔒 Seguridad

### 5. ProGuard/R8
- [x] `proguard-rules.pro` configurado con reglas para React Native, Expo y Google Sign-In
- [x] `minifyEnabled = true` en release builds
- [x] `shrinkResources = true` en release builds
- [ ] Probar build de release para verificar que no hay crashes por ofuscación

### 6. Credenciales y Secretos
- [ ] Verificar que NO hay tokens/secretos hardcodeados
- [ ] Usar variables de entorno para todas las configuraciones sensibles
- [ ] Verificar que `.env` está en `.gitignore`

## 🚀 Performance y Optimización

### 7. Bundle Size
- [ ] Verificar tamaño del bundle: `eas build --platform android --profile production --local`
- [ ] Optimizar imágenes (usar formatos WebP cuando sea posible)
- [ ] Considerar code splitting si el bundle es muy grande
- [ ] Verificar que no hay dependencias innecesarias

### 8. Performance
- [ ] Probar la app en dispositivos de gama baja
- [ ] Verificar tiempos de carga
- [ ] Optimizar imágenes grandes
- [ ] Verificar que no hay memory leaks

## 🔔 Notificaciones Push

### 9. Firebase Configuration
- [ ] Crear proyecto en Firebase Console: https://console.firebase.google.com/
- [ ] Agregar app Android al proyecto Firebase
- [ ] Descargar `google-services.json` y colocarlo en `android/app/`
- [ ] Configurar FCM credentials en Expo: https://docs.expo.dev/push-notifications/fcm-credentials/
- [ ] Probar notificaciones push en dispositivo físico

## 📊 Monitoreo y Analytics

### 10. Crash Reporting (Recomendado)
- [ ] Configurar Sentry o Firebase Crashlytics
- [ ] Probar que los crashes se reportan correctamente
- [ ] Configurar alertas para crashes críticos

### 11. Analytics (Opcional)
- [ ] Configurar Firebase Analytics o similar
- [ ] Definir eventos importantes a trackear
- [ ] Verificar cumplimiento con políticas de privacidad

## 🎨 Assets para Play Store

### 12. Iconos y Screenshots
- [ ] Icono de la app (512x512px) - ya configurado en `app.json`
- [ ] Screenshots para diferentes tamaños de pantalla:
  - Teléfono: mínimo 2, máximo 8 (16:9 o 9:16)
  - Tablet: mínimo 1, máximo 8 (16:9 o 9:16)
- [ ] Feature graphic (1024x500px)
- [ ] Logo de la app para Play Store

### 13. Descripción y Metadatos
- [ ] Título de la app (máximo 50 caracteres)
- [ ] Descripción corta (máximo 80 caracteres)
- [ ] Descripción completa (máximo 4000 caracteres)
- [ ] Categoría de la app
- [ ] Palabras clave (máximo 30 caracteres)
- [ ] Política de privacidad (URL)
- [ ] Contacto de soporte (email)

## 🧪 Testing

### 14. Testing Interno
- [ ] Probar en diferentes dispositivos Android (gama baja, media, alta)
- [ ] Probar en diferentes versiones de Android (mínimo API 21)
- [ ] Probar todas las funcionalidades principales
- [ ] Probar con conexión lenta/sin conexión
- [ ] Probar login con Google
- [ ] Probar registro de usuarios
- [ ] Probar inscripciones a convenciones
- [ ] Probar subida de comprobantes
- [ ] Probar notificaciones push

### 15. Testing Beta
- [ ] Crear track de "Internal Testing" en Play Console
- [ ] Subir APK/AAB a Internal Testing
- [ ] Invitar testers internos
- [ ] Recopilar feedback y corregir bugs
- [ ] Crear track de "Closed Testing" (opcional)
- [ ] Expandir a "Open Testing" cuando esté listo

## 📝 Documentación Legal

### 16. Políticas y Términos
- [ ] Política de privacidad (requerida)
- [ ] Términos de servicio (recomendado)
- [ ] Política de reembolsos (si aplica)
- [ ] Contenido de la app apropiado (sin contenido ofensivo)

### 17. Permisos
- [ ] Verificar que todos los permisos están justificados
- [ ] Agregar descripciones claras de por qué se necesitan los permisos
- [ ] Verificar que no se solicitan permisos innecesarios

## 🚀 Publicación

### 18. Build Final
- [ ] Crear build de producción: `eas build --platform android --profile production`
- [ ] Verificar que el build es correcto
- [ ] Descargar AAB (Android App Bundle) del build

### 19. Play Console Setup
- [ ] Crear cuenta de desarrollador en Google Play Console ($25 USD, pago único)
- [ ] Crear nueva app en Play Console
- [ ] Completar información de la app (título, descripción, iconos, screenshots)
- [ ] Configurar categoría y contenido
- [ ] Configurar precios y distribución
- [ ] Configurar política de privacidad

### 20. Subir Build
- [ ] Subir AAB a Play Console (pestaña "Production" o "Testing")
- [ ] Completar formulario de contenido de la app
- [ ] Configurar versión y release notes
- [ ] Revisar y enviar para revisión

### 21. Revisión de Google
- [ ] Esperar revisión de Google (puede tomar 1-7 días)
- [ ] Responder a cualquier pregunta de Google
- [ ] Corregir cualquier problema reportado
- [ ] Una vez aprobada, la app estará disponible en Play Store

## 📈 Post-Lanzamiento

### 22. Monitoreo
- [ ] Monitorear crashes y errores en Play Console
- [ ] Revisar reviews y ratings
- [ ] Responder a comentarios de usuarios
- [ ] Monitorear métricas de uso

### 23. Actualizaciones
- [ ] Planificar ciclo de actualizaciones
- [ ] Incrementar `versionCode` en cada actualización
- [ ] Probar actualizaciones antes de publicar
- [ ] Publicar actualizaciones gradualmente (staged rollout)

## 🔗 Recursos Útiles

- [Documentación de EAS Build](https://docs.expo.dev/build/introduction/)
- [Guía de publicación en Play Store](https://developer.android.com/distribute/googleplay/start)
- [Configuración de Firebase](https://firebase.google.com/docs/android/setup)
- [ProGuard Rules para React Native](https://reactnative.dev/docs/signed-apk-android#enabling-proguard-to-reduce-the-size-of-the-apk)
- [Política de privacidad template](https://www.freeprivacypolicy.com/)

## ⚠️ Notas Importantes

1. **Keystore**: Si pierdes el keystore de producción, NO podrás actualizar la app. Guarda múltiples backups.
2. **Versioning**: `versionCode` debe incrementarse en cada release. No puedes decrementarlo.
3. **Testing**: Siempre prueba en dispositivos físicos antes de publicar.
4. **Revisión**: La primera revisión puede tomar varios días. Sé paciente.
5. **Actualizaciones**: Las actualizaciones son más rápidas de revisar que el lanzamiento inicial.

