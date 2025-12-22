# 🎨 Corregir Logo - Guía Paso a Paso

## 🔍 Problema

- ❌ Logo recortado en el icono del APK
- ❌ La palabra "Movil" no aparece completa
- ❌ Splash screen también recortado

---

## ✅ Solución Rápida (Automática)

### Paso 1: Generar Assets Automáticamente

Ejecuta el script que genera los assets correctos:

```bash
cd /home/jerlibgnzlz/Escritorio/v0-project-setup-and-plan/amva-mobile
./scripts/generar-assets-logo.sh
```

Este script:
- ✅ Crea `icon.png` (1024x1024, con padding)
- ✅ Crea `splash-logo.png` (1024x1024, logo completo)
- ✅ Crea `adaptive-icon.png` (1024x1024, con más padding)

### Paso 2: Verificar los Assets Generados

Revisa los archivos en `amva-mobile/assets/images/`:
- `icon.png` - Debe verse bien centrado
- `splash-logo.png` - Debe mostrar el logo completo
- `adaptive-icon.png` - Debe tener más espacio alrededor

### Paso 3: Si el Logo Original Tiene "Movil"

Si el logo original (`amvamovil.png`) tiene la palabra "Movil" y quieres que:
- **Iconos**: Solo muestren el logo sin "Movil" (más limpio)
- **Splash**: Muestren el logo completo con "Movil"

Entonces necesitas crear manualmente:
1. Una versión del logo **SIN** "Movil" para los iconos
2. Usar el logo completo para el splash

### Paso 4: Regenerar Archivos Nativos

Después de tener los assets correctos:

```bash
cd /home/jerlibgnzlz/Escritorio/v0-project-setup-and-plan/amva-mobile
npx expo prebuild --clean
```

Esto regenera los archivos nativos de Android con los nuevos assets.

### Paso 5: Compilar Nuevo APK

```bash
eas build --platform android --profile production
```

---

## 🎨 Solución Manual (Si Necesitas Más Control)

### Opción 1: Usar Canva (Recomendado)

1. Ve a https://www.canva.com
2. Crea un diseño de **1024x1024px**
3. Coloca el logo centrado con espacio alrededor
4. Exporta como PNG con transparencia
5. Guarda como:
   - `icon.png` - Solo logo (sin "Movil")
   - `adaptive-icon.png` - Solo logo con más padding (sin "Movil")
   - `splash-logo.png` - Logo completo con "Movil"

### Opción 2: Usar GIMP o Photoshop

1. Abre el logo original
2. Crea un nuevo canvas de **1024x1024px**
3. Centra el logo con padding:
   - **Icono**: 10% de padding (logo ocupa ~80% del espacio)
   - **Adaptive Icon**: 20% de padding (logo ocupa ~60% del espacio)
4. Exporta como PNG con transparencia

---

## 📋 Estructura Final de Archivos

```
amva-mobile/assets/images/
├── icon.png              # 1024x1024, solo logo (sin "Movil")
├── splash-logo.png       # 1024x1024, logo completo (con "Movil")
├── adaptive-icon.png     # 1024x1024, solo logo con más padding (sin "Movil")
└── amvamovil.png         # Logo original (mantener como referencia)
```

---

## ⚙️ Configuración Actualizada

El archivo `app.json` ya está actualizado para usar:
- `icon.png` para el icono de la app
- `splash-logo.png` para el splash screen
- `adaptive-icon.png` para el adaptive icon de Android

---

## ✅ Checklist

- [ ] Ejecutar script `generar-assets-logo.sh` o crear assets manualmente
- [ ] Verificar que los archivos sean 1024x1024px
- [ ] Verificar que los iconos tengan padding suficiente
- [ ] Verificar que el splash muestre el logo completo
- [ ] Ejecutar `npx expo prebuild --clean`
- [ ] Compilar con `eas build --platform android --profile production`
- [ ] Probar el APK en el teléfono físico

---

## 🐛 Si Aún Se Ve Recortado

1. **Aumenta el padding**: El adaptive icon necesita más espacio
2. **Verifica el tamaño**: Debe ser exactamente 1024x1024px
3. **Centra el logo**: Debe estar perfectamente centrado
4. **Regenera nativos**: Ejecuta `npx expo prebuild --clean`
5. **Recompila**: Vuelve a compilar con EAS Build

---

## 💡 Consejos Importantes

1. **Padding es clave**: Android recorta los bordes del adaptive icon, por eso necesita más padding
2. **Sin texto en iconos**: Los iconos deben ser solo el logo, sin "Movil" (más limpio y profesional)
3. **Splash puede tener texto**: El splash screen puede mostrar el logo completo con "Movil"
4. **Transparencia**: Usa PNG con transparencia para mejor resultado
5. **Tamaños mínimos**: 1024x1024px es el mínimo recomendado

---

## 🚀 Próximos Pasos

1. Ejecuta el script o crea los assets manualmente
2. Verifica que se vean bien
3. Regenera los archivos nativos
4. Compila el nuevo APK
5. Prueba en el teléfono físico

