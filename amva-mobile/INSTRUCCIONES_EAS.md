# 🚀 Instrucciones para Configurar EAS y Firebase

## 📋 Paso 1: Crear Proyecto en EAS

Ejecuta este comando y responde las preguntas:

```bash
cd /home/jerlibgnzlz/Escritorio/v0-project-setup-and-plan/amva-mobile
eas init
```

**Cuando te pregunte**:
- **Would you like to create a project?**: Responde `Yes` o `Y`
- **Project name**: `AMVA Móvil`
- **Slug**: `amva-movil` (o el que prefieras)

Esto creará un proyecto en EAS y actualizará automáticamente el `projectId` en `app.json`.

---

## 📋 Paso 2: Configurar Credenciales de Firebase

Una vez que el proyecto esté creado, ejecuta:

```bash
eas credentials
```

**Responde así**:
1. **Platform**: `Android`
2. **Workflow**: `production` (o `preview` para probar)
3. **What would you like to do?**: `Set up Push Notifications credentials`
4. **Push Notifications Setup**: `Set up Firebase Cloud Messaging (FCM)`
5. **Server Key**: `AIzaSyDuvI7czRjhAdkoZQnWdgh42VRHwe910bA`
6. **Sender ID**: `804089781668`
7. **Google Services JSON**: (dejar en blanco para auto-detectar)

---

## ✅ Verificar

Después de configurar, verifica:

```bash
eas credentials
```

Selecciona Android y verifica que aparezca la configuración de FCM.

---

## 🎯 Resumen de Credenciales

- **Server Key**: `AIzaSyDuvI7czRjhAdkoZQnWdgh42VRHwe910bA`
- **Sender ID**: `804089781668`

---

## 🚀 Comandos en Orden

```bash
# 1. Crear proyecto EAS
cd /home/jerlibgnzlz/Escritorio/v0-project-setup-and-plan/amva-mobile
eas init

# 2. Configurar credenciales Firebase
eas credentials

# 3. Rebuild la app (después de configurar)
eas build --platform android --profile production
```

