# 🔧 Resumen de Solución de Problemas

## ❌ Problema 1: Login con Google No Funciona

### ✅ Solución Implementada

1. **Mejorado el código de Google Sign-In**:
   - Ahora usa `googleAndroidClientId` específico para Android
   - Agregado logging para debugging

2. **Corregido formato en `app.json`**:
   - `googleAndroidClientId` ahora tiene el formato correcto (sin `.apps.googleusercontent.com` duplicado)

### 📋 Pasos para Resolver

1. **Obtener SHA-1 del keystore de producción**:
   ```bash
   cd amva-mobile
   eas credentials
   # Selecciona Android → View credentials → Copia el SHA-1
   ```

2. **Agregar SHA-1 en Google Cloud Console**:
   - Ve a: https://console.cloud.google.com/apis/credentials
   - Busca el cliente Android: `378853205278-c2e1gcjn06mg857rcvprns01fu8pduat`
   - Agrega el SHA-1 del keystore de producción
   - Espera 5-15 minutos

3. **Probar login con Google** en la app

**Ver guía completa**: `docs/OBTENER_SHA1_PRODUCCION.md`

---

## ❌ Problema 2: "Debes Autenticarte" al Subir Pagos

### ✅ Solución Implementada

1. **Mejorado el mensaje de error**:
   - Ahora explica claramente qué hacer
   - Muestra pasos específicos

2. **El flujo correcto es**:
   - Iniciar sesión con el mismo email con el que te inscribiste
   - Luego podrás subir comprobantes

### 📋 Pasos para Resolver

1. **Abre la app**
2. **Ve a la pantalla de Login** (si no estás autenticado)
3. **Inicia sesión** con el mismo email con el que te inscribiste
4. **Ahora podrás subir comprobantes**

---

## 🔍 Verificar Estado de Autenticación

Para verificar si estás autenticado:

1. Abre la app
2. Ve a la pantalla de **Perfil**
3. Si ves tu información (nombre, email, etc.), estás autenticado ✅
4. Si no ves nada o te pide login, no estás autenticado ❌

---

## 📋 Checklist de Verificación

### Login con Google
- [ ] SHA-1 del keystore de producción obtenido
- [ ] SHA-1 agregado en Google Cloud Console
- [ ] Esperado 5-15 minutos después de agregar SHA-1
- [ ] `googleAndroidClientId` correcto en `app.json`: `378853205278-c2e1gcjn06mg857rcvprns01fu8pduat`
- [ ] OAuth consent screen configurado
- [ ] Login con Google probado en la app

### Subir Pagos
- [ ] App instalada en dispositivo físico
- [ ] Iniciado sesión con el mismo email de la inscripción
- [ ] Token guardado correctamente (verificar logs)
- [ ] Estado `isAuthenticated` es `true`
- [ ] Subir comprobante probado exitosamente

---

## 🐛 Debugging

### Ver Logs de Autenticación

En la app, busca en los logs:
- `🔍 Google Sign-In configurado con:` - Muestra qué Client ID se está usando
- `🔍 Verificando autenticación:` - Muestra el estado actual
- `✅ Tokens guardados verificados:` - Confirma que los tokens se guardaron
- `🔍 [AppNavigator] Estado de autenticación:` - Estado global

### Errores Comunes

1. **"10" o "DEVELOPER_ERROR"** en Google Sign-In:
   - SHA-1 no está configurado o no coincide
   - Verifica que el SHA-1 sea correcto
   - Espera más tiempo (hasta 30 minutos)

2. **"Autenticación requerida"** al subir pagos:
   - No estás autenticado
   - Inicia sesión con el mismo email de la inscripción

---

## 🚀 Próximos Pasos

1. **Obtener SHA-1 del keystore de producción** (desde EAS)
2. **Agregarlo en Google Cloud Console**
3. **Esperar 5-15 minutos**
4. **Probar login con Google**
5. **Iniciar sesión antes de subir comprobantes**

---

## 📚 Documentación Relacionada

- `docs/OBTENER_SHA1_PRODUCCION.md` - Guía detallada para obtener SHA-1
- `docs/SOLUCION_PROBLEMAS_BUILD.md` - Guía completa de solución de problemas

