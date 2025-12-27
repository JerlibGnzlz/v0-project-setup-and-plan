# 🔧 Configuración Correcta: SHA-1 en Firebase vs Google Cloud Console

## 🎯 Respuesta Directa

**El SHA-1 debe estar en AMBOS lugares, pero de forma diferente:**

1. **Google Cloud Console**: El SHA-1 debe estar en el **cliente OAuth Android**
2. **Firebase Console**: El SHA-1 debe estar en la **app Android** (Firebase lo sincroniza automáticamente)

## ⚠️ El Problema Actual

Cuando intentas agregar el mismo SHA-1 en ambos lugares y aparece "cliente duplicado", significa que:

- Hay **DOS clientes OAuth** en Google Cloud Console con el mismo SHA-1 y package name
- O Firebase está intentando crear un cliente cuando ya existe uno

## ✅ Solución Correcta

### Opción 1: Configurar desde Firebase (Recomendado)

**Firebase sincroniza automáticamente con Google Cloud Console**, así que:

1. **Agrega el SHA-1 en Firebase Console**:
   - Ve a Firebase Console → Tu app Android
   - Haz clic en "Agregar huella digital"
   - Agrega: `4B:24:0F:1B:6A:E6:3D:71:38:77:D1:E7:69:40:D2:1D:5D:30:7C:40`
   - Firebase automáticamente lo sincroniza con Google Cloud Console

2. **Verifica en Google Cloud Console**:
   - Ve a Google Cloud Console → Credentials
   - El cliente OAuth Android debería tener el SHA-1 automáticamente
   - **NO agregues el SHA-1 manualmente aquí** si ya lo agregaste en Firebase

### Opción 2: Configurar desde Google Cloud Console

Si prefieres configurarlo manualmente:

1. **Agrega el SHA-1 en Google Cloud Console**:
   - Ve a Google Cloud Console → Credentials
   - Abre el cliente OAuth Android
   - Agrega el SHA-1: `4B:24:0F:1B:6A:E6:3D:71:38:77:D1:E7:69:40:D2:1D:5D:30:7C:40`
   - Guarda los cambios

2. **Descarga google-services.json desde Firebase**:
   - Ve a Firebase Console → Tu app Android
   - Descarga el archivo `google-services.json` actualizado
   - Reemplaza el archivo en tu proyecto

## 🔍 Verificación de Tu Configuración Actual

### En Google Cloud Console (Primera Imagen)

Veo que tienes:
- ✅ Cliente OAuth Android: `378853205278-c2e1gcjn06mg857rcvprns01fu8pduat`
- ✅ Package name: `org.vidaabundante.app`
- ✅ SHA-1: `4B:24:0F:1B:6A:E6:3D:71:38:77:D1:E7:69:40:D2:1D:5D:30:7C:40`
- ✅ Proyecto: `amva-auth` (parece ser el proyecto correcto)

**Estado**: ✅ Correcto

### En Firebase Console (Segunda Imagen)

Veo que tienes:
- ✅ App Android: `AMVA Móvil`
- ✅ Package name: `org.vidaabundante.app`
- ✅ SHA-1: `4b:24:0f:1b:6a:e6:3d:71:38:77:d1:e7:69:40:d2:1d:5d:30:7c:40` (mismo, en minúsculas)
- ✅ Proyecto: `amva-auth` (Firebase)

**Estado**: ✅ Correcto

## ⚠️ Problema: Proyectos Diferentes

**Veo que hay una diferencia importante:**

- **Google Cloud Console**: Proyecto `amva-auth`
- **Firebase Console**: Proyecto `amva-auth`

**Esto puede causar el error de cliente duplicado** si ambos proyectos tienen clientes OAuth con el mismo SHA-1 y package name.

## ✅ Solución: Verificar Proyectos Vinculados

### Paso 1: Verificar que Firebase y Google Cloud Estén Vinculados

1. **En Firebase Console**:
   - Ve a: Project Settings → General
   - Busca "Project ID" o "Google Cloud project"
   - Verifica que sea `amva-auth` o `amva-auth`

2. **En Google Cloud Console**:
   - Verifica qué proyecto estás usando
   - Debe ser el mismo que Firebase

### Paso 2: Usar el Mismo Proyecto en Ambos

**Opción A: Usar `amva-auth` (Firebase)**

1. En Google Cloud Console, cambia al proyecto `amva-auth`
2. Verifica que el cliente OAuth Android esté ahí
3. Si no está, créalo o sincroniza desde Firebase

**Opción B: Usar `amva-auth` (Google Cloud)**

1. En Firebase Console, verifica que esté vinculado a `amva-auth`
2. Si no, vincula Firebase al proyecto `amva-auth`

## 🎯 Configuración Correcta Final

### Lo que Debe Estar en Google Cloud Console

- ✅ **Un solo cliente OAuth Android** con:
  - Package name: `org.vidaabundante.app`
  - SHA-1: `4B:24:0F:1B:6A:E6:3D:71:38:77:D1:E7:69:40:D2:1D:5D:30:7C:40`
  - En el proyecto correcto (`amva-auth` o `amva-auth`, pero el mismo en ambos)

### Lo que Debe Estar en Firebase Console

- ✅ **App Android** con:
  - Package name: `org.vidaabundante.app`
  - SHA-1: `4B:24:0F:1B:6A:E6:3D:71:38:77:D1:E7:69:40:D2:1D:5D:30:7C:40`
  - En el mismo proyecto que Google Cloud Console

## 📋 Pasos para Resolver

### Paso 1: Identificar el Proyecto Correcto

1. ¿Cuál es tu proyecto principal?
   - `amva-auth` (Firebase)
   - `amva-auth` (Google Cloud)

### Paso 2: Eliminar Duplicados

1. **En Google Cloud Console**, revisa ambos proyectos:
   - `amva-auth`
   - `amva-auth`
2. **Identifica** qué proyecto tiene el cliente duplicado
3. **Elimina** el cliente del proyecto incorrecto

### Paso 3: Configurar Correctamente

1. **Usa el mismo proyecto** en Firebase y Google Cloud Console
2. **Agrega el SHA-1 en Firebase** (recomendado)
3. **Firebase sincronizará** automáticamente con Google Cloud Console
4. **NO agregues manualmente** en Google Cloud Console si ya lo agregaste en Firebase

## ✅ Resumen

**El SHA-1 debe estar en AMBOS lugares:**

1. **Google Cloud Console**: En el cliente OAuth Android (puede ser automático desde Firebase)
2. **Firebase Console**: En la app Android (lo agregas manualmente)

**Pero:**
- ✅ Debe ser el **mismo proyecto** en ambos lugares
- ✅ Solo debe haber **un cliente OAuth** con esa combinación SHA-1 + package name
- ✅ Si agregas en Firebase, Firebase sincroniza con Google Cloud automáticamente

## 🎯 Recomendación

**Usa Firebase Console para agregar el SHA-1** y deja que Firebase sincronice automáticamente con Google Cloud Console. Esto evita duplicados.

