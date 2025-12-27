# 🧪 Cómo Probar Google OAuth

## ✅ Verificación Completada

La configuración está correcta:
- ✅ Web Client ID configurado
- ✅ Android Client ID configurado
- ✅ google-services.json correcto
- ✅ Fallback a Web Client ID implementado
- ✅ Código actualizado

## 🎯 Cómo Probar

### Opción 1: Probar con APK Existente (Más Rápido)

#### Paso 1: Descargar APK

1. Ve a: https://expo.dev/artifacts/eas/aXpxxM3bqffGfC1wgryc1D.apk
2. O ve a: https://expo.dev/accounts/jerlibgnzlz/projects/amva-movil/builds/509eaa2d-285d-474f-9a8a-c2d85488dc21
3. Descarga el APK

#### Paso 2: Instalar en Teléfono

1. Transfiere el APK a tu teléfono (USB, email, Drive, WhatsApp, etc.)
2. Abre el APK en tu teléfono
3. Si aparece advertencia sobre "fuentes desconocidas":
   - Ve a Configuración → Seguridad
   - Permite instalación desde fuentes desconocidas
4. Instala el APK
5. Abre la app

#### Paso 3: Probar Google OAuth

1. Abre la app en tu teléfono
2. Ve a la pantalla de login
3. Haz clic en "Iniciar sesión con Google" o botón similar
4. Selecciona tu cuenta de Google
5. Autoriza la app

**Resultado Esperado**:
- ✅ Debería abrirse el selector de cuenta de Google
- ✅ Deberías poder seleccionar tu cuenta
- ✅ Deberías poder autorizar la app
- ✅ Deberías iniciar sesión correctamente

### Opción 2: Probar en Emulador/Dispositivo de Desarrollo

#### Paso 1: Iniciar la App

```bash
cd amva-mobile
npm start
```

O si tienes dispositivo conectado:

```bash
cd amva-mobile
npm run android
```

#### Paso 2: Probar Google OAuth

1. La app se abrirá en el emulador/dispositivo
2. Ve a la pantalla de login
3. Haz clic en "Iniciar sesión con Google"
4. Prueba el login

## 🔍 Qué Observar Durante la Prueba

### Si Funciona Correctamente

1. **Se abre el selector de Google**: ✅ Configuración correcta
2. **Puedes seleccionar tu cuenta**: ✅ OAuth funcionando
3. **Se autoriza correctamente**: ✅ Todo bien
4. **Inicias sesión en la app**: ✅ Éxito completo

### Si No Funciona

#### Error: "DEVELOPER_ERROR"

**Significa**: El Android Client ID no tiene el SHA-1 configurado

**Solución**: El código automáticamente usará Web Client ID como fallback. Si aún no funciona:
1. Verifica que el Web Client ID esté correcto en `app.json`
2. Reinicia la app completamente
3. Vuelve a intentar

#### Error: "PLAY_SERVICES_NOT_AVAILABLE"

**Significa**: Google Play Services no está disponible

**Solución**:
1. Actualiza Google Play Services en tu dispositivo
2. O prueba en un dispositivo diferente

#### Error: "SIGN_IN_CANCELLED"

**Significa**: El usuario canceló el login

**Solución**: Esto es normal, solo vuelve a intentar

## 📋 Checklist de Prueba

- [ ] APK descargado o app iniciada
- [ ] App instalada/abierta en dispositivo
- [ ] Pantalla de login visible
- [ ] Botón "Iniciar sesión con Google" visible
- [ ] Clic en botón de Google
- [ ] Selector de cuenta de Google aparece
- [ ] Cuenta seleccionada
- [ ] Autorización completada
- [ ] Login exitoso en la app

## 🎯 Comportamiento Esperado del Código

### Flujo Automático

1. **Intenta usar Android Client ID** primero
2. **Si falla con DEVELOPER_ERROR**, automáticamente usa **Web Client ID**
3. **Muestra en consola**: `⚠️ Usando Web Client ID como fallback (no requiere SHA-1)`
4. **Continúa con el login** usando Web Client ID

### Logs en Consola

Cuando pruebes, deberías ver en la consola:

```
🔍 Google Sign-In configurado con: { platform: 'android', clientId: '378853205278...' }
```

Si usa fallback:

```
⚠️ Usando Web Client ID como fallback (no requiere SHA-1)
```

## ⚠️ Notas Importantes

1. **Primera vez**: Puede tardar unos segundos en cargar
2. **Permisos**: Asegúrate de tener conexión a internet
3. **Google Play Services**: Debe estar actualizado en el dispositivo
4. **Cuenta de Google**: Debe estar configurada en el dispositivo

## 🎉 Resultado Esperado

Después de probar:

- ✅ Google OAuth debería funcionar
- ✅ Deberías poder iniciar sesión con tu cuenta de Google
- ✅ La app debería autenticarte correctamente

## 📝 Si Necesitas Ayuda

Si encuentras algún problema:

1. **Revisa los logs** en la consola de la app
2. **Verifica el error** que aparece
3. **Consulta las guías** de solución de problemas
4. **Comparte el error** conmigo para ayudarte

## 🚀 Próximos Pasos Después de Probar

### Si Funciona

1. ✅ Google OAuth está funcionando
2. ✅ Puedes usar la app normalmente
3. ⚠️ Para producción, configura SHA-1 correctamente (opcional pero recomendado)

### Si No Funciona

1. ⚠️ Revisa el error específico
2. ⚠️ Verifica la configuración
3. ⚠️ Consulta las guías de solución de problemas
4. ⚠️ Comparte el error para ayudarte a resolverlo

