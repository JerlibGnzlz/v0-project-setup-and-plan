# 🔥 Credenciales de Firebase para Configurar

## 📋 Información que Necesitas

**API Key (Server Key)**:
```
AIzaSyDuvI7czRjhAdkoZQnWdgh42VRHwe910bA
```

**Sender ID**:
```
804089781668
```

---

## 🚀 Pasos para Configurar en EAS

### 1. Ejecutar EAS Credentials

```bash
cd /home/jerlibgnzlz/Escritorio/v0-project-setup-and-plan/amva-mobile
eas credentials
```

### 2. Responder las Preguntas

**Pregunta 1: Platform**
```
? Select platform › Android
```

**Pregunta 2: Workflow**
```
? Select workflow › production
```
(O `preview` si quieres probar primero)

**Pregunta 3: What would you like to do?**
```
? What would you like to do? › Set up Push Notifications credentials
```

**Pregunta 4: Push Notifications Setup**
```
? Push Notifications Setup › Set up Firebase Cloud Messaging (FCM)
```

**Pregunta 5: Server Key**
```
? Server Key › AIzaSyDuvI7czRjhAdkoZQnWdgh42VRHwe910bA
```
(Pega la API Key completa)

**Pregunta 6: Sender ID**
```
? Sender ID › 804089781668
```

**Pregunta 7: Google Services JSON**
```
? Google Services JSON › (dejar en blanco para auto-detectar)
```
O proporciona: `android/app/google-services.json`

---

## ✅ Verificar que Funcionó

Después de configurar, verifica:

```bash
eas credentials
```

Selecciona Android y verifica que aparezca la configuración de FCM.

---

## 📋 Próximos Pasos

1. ✅ Credenciales configuradas en EAS
2. ⏳ Rebuild la app: `eas build --platform android --profile production`
3. ⏳ Instalar en dispositivo físico
4. ⏳ Probar notificaciones push

---

## 🔍 Comando Rápido

```bash
cd /home/jerlibgnzlz/Escritorio/v0-project-setup-and-plan/amva-mobile
eas credentials
```

Luego sigue las instrucciones arriba usando:
- **Server Key**: `AIzaSyDuvI7czRjhAdkoZQnWdgh42VRHwe910bA`
- **Sender ID**: `804089781668`

