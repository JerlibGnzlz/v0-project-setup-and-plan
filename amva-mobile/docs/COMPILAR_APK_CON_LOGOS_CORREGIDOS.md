# 🎨 Compilar APK con Logos Corregidos y Google Login Funcionando

## 🎯 Objetivo

Compilar un nuevo APK que:
- ✅ Tenga los logos corregidos (icon.png, splash-logo.png, adaptive-icon.png)
- ✅ Use el keystore anterior (`ZeEnL0LIUD`) con SHA-1 `4B:24:0F...`
- ✅ Funcione con Google Login (porque usa el mismo SHA-1 que ya está configurado)

---

## ✅ Pasos para Compilar

### Paso 1: Verificar que los Logos Estén Correctos

Los logos ya están generados y configurados en `app.json`:
- ✅ `icon.png` (1024x1024, para icono de app)
- ✅ `splash-logo.png` (1024x1024, para splash screen)
- ✅ `adaptive-icon.png` (1024x1024, para adaptive icon Android)

**Verificación rápida**:
```bash
cd /home/jerlibgnzlz/Escritorio/v0-project-setup-and-plan/amva-mobile
ls -lh assets/images/*.png
```

Deberías ver los 3 archivos: `icon.png`, `splash-logo.png`, `adaptive-icon.png`

---

### Paso 2: Cambiar Keystore Default al Anterior

Para que el nuevo APK use el mismo SHA-1 (`4B:24:0F...`):

```bash
eas credentials
```

1. Selecciona: **Android**
2. Selecciona: **Keystore: Manage everything needed to build your project**
3. Selecciona: **Change default keystore**
4. Selecciona: **Build Credentials ZeEnL0LIUD** (el keystore anterior)
5. Confirma el cambio

**Esto asegura** que el nuevo APK use el SHA-1 `4B:24:0F...` que ya funciona.

---

### Paso 3: Compilar el Nuevo APK

```bash
cd /home/jerlibgnzlz/Escritorio/v0-project-setup-and-plan/amva-mobile
eas build --platform android --profile production
```

**Este proceso**:
- ✅ Usará el keystore anterior (`ZeEnL0LIUD`)
- ✅ Incluirá los logos corregidos (ya están en `app.json`)
- ✅ Generará un APK con SHA-1 `4B:24:0F...` (que ya funciona)
- ✅ Tiempo estimado: 10-20 minutos

---

### Paso 4: Descargar el Nuevo APK

Cuando el build termine:

1. Ve a: https://expo.dev/accounts/jerlibgnzlz/projects/amva-movil/builds
2. Busca el build más reciente
3. Haz clic en **"Download"** o **"Descargar"**
4. Descarga el archivo `.apk`

---

### Paso 5: Instalar el Nuevo APK

1. **Desinstala** completamente la app anterior
2. **Limpia** cache de Google Play Services
3. **Reinicia** el teléfono (opcional pero recomendado)
4. **Instala** el nuevo APK descargado
5. **Abre** la app

---

### Paso 6: Verificar que Todo Funcione

1. **Verifica los logos**:
   - ✅ Icono de la app debe verse completo (sin recortes)
   - ✅ Splash screen debe mostrar el logo completo con "Movil"
   - ✅ Adaptive icon debe verse centrado

2. **Prueba Google Login**:
   - ✅ Debe funcionar correctamente (usa el mismo SHA-1)

---

## 📋 Checklist

- [ ] Logos generados y en `assets/images/` (icon.png, splash-logo.png, adaptive-icon.png)
- [ ] `app.json` configurado con las rutas correctas de los logos
- [ ] Keystore default cambiado a `ZeEnL0LIUD` (SHA-1 `4B:24:0F...`)
- [ ] Build ejecutado: `eas build --platform android --profile production`
- [ ] APK descargado
- [ ] App anterior desinstalada
- [ ] Nuevo APK instalado
- [ ] Logos verificados (icono, splash, adaptive icon)
- [ ] Google Login probado y funcionando

---

## 🎯 Resumen

**El nuevo APK tendrá**:
- ✅ Logos corregidos (sin recortes)
- ✅ Google Login funcionando (mismo SHA-1 `4B:24:0F...`)
- ✅ Todo funcionando correctamente

**No necesitas**:
- ❌ Agregar SHA-1 nuevo en Google Cloud Console (ya está configurado)
- ❌ Esperar propagación (el SHA-1 ya está funcionando)
- ❌ Cambiar configuración de Google Cloud Console

---

## 💡 Por Qué Funcionará

1. **Mismo keystore** = Mismo SHA-1 (`4B:24:0F...`)
2. **SHA-1 ya configurado** = Google Login funcionará inmediatamente
3. **Logos corregidos** = Se incluirán en el nuevo APK automáticamente
4. **Sin cambios de configuración** = No necesitas esperar propagación

---

## 🚀 Comando Rápido

```bash
# 1. Cambiar keystore default (si no lo has hecho)
eas credentials
# → Android → Keystore → Change default keystore → ZeEnL0LIUD

# 2. Compilar APK
cd /home/jerlibgnzlz/Escritorio/v0-project-setup-and-plan/amva-mobile
eas build --platform android --profile production

# 3. Descargar e instalar el nuevo APK
```

---

## ✅ Resultado Esperado

Después de compilar e instalar el nuevo APK:
- ✅ Logos se verán correctos (sin recortes)
- ✅ Google Login funcionará (mismo SHA-1)
- ✅ Todo funcionando perfectamente

¡Vamos a compilar el nuevo APK con los logos corregidos!

