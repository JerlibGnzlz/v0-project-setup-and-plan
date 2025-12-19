# 🚀 Pasos Rápidos para Publicar en Play Store (Testing)

## ⏱️ Timeline: 3-6 horas

### Paso 1: Crear Cuenta de Google Play Developer (30 min)
1. Ir a: https://play.google.com/console/signup
2. Pagar $25 USD (pago único de por vida)
3. Completar información de la cuenta
4. Esperar activación (puede ser inmediato o hasta 48 horas)

### Paso 2: Configurar el Proyecto (1-2 horas)

#### 2.1 Actualizar `app.json`
```json
{
  "expo": {
    "android": {
      "package": "org.vidaabundante.app",
      "versionCode": 1,
      "permissions": []
    }
  }
}
```

#### 2.2 Instalar EAS CLI (si no lo tienes)
```bash
npm install -g eas-cli
eas login
```

#### 2.3 Configurar EAS Build
```bash
cd amva-mobile
eas build:configure
```

### Paso 3: Crear Build de Producción (30 min - 2 horas)

#### Opción A: EAS Build (Recomendado - más fácil)
```bash
cd amva-mobile
eas build --platform android --profile production
```

#### Opción B: Build Local
```bash
cd amva-mobile
npx expo prebuild --platform android
cd android
./gradlew bundleRelease
# El AAB estará en: android/app/build/outputs/bundle/release/app-release.aab
```

### Paso 4: Subir a Play Console (15-30 min)

1. **Ir a Play Console**: https://play.google.com/console
2. **Crear nueva app**:
   - Nombre: "AMVA Móvil"
   - Idioma: Español
   - Tipo: App
   - Gratis

3. **Completar información mínima**:
   - Descripción corta: "App oficial de AMVA"
   - Descripción completa: Descripción de la app
   - Icono: 512x512px (usar amvamovil.png)
   - Al menos 2 capturas de pantalla

4. **Subir a Internal Testing**:
   - Ir a: Testing → Internal testing
   - Crear nueva release
   - Subir el archivo `.aab` o `.apk`
   - Agregar notas de versión: "Primera versión de prueba"

5. **Agregar testers**:
   - Agregar emails de testers (hasta 100)
   - Copiar el link de testing

### Paso 5: Actualizar Botón de Descarga (5 min)

Una vez que tengas el link de testing, actualizar:

```tsx
// components/download-app-button.tsx
const PLAY_STORE_URL = 'TU_LINK_DE_TESTING_AQUI'
// O cuando esté en producción:
// const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=org.vidaabundante.app'
```

## ✅ Resultado

- ✅ App disponible para testing en 3-6 horas
- ✅ Botón de descarga funcionando
- ✅ Solo visible para testers agregados
- ✅ Puedes probar el flujo completo

## 🔄 Siguiente Paso: Producción

Cuando estés listo para lanzamiento público:
1. Completar toda la información de la tienda
2. Agregar más capturas de pantalla
3. Mover de Internal Testing a Producción
4. Esperar revisión de Google (1-7 días)
5. Actualizar link en el botón a URL pública

---

**Nota**: El link de testing funciona igual que el de producción, solo que solo los testers agregados pueden acceder.

