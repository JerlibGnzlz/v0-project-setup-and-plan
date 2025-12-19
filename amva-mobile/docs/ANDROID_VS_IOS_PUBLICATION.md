# 📱 Publicación: Android vs iOS

## ✅ Estado Actual de la App

### Android ✅
- **Configurado**: ✅ Sí
- **Build nativo**: ✅ Sí (carpeta `android/`)
- **Google Sign-In**: ✅ Configurado
- **Listo para publicar**: ✅ Sí (solo falta Play Store)

### iOS ✅
- **Configurado**: ✅ Sí (en `app.json`)
- **Build nativo**: ✅ Sí (carpeta `ios/`)
- **Apple Sign-In**: ⚠️ No configurado aún
- **Listo para publicar**: ⚠️ Parcialmente (falta configuración de Apple)

---

## 🆚 Comparación: Play Store vs App Store

| Aspecto | Android (Play Store) | iOS (App Store) |
|---------|---------------------|-----------------|
| **Costo** | $25 USD (una vez) | $99 USD/año |
| **Requisitos** | Cuenta de Google | Cuenta de Apple Developer |
| **Tiempo de revisión** | 1-7 días | 1-3 días |
| **Proceso** | Más simple | Más estricto |
| **APK directo** | ✅ Posible | ❌ No permitido |
| **TestFlight** | ❌ No aplica | ✅ Sí (testing gratuito) |

---

## 📱 Android: Play Store

### ✅ Ventajas
- **Costo bajo**: $25 USD pago único
- **APK directo**: Puedes distribuir sin Play Store
- **Proceso simple**: Menos restricciones
- **Actualizaciones rápidas**: Aprobación más rápida

### 📋 Requisitos
1. Cuenta de Google Developer ($25 USD)
2. APK firmado
3. Información de la app (descripción, screenshots, etc.)
4. Políticas de Google cumplidas

### ⏱️ Tiempo Estimado
- Setup inicial: 1-2 horas
- Primera publicación: 1-7 días de revisión
- Actualizaciones: 1-3 días

---

## 🍎 iOS: App Store

### ✅ Ventajas
- **TestFlight**: Testing gratuito antes de publicar
- **Calidad**: Apps más pulidas (revisión estricta)
- **Usuarios premium**: iOS users suelen pagar más
- **Menos malware**: App Store más seguro

### ❌ Desventajas
- **Costo alto**: $99 USD/año (renovación anual)
- **Sin instalación directa**: Debe pasar por App Store
- **Revisión estricta**: Pueden rechazar por detalles menores
- **Requiere Mac**: Para builds nativos (o EAS Build)

### 📋 Requisitos
1. **Cuenta de Apple Developer** ($99 USD/año)
2. **Certificados y Provisioning Profiles**:
   - Certificado de desarrollo
   - Certificado de distribución
   - Provisioning Profile para la app
3. **Información de la app**:
   - Descripción
   - Screenshots (varios tamaños)
   - Icono de la app
   - Política de privacidad
4. **Cumplir políticas de Apple**:
   - Guías de diseño humano
   - Política de privacidad
   - Términos de servicio

### ⏱️ Tiempo Estimado
- Setup inicial: 3-5 horas (configurar certificados)
- Primera publicación: 1-3 días de revisión
- Actualizaciones: 1-2 días

---

## 🔧 Configuración Necesaria para iOS

### 1. Apple Developer Account
```
Costo: $99 USD/año
Registro: https://developer.apple.com/programs/
```

### 2. Certificados iOS
```bash
# Opción A: EAS Build (Recomendado para Expo)
npx eas-cli build --platform ios

# Opción B: Build local (requiere Mac)
cd amva-mobile
npx expo prebuild
npx expo run:ios
```

### 3. Google Sign-In para iOS
- Crear iOS Client ID en Google Cloud Console
- Configurar en `app.json`:
```json
{
  "ios": {
    "googleClientId": "TU_IOS_CLIENT_ID.apps.googleusercontent.com"
  }
}
```

