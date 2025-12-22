# 🔑 Cómo Obtener SHA-1 desde EAS Credentials

## 📋 Pasos Detallados

### Paso 1: Ejecutar EAS Credentials

```bash
cd /home/jerlibgnzlz/Escritorio/v0-project-setup-and-plan/amva-mobile
eas credentials
```

### Paso 2: Seleccionar Plataforma

Cuando aparezca el menú:
```
? What platform would you like to manage credentials for?
❯ Android
  iOS
```

**Selecciona: Android**

### Paso 3: Seleccionar Opción de Credenciales

Después de seleccionar Android, verás un menú como este:
```
? What would you like to do?
❯ Set up a new keystore
  Use existing keystore
  View credentials
  Remove credentials
  Go back
```

**Selecciona: View credentials** (o "Ver credenciales")

### Paso 4: Ver SHA-1

Después de seleccionar "View credentials", verás información sobre tu keystore, incluyendo:

```
Keystore credentials
  Keystore password: [hidden]
  Key alias: [alias name]
  Key password: [hidden]
  SHA-1: XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX
  SHA-256: XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX
```

**Copia el SHA-1 completo** (el que tiene formato `XX:XX:XX:...` con 20 pares de caracteres separados por `:`)

---

## ⚠️ Si Ves Menú de FCM/Push Notifications

Si ves un menú como:
```
Manage your Google Service Account Key for Push Notifications (FCM V1)
  Upload a Google Service Account Key
  Delete a Google Service Account Key
  Go back
```

**Selecciona: Go back** para volver al menú anterior y buscar la opción correcta.

---

## 🎯 Opción Correcta

La opción que necesitas es:
- ✅ **View credentials** (Ver credenciales) - Para ver SHA-1 del keystore
- ❌ **Google Service Account Key** - Para FCM/Push Notifications (no es lo que necesitas ahora)

---

## 📋 Resumen

1. Ejecuta `eas credentials`
2. Selecciona **Android**
3. Selecciona **View credentials** (NO "Google Service Account Key")
4. Copia el **SHA-1** que aparece
5. Agrégalo en Google Cloud Console

---

## 🐛 Si No Ves "View credentials"

Si no ves la opción "View credentials", puede ser que:
1. No hayas creado un keystore aún (en ese caso, EAS lo creará automáticamente en el primer build)
2. Necesites usar "Set up a new keystore" primero

En ese caso, el SHA-1 se generará automáticamente cuando hagas el primer build con EAS.

