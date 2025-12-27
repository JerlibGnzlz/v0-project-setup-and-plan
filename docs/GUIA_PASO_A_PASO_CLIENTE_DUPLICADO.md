# 🔧 Guía Paso a Paso: Resolver Cliente OAuth Duplicado

## 🎯 Objetivo

Eliminar el cliente OAuth duplicado que está causando el error en Firebase.

**Error**: "Otro proyecto contiene un cliente de OAuth 2.0 que usa esta misma combinación de huella digital SHA-1 y nombre de paquete."

**SHA-1**: `4B:24:0F:1B:6A:E6:3D:71:38:77:D1:E7:69:40:D2:1D:5D:30:7C:40`  
**Package Name**: `org.vidaabundante.app`

## 📋 Paso 1: Abrir Google Cloud Console

1. **Abre tu navegador** y ve a:
   ```
   https://console.cloud.google.com/apis/credentials
   ```

2. **Inicia sesión** con tu cuenta de Google (la misma que usas para Firebase)

## 📋 Paso 2: Revisar Todos los Proyectos

### 2.1. Ver Selector de Proyectos

1. En la **parte superior** de la página, verás un **selector de proyectos**
2. Haz clic en el selector (muestra el nombre del proyecto actual)

### 2.2. Ver Lista de Proyectos

Verás una lista de todos tus proyectos de Google Cloud. Anota los nombres de todos los proyectos que veas.

### 2.3. Proyectos Comunes a Revisar

Busca proyectos con nombres como:
- `amva-auth` (tu proyecto actual) ✅ **NO eliminar este**
- Proyectos anteriores relacionados
- Proyectos de prueba o desarrollo
- Proyectos con nombres similares

## 📋 Paso 3: Revisar Cada Proyecto

Para **cada proyecto** en tu lista (excepto `amva-auth`):

### 3.1. Seleccionar el Proyecto

1. Haz clic en el nombre del proyecto en el selector
2. Espera a que cargue el proyecto

### 3.2. Ir a Credentials

1. En el menú lateral izquierdo, busca **"APIs & Services"**
2. Haz clic en **"Credentials"** (o "Credenciales")

### 3.3. Buscar Cliente Android OAuth

1. En la página de Credentials, busca la sección **"OAuth 2.0 Client IDs"**
2. Busca clientes de tipo **"Android"**
3. Haz clic en cada cliente Android para ver sus detalles

### 3.4. Verificar SHA-1 y Package Name

Para cada cliente Android, verifica:

- **Package name**: ¿Es `org.vidaabundante.app`?
- **SHA-1 certificate fingerprint**: ¿Aparece `4B:24:0F:1B:6A:E6:3D:71:38:77:D1:E7:69:40:D2:1D:5D:30:7C:40`?

### 3.5. Si Encuentras el Cliente Duplicado

Si encuentras un cliente con:
- ✅ Package name: `org.vidaabundante.app`
- ✅ SHA-1: `4B:24:0F:1B:6A:E6:3D:71:38:77:D1:E7:69:40:D2:1D:5D:30:7C:40`
- ✅ Y **NO es** el proyecto `amva-auth`

**Este es el cliente duplicado que debes eliminar.**

## 📋 Paso 4: Eliminar el Cliente Duplicado

### 4.1. Abrir el Cliente Duplicado

1. Haz clic en el cliente Android duplicado
2. Se abrirá una página con los detalles del cliente

### 4.2. Verificar Antes de Eliminar

**IMPORTANTE**: Antes de eliminar, verifica:
- ❓ ¿Este proyecto está en uso?
- ❓ ¿Es un proyecto antiguo que ya no necesitas?
- ❓ ¿Es un proyecto de prueba o desarrollo?

**Si no estás seguro**, anota el **Client ID** y el **nombre del proyecto** antes de eliminar.

### 4.3. Eliminar el Cliente

**Opción A: Eliminar Solo el SHA-1** (si el cliente tiene otros SHA-1)

1. En la sección **"SHA-1 certificate fingerprint"**
2. Busca el SHA-1: `4B:24:0F:1B:6A:E6:3D:71:38:77:D1:E7:69:40:D2:1D:5D:30:7C:40`
3. Haz clic en el **icono de eliminar** (🗑️) junto a ese SHA-1
4. Haz clic en **"Save"** (Guardar)