### 4. TestFlight (Testing antes de publicar)
- Gratis con cuenta de Apple Developer
- Permite testing con hasta 10,000 usuarios
- No requiere aprobación de App Store

---

## 💡 Recomendaciones

### Opción 1: Solo Android (Inicial) ⭐ Recomendado
- **Costo**: $25 USD (una vez)
- **Tiempo**: 1-2 semanas
- **Ventaja**: Lanzamiento rápido y económico
- **Desventaja**: Solo usuarios Android

**Cuándo usar**:
- Presupuesto limitado
- Quieres lanzar rápido
- La mayoría de usuarios son Android

### Opción 2: Android + iOS (Completo)
- **Costo**: $25 USD + $99 USD/año = $124 USD primer año
- **Tiempo**: 2-3 semanas
- **Ventaja**: Alcance completo
- **Desventaja**: Mayor costo y complejidad

**Cuándo usar**:
- Presupuesto disponible
- Quieres llegar a todos los usuarios
- Tienes usuarios iOS importantes

### Opción 3: Android primero, iOS después
- **Fase 1**: Android ($25 USD) → Lanzar en 1-2 semanas
- **Fase 2**: iOS ($99 USD/año) → Lanzar cuando tengas presupuesto
- **Ventaja**: Lanzamiento gradual
- **Desventaja**: Usuarios iOS esperan

---

## 📊 Distribución de Usuarios (Típico)

### En Latinoamérica:
- **Android**: 70-80%
- **iOS**: 20-30%

### En Estados Unidos:
- **Android**: 50-60%
- **iOS**: 40-50%

### Para AMVA (Organización religiosa):
- Probablemente más Android (mayor accesibilidad económica)
- Pero algunos usuarios importantes pueden tener iOS

---

## 🎯 Plan Recomendado para AMVA

### Fase 1: Android (Ahora) ⭐
1. ✅ App ya está lista para Android
2. Pagar $25 USD para Play Store
3. Publicar en Internal Testing
4. Lanzar a producción en 1-2 semanas

### Fase 2: iOS (Después, si es necesario)
1. Evaluar demanda de usuarios iOS
2. Si hay demanda, pagar $99 USD/año
3. Configurar certificados iOS
4. Publicar en TestFlight para testing
5. Lanzar a App Store

---

## 🔗 Estado del Botón de Descarga

El botón actual (`components/download-app-button.tsx`) ya está preparado para ambos:

```typescript
// Detecta automáticamente el dispositivo
if (isIOS) {
  window.location.href = APP_STORE_URL
} else if (isAndroid) {
  window.location.href = PLAY_STORE_URL
}
```

**Funciona así**:
- **Android**: Redirige a Play Store (o APK si configuras)
- **iOS**: Redirige a App Store (cuando esté publicado)
- **Desktop**: Muestra QR code con ambos links

---

## ✅ Conclusión

### Respuesta corta:
**Sí, la app puede descargarse en Android e iOS**, pero:

1. **Android**: ✅ Listo para publicar (solo falta Play Store)
2. **iOS**: ⚠️ Configurado pero necesita:
   - Cuenta de Apple Developer ($99 USD/año)
   - Certificados iOS
   - Publicación en App Store

### Recomendación:
- **Empezar con Android** ($25 USD)
- **Evaluar demanda de iOS** después
- **Agregar iOS** si hay usuarios que lo necesiten

---

## 📝 Próximos Pasos

### Para Android (Listo):
1. Crear cuenta de Google Developer
2. Pagar $25 USD
3. Subir APK a Play Console
4. Configurar Internal Testing
5. Publicar

### Para iOS (Si decides):
1. Crear cuenta de Apple Developer ($99 USD/año)
2. Configurar certificados con EAS Build
3. Configurar Google Sign-In para iOS
4. Subir a TestFlight
5. Publicar en App Store

