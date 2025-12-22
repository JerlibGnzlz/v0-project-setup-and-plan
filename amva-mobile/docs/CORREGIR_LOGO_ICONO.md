# 🎨 Corregir Logo e Icono de la App

## 🔍 Problema Identificado

- ❌ El logo se ve recortado en el icono del APK
- ❌ La palabra "Movil" no aparece completa
- ❌ El splash screen también está recortado

**Causa**: El logo actual (`amvamovil.png`) es de 500x500px y se está usando para todo (icono, splash, adaptive icon), lo que causa recortes.

---

## ✅ Solución

Necesitas crear **3 versiones diferentes** del logo:

### 1. **Icono de App** (`icon.png`)
- **Tamaño**: 1024x1024px
- **Formato**: PNG con transparencia
- **Contenido**: Solo el logo (globo + "A.M.V.A"), **SIN** la palabra "Movil"
- **Padding**: El logo debe estar centrado con espacio alrededor (mínimo 10% de padding)

### 2. **Splash Screen** (`splash-logo.png`)
- **Tamaño**: 1284x2778px (o al menos 1024x1024px)
- **Formato**: PNG con transparencia
- **Contenido**: Logo completo con "A.M.V.A" y "Movil"
- **Fondo**: Transparente o del color de fondo (`#0a1628`)

### 3. **Adaptive Icon** (`adaptive-icon.png`)
- **Tamaño**: 1024x1024px
- **Formato**: PNG con transparencia
- **Contenido**: Solo el logo (globo + "A.M.V.A"), **SIN** la palabra "Movil"
- **Padding**: **MUY IMPORTANTE**: El logo debe estar centrado con **mínimo 20% de padding** en todos los lados
  - El sistema Android recorta los bordes del adaptive icon
  - Si el logo está muy cerca de los bordes, se cortará

---

## 📋 Pasos para Crear los Assets

### Opción 1: Usar Herramientas Online (Recomendado)

1. **Canva** (https://www.canva.com):
   - Crea un diseño de 1024x1024px
   - Coloca el logo centrado con padding
   - Exporta como PNG con transparencia

2. **Figma** (https://www.figma.com):
   - Crea un frame de 1024x1024px
   - Coloca el logo centrado
   - Exporta como PNG

3. **GIMP** o **Photoshop**:
   - Abre el logo original
   - Redimensiona el canvas a 1024x1024px
   - Centra el logo con padding
   - Exporta como PNG

### Opción 2: Usar Script de Conversión (Si tienes el logo original)

Si tienes el logo original en alta resolución, puedes usar ImageMagick:

```bash
# Instalar ImageMagick (si no lo tienes)
sudo apt-get install imagemagick

# Crear icono (1024x1024 con padding)
convert logo-original.png -resize 800x800 -gravity center -extent 1024x1024 -background transparent icon.png

# Crear splash (más grande, con texto completo)
convert logo-original-completo.png -resize 1024x1024 -background transparent splash-logo.png

# Crear adaptive icon (1024x1024 con más padding)
convert logo-original.png -resize 600x600 -gravity center -extent 1024x1024 -background transparent adaptive-icon.png
```

---

## 📁 Estructura de Archivos

Después de crear los assets, colócalos en:

```
amva-mobile/assets/images/
├── icon.png              # Icono de app (1024x1024, solo logo)
├── splash-logo.png       # Splash screen (1284x2778 o 1024x1024, logo completo)
├── adaptive-icon.png     # Adaptive icon Android (1024x1024, logo con padding)
└── amvamovil.png         # Logo original (mantener como referencia)
```

---

## ⚙️ Actualizar app.json

Después de crear los assets, actualiza `app.json`:

```json
{
  "expo": {
    "icon": "./assets/images/icon.png",
    "splash": {
      "image": "./assets/images/splash-logo.png",
      "resizeMode": "contain",
      "backgroundColor": "#0a1628"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/images/adaptive-icon.png",
        "backgroundColor": "#0a1628"
      }
    }
  }
}
```

---

## 🎯 Guía Visual de Padding

### Icono Normal (icon.png)
```
┌─────────────────────────┐
│                         │ ← 10% padding
│    ┌─────────────┐      │
│    │             │      │
│    │    LOGO     │      │ ← Logo centrado
│    │             │      │
│    └─────────────┘      │
│                         │ ← 10% padding
└─────────────────────────┘
     1024x1024px
```

### Adaptive Icon (adaptive-icon.png)
```
┌─────────────────────────┐
│                         │ ← 20% padding (MUY IMPORTANTE)
│                         │
│    ┌─────────────┐      │
│    │             │      │
│    │    LOGO     │      │ ← Logo más pequeño, más centrado
│    │             │      │
│    └─────────────┘      │
│                         │
│                         │ ← 20% padding
└─────────────────────────┘
     1024x1024px
```

**Nota**: Android recorta los bordes del adaptive icon, por eso necesitas más padding.

---

## ✅ Checklist

- [ ] Crear `icon.png` (1024x1024, solo logo, 10% padding)
- [ ] Crear `splash-logo.png` (1024x1024 o mayor, logo completo)
- [ ] Crear `adaptive-icon.png` (1024x1024, solo logo, 20% padding)
- [ ] Colocar archivos en `amva-mobile/assets/images/`
- [ ] Actualizar `app.json` con las nuevas rutas
- [ ] Probar con `npx expo prebuild --clean`
- [ ] Compilar con `eas build --platform android --profile production`

---

## 🚀 Después de Crear los Assets

1. Coloca los archivos en `amva-mobile/assets/images/`
2. Actualiza `app.json` (ya está preparado abajo)
3. Ejecuta: `npx expo prebuild --clean` para regenerar los archivos nativos
4. Compila: `eas build --platform android --profile production`

---

## 💡 Consejos

1. **Padding es clave**: El adaptive icon necesita más padding porque Android lo recorta
2. **Sin texto en iconos**: Los iconos deben ser solo el logo, sin "Movil"
3. **Splash puede tener texto**: El splash screen puede mostrar el logo completo con texto
4. **Transparencia**: Usa PNG con transparencia para mejor resultado
5. **Tamaños mínimos**: 1024x1024px es el mínimo recomendado

---

## 🐛 Si Aún Se Ve Recortado

1. Verifica que los archivos sean exactamente 1024x1024px
2. Aumenta el padding en el adaptive icon (hasta 25-30%)
3. Verifica que el logo esté perfectamente centrado
4. Prueba con `npx expo prebuild --clean` antes de compilar

