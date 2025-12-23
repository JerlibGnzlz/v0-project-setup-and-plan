# 🚀 Compilar APK Final con Logos Pequeños y Google Login

## ✅ Estado Actual

- ✅ Logos más pequeños generados (512x512)
- ✅ Archivos nativos regenerados con `prebuild`
- ✅ SHA-1 configurado: `4B:24:0F:1B:6A:E6:3D:71:38:77:D1:E7:69:40:D2:1D:5D:30:7C:40`
- ✅ Google Login funcionando con ese SHA-1

---

## 🎯 Pasos para Compilar el APK Final

### Paso 1: Cambiar Keystore Default (IMPORTANTE)

Antes de compilar, asegúrate de usar el keystore correcto:

```bash
cd /home/jerlibgnzlz/Escritorio/v0-project-setup-and-plan/amva-mobile
eas credentials
```

1. Selecciona: **Android**
2. Selecciona: **Keystore: Manage everything needed to build your project**
3. Selecciona: **Change default keystore**
4. Selecciona: **Build Credentials ZeEnL0LIUD** (el keystore con SHA-1 `4B:24:0F...`)
5. Confirma el cambio

**Esto asegura** que el nuevo APK use el SHA-1 `4B:24:0F...` que ya funciona.

---

### Paso 2: Compilar el APK

```bash
cd /home/jerlibgnzlz/Escritorio/v0-project-setup-and-plan/amva-mobile
eas build --platform android --profile production
```

**Este proceso**:
- ✅ Usará el keystore anterior (`ZeEnL0LIUD`)
- ✅ Incluirá los logos más pequeños (512x512)
- ✅ Generará un APK con SHA-1 `4B:24:0F...` (que ya funciona)
- ✅ Tiempo estimado: 10-20 minutos

---

### Paso 3: Descargar el APK

Cuando el build termine:

1. Ve a: https://expo.dev/accounts/jerlibgnzlz/projects/amva-movil/builds
2. Busca el build más reciente
3. Haz clic en **"Download"** o **"Descargar"**
4. Descarga el archivo `.apk`

---

### Paso 4: Instalar el Nuevo APK

1. **Desinstala** completamente la app anterior
2. **Limpia** cache de Google Play Services
3. **Reinicia** el teléfono (opcional pero recomendado)
4. **Instala** el nuevo APK descargado
5. **Abre** la app

---

### Paso 5: Verificar que Todo Funcione

1. **Verifica los logos**:
   - ✅ Icono de la app debe verse completo (más pequeño pero sin recortes)
   - ✅ Splash screen debe mostrar el logo completo
   - ✅ Adaptive icon debe verse centrado

2. **Prueba Google Login**:
   - ✅ Debe funcionar correctamente (usa el mismo SHA-1 `4B:24:0F...`)

---

## 📋 Resumen

| Característica | Estado |
|----------------|--------|
| Logos | ✅ Más pequeños (512x512) |
| SHA-1 | ✅ `4B:24:0F...` (funcionando) |
| Google Login | ✅ Funcionando |
| Archivos nativos | ✅ Regenerados |

---

## 🎯 Resultado Esperado

Después de compilar e instalar el nuevo APK:
- ✅ Logos más pequeños pero correctos (sin recortes)
- ✅ Google Login funcionando (mismo SHA-1)
- ✅ Todo funcionando perfectamente

---

## 💡 Nota Importante

**NO necesitas**:
- ❌ Agregar SHA-1 nuevo en Google Cloud Console (ya está configurado)
- ❌ Esperar propagación (el SHA-1 ya está funcionando)
- ❌ Cambiar configuración de Google Cloud Console

**Solo necesitas**:
- ✅ Cambiar el keystore default al anterior (`ZeEnL0LIUD`)
- ✅ Compilar el nuevo APK
- ✅ Instalar y probar

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

¡Listo para compilar! 🎉

