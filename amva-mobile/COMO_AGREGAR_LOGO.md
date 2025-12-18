# Cómo Agregar el Logo AMVA Móvil

## 📋 Pasos para agregar el logo

### 1. Preparar la imagen

Asegúrate de tener la imagen del logo con las siguientes características:

- **Nombre del archivo:** `logo-amva-movil.png` (o `.jpg`, `.webp`)
- **Ubicación:** `amva-mobile/assets/images/logo-amva-movil.png`
- **Tamaño recomendado:** 
  - Mínimo: 512x512px
  - Ideal: 1024x1024px o mayor
- **Formato:** PNG con transparencia (preferido) o JPG de alta calidad

### 2. Agregar la imagen

1. Coloca el archivo de imagen en la carpeta:
   ```
   amva-mobile/assets/images/logo-amva-movil.png
   ```

2. Si usas un formato diferente (JPG o WebP), actualiza las referencias en:
   - `amva-mobile/src/screens/auth/LoginScreen.tsx`
   - `amva-mobile/src/screens/auth/RegisterScreen.tsx`
   - `amva-mobile/src/screens/home/HomeScreen.tsx`

   Cambia la extensión en la línea:
   ```typescript
   source={require('../../assets/images/logo-amva-movil.png')}
   ```

### 3. Verificar que funciona

1. Reinicia el servidor de desarrollo:
   ```bash
   npm start
   ```

2. Verifica que el logo aparezca en:
   - Pantalla de Login
   - Pantalla de Registro
   - Pantalla de Inicio (Home)

### 4. Ajustar tamaño si es necesario

Si el logo se ve muy grande o muy pequeño, puedes ajustar el tamaño en los estilos:

**LoginScreen y RegisterScreen:**
```typescript
logoImage: {
  width: 120,  // Ajusta este valor
  height: 120, // Ajusta este valor
},
```

**HomeScreen:**
```typescript
logoImage: {
  width: 100,  // Ajusta este valor
  height: 100, // Ajusta este valor
},
```

## 🎨 Descripción del Logo

El logo debe tener:
- Globo terrestre con continentes en verde y océanos en azul
- Texto "A.M.V.A" en color dorado/naranja sobre el globo
- Texto "movil" en azul a la derecha del globo
- Fondo negro o transparente

## ⚠️ Nota Importante

Si la imagen no se encuentra, la app mostrará un error. Asegúrate de:
1. Que el archivo exista en la ruta correcta
2. Que el nombre del archivo coincida exactamente (incluyendo mayúsculas/minúsculas)
3. Que la extensión del archivo coincida con la referencia en el código

## 🔄 Actualizar después de agregar la imagen

Una vez agregada la imagen, ejecuta:

```bash
cd amva-mobile
npm start
```

Y reinicia la app para ver los cambios.

