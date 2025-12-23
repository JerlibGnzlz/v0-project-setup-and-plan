# 🚀 Generar Nuevo APK con EAS Build

## 🎯 Objetivo

Generar un nuevo APK compilado con el keystore correcto para resolver el problema de Google Login.

---

## ✅ Pasos para Generar Nuevo APK

### Paso 1: Verificar Keystore Default (Opcional pero Recomendado)

Antes de compilar, verifica qué keystore se usará:

```bash
cd /home/jerlibgnzlz/Escritorio/v0-project-setup-and-plan/amva-mobile
eas credentials
```

1. Selecciona: **Android**
2. Selecciona: **Keystore: Manage everything needed to build your project**
3. Verifica qué keystore es el default:
   - Si es `Z1yAtGGy9c` (nuevo), el SHA-1 será `9B:AF:07...`
   - Si es `ZeEnL0LIUD` (anterior), el SHA-1 será `4B:24:0F...`

**Recomendación**: Cambia el default al keystore anterior (`ZeEnL0LIUD`) para que coincida con el SHA-1 que ya tienes configurado.

---

### Paso 2: Cambiar Keystore Default (Recomendado)

Si quieres usar el keystore anterior:

1. En EAS credentials, selecciona: **"Change default keystore"**
2. Selecciona: **"Build Credentials ZeEnL0LIUD"**
3. Confirma el cambio

**Ventaja**: El nuevo APK usará el SHA-1 `4B:24:0F...` que ya tienes configurado.

---

### Paso 3: Compilar Nuevo APK

Ejecuta el comando de compilación:

```bash
cd /home/jerlibgnzlz/Escritorio/v0-project-setup-and-plan/amva-mobile
eas build --platform android --profile production
```

**Este proceso**:
- ✅ Comprimirá tu proyecto
- ✅ Lo subirá a los servidores de EAS
- ✅ Compilará el APK con el keystore configurado
- ✅ Te dará un enlace para descargar el APK cuando termine

**Tiempo estimado**: 10-20 minutos

---

### Paso 4: Monitorear el Build

Después de ejecutar el comando, verás:

```
Compressing project files and uploading to EAS Build...
✔ Uploaded to EAS
See logs: https://expo.dev/accounts/jerlibgnzlz/projects/amva-movil/builds/[ID]

Waiting for build to complete...
```

**Puedes**:
- ✅ Dejar que termine (recomendado)
- ✅ O cerrar la terminal y monitorear desde el enlace que aparece
- ✅ Recibirás una notificación cuando termine

---

### Paso 5: Descargar el APK

Cuando el build termine:

1. Ve al enlace que apareció en la terminal
2. O ve a: https://expo.dev/accounts/jerlibgnzlz/projects/amva-movil/builds
3. Busca el build más reciente
4. Haz clic en **"Download"** o **"Descargar"**
5. Descarga el archivo `.apk`

---

### Paso 6: Verificar SHA-1 del Nuevo APK

Después de compilar, verifica qué SHA-1 tiene el nuevo APK:

```bash
eas credentials
```

1. Selecciona: **Android**
2. Selecciona: **Keystore: Manage everything needed to build your project**
3. Selecciona: **View credentials**
4. Copia el SHA-1 que aparece

**Este SHA-1 debe estar en Google Cloud Console** para que funcione Google Login.

---

### Paso 7: Agregar SHA-1 en Google Cloud Console (Si es Diferente)

Si el nuevo APK usa un SHA-1 diferente:

1. Ve a: https://console.cloud.google.com/apis/credentials
2. Busca el cliente Android: `378853205278-c2e1gcjn06mg857rcvprns01fu8pduat`
3. Agrega el SHA-1 del nuevo APK
4. Guarda los cambios
5. Espera 30 minutos

---

### Paso 8: Instalar el Nuevo APK

1. **Desinstala** completamente la app anterior
2. **Limpia** cache de Google Play Services
3. **Reinicia** el teléfono (opcional pero recomendado)
4. **Instala** el nuevo APK descargado
5. **Abre** la app
6. **Prueba** el login con Google

---

## 📋 Checklist Completo

- [ ] Keystore default verificado/cambiado
- [ ] Comando de compilación ejecutado
- [ ] Build completado exitosamente
- [ ] APK descargado
- [ ] SHA-1 del nuevo APK verificado
- [ ] SHA-1 agregado en Google Cloud Console (si es diferente)
- [ ] Esperado 30 minutos después de agregar SHA-1
- [ ] App anterior desinstalada
- [ ] Nuevo APK instalado
- [ ] Login con Google probado

---

## 🎯 Opciones de Compilación

### Compilar para Producción (Recomendado)

```bash
eas build --platform android --profile production
```

- ✅ Usa el keystore de producción
- ✅ APK optimizado y minificado
- ✅ Listo para publicar en Play Store

### Compilar para Preview (Pruebas)

```bash
eas build --platform android --profile preview
```

- ⚠️ Usa keystore diferente (debug o preview)
- ⚠️ No optimizado para producción
- ✅ Útil para pruebas rápidas

---

## 💡 Consejos

1. **Verifica el keystore antes de compilar**: Asegúrate de que el keystore default sea el correcto
2. **Monitorea el build**: Puedes ver el progreso desde el enlace que aparece
3. **Descarga el APK**: Guárdalo en un lugar seguro
4. **Verifica el SHA-1**: Asegúrate de que esté en Google Cloud Console
5. **Espera la propagación**: Después de agregar SHA-1, espera 30 minutos

---

## 🐛 Si el Build Falla

Si el build falla:

1. **Revisa los logs**: Ve al enlace que aparece en la terminal
2. **Verifica errores comunes**:
   - Problemas con `google-services.json`
   - Problemas con gradle
   - Problemas con dependencias
3. **Corrige los errores** y vuelve a compilar

---

## ✅ Resumen Rápido

```bash
# 1. Ir al directorio del proyecto
cd /home/jerlibgnzlz/Escritorio/v0-project-setup-and-plan/amva-mobile

# 2. Compilar APK de producción
eas build --platform android --profile production

# 3. Esperar a que termine (10-20 minutos)

# 4. Descargar el APK desde el enlace que aparece

# 5. Verificar SHA-1 y agregarlo en Google Cloud Console si es necesario

# 6. Instalar el nuevo APK y probar
```

---

## 🚀 Después de Generar el Nuevo APK

1. **Verifica** que el SHA-1 del nuevo APK esté en Google Cloud Console
2. **Espera** 30 minutos después de agregar SHA-1 (si es necesario)
3. **Desinstala** la app anterior completamente
4. **Instala** el nuevo APK
5. **Prueba** el login con Google

Debería funcionar correctamente con el nuevo APK.

