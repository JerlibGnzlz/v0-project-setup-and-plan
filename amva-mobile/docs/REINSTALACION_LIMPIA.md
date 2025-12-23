# 🧹 Reinstalación Limpia de la App

## 🎯 ¿Qué es una Reinstalación Limpia?

Una reinstalación limpia elimina **completamente** la app del teléfono, incluyendo:
- ✅ La aplicación instalada
- ✅ Todos los datos de la app
- ✅ Cache de la app
- ✅ Datos de Google Sign-In cacheados
- ✅ Tokens y credenciales guardadas

Esto asegura que la app se instale desde cero, sin datos residuales que puedan causar problemas.

---

## 📋 Pasos para Reinstalación Limpia

### Opción 1: Desde el Teléfono (Recomendada)

#### Paso 1: Desinstalar la App

1. Ve a **Configuración** → **Apps** (o **Aplicaciones**)
2. Busca **"AMVA Móvil"** o **"org.vidaabundante.app"**
3. Toca en la app
4. Toca **"Desinstalar"** o **"Uninstall"**
5. Confirma la desinstalación

#### Paso 2: Limpiar Cache de Google Play Services (Opcional pero Recomendado)

1. Ve a **Configuración** → **Apps**
2. Busca **"Google Play Services"**
3. Toca en la app
4. Toca **"Almacenamiento"** o **"Storage"**
5. Toca **"Borrar caché"** o **"Clear cache"**
   - ⚠️ **NO borres los datos**, solo el caché

#### Paso 3: Reiniciar el Teléfono (Opcional pero Recomendado)

1. Mantén presionado el botón de encendido
2. Selecciona **"Reiniciar"** o **"Restart"**
3. Espera a que el teléfono se reinicie completamente

#### Paso 4: Instalar el APK de Nuevo

1. Abre el archivo APK que descargaste desde EAS Build
2. Si aparece una advertencia de seguridad, permite la instalación desde fuentes desconocidas
3. Instala el APK
4. Abre la app

---

### Opción 2: Desde ADB (Si Tienes Acceso)

Si tienes ADB configurado en tu computadora:

```bash
# Conectar el teléfono por USB y habilitar depuración USB

# Desinstalar la app
adb uninstall org.vidaabundante.app

# Limpiar cache de Google Play Services (opcional)
adb shell pm clear com.google.android.gms

# Reiniciar el teléfono (opcional)
adb reboot

# Después de reiniciar, instalar el APK
adb install /ruta/al/archivo.apk
```

---

## 🔍 Verificar que la Desinstalación Fue Completa

Después de desinstalar, verifica que:

1. ✅ La app **NO aparece** en el menú de aplicaciones
2. ✅ La app **NO aparece** en Configuración → Apps
3. ✅ No hay carpetas residuales en el almacenamiento (opcional verificar)

---

## ⚠️ Advertencias Importantes

### Antes de Desinstalar

- ⚠️ **Guarda cualquier dato importante** de la app si es necesario
- ⚠️ Si tienes sesiones activas, cierra sesión antes de desinstalar
- ⚠️ Si tienes datos importantes guardados en la app, haz un backup si es posible

### Después de Reinstalar

- ✅ La app estará **completamente nueva** (sin datos anteriores)
- ✅ Tendrás que **iniciar sesión de nuevo**
- ✅ Tendrás que **configurar permisos** de nuevo (cámara, almacenamiento, etc.)

---

## 🎯 Cuándo Hacer una Reinstalación Limpia

Haz una reinstalación limpia cuando:

1. ✅ **Google Login no funciona** después de agregar SHA-1 y esperar
2. ✅ **La app tiene comportamientos extraños** o errores persistentes
3. ✅ **Cambiaste la configuración** de Google Sign-In y quieres asegurarte de que se aplique
4. ✅ **Actualizaste el APK** y quieres empezar desde cero
5. ✅ **Tienes problemas de cache** o datos corruptos

---

## 📋 Checklist de Reinstalación Limpia

- [ ] App desinstalada completamente
- [ ] Cache de Google Play Services limpiado (opcional)
- [ ] Teléfono reiniciado (opcional pero recomendado)
- [ ] APK descargado y listo para instalar
- [ ] APK instalado de nuevo
- [ ] App abierta y probada
- [ ] Login con Google probado

---

## 🚀 Después de la Reinstalación Limpia

1. **Abre la app**
2. **Concede los permisos** necesarios (cámara, almacenamiento, etc.)
3. **Prueba el login con Google**
4. Si aún no funciona, verifica:
   - Que el SHA-1 esté correctamente agregado en Google Cloud Console
   - Que hayas esperado al menos 30 minutos después de agregar el SHA-1
   - Que el OAuth consent screen esté publicado o en modo prueba con usuarios

---

## 💡 Consejos Adicionales

### Si la App No Se Desinstala Completamente

A veces Android puede tener problemas para desinstalar completamente una app. En ese caso:

1. Ve a **Configuración** → **Apps**
2. Busca la app
3. Toca **"Forzar detención"** o **"Force stop"**
4. Luego intenta desinstalar de nuevo

### Si Aparece "No se puede desinstalar"

Algunas apps pueden estar protegidas. En ese caso:

1. Ve a **Configuración** → **Seguridad** → **Administradores del dispositivo**
2. Verifica que la app no esté como administrador
3. Si está, desactívala
4. Luego intenta desinstalar de nuevo

---

## ✅ Resumen

**Reinstalación limpia** = Desinstalar completamente + Limpiar cache (opcional) + Reiniciar (opcional) + Instalar de nuevo

Esto asegura que la app se instale desde cero, sin datos residuales que puedan causar problemas con Google Sign-In.

