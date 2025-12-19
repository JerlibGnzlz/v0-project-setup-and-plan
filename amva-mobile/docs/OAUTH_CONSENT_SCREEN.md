# Pantalla de Consentimiento OAuth - Configuración

## 📋 Información de la Aplicación

### ¿Qué es?

La pantalla de consentimiento OAuth es lo que ven los usuarios cuando autorizan tu app para usar su cuenta de Google.

### Campos y su Impacto

#### 1. **Nombre de la aplicación** (Application name)
- **Campo**: "AMVA Dashboard" (actualmente)
- **Impacto**: ⚠️ **Solo visual** - NO afecta configuración técnica
- **Puedes cambiarlo**: ✅ Sí, sin problemas
- **Qué muestra**: El nombre que ven los usuarios al autorizar

#### 2. **Logo de la aplicación**
- **Impacto**: ⚠️ **Solo visual** - NO afecta configuración técnica
- **Puedes cambiarlo**: ✅ Sí, sin problemas

#### 3. **Dominios autorizados**
- **Impacto**: ✅ **Técnico** - Afecta qué dominios pueden usar OAuth
- **NO cambiar sin cuidado**: ⚠️ Puede romper funcionalidad

#### 4. **Política de Privacidad / Términos de Servicio**
- **Impacto**: ⚠️ **Solo visual** - NO afecta configuración técnica
- **Puedes cambiarlo**: ✅ Sí, sin problemas

## ✅ Respuesta Directa

**¿Cambiar "AMVA Dashboard" afecta la configuración?**

**NO**. Puedes cambiarlo a:
- "AMVA Móvil"
- "AMVA Digital"
- "Asociación Misionera Vida Abundante"
- Cualquier otro nombre

**NO afectará**:
- ❌ Client IDs (Web o Android)
- ❌ SHA-1
- ❌ Tokens
- ❌ Backend
- ❌ App móvil
- ❌ Landing page

**Solo afectará**:
- ✅ El nombre que ven los usuarios en la pantalla de consentimiento

## 🎯 Recomendación

### Para Consistencia:

Si tienes múltiples apps/clientes:
- **Web/Admin**: "AMVA Dashboard" o "AMVA Digital"
- **Móvil**: "AMVA Móvil" o "AMVA App"

O un nombre general:
- "AMVA Digital" (para todo)
- "Asociación Misionera Vida Abundante"

### Configuración Sugerida:

```
Nombre de la aplicación: AMVA Digital
Logo: [Logo de AMVA]
Política de Privacidad: https://ministerio-backend-wdbj.onrender.com/privacy-policy
Términos de Servicio: https://ministerio-backend-wdbj.onrender.com/terms-of-service
```

## ⚠️ Campos que SÍ Afectan la Configuración

**NO cambies estos sin cuidado**:

1. **Dominios autorizados**
   - Si cambias esto, puede romper OAuth en algunos dominios
   - Solo agrega nuevos, no elimines existentes sin verificar

2. **Client IDs**
   - NO los cambies manualmente
   - Se generan automáticamente

3. **SHA-1 (en cliente Android)**
   - Si cambias esto, Google Sign-In dejará de funcionar
   - Solo agrega nuevos SHA-1, no elimines

## 📝 Resumen

| Campo | Puedes Cambiarlo | Afecta Configuración |
|-------|------------------|---------------------|
| Nombre de aplicación | ✅ Sí | ❌ No |
| Logo | ✅ Sí | ❌ No |
| Política de Privacidad | ✅ Sí | ❌ No |
| Términos de Servicio | ✅ Sí | ❌ No |
| Dominios autorizados | ⚠️ Con cuidado | ✅ Sí |
| Client IDs | ❌ No | ✅ Sí |
| SHA-1 | ⚠️ Solo agregar | ✅ Sí |

## 🎯 Conclusión

**Puedes cambiar "AMVA Dashboard" a cualquier nombre sin problemas.**

Es solo información visual para los usuarios. La configuración técnica (Client IDs, SHA-1, tokens) seguirá funcionando igual.

