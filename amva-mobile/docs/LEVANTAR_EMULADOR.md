# Cómo Levantar el Emulador Android

## 🚀 Métodos para Iniciar el Emulador

### Método 1: Desde Android Studio (Más Fácil)

1. **Abre Android Studio**
2. **Ve a Tools → Device Manager** (o haz clic en el ícono del dispositivo en la barra lateral)
3. **Selecciona tu emulador** (ej: Pixel_7)
4. **Haz clic en el botón Play** ▶️
5. El emulador se iniciará automáticamente

### Método 2: Desde la Terminal (Línea de Comandos)

#### Paso 1: Listar emuladores disponibles
```bash
# Opción A: Si tienes ANDROID_HOME configurado
$ANDROID_HOME/emulator/emulator -list-avds

# Opción B: Ruta completa
~/Android/Sdk/emulator/emulator -list-avds

# Opción C: Buscar automáticamente
find ~/Android/Sdk -name "emulator" -type f 2>/dev/null | head -1 | xargs -I {} {} -list-avds
```

#### Paso 2: Iniciar el emulador
```bash
# Reemplaza "Pixel_7" con el nombre de tu emulador
$ANDROID_HOME/emulator/emulator -avd Pixel_7 &

# O con ruta completa
~/Android/Sdk/emulator/emulator -avd Pixel_7 &

# O si está en PATH
emulator -avd Pixel_7 &
```

### Método 3: Usando Expo CLI (Automático)

```bash
cd amva-mobile

# Expo detectará automáticamente el emulador si está corriendo
# O iniciará uno si no hay ninguno
npx expo run:android
```

### Método 4: Script Rápido

Crea un script `start-emulator.sh`:

```bash
#!/bin/bash
# Buscar emulador
EMULATOR_PATH=$(find ~/Android/Sdk -name "emulator" -type f 2>/dev/null | head -1)

if [ -z "$EMULATOR_PATH" ]; then
    echo "❌ No se encontró el emulador de Android"
    echo "   Asegúrate de tener Android SDK instalado"
    exit 1
fi

# Listar emuladores
echo "📱 Emuladores disponibles:"
$EMULATOR_PATH -list-avds

# Iniciar el primero disponible (o especifica uno)
AVD_NAME=$($EMULATOR_PATH -list-avds | head -1)

if [ -z "$AVD_NAME" ]; then
    echo "❌ No hay emuladores configurados"
    echo "   Crea uno desde Android Studio → Device Manager"
    exit 1
fi

echo "🚀 Iniciando emulador: $AVD_NAME"
$EMULATOR_PATH -avd "$AVD_NAME" &
```

## 🔍 Verificar que el Emulador Está Corriendo

```bash
# Ver dispositivos conectados
adb devices

# Deberías ver algo como:
# List of devices attached
# emulator-5554	device
```

## ⚠️ Problemas Comunes

### Error: "emulator: command not found"

**Solución**:
```bash
# Agregar al PATH en ~/.zshrc o ~/.bashrc
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools

# Recargar shell
source ~/.zshrc  # o source ~/.bashrc
```

### Error: "No AVD available"

**Solución**:
1. Abre Android Studio
2. Ve a **Tools → Device Manager**
3. Haz clic en **"+ Create Device"**
4. Selecciona un dispositivo (ej: Pixel 7)
5. Descarga una imagen del sistema (ej: Android 13)
6. Completa la creación

### Emulador muy lento

**Soluciones**:
- Usa un emulador con menos RAM
- Habilita aceleración por hardware (HAXM/KVM)
- Cierra otras aplicaciones pesadas
- Usa un dispositivo físico si es posible

## ✅ Verificación Rápida

```bash
# 1. Verificar que adb funciona
adb devices

# 2. Verificar que el emulador tiene Google Play Services
adb shell pm list packages | grep "google"

# 3. Ver logs del emulador
adb logcat
```

## 🎯 Comandos Útiles

```bash
# Reiniciar adb (si hay problemas)
adb kill-server
adb start-server

# Ver información del dispositivo
adb shell getprop ro.product.model
adb shell getprop ro.build.version.release

# Instalar APK directamente
adb install -r path/to/app.apk

# Abrir la app
adb shell am start -n org.vidaabundante.app/.MainActivity
```

## 📝 Notas

- El emulador puede tardar 1-2 minutos en iniciar completamente
- Asegúrate de tener suficiente RAM (mínimo 4GB libres)
- Para Google Sign-In, necesitas un emulador con Google Play Services (no AOSP)

