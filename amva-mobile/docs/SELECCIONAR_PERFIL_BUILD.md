# 🎯 Seleccionar Perfil de Build en EAS

## 📋 Opciones Disponibles

Cuando ejecutas `eas build`, puedes seleccionar entre:

1. **development** - Para desarrollo y pruebas
2. **preview** - Para pruebas previas a producción
3. **production** - Para producción (Play Store)

---

## ✅ Selecciona: **production**

**Razón**: Necesitas un APK de producción que:
- ✅ Use el keystore de producción (`ZeEnL0LIUD` con SHA-1 `4B:24:0F...`)
- ✅ Esté optimizado y minificado
- ✅ Tenga los logos corregidos
- ✅ Funcione con Google Login
- ✅ Esté listo para usar (o publicar en Play Store)

---

## 📊 Comparación de Perfiles

| Perfil | Uso | Keystore | Optimización | Google Login |
|--------|-----|----------|--------------|--------------|
| **development** | Desarrollo local | Debug keystore | No optimizado | ❌ No funciona |
| **preview** | Pruebas | Preview keystore | Parcialmente optimizado | ⚠️ Puede no funcionar |
| **production** | Producción | Producción keystore | ✅ Optimizado | ✅ Funciona |

---

## 🎯 Para tu Caso Específico

**Selecciona: production**

Porque:
- ✅ Necesitas el keystore de producción (`ZeEnL0LIUD`)
- ✅ Necesitas que Google Login funcione (requiere keystore de producción)
- ✅ Necesitas un APK optimizado y listo para usar
- ✅ Los logos corregidos se incluirán automáticamente

---

## ✅ Comando Correcto

```bash
cd /home/jerlibgnzlz/Escritorio/v0-project-setup-and-plan/amva-mobile
eas build --platform android --profile production
```

O si te pregunta interactivamente:
- Selecciona: **production**

---

## 📋 Resumen

**Selecciona: production** ✅

Este es el perfil correcto para tu caso porque:
- Usa el keystore de producción correcto
- Google Login funcionará
- APK optimizado y listo para usar
- Incluye los logos corregidos

---

## 🚀 Después de Seleccionar Production

1. EAS compilará el APK con el keystore de producción
2. El APK tendrá SHA-1 `4B:24:0F...` (que ya funciona)
3. Los logos corregidos se incluirán automáticamente
4. El APK estará optimizado y listo para usar

¡Selecciona **production** y continúa!

