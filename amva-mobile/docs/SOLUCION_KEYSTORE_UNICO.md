# 🔧 Solución: Solo un Keystore Visible en EAS

## 🔍 Situación Actual

Solo ves **un keystore** en EAS:
- **Build Credentials NYdiJY86HE (Default)**
- SHA-1: `F7:2B:AF:20:1C:84:29:93:30:07:00:5D:EB:1C:1E:95:F6:79:2C:E6`
- Actualizado hace 27 minutos

**Problema**: Este SHA-1 **NO está configurado** en Google Cloud Console, por lo que Google Login no funcionará.

---

## ✅ Solución: Agregar SHA-1 en Google Cloud Console

### Paso 1: Agregar SHA-1 en Google Cloud Console

1. Ve a: **https://console.cloud.google.com/apis/credentials**
2. Busca el cliente Android: `378853205278-c2e1gcjn06mg857rcvprns01fu8pduat`
3. Haz clic para editarlo
4. En "SHA-1 certificate fingerprint":
   - Haz clic en **"+ Agregar huella digital"** o **"+ Add fingerprint"**
   - Pega: `F7:2B:AF:20:1C:84:29:93:30:07:00:5D:EB:1C:1E:95:F6:79:2C:E6`
   - Guarda los cambios

---

### Paso 2: Mantener SHA-1 Anterior (Si Está Configurado)

Si aún tienes el SHA-1 `4B:24:0F...` configurado en Google Cloud Console:
- **NO lo elimines**
- **Agrega** el nuevo SHA-1 (`F7:2B:AF...`) junto al anterior
- Puedes tener **múltiples SHA-1** configurados

**Ventaja**: Si tienes un APK anterior compilado con `4B:24:0F...`, seguirá funcionando.

---

### Paso 3: Esperar Propagación

Después de agregar el SHA-1:
- ⏱️ Espera **30 minutos** para que Google propague los cambios
- 🔄 Puede tardar hasta **1 hora** en algunos casos

---

### Paso 4: Compilar el APK

Después de agregar el SHA-1 y esperar:

```bash
cd /home/jerlibgnzlz/Escritorio/v0-project-setup-and-plan/amva-mobile
eas build --platform android --profile production
```

El nuevo APK usará el keystore `NYdiJY86HE` con SHA-1 `F7:2B:AF...`.

---

### Paso 5: Instalar y Probar

1. Descarga el nuevo APK
2. Desinstala la app anterior
3. Instala el nuevo APK
4. Prueba Google Login (debería funcionar después de esperar 30 minutos)

---

## 🔍 ¿Qué Pasó con los Otros Keystores?

Los keystores anteriores (`ZeEnL0LIUD`, `Z1yAtGGy9c`) pueden haber sido:
- Eliminados automáticamente por EAS
- Reemplazados por el nuevo keystore
- Ocultos por alguna razón

**No te preocupes**, el nuevo keystore funcionará igual de bien una vez que agregues el SHA-1.

---

## 📋 Checklist

- [ ] SHA-1 `F7:2B:AF...` agregado en Google Cloud Console
- [ ] SHA-1 `4B:24:0F...` mantenido (si estaba configurado)
- [ ] Esperado 30 minutos después de agregar SHA-1
- [ ] APK compilado con el nuevo keystore
- [ ] App desinstalada y reinstalada
- [ ] Google Login probado

---

## 🎯 Resumen

| Acción | Descripción |
|--------|-------------|
| Keystore actual | `NYdiJY86HE` con SHA-1 `F7:2B:AF...` |
| Acción necesaria | Agregar SHA-1 en Google Cloud Console |
| Tiempo de espera | 30 minutos después de agregar |
| Resultado | Google Login funcionará |

---

## 💡 Nota Importante

Si tienes un APK anterior compilado con el keystore `4B:24:0F...`:
- Ese APK seguirá funcionando si mantienes ese SHA-1 en Google Cloud Console
- Puedes tener **ambos SHA-1** configurados
- El nuevo APK usará el SHA-1 `F7:2B:AF...`

---

## 🚀 Próximos Pasos

1. **Agrega** el SHA-1 `F7:2B:AF:20:1C:84:29:93:30:07:00:5D:EB:1C:1E:95:F6:79:2C:E6` en Google Cloud Console
2. **Mantén** el SHA-1 `4B:24:0F...` si está configurado (para APKs anteriores)
3. **Espera** 30 minutos
4. **Compila** el nuevo APK
5. **Prueba** Google Login

¡Agrega el SHA-1 `F7:2B:AF...` en Google Cloud Console y todo funcionará!

