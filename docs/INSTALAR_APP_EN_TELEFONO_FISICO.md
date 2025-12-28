# 📱 Cómo Instalar la App en tu Teléfono Físico

## ✅ Opción 1: APK con EAS Build (Recomendado)

Esta es la mejor opción para probar en Android. Genera un APK que puedes instalar directamente.

### Pasos:

1. **Instalar EAS CLI (si no lo tienes):**
   ```bash
   npm install -g eas-cli
   ```

2. **Iniciar sesión en Expo:**
   ```bash
   eas login
   ```

3. **Construir APK para Android:**
   ```bash
   cd amva-mobile
   eas build --platform android --profile preview
   ```

4. **Esperar el build:**
   - El build tomará 10-20 minutos
   - Recibirás un enlace para descargar el APK cuando termine

5. **Descargar e instalar:**
   - Abre el enlace en tu teléfono
   - Descarga el APK
   - Permite instalación desde fuentes desconocidas (si es necesario)
   - Instala el APK

### Ventajas:
- ✅ Funciona con todas las funcionalidades nativas (Google Sign-In, notificaciones, etc.)
- ✅ No requiere cable USB
- ✅ Puedes compartir el APK con otros usuarios

---

## ✅ Opción 2: Development Build (Para desarrollo activo)

Si estás desarrollando activamente y quieres ver cambios en tiempo real.

### Pasos:

1. **Construir development build:**
   ```bash
   cd amva-mobile
   eas build --platform android --profile development
   ```

2. **Instalar en tu teléfono:**
   - Descarga el APK del enlace proporcionado
   - Instala en tu teléfono

3. **Iniciar el servidor de desarrollo:**
   ```bash
   cd amva-mobile
   npx expo start --dev-client
   ```

4. **Conectar tu teléfono:**
   - Abre la app instalada
   - Escanea el código QR que aparece en la terminal
   - O conecta por USB y usa: `adb reverse tcp:8081 tcp:8081`

### Ventajas:
- ✅ Cambios en tiempo real (Hot Reload)
- ✅ Útil para desarrollo activo
- ✅ Debugging mejorado

---

## ✅ Opción 3: Build Local (Si tienes Android Studio)

Si prefieres construir localmente sin usar EAS.

### Requisitos:
- Android Studio instalado
- Android SDK configurado
- Variables de entorno configuradas

### Pasos:

1. **Generar archivos nativos:**
   ```bash
   cd amva-mobile
   npx expo prebuild --platform android
   ```

2. **Construir APK:**
   ```bash
   cd amva-mobile/android
   ./gradlew assembleRelease
   ```

3. **Encontrar el APK:**
   - El APK estará en: `amva-mobile/android/app/build/outputs/apk/release/app-release.apk`

4. **Instalar en tu teléfono:**
   - Transfiere el APK a tu teléfono (USB, email, etc.)
   - Instala el APK

---

## ✅ Opción 4: Expo Go (Limitado - No recomendado para Google Sign-In)

⚠️ **Nota:** Expo Go tiene limitaciones y puede no funcionar correctamente con Google Sign-In usando Backend Proxy.

### Pasos:

1. **Instalar Expo Go:**
   - Descarga "Expo Go" desde Google Play Store

2. **Iniciar servidor:**
   ```bash
   cd amva-mobile
   npx expo start
   ```

3. **Conectar:**
   - Abre Expo Go en tu teléfono
   - Escanea el código QR
   - O conecta por USB y usa: `adb reverse tcp:8081 tcp:8081`

### Limitaciones:
- ❌ Puede no funcionar con Google Sign-In Backend Proxy
- ❌ No incluye todas las funcionalidades nativas
- ✅ Útil solo para pruebas rápidas de UI

---

## 🎯 Recomendación

**Para probar Google Sign-In funcionando:**
- ✅ Usa **Opción 1: APK con EAS Build (preview)**
- Es la más confiable y funciona con todas las funcionalidades

**Para desarrollo activo:**
- ✅ Usa **Opción 2: Development Build**
- Permite ver cambios en tiempo real

---

## 📋 Checklist Antes de Construir

- [ ] Verificar que `app.json` tiene la configuración correcta
- [ ] Verificar que `google-services.json` está en `android/app/`
- [ ] Verificar que las variables de entorno están configuradas
- [ ] Verificar que el backend está funcionando en producción

---

## 🚀 Comando Rápido (Recomendado)

```bash
cd amva-mobile
eas build --platform android --profile preview
```

Este comando:
1. Construye un APK optimizado
2. Te da un enlace para descargar
3. Puedes instalar directamente en tu teléfono
4. Funciona con Google Sign-In Backend Proxy ✅

---

## 📱 Después de Instalar

1. Abre la app en tu teléfono
2. Haz clic en "Continuar con Google"
3. Deberías poder iniciar sesión correctamente ✅

---

## 🆘 Troubleshooting

### Error: "EAS CLI no encontrado"
```bash
npm install -g eas-cli
```

### Error: "No estás autenticado"
```bash
eas login
```

### Error: "Build failed"
- Verifica que todas las dependencias estén instaladas
- Verifica que `google-services.json` existe
- Revisa los logs del build en Expo Dashboard

### El APK no se instala
- Ve a Configuración → Seguridad → Permite instalación desde fuentes desconocidas
- O transfiere el APK por USB y permite la instalación cuando se solicite

