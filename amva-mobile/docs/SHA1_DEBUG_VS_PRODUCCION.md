# 🔑 SHA-1 Debug vs Producción - Por Qué Funciona en Emulador pero No en Físico

## 🔍 Problema Identificado

- ✅ **Emulador**: Login con Google funciona
- ❌ **Teléfono físico**: Login con Google NO funciona (DEVELOPER_ERROR)

---

## 💡 Explicación

### Por Qué Funciona en el Emulador

El **emulador** usa el **keystore de debug** que viene por defecto con Android Studio. Este keystore tiene un SHA-1 específico que probablemente ya está configurado en Google Cloud Console.

### Por Qué NO Funciona en el Teléfono Físico

El **teléfono físico** está usando el **APK compilado con EAS Build**, que usa un **keystore de producción** diferente. Este keystore tiene un SHA-1 diferente que probablemente **NO está configurado** en Google Cloud Console.

---

## ✅ Solución

Necesitas tener **AMBOS SHA-1** configurados en Google Cloud Console:

1. **SHA-1 de Debug** (para desarrollo/emulador) - Ya está configurado ✅
2. **SHA-1 de Producción** (para builds de EAS) - Falta agregar ❌

---

## 📋 Paso 1: Obtener SHA-1 de Producción

El SHA-1 que necesitas es el del keystore de producción que EAS Build está usando:

```bash
cd /home/jerlibgnzlz/Escritorio/v0-project-setup-and-plan/amva-mobile
eas credentials
```

1. Selecciona **Android**
2. Selecciona **View credentials**
3. Busca la sección **"Keystore"** o **"Signing Key"**
4. Verás el **SHA-1** listado ahí
5. **Copia el SHA-1 completo**

Este es el SHA-1 que necesitas agregar en Google Cloud Console.

---

## 📋 Paso 2: Agregar SHA-1 de Producción en Google Cloud Console

1. Ve a: **https://console.cloud.google.com/apis/credentials**
2. Busca el cliente Android: `378853205278-c2e1gcjn06mg857rcvprns01fu8pduat`
3. Haz clic para editarlo
4. En la sección **"SHA-1 certificate fingerprint"**:
   - Verás el SHA-1 de debug que ya está ahí
   - Haz clic en **"+ Agregar huella digital"** o **"+ Add fingerprint"**
   - Pega el SHA-1 de producción que obtuviste de EAS
   - **NO elimines** el SHA-1 de debug (puedes tener ambos)
5. Haz clic en **"Guardar"** o **"Save"**

---

## 📋 Paso 3: Verificar SHA-1 de Debug (Opcional)

Si quieres verificar cuál es el SHA-1 de debug que ya tienes configurado:

```bash
cd /home/jerlibgnzlz/Escritorio/v0-project-setup-and-plan/amva-mobile/android
./gradlew signingReport
```

Busca la línea que dice **"SHA1:"** en la sección de **"Variant: debug"**.

Este SHA-1 debería estar ya configurado en Google Cloud Console (por eso funciona en el emulador).

---

## ⏱️ Paso 4: Esperar Propagación

Después de agregar el SHA-1 de producción:
- ⏱️ Espera **15-30 minutos** para que Google propague los cambios
- 🔄 Los cambios pueden tardar hasta **1 hora** en algunos casos

---

## ✅ Paso 5: Probar en Teléfono Físico

Después de esperar 15-30 minutos:
1. Abre la app en tu teléfono físico
2. Intenta iniciar sesión con Google
3. Debería funcionar correctamente

---

## 📊 Resumen

| Entorno | Keystore | SHA-1 | Estado |
|---------|----------|-------|--------|
| Emulador | Debug (por defecto) | SHA-1 de Debug | ✅ Funciona |
| Teléfono Físico | Producción (EAS Build) | SHA-1 de Producción | ❌ Falta agregar |

---

## 🎯 Checklist

- [ ] SHA-1 de producción obtenido desde EAS (`eas credentials`)
- [ ] SHA-1 de producción agregado en Google Cloud Console
- [ ] SHA-1 de debug NO eliminado (debe estar también)
- [ ] Esperado 15-30 minutos después de agregar SHA-1
- [ ] Probado login con Google en teléfono físico

---

## 💡 Nota Importante

Puedes tener **múltiples SHA-1** en el mismo cliente Android:
- ✅ SHA-1 de Debug (para desarrollo)
- ✅ SHA-1 de Producción (para builds de EAS)
- ✅ SHA-1 de otros keystores si es necesario

**NO elimines** ningún SHA-1 existente, solo agrega el nuevo.

---

## 🐛 Si Aún No Funciona

1. Verifica que el SHA-1 de producción sea correcto (desde EAS)
2. Verifica que esté agregado en Google Cloud Console
3. Espera más tiempo (hasta 1 hora)
4. Verifica que el Client ID sea correcto: `378853205278-c2e1gcjn06mg857rcvprns01fu8pduat`
5. Verifica OAuth consent screen

