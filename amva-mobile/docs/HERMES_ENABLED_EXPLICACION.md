# 🔧 Explicación: ¿Para qué es `hermesEnabled`?

## 📋 ¿Qué es Hermes?

**Hermes** es el motor de JavaScript optimizado de React Native/Expo que:

1. **Mejora el rendimiento**: Reduce el tiempo de inicio de la app
2. **Reduce el tamaño**: Genera bundles más pequeños
3. **Mejora la memoria**: Usa menos memoria que el motor JavaScript tradicional (JSC)

## 🎯 ¿Por qué necesitamos `hermesEnabled`?

### Problema Original

Los módulos de Expo (especialmente `expo-modules-core`) necesitan saber si Hermes está habilitado o no para:

1. **Compilar código nativo correctamente**: Algunos módulos tienen código diferente para Hermes vs JSC
2. **Incluir dependencias correctas**: Dependen de diferentes librerías según el motor usado
3. **Optimizar el build**: Pueden aplicar optimizaciones específicas para Hermes

### El Error que Estábamos Resolviendo

```
Could not get unknown property 'hermesEnabled' for project ':app'
```

Este error ocurría porque:
- `expo-modules-core` intentaba acceder a `project(':app').hermesEnabled`
- Pero esta propiedad no estaba definida cuando los módulos se evaluaban
- Los módulos se evalúan **antes** de que el `build.gradle` del módulo `:app` se ejecute completamente

## ✅ Solución Implementada

### 1. Definir en `settings.gradle` (Proyecto Raíz)

```gradle
// Leer desde gradle.properties
def hermesEnabledProp = 'true'
def gradlePropsFile = new File(rootDir, 'gradle.properties')
if (gradlePropsFile.exists()) {
    gradlePropsFile.eachLine { line ->
        if (line.startsWith('hermesEnabled=')) {
            hermesEnabledProp = line.substring('hermesEnabled='.length()).trim()
        }
    }
}
rootProject.ext.hermesEnabled = hermesEnabledProp.toBoolean()
```

**Propósito**: Hacer `hermesEnabled` disponible a nivel del proyecto raíz antes de que se evalúen los módulos.

### 2. Definir en `app/build.gradle` (Módulo :app)

```gradle
// Leer desde gradle.properties
def hermesEnabledProp = 'true'
def gradlePropsFile = new File(rootDir, 'gradle.properties')
if (gradlePropsFile.exists()) {
    gradlePropsFile.eachLine { line ->
        if (line.startsWith('hermesEnabled=')) {
            hermesEnabledProp = line.substring('hermesEnabled='.length()).trim()
        }
    }
}
project.ext.hermesEnabled = hermesEnabledProp.toBoolean()
```

**Propósito**: Hacer `hermesEnabled` disponible como propiedad del proyecto `:app` para que los módulos de Expo puedan accederlo.

### 3. Usar en Dependencies

```gradle
if (hermesEnabled.toBoolean()) {
    implementation("com.facebook.react:hermes-android")
} else {
    implementation jscFlavor
}
```

**Propósito**: Incluir las dependencias correctas según el motor JavaScript usado.

## 📊 Resumen

| Componente | Propósito |
|------------|-----------|
| `gradle.properties` | Fuente de verdad: `hermesEnabled=true` |
| `settings.gradle` | Define `rootProject.ext.hermesEnabled` para acceso global |
| `app/build.gradle` | Define `project.ext.hermesEnabled` para acceso desde módulos |
| Dependencies | Usa `hermesEnabled` para incluir librerías correctas |

## 🎯 Resultado

Con esta configuración:
- ✅ Los módulos de Expo pueden acceder a `hermesEnabled` cuando lo necesitan
- ✅ El build incluye las dependencias correctas (Hermes o JSC)
- ✅ La app se compila correctamente con el motor JavaScript configurado

## 📚 Referencias

- [React Native Hermes](https://reactnative.dev/docs/hermes)
- [Expo JavaScript Engine](https://docs.expo.dev/guides/using-hermes/)
- [Gradle Properties](https://docs.gradle.org/current/userguide/build_environment.html#sec:gradle_configuration_properties)

