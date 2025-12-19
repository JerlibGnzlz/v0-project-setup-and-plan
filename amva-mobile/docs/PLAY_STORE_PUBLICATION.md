# Guía para Publicar AMVA Móvil en Google Play Store

## 📋 Requisitos Previos

### 1. Cuenta de Desarrollador de Google Play
- **Costo**: $25 USD (pago único de por vida)
- **Registro**: https://play.google.com/console/signup
- **Tiempo de activación**: 24-48 horas después del pago

### 2. Preparación del Proyecto

#### Configuración en `app.json`
```json
{
  "expo": {
    "name": "AMVA Móvil",
    "slug": "amva-movil",
    "version": "1.0.0",  // Incrementar en cada release
    "android": {
      "package": "org.vidaabundante.app",
      "versionCode": 1,  // Incrementar en cada release
      "permissions": [],  // Solo los necesarios
      "adaptiveIcon": {
        "foregroundImage": "./assets/images/amvamovil.png",
        "backgroundColor": "#0a1628"
      }
    }
  }
}
```

#### Configuración de EAS Build (Recomendado)
```bash
# Instalar EAS CLI
npm install -g eas-cli

# Iniciar sesión en Expo
eas login

# Configurar proyecto
cd amva-mobile
eas build:configure
```

### 3. Crear Keystore de Producción

```bash
# Generar keystore de producción
keytool -genkeypair -v -storetype PKCS12 -keystore amva-release.keystore \
  -alias amva-release -keyalg RSA -keysize 2048 -validity 10000 \
  -storepass [TU_PASSWORD] -keypass [TU_PASSWORD]

# Guardar en lugar seguro (NO commitear)
# Guardar contraseñas en lugar seguro
```

## 🚀 Proceso de Publicación

### Paso 1: Build de Producción

#### Opción A: Usando EAS Build (Recomendado)
```bash
cd amva-mobile

# Build de producción para Android
eas build --platform android --profile production

# El build se subirá automáticamente a Google Play si está configurado
```

#### Opción B: Build Local
```bash
cd amva-mobile

# Prebuild
npx expo prebuild --platform android

# Build APK/AAB
cd android
./gradlew assembleRelease  # Para APK
./gradlew bundleRelease    # Para AAB (recomendado para Play Store)
```

### Paso 2: Subir a Play Store Console

1. **Acceder a Google Play Console**: https://play.google.com/console
2. **Crear nueva app**:
   - Nombre: "AMVA Móvil"
   - Idioma predeterminado: Español
   - Tipo de app: App
   - Gratis o de pago: Gratis

3. **Completar información de la tienda**:
   - **Descripción corta** (80 caracteres): "App oficial de AMVA para gestión de convenciones y credenciales"
   - **Descripción completa**: Descripción detallada de la app
   - **Capturas de pantalla**: Mínimo 2, máximo 8 (requeridas)
   - **Icono de alta resolución**: 512x512px
   - **Imagen destacada**: 1024x500px (opcional pero recomendado)
   - **Video promocional**: Opcional

4. **Configuración de contenido**:
   - Clasificación de contenido
   - Política de privacidad (URL)
   - Datos de seguridad

5. **Subir APK/AAB**:
   - Ir a "Producción" → "Crear nueva versión"
   - Subir el archivo `.aab` (recomendado) o `.apk`
   - Agregar notas de la versión

### Paso 3: Testing Tracks (Para Probar Antes de Publicar)

#### Internal Testing (Hasta 100 testers)
```bash
# Build para testing interno
eas build --platform android --profile preview

# En Play Console:
# Testing → Internal testing → Crear release
# Agregar emails de testers
```

#### Closed Testing (Hasta 20,000 testers)
- Similar a Internal pero con más testers
- Útil para beta testing

#### Open Testing (Público)
- Cualquiera puede unirse como tester
- Útil para pruebas públicas antes del lanzamiento

### Paso 4: Revisión de Google

- **Tiempo de revisión**: 1-7 días (típicamente 1-3 días)
- **Verificaciones**:
  - Política de contenido
  - Permisos solicitados
  - Funcionalidad básica
  - Política de privacidad

### Paso 5: Publicación

Una vez aprobada:
- La app estará disponible en Play Store
- URL: `https://play.google.com/store/apps/details?id=org.vidaabundante.app`
- Los usuarios podrán descargarla normalmente

## 🔗 Configurar Botón de Descarga en la Web

### Opción 1: Link Directo a Play Store

```tsx
// components/download-button.tsx
<a
  href="https://play.google.com/store/apps/details?id=org.vidaabundante.app"
  target="_blank"
  rel="noopener noreferrer"
  className="..."
>
  <img
    src="https://play.google.com/intl/en_us/badges/static/images/badges/es_badge_web_generic.png"
    alt="Disponible en Google Play"
    className="h-14"
  />
</a>
```

### Opción 2: Detección Inteligente

```tsx
// Detectar si es Android y mostrar botón apropiado
const isAndroid = /Android/i.test(navigator.userAgent)

if (isAndroid) {
  // Mostrar botón de Play Store
} else {
  // Mostrar mensaje "Próximamente en iOS" o link a Play Store igual
}
```

### Opción 3: Deep Link (Abrir Play Store App)

```tsx
// Intentar abrir Play Store app, si no está instalado, abrir web
const playStoreUrl = 'https://play.google.com/store/apps/details?id=org.vidaabundante.app'
const playStoreApp = 'market://details?id=org.vidaabundante.app'

window.location.href = playStoreApp
// Si falla, redirigir a playStoreUrl
```

## 📱 Testing Tracks Recomendados

### Flujo Recomendado:

1. **Internal Testing** (1-2 semanas)
   - Probar con equipo interno
   - Verificar funcionalidad básica
   - Corregir bugs críticos

2. **Closed Testing** (2-4 semanas)
   - Beta testing con usuarios seleccionados
   - Recopilar feedback
   - Optimizar UX

3. **Open Testing** (Opcional, 1-2 semanas)
   - Testing público
   - Más feedback
   - Validar en diferentes dispositivos

4. **Producción**
   - Lanzamiento público
   - Monitorear reviews y crashes
   - Actualizaciones según feedback

## ⚠️ Checklist Antes de Publicar

- [ ] App probada en diferentes dispositivos Android
- [ ] Política de privacidad publicada y accesible
- [ ] Icono y capturas de pantalla preparados
- [ ] Descripción de la app completa y atractiva
- [ ] Versión y versionCode actualizados
- [ ] Keystore de producción guardado de forma segura
- [ ] Permisos mínimos necesarios configurados
- [ ] Testing tracks completados
- [ ] Botón de descarga configurado en la web

## 🔄 Actualizaciones Futuras

Para cada actualización:
1. Incrementar `version` en `app.json` (ej: 1.0.0 → 1.0.1)
2. Incrementar `versionCode` en `app.json` (ej: 1 → 2)
3. Crear nuevo build
4. Subir a Play Console
5. Agregar notas de la versión
6. Publicar

## 📞 Soporte

- **Documentación EAS**: https://docs.expo.dev/build/introduction/
- **Play Console Help**: https://support.google.com/googleplay/android-developer
- **Expo Docs**: https://docs.expo.dev/

---

**Nota**: El proceso completo puede tomar 1-2 semanas desde el build inicial hasta la publicación en producción, dependiendo del tiempo de revisión de Google.