**Opción B: Eliminar el Cliente Completo** (si solo tiene ese SHA-1 o no lo necesitas)

1. En la parte superior de la página, haz clic en **"Delete"** (Eliminar)
2. Confirma la eliminación
3. El cliente será eliminado

## 📋 Paso 5: Verificar el Proyecto Correcto

### 5.1. Seleccionar el Proyecto Correcto

1. Ve al proyecto **`amva-auth`** (tu proyecto actual)
2. Ve a: **APIs & Services** → **Credentials**

### 5.2. Verificar que el Cliente Esté Configurado

1. Busca el cliente Android: `378853205278-c2e1gcjn06mg857rcvprns01fu8pduat`
2. Haz clic para ver sus detalles
3. Verifica que tenga:
   - ✅ Package name: `org.vidaabundante.app`
   - ✅ SHA-1: `4B:24:0F:1B:6A:E6:3D:71:38:77:D1:E7:69:40:D2:1D:5D:30:7C:40`

### 5.3. Si Falta el SHA-1

Si el cliente en `amva-auth` **NO tiene** el SHA-1:

1. Haz clic en **"Edit"** (Editar)
2. En **"SHA-1 certificate fingerprint"**, haz clic en **"+ Add fingerprint"**
3. Agrega: `4B:24:0F:1B:6A:E6:3D:71:38:77:D1:E7:69:40:D2:1D:5D:30:7C:40`
4. Haz clic en **"Save"** (Guardar)

## 📋 Paso 6: Esperar y Verificar en Firebase

### 6.1. Esperar Sincronización

1. **Espera 5-10 minutos** después de eliminar el cliente duplicado
2. Google necesita tiempo para sincronizar los cambios

### 6.2. Verificar en Firebase

1. Ve a: https://console.firebase.google.com/project/amva-auth/settings/general
2. Ve a **"Your apps"** → Selecciona la app Android
3. Busca **"SHA certificate fingerprints"**
4. Intenta agregar el SHA-1: `4B:24:0F:1B:6A:E6:3D:71:38:77:D1:E7:69:40:D2:1D:5D:30:7C:40`
5. **Si ya no aparece el error**, ¡está resuelto! ✅

## ✅ Checklist Completo

- [ ] Abrir Google Cloud Console
- [ ] Revisar todos los proyectos
- [ ] Identificar el proyecto con el cliente duplicado
- [ ] Verificar que NO sea `amva-auth`
- [ ] Eliminar el cliente duplicado o solo el SHA-1
- [ ] Verificar que `amva-auth` tenga el cliente correcto
- [ ] Agregar SHA-1 en `amva-auth` si falta
- [ ] Esperar 5-10 minutos
- [ ] Verificar en Firebase que el error desapareció

## ⚠️ Precauciones Importantes

### NO Eliminar

- ❌ **NO elimines** el cliente del proyecto `amva-auth`
- ❌ **NO elimines** si no estás seguro de qué proyecto es

### SÍ Eliminar

- ✅ Cliente en proyectos antiguos que ya no usas
- ✅ Cliente en proyectos de prueba o desarrollo
- ✅ Cliente duplicado en proyectos incorrectos

## 🎯 Resultado Esperado

Después de seguir estos pasos:

- ✅ El cliente duplicado estará eliminado
- ✅ Solo `amva-auth` tendrá esa combinación SHA-1 + package name
- ✅ El error en Firebase desaparecerá
- ✅ Podrás agregar el SHA-1 en Firebase sin problemas
- ✅ Google OAuth funcionará correctamente

## 📝 Notas Adicionales

### Si No Encuentras el Cliente Duplicado

1. Verifica que estés revisando **todos** los proyectos
2. Busca también en proyectos que puedan tener nombres diferentes
3. Si aún no lo encuentras, puede ser un problema de caché
4. Espera 30 minutos y vuelve a intentar en Firebase

### Si Tienes Dudas

1. Anota el **Client ID** del cliente antes de eliminar
2. Anota el **nombre del proyecto** donde está
3. Puedes restaurarlo más tarde si es necesario

## 🎉 Siguiente Paso

Una vez resuelto el cliente duplicado:

1. ✅ Descarga el APK existente: https://expo.dev/artifacts/eas/aXpxxM3bqffGfC1wgryc1D.apk
2. ✅ Instálalo en tu teléfono
3. ✅ Prueba Google OAuth
4. ✅ Debería funcionar correctamente

