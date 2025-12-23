# 🔍 Problema: Keystores Anteriores Desaparecieron

## 🔴 Situación Actual

Tienes **2 keystores nuevos**:
1. **AXSye1dRA5 (Default)** - SHA-1: `BC:0C:2C:C3:68:D1:50:C3:7E:07:17:EE:49:8F:D0:35:7D:0F:1E:E3` (nuevo, hace 2 segundos)
2. **NYdiJY86HE** - SHA-1: `F7:2B:AF:20:1C:84:29:93:30:07:00:5D:EB:1C:1E:95:F6:79:2C:E6` (hace 45 minutos)

**Los keystores anteriores desaparecieron**:
- ❌ `ZeEnL0LIUD` con SHA-1 `4B:24:0F...` (el que funcionaba)
- ❌ `Z1yAtGGy9c` con SHA-1 `9B:AF:07...`

---

## 🔍 ¿Qué Pasó?

EAS puede crear **nuevos keystores automáticamente** cuando:
- Se ejecuta un build
- Se cambia la configuración
- Se regeneran los archivos nativos con `prebuild`

**Problema**: Cada keystore nuevo tiene un SHA-1 diferente, y si no está en Google Cloud Console, Google Login no funcionará.

---

## ✅ Solución: Agregar SHA-1 del Keystore Actual

### Opción 1: Usar el Keystore Default Actual (Recomendado)

El keystore default actual es `AXSye1dRA5` con SHA-1 `BC:0C:2C:C3:68:D1:50:C3:7E:07:17:EE:49:8F:D0:35:7D:0F:1E:E3`.

**Pasos**:

1. **Agrega este SHA-1 en Google Cloud Console**:
   - Ve a: https://console.cloud.google.com/apis/credentials
   - Busca el cliente Android: `378853205278-c2e1gcjn06mg857rcvprns01fu8pduat`
   - Agrega: `BC:0C:2C:C3:68:D1:50:C3:7E:07:17:EE:49:8F:D0:35:7D:0F:1E:E3`
   - Guarda los cambios

2. **Mantén el SHA-1 anterior** (`4B:24:0F...`) si está configurado:
   - Para que los APKs anteriores sigan funcionando
   - Puedes tener múltiples SHA-1 configurados

3. **Espera 30 minutos** después de agregar el SHA-1

4. **Compila el APK**:
   ```bash
   eas build --platform android --profile production
   ```

5. **Instala y prueba** Google Login

---

### Opción 2: Agregar Ambos SHA-1 Nuevos

Si quieres que funcionen ambos keystores nuevos:

1. **Agrega ambos SHA-1** en Google Cloud Console:
   - `BC:0C:2C:C3:68:D1:50:C3:7E:07:17:EE:49:8F:D0:35:7D:0F:1E:E3` (default actual)
   - `F7:2B:AF:20:1C:84:29:93:30:07:00:5D:EB:1C:1E:95:F6:79:2C:E6` (el otro)

2. **Mantén el SHA-1 anterior** (`4B:24:0F...`) si está configurado

3. **Espera 30 minutos**

4. **Compila y prueba**

---

## 🎯 Recomendación

**Usa el keystore default actual** (`AXSye1dRA5`):

1. **Agrega** el SHA-1 `BC:0C:2C:C3:68:D1:50:C3:7E:07:17:EE:49:8F:D0:35:7D:0F:1E:E3` en Google Cloud Console
2. **Mantén** el SHA-1 `4B:24:0F...` si está configurado (para APKs anteriores)
3. **Espera** 30 minutos
4. **Compila** el nuevo APK
5. **Funcionará** con Google Login

---

## 📋 Resumen de Keystores

| Nombre | SHA-1 | Estado | Acción |
|--------|-------|--------|--------|
| **AXSye1dRA5** (Default) | `BC:0C:2C...` | ✅ Actual | **Agregar SHA-1** |
| **NYdiJY86HE** | `F7:2B:AF...` | ⚠️ No default | Agregar SHA-1 (opcional) |
| ~~ZeEnL0LIUD~~ | ~~`4B:24:0F...`~~ | ❌ Desaparecido | Mantener SHA-1 si está configurado |

---

## 💡 Por Qué Desaparecieron

Los keystores anteriores pueden haber sido:
- **Eliminados automáticamente** por EAS
- **Reemplazados** por nuevos keystores
- **Ocultos** por alguna razón

**No te preocupes**, los nuevos keystores funcionarán igual de bien una vez que agregues el SHA-1.

---

## 🚀 Próximos Pasos

1. **Agrega** el SHA-1 `BC:0C:2C:C3:68:D1:50:C3:7E:07:17:EE:49:8F:D0:35:7D:0F:1E:E3` en Google Cloud Console
2. **Mantén** el SHA-1 `4B:24:0F...` si está configurado (para APKs anteriores)
3. **Espera** 30 minutos
4. **Compila** el nuevo APK
5. **Prueba** Google Login

---

## ⚠️ Nota Importante

**Cada vez que EAS crea un nuevo keystore**, necesitarás agregar su SHA-1 en Google Cloud Console. Para evitar esto en el futuro:

1. **No ejecutes** `eas credentials` innecesariamente
2. **No cambies** el keystore default a menos que sea necesario
3. **Mantén** el mismo keystore para todos los builds

---

## ✅ Resumen

| Problema | Solución |
|----------|----------|
| Keystores anteriores desaparecieron | Agregar SHA-1 del keystore actual |
| SHA-1 no configurado | Agregar en Google Cloud Console |
| Google Login no funciona | Esperar 30 min después de agregar SHA-1 |

¡Agrega el SHA-1 `BC:0C:2C...` en Google Cloud Console y todo funcionará!

