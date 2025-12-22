# 🔍 Problema: Google Login No Funciona Después de Cambiar Logo

## 🔴 Situación

- ✅ Antes funcionaba Google Login
- ❌ Después de cambiar los logos, ya no funciona
- ✅ Ya agregaste SHA-1: `4B:24:0F:1B:6A:E6:3D:71:38:77:D1:E7:69:40:D2:1D:5D:30:7C:40`

---

## 🔍 Posibles Causas

### 1. SHA-1 del Nuevo Build es Diferente

Cuando ejecutamos `npx expo prebuild --clean`, se regeneraron los archivos nativos. Si EAS Build generó un nuevo keystore o usó uno diferente, el SHA-1 podría haber cambiado.

**Solución**: Verifica que el SHA-1 que agregaste sea el mismo que el del build actual.

---

### 2. El Prebuild Cambió la Configuración

El `prebuild` podría haber afectado la configuración de Google Sign-In en los archivos nativos.

**Solución**: Verificar que la configuración en `app.json` siga siendo correcta.

---

### 3. Tiempo de Propagación

Si acabas de agregar el SHA-1, puede que no haya pasado suficiente tiempo.

**Solución**: Espera al menos 30 minutos después de agregar el SHA-1.

---

## ✅ Solución Paso a Paso

### Paso 1: Verificar SHA-1 Actual del Build

Ejecuta:

```bash
cd /home/jerlibgnzlz/Escritorio/v0-project-setup-and-plan/amva-mobile
eas credentials
```

1. Selecciona: **Android**
2. Selecciona: **View credentials**
3. Copia el **SHA-1** que aparece

**Compara** este SHA-1 con el que agregaste: `4B:24:0F:1B:6A:E6:3D:71:38:77:D1:E7:69:40:D2:1D:5D:30:7C:40`

**Deben ser EXACTAMENTE iguales**. Si son diferentes, ese es el problema.

---

### Paso 2: Si el SHA-1 es Diferente

Si el SHA-1 de EAS es diferente al que agregaste:

1. **Elimina** el SHA-1 incorrecto de Google Cloud Console
2. **Agrega** el SHA-1 correcto (el de EAS)
3. **Espera** 30 minutos
4. **Desinstala** y **reinstala** la app
5. **Prueba** de nuevo

---

### Paso 3: Verificar Configuración en app.json

El `app.json` debe tener:

```json
{
  "extra": {
    "googleAndroidClientId": "378853205278-c2e1gcjn06mg857rcvprns01fu8pduat.apps.googleusercontent.com"
  }
}
```

Verifica que esto siga siendo correcto.

---

### Paso 4: Verificar OAuth Consent Screen

Ve a: https://console.cloud.google.com/apis/credentials/consent

Verifica:
- ✅ Estado: "En producción" o "In production"
- ✅ Si está en "En prueba", asegúrate de tener usuarios de prueba agregados
- ✅ Scopes: `email` y `profile`

---

### Paso 5: Limpiar y Recompilar

Si nada funciona, intenta:

1. **Limpiar** el proyecto:
   ```bash
   cd /home/jerlibgnzlz/Escritorio/v0-project-setup-and-plan/amva-mobile
   npx expo prebuild --clean
   ```

2. **Verificar** que `app.json` tenga el Client ID correcto

3. **Recompilar** con EAS:
   ```bash
   eas build --platform android --profile production
   ```

4. **Obtener** el SHA-1 del nuevo build

5. **Agregar** el SHA-1 en Google Cloud Console

6. **Esperar** 30 minutos

7. **Probar** de nuevo

---

## 🔍 Diagnóstico Rápido

Ejecuta este comando para verificar la configuración:

```bash
cd /home/jerlibgnzlz/Escritorio/v0-project-setup-and-plan/amva-mobile
./scripts/diagnostico-google-login.sh
```

---

## 📋 Checklist

- [ ] SHA-1 en EAS credentials obtenido
- [ ] SHA-1 comparado con el agregado en Google Cloud Console (`4B:24:0F:1B:6A:E6:3D:71:38:77:D1:E7:69:40:D2:1D:5D:30:7C:40`)
- [ ] Ambos SHA-1 son EXACTAMENTE iguales
- [ ] Si son diferentes, agregado el SHA-1 correcto
- [ ] Esperado 30 minutos después de agregar SHA-1
- [ ] OAuth consent screen verificado
- [ ] Client ID en app.json verificado
- [ ] App desinstalada y reinstalada
- [ ] Probado de nuevo

---

## 🚨 Si el SHA-1 es Diferente

Si el SHA-1 de EAS es diferente al que agregaste (`4B:24:0F:1B:6A:E6:3D:71:38:77:D1:E7:69:40:D2:1D:5D:30:7C:40`), entonces:

1. **Ese es el problema**: Estás usando un SHA-1 incorrecto
2. **Solución**: Agrega el SHA-1 correcto (el de EAS) en Google Cloud Console
3. **Espera** 30 minutos
4. **Prueba** de nuevo

---

## 💡 Nota Importante

El SHA-1 puede cambiar si:
- EAS Build generó un nuevo keystore
- Se regeneraron los archivos nativos con `prebuild --clean`
- Se cambió la configuración del keystore

**Siempre verifica el SHA-1 actual desde EAS credentials antes de agregarlo en Google Cloud Console.**

