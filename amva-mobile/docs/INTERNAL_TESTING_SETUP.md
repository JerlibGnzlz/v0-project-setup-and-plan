# 🧪 Guía Rápida: Internal Testing en Play Store

## ⚡ Para Probar el Botón de Descarga Mientras Desarrollas

### Paso 1: Crear Cuenta de Google Play Developer (30 min)

1. Ir a: https://play.google.com/console/signup
2. Pagar $25 USD (pago único de por vida)
3. Completar información básica
4. Esperar activación (puede ser inmediato)

### Paso 2: Preparar Build Mínimo (1-2 horas)

#### 2.1 Verificar configuración en `app.json`
```json
{
  "expo": {
    "name": "AMVA Móvil",
    "version": "1.0.0",
    "android": {
      "package": "org.vidaabundante.app",
      "versionCode": 1
    }
  }
}
```

#### 2.2 Crear build con EAS (Recomendado - más fácil)
```bash
cd amva-mobile

# Instalar EAS CLI si no lo tienes
npm install -g eas-cli

# Iniciar sesión
eas login

# Configurar proyecto (primera vez)
eas build:configure

# Crear build de producción
eas build --platform android --profile production
```

**Tiempo estimado**: 30-60 minutos (EAS construye en la nube)

#### 2.3 Alternativa: Build Local
```bash
cd amva-mobile
npx expo prebuild --platform android
cd android
./gradlew bundleRelease
# El archivo estará en: android/app/build/outputs/bundle/release/app-release.aab
```

### Paso 3: Subir a Internal Testing (15-30 min)

1. **Ir a Play Console**: https://play.google.com/console

2. **Crear nueva app**:
   - Click en "Crear app"
   - Nombre: "AMVA Móvil"
   - Idioma predeterminado: Español
   - Tipo: App
   - Gratis o de pago: Gratis
   - Click "Crear"

3. **Completar información mínima** (solo lo necesario para testing):
   - **Descripción corta** (80 caracteres): "App oficial de AMVA para gestión de convenciones"
   - **Descripción completa**: Descripción básica de la app
   - **Icono**: Subir `amvamovil.png` (512x512px)
   - **Capturas de pantalla**: Mínimo 2 (pueden ser del emulador)
   - **Clasificación de contenido**: Completar cuestionario básico

4. **Subir a Internal Testing**:
   - En el menú lateral: Testing → Internal testing
   - Click "Crear nueva release"
   - Subir el archivo `.aab` (o `.apk` si usaste build local)
   - Agregar notas: "Versión de desarrollo para testing"
   - Click "Guardar"
   - Click "Revisar release"
   - Click "Iniciar rollout en Internal testing"

5. **Agregar testers**:
   - En la misma página de Internal testing
   - Sección "Testers"
   - Click "Crear lista de testers"
   - Agregar emails de testers (hasta 100)
   - Guardar lista
   - Copiar el link de testing (se verá algo como: `https://play.google.com/apps/internaltest/[ID]`)

### Paso 4: Actualizar Botón de Descarga (5 min)

Una vez que tengas el link de testing:

```tsx
// components/download-app-button.tsx
const PLAY_STORE_URL = 'TU_LINK_DE_TESTING_AQUI'
// Ejemplo: 'https://play.google.com/apps/internaltest/1234567890'
```

O si quieres que funcione tanto para testing como producción:

```tsx
// components/download-app-button.tsx
const PLAY_STORE_TESTING_URL = 'https://play.google.com/apps/internaltest/[TU_ID]'
const PLAY_STORE_PRODUCTION_URL = 'https://play.google.com/store/apps/details?id=org.vidaabundante.app'

// Usar testing mientras desarrollas, producción cuando esté lista
const PLAY_STORE_URL = process.env.NEXT_PUBLIC_APP_ENV === 'production' 
  ? PLAY_STORE_PRODUCTION_URL 
  : PLAY_STORE_TESTING_URL
```

### Paso 5: Probar el Botón

1. Ir a la web
2. Click en el botón "AMVA app" en el footer
3. Si estás en Android: Te llevará directamente a Play Store (versión de testing)
4. Si estás en desktop: Verás el diálogo con QR code y links

## ✅ Ventajas de Internal Testing

- ✅ **Rápido**: Disponible en horas, no días
- ✅ **Privado**: Solo testers agregados pueden verla
- ✅ **Actualizable**: Puedes subir nuevas versiones fácilmente
- ✅ **Sin revisión extensa**: Google revisa menos que en producción
- ✅ **Ideal para desarrollo**: Pruebas continuas sin afectar usuarios públicos

## 🔄 Actualizar la App (Para Nuevas Versiones)

1. Incrementar `version` y `versionCode` en `app.json`
2. Crear nuevo build
3. Subir nueva versión a Internal Testing
4. Los testers recibirán actualización automática

## 📱 Link de Testing vs Producción

- **Testing**: `https://play.google.com/apps/internaltest/[ID]`
- **Producción**: `https://play.google.com/store/apps/details?id=org.vidaabundante.app`

Ambos funcionan igual en el botón, solo cambia la URL.

## ⚠️ Notas Importantes

- El link de testing solo funciona para testers agregados
- Si alguien sin acceso intenta abrirlo, verá "No disponible"
- Puedes agregar/quitar testers en cualquier momento
- Cuando estés listo, puedes mover la misma versión a Producción sin crear nuevo build

---

**Tiempo total estimado**: 3-6 horas desde cero hasta tener el botón funcionando

