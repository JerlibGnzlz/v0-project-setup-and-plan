# 🔧 Configurar Proyecto EAS Primero

## ⚠️ Problema Actual

El `projectId` en `app.json` no es un UUID válido. Necesitamos crear un proyecto en EAS primero.

## 🚀 Solución: Crear Proyecto en EAS

### Opción A: Desde la Web (Más Fácil)

1. Ve a: **https://expo.dev/accounts/[tu-usuario]/projects**
2. Haz clic en **"Create a project"** o **"Crear proyecto"**
3. Nombre del proyecto: `AMVA Móvil` o `amva-movil`
4. Slug: `amva-movil`
5. Haz clic en **"Create"**

### Opción B: Desde la Terminal (Interactivo)

```bash
cd /home/jerlibgnzlz/Escritorio/v0-project-setup-and-plan/amva-mobile
eas init
```

Cuando te pregunte:
- **Would you like to create a project?**: Responde `Yes` o `Y`
- **Project name**: `AMVA Móvil`
- **Slug**: `amva-movil`

Esto actualizará automáticamente el `projectId` en `app.json` con un UUID válido.

---

## ✅ Después de Crear el Proyecto

Una vez que tengas el proyecto creado, podrás ejecutar:

```bash
eas credentials
```

Y configurar las credenciales de Firebase.

---

## 🔄 Alternativa: Configuración Manual (Sin EAS)

Si prefieres no usar EAS por ahora, puedes configurar Firebase manualmente:

1. El `google-services.json` ya está en su lugar ✅
2. Las notificaciones pueden funcionar sin EAS credentials si Firebase está bien configurado
3. Solo necesitarías rebuild la app después de agregar `google-services.json`

---

## 📋 Próximos Pasos

1. **Crear proyecto en EAS** (web o terminal)
2. **Configurar credenciales**: `eas credentials`
3. **Rebuild la app**: `eas build --platform android --profile production`
4. **Probar notificaciones** en dispositivo físico

