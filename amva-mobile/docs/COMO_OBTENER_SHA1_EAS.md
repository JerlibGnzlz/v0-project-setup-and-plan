# 🔑 Cómo Obtener SHA-1 desde EAS Credentials - Guía Paso a Paso

## 📋 Pasos Detallados

### Paso 1: Ejecutar EAS Credentials

```bash
cd /home/jerlibgnzlz/Escritorio/v0-project-setup-and-plan/amva-mobile
eas credentials
```

### Paso 2: Seleccionar Plataforma

Cuando aparezca:
```
? What platform would you like to manage credentials for?
❯ Android
  iOS
```

**Selecciona: Android**

### Paso 3: Seleccionar Keystore

Cuando aparezca el menú:
```
? What do you want to do? ›
❯ Keystore: Manage everything needed to build your project
  Google Service Account
  Push Notifications (Legacy): Manage your FCM (Legacy) API Key
  credentials.json: Upload/Download credentials between EAS servers and your local json
  Go back
  Exit
```

**Selecciona: Keystore: Manage everything needed to build your project**

### Paso 4: Ver Credenciales

Después de seleccionar Keystore, verás opciones como:
```
? What would you like to do with your Android Keystore?
❯ Set up a new keystore
  Use existing keystore
  View credentials
  Remove credentials
  Go back
```

**Selecciona: View credentials**

### Paso 5: Copiar SHA-1

Después de seleccionar "View credentials", verás información del keystore, incluyendo:

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

## 🎯 Resumen Rápido

1. `eas credentials`
2. Selecciona: **Android**
3. Selecciona: **Keystore: Manage everything needed to build your project**
4. Selecciona: **View credentials**
5. Copia el **SHA-1**

---

## ⚠️ Nota Importante

- El SHA-1 que obtengas debe ser **exactamente igual** al que agregaste en Google Cloud Console
- Si son diferentes, ese es el problema
- Compara carácter por carácter

---

## 📋 Después de Obtener el SHA-1

1. Compara con el que agregaste: `4B:24:0F:1B:6A:E6:3D:71:38:77:D1:E7:69:40:D2:1D:5D:30:7C:40`
2. Si son diferentes, agrega el SHA-1 correcto en Google Cloud Console
3. Espera 30 minutos
4. Prueba de nuevo

