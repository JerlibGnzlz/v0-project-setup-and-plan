# Guía de Prueba de Google Sign-In

## 🧪 Pasos para Probar Google Sign-In

### 1. Verificar Requisitos Previos

- [x] SHA-1 configurado en Google Cloud Console
- [x] Cliente Android creado con SHA-1
- [x] Build nativo ejecutado
- [ ] Emulador/dispositivo con Google Play Services

### 2. Ejecutar Build

```bash
cd amva-mobile

# Opción 1: En emulador/dispositivo conectado
npx expo run:android

# Opción 2: Solo compilar APK
cd android
./gradlew assembleDebug
```

### 3. Verificar que la App se Instale

- La app debería instalarse automáticamente
- Si hay errores, revisa los logs en la terminal

### 4. Probar Google Sign-In

#### En LoginScreen:
1. Abre la app
2. Ve a la pantalla de login
3. Presiona **"🔵 Continuar con Google"**
4. Debería abrirse la UI nativa de Google Sign-In
5. Selecciona una cuenta de Google
6. La app debería autenticarte automáticamente

#### En Step1Auth (Inscripción):
1. Ve a la pantalla de inscripción a convención
2. En el paso 1 (Autenticación)
3. Presiona **"🔵 Continuar con Google"**
4. Debería funcionar igual que en LoginScreen

### 5. Verificar Logs

Busca estos logs en la consola:

```
✅ Google Sign-In configurado correctamente
🔐 Iniciando sesión con Google (nativo)...
✅ Token de Google obtenido, enviando al backend...
✅ Login con Google exitoso
```

### 6. Verificar Autenticación

Después del login exitoso:
- Deberías ver la pantalla principal (MainTabs)
- El estado de invitado debería estar actualizado
- Puedes navegar por la app normalmente

## 🐛 Troubleshooting

### Error: "Google Play Services not available"

**Solución**:
- Usa un emulador con Google Play Services (no AOSP)
- O usa un dispositivo físico con Google Play Services instalado

### Error: "Sign in cancelled"

**Solución**:
- Esto no es un error, el usuario canceló
- Verifica que el OAuth consent screen esté configurado

### Error: "Configuration error"

**Solución**:
1. Verifica que el SHA-1 esté configurado en Google Cloud Console
2. Verifica que el `webClientId` sea el correcto (Web Client ID)
3. Espera 5-15 minutos después de configurar SHA-1

### Error: "Token invalid"

**Solución**:
1. Verifica que `GOOGLE_CLIENT_ID` en backend sea el Web Client ID
2. Verifica que `webClientId` en app móvil sea el mismo Web Client ID
3. Verifica que ambos clientes (Web y Android) estén en el mismo proyecto

### La app no se instala

**Solución**:
```bash
# Limpiar build
cd android
./gradlew clean

# Rebuild
cd ..
npx expo prebuild --clean
npx expo run:android
```

## ✅ Checklist de Prueba

- [ ] Build compilado exitosamente
- [ ] App instalada en emulador/dispositivo
- [ ] Botón "Continuar con Google" visible
- [ ] UI nativa de Google se abre al presionar
- [ ] Puedo seleccionar cuenta de Google
- [ ] Login exitoso después de seleccionar cuenta
- [ ] Navegación automática a pantalla principal
- [ ] Estado de invitado actualizado correctamente
- [ ] Puedo usar la app normalmente después del login

## 📝 Notas

- El primer login puede tardar más (configuración inicial)
- Los cambios en Google Cloud Console pueden tardar 5-15 minutos
- Si algo falla, revisa los logs en la consola para más detalles

## 🎯 Resultado Esperado

Después de un login exitoso con Google:
1. ✅ Token guardado en SecureStore
2. ✅ Estado de invitado actualizado
3. ✅ Navegación automática a MainTabs
4. ✅ Puedes usar todas las funciones de la app

