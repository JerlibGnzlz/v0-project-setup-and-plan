# 🔑 Cómo Agregar Múltiples SHA-1 en Google Cloud Console

## 🎯 Problema

Google Cloud Console solo te permite agregar 1 SHA-1 a la vez, pero puedes agregar múltiples SHA-1 uno por uno.

---

## ✅ Solución: Agregar SHA-1 Uno por Uno

### Paso 1: Agregar el Primer SHA-1

1. Ve a: **https://console.cloud.google.com/apis/credentials**
2. Busca el cliente Android: `378853205278-c2e1gcjn06mg857rcvprns01fu8pduat`
3. Haz clic en el **nombre del cliente** para editarlo
4. En la sección **"SHA-1 certificate fingerprint"**:
   - Si ya hay un SHA-1, verás un campo de texto con el SHA-1 existente
   - Haz clic en **"+ Agregar huella digital"** o **"+ Add fingerprint"** (botón debajo del campo)
   - Aparecerá un **nuevo campo de texto vacío**
   - Pega el primer SHA-1: `4B:24:0F:1B:6A:E6:3D:71:38:77:D1:E7:69:40:D2:1D:5D:30:7C:40`
5. **NO guardes todavía** - Continúa con el siguiente paso

---

### Paso 2: Agregar el Segundo SHA-1

1. Después de agregar el primer SHA-1, verás que aparece un **nuevo campo vacío** debajo
2. O haz clic en **"+ Agregar huella digital"** de nuevo si no aparece automáticamente
3. Pega el segundo SHA-1: `9B:AF:07:1F:4A:A2:70:9C:E6:AB:79:E4:EC:ED:AE:22:CE:F6:DB:8A`
4. Ahora deberías tener **2 campos de texto** con los 2 SHA-1

---

### Paso 3: Guardar los Cambios

1. Desplázate hacia abajo en la página
2. Haz clic en **"Guardar"** o **"Save"** (botón azul en la parte inferior)
3. Espera a que se guarde (puede tardar unos segundos)

---

## 🔍 Si No Ves el Botón "+ Agregar huella digital"

### Opción 1: Buscar el Botón

El botón puede estar:
- **Debajo** del campo de SHA-1 existente
- **A la derecha** del campo de SHA-1
- En un menú **"..."** o **"Más opciones"**

### Opción 2: Eliminar y Reagregar

Si ya tienes un SHA-1 y quieres agregar otro:

1. **NO elimines** el SHA-1 existente
2. Busca el botón **"+ Agregar huella digital"** o **"+ Add fingerprint"**
3. Si no lo encuentras, intenta hacer clic en el **icono de "+"** o **"Agregar"** cerca del campo SHA-1

### Opción 3: Verificar que Estás en la Página Correcta

Asegúrate de estar en:
- **APIs & Services** → **Credentials**
- Cliente de tipo **"Android"** (no "Web application" ni "iOS")
- La página de **edición** del cliente (no la lista de clientes)

---

## 📋 Pasos Detallados con Capturas de Pantalla

### 1. Ir a Credentials

1. Ve a: https://console.cloud.google.com/apis/credentials
2. Inicia sesión si es necesario

### 2. Buscar el Cliente Android

1. En la lista de credenciales, busca: `378853205278-c2e1gcjn06mg857rcvprns01fu8pduat`
2. O busca por nombre: "AMVA Android Client"
3. Haz clic en el **nombre** o en el **icono de edición** (lápiz)

### 3. Editar SHA-1

1. Desplázate hasta la sección **"SHA-1 certificate fingerprint"**
2. Verás un campo de texto con el SHA-1 actual (si hay uno)
3. Debajo del campo, busca el botón **"+ Agregar huella digital"** o **"+ Add fingerprint"**
4. Haz clic en ese botón

### 4. Agregar Primer SHA-1

1. Aparecerá un **nuevo campo de texto vacío**
2. Pega: `4B:24:0F:1B:6A:E6:3D:71:38:77:D1:E7:69:40:D2:1D:5D:30:7C:40`

### 5. Agregar Segundo SHA-1

1. Haz clic en **"+ Agregar huella digital"** de nuevo
2. Aparecerá otro campo vacío
3. Pega: `9B:AF:07:1F:4A:A2:70:9C:E6:AB:79:E4:EC:ED:AE:22:CE:F6:DB:8A`

### 6. Guardar

1. Desplázate hacia abajo
2. Haz clic en **"Guardar"** o **"Save"**

---

## 🐛 Si Aún No Puedes Agregar el Segundo SHA-1

### Solución Alternativa: Agregar Uno por Vez

1. **Agrega el primero**: `4B:24:0F:1B:6A:E6:3D:71:38:77:D1:E7:69:40:D2:1D:5D:30:7C:40`
2. **Guarda** los cambios
3. **Espera** unos segundos
4. **Vuelve a editar** el cliente
5. **Agrega el segundo**: `9B:AF:07:1F:4A:A2:70:9C:E6:AB:79:E4:EC:ED:AE:22:CE:F6:DB:8A`
6. **Guarda** de nuevo

---

## ✅ Verificación

Después de guardar, deberías ver:

```
SHA-1 certificate fingerprint:
  • 4B:24:0F:1B:6A:E6:3D:71:38:77:D1:E7:69:40:D2:1D:5D:30:7C:40
  • 9B:AF:07:1F:4A:A2:70:9C:E6:AB:79:E4:EC:ED:AE:22:CE:F6:DB:8A
```

O una lista con ambos SHA-1 listados.

---

## 💡 Consejo

Si la interfaz de Google Cloud Console no te permite agregar múltiples SHA-1 fácilmente:

1. **Agrega primero el más importante**: `4B:24:0F...` (el que usa tu APK actual)
2. **Guarda** y **espera** 30 minutos
3. **Prueba** el login con Google
4. Si funciona, puedes agregar el segundo después cuando compiles un nuevo APK

---

## 📋 Checklist

- [ ] Primer SHA-1 agregado (`4B:24:0F...`)
- [ ] Segundo SHA-1 agregado (`9B:AF:07...`) - Si es posible
- [ ] Cambios guardados
- [ ] Ambos SHA-1 visibles en la lista
- [ ] Esperado 30 minutos después de guardar

---

## 🚀 Después de Agregar

1. Espera **30 minutos** para que Google propague los cambios
2. Haz una **reinstalación limpia** de la app
3. Prueba el **login con Google**

Debería funcionar con al menos el primer SHA-1 (`4B:24:0F...`).

