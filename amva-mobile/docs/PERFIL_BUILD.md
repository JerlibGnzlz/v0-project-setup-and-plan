# 🔧 Perfiles de Build en EAS

## 📋 Perfiles Disponibles

### 1. **preview** (Recomendado para probar)
- **Tipo**: APK (instalable directamente)
- **Optimizaciones**: Mínimas (build más rápido)
- **Uso**: Para probar la app antes de publicar
- **Ventajas**: 
  - ✅ Build más rápido
  - ✅ APK fácil de instalar
  - ✅ Menos optimizaciones = menos problemas potenciales

### 2. **production** (Para Play Store)
- **Tipo**: AAB (Android App Bundle)
- **Optimizaciones**: Máximas (ProGuard/R8, minificación, etc.)
- **Uso**: Para publicar en Play Store
- **Ventajas**:
  - ✅ Tamaño optimizado
  - ✅ Código ofuscado
  - ⚠️ Build más lento
  - ⚠️ Más propenso a errores de configuración

## 🎯 Recomendación

**Probar primero con `preview`**:
```bash
eas build --platform android --profile preview
```

**Razones**:
1. Build más rápido
2. Menos optimizaciones = menos problemas
3. APK fácil de instalar y probar
4. Si funciona en `preview`, probablemente funcionará en `production`

## 🔄 Flujo Recomendado

1. **Primero**: `eas build --platform android --profile preview`
   - Verificar que la app funciona correctamente
   - Probar todas las funcionalidades
   - Verificar que las notificaciones push funcionan

2. **Después**: `eas build --platform android --profile production`
   - Solo cuando `preview` funciona perfectamente
   - Para publicar en Play Store

## ⚠️ Diferencias Clave

| Aspecto | Preview | Production |
|---------|---------|------------|
| Tipo | APK | AAB |
| Optimizaciones | Mínimas | Máximas |
| ProGuard/R8 | Deshabilitado | Habilitado |
| Minificación | Deshabilitada | Habilitada |
| Tiempo de Build | ~10-15 min | ~15-20 min |
| Instalación | Directa (APK) | Solo Play Store (AAB) |

## 🐛 Si Preview Funciona pero Production Falla

Si `preview` funciona pero `production` falla, el problema probablemente está en:
- Configuración de ProGuard/R8
- Reglas de minificación
- Optimizaciones de código

En ese caso, necesitaríamos revisar:
- `android/app/proguard-rules.pro`
- Configuración de `minifyEnabled` en `build.gradle`
- Reglas de ofuscación

