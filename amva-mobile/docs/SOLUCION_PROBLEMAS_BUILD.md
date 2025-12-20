# 🔧 Solución de Problemas del Build

## ❌ Problema 1: Login con Google No Funciona

### Posibles Causas

1. **SHA-1 del keystore de producción no configurado**
   - El keystore usado en EAS Build es diferente al de debug
   - Google requiere el SHA-1 del keystore de producción

2. **Client ID incorrecto**
   - Verificar que el `googleAndroidClientId` en `app.json` sea correcto

### ✅ Solución

#### Paso 1: Obtener SHA-1 del Keystore de Producción

El keystore usado en EAS Build es el que generaste con EAS. Necesitas obtener su SHA-1:

```bash
# EAS guarda el keystore, pero puedes obtener el SHA-1 desde EAS CLI
eas credentials
# Selecciona Android → View credentials → Ver SHA-1
```

O si tienes acceso al keystore local:

```bash
keytool -list -v -keystore android/app/amva-release-key.keystore -alias amva-key-alias
# Busca la línea "SHA1:" y copia el valor
```

#### Paso 2: Agregar SHA-1 en Google Cloud Console

1. Ve a: https://console.cloud.google.com/apis/credentials
2. Selecciona tu proyecto
3. Busca el cliente Android: `378853205278-c2e1gcjn06mg857rcvprns01fu8pduat`
4. Haz clic en editar
5. En "SHA-1 certificate fingerprint", agrega el SHA-1 del keystore de producción
6. Guarda los cambios
7. Espera 5-15 minutos para que se propague

#### Paso 3: Verificar Configuración

- ✅ `googleAndroidClientId` en `app.json`: `378853205278-c2e1gcjn06mg857rcvprns01fu8pduat`
- ✅ SHA-1 de producción agregado en Google Cloud Console
- ✅ OAuth consent screen configurado

---

## ❌ Problema 2: "Debes Autenticarte" al Subir Pagos

### Causa

El código verifica que:
1. Hay un token de invitado guardado (`invitado_token`)
2. El usuario está autenticado (`isAuthenticated`)
3. El email del invitado coincide con el email de la inscripción

### ✅ Solución

#### Opción A: Iniciar Sesión Después de Instalar la App

1. Abre la app
2. Ve a la pantalla de login
3. Inicia sesión con el mismo email con el que te inscribiste
4. Ahora podrás subir comprobantes

#### Opción B: Mejorar el Flujo de Autenticación

Si te inscribiste sin iniciar sesión, necesitas:
1. Iniciar sesión con el mismo email
2. O mejorar el código para permitir subir comprobantes sin autenticación (menos seguro)

---

## 🔍 Verificar Estado de Autenticación

Para verificar si estás autenticado:

1. Abre la app
2. Ve a la pantalla de Perfil
3. Si ves tu información, estás autenticado
4. Si no ves nada o te pide login, no estás autenticado

---

## 📋 Checklist de Verificación

### Login con Google
- [ ] SHA-1 del keystore de producción obtenido
- [ ] SHA-1 agregado en Google Cloud Console
- [ ] Esperado 5-15 minutos después de agregar SHA-1
- [ ] `googleAndroidClientId` correcto en `app.json`
- [ ] OAuth consent screen configurado

### Subir Pagos
- [ ] App instalada en dispositivo físico
- [ ] Iniciado sesión con el mismo email de la inscripción
- [ ] Token guardado correctamente (verificar logs)
- [ ] Estado `isAuthenticated` es `true`

---

## 🐛 Debugging

### Ver Logs de Autenticación

En la app, busca en los logs:
- `🔍 Verificando autenticación:` - Muestra el estado actual
- `✅ Tokens guardados verificados:` - Confirma que los tokens se guardaron
- `🔍 [AppNavigator] Estado de autenticación:` - Estado global

### Verificar Tokens

Si los tokens no se guardan correctamente:
1. Verifica permisos de SecureStore
2. Verifica que no haya errores en la consola
3. Intenta cerrar y abrir la app nuevamente

---

## 🚀 Próximos Pasos

1. **Obtener SHA-1 del keystore de producción**
2. **Agregarlo en Google Cloud Console**
3. **Esperar 5-15 minutos**
4. **Rebuild la app** (opcional, pero recomendado)
5. **Probar login con Google**
6. **Iniciar sesión antes de subir comprobantes**

