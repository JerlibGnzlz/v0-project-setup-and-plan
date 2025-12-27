# 🔍 Dónde Encontrar el Cliente Duplicado para Eliminarlo

## 🎯 Ubicación Exacta: Google Cloud Console

El cliente OAuth duplicado está en **Google Cloud Console**, no en Firebase Console.

## 📋 Paso a Paso: Encontrar el Cliente Duplicado

### Paso 1: Abrir Google Cloud Console

1. **Abre tu navegador**
2. **Ve a**: https://console.cloud.google.com/apis/credentials
3. **Inicia sesión** con tu cuenta de Google (la misma que usas para Firebase)

### Paso 2: Ver Todos los Proyectos

1. En la **parte superior** de la página, verás un **selector de proyectos**
2. Haz clic en el selector (muestra el nombre del proyecto actual)
3. Se abrirá una lista con **todos tus proyectos** de Google Cloud
4. **Anota los nombres** de todos los proyectos que veas

### Paso 3: Revisar Cada Proyecto (Excepto `amva-auth`)

Para **cada proyecto** en tu lista (excepto `amva-auth`):

#### 3.1. Seleccionar el Proyecto

1. Haz clic en el nombre del proyecto en el selector
2. Espera a que cargue el proyecto

#### 3.2. Ir a Credentials

1. En el **menú lateral izquierdo**, busca **"APIs & Services"**
2. Haz clic en **"Credentials"** (o "Credenciales" si está en español)
3. O ve directamente a: `https://console.cloud.google.com/apis/credentials?project=[NOMBRE-DEL-PROYECTO]`

#### 3.3. Buscar Cliente Android OAuth

1. En la página de Credentials, busca la sección **"OAuth 2.0 Client IDs"**
2. Verás una lista de clientes OAuth
3. Busca clientes de tipo **"Android"** (no "Web application" ni "iOS")

#### 3.4. Ver Detalles de Cada Cliente Android

1. Haz clic en cada cliente Android para ver sus detalles
2. Se abrirá una página con la información del cliente

#### 3.5. Verificar si Es el Duplicado

Busca estos datos en el cliente:

- **Application type**: Debe ser "Android"
- **Package name**: ¿Es `org.vidaabundante.app`?
- **SHA-1 certificate fingerprint**: ¿Aparece `4B:24:0F:1B:6A:E6:3D:71:38:77:D1:E7:69:40:D2:1D:5D:30:7C:40`?

**Si encuentras un cliente con**:
- ✅ Package name: `org.vidaabundante.app`
- ✅ SHA-1: `4B:24:0F:1B:6A:E6:3D:71:38:77:D1:E7:69:40:D2:1D:5D:30:7C:40`
- ✅ Y **NO es** el proyecto `amva-auth`

**Este es el cliente duplicado que debes eliminar.**

## 📍 Ubicación Exacta en la Página

### Estructura de la Página de Credentials

```
Google Cloud Console
├── APIs & Services (menú lateral)
│   └── Credentials
│       ├── API Keys
│       ├── OAuth 2.0 Client IDs  ← AQUÍ está el cliente
│       │   ├── Cliente Android 1
│       │   ├── Cliente Android 2  ← Puede estar aquí
│       │   └── Cliente Web
│       └── Service Accounts
```

### Cómo Identificar el Cliente Duplicado

Cuando hagas clic en un cliente Android, verás una página con:

```
OAuth 2.0 Client ID Details

Name: [Nombre del cliente]
Application type: Android
Package name: org.vidaabundante.app  ← Verifica esto
SHA-1 certificate fingerprint:
  4B:24:0F:1B:6A:E6:3D:71:38:77:D1:E7:69:40:D2:1D:5D:30:7C:40  ← Verifica esto
```

## 🎯 Proyectos Comunes Donde Puede Estar

### Proyectos a Revisar

1. **Proyectos antiguos** relacionados con tu app
2. **Proyectos de prueba** o desarrollo
3. **Proyectos con nombres similares** a `amva-auth`
4. **Proyectos que creaste** antes de `amva-auth`

### Proyecto que NO Debes Tocar

- ❌ **`amva-auth`** - Este es tu proyecto correcto, NO elimines nada aquí

## 🔍 Método Rápido: Buscar por Package Name

### Opción 1: Buscar en Cada Proyecto

1. Ve a cada proyecto en Google Cloud Console
2. Ve a: **APIs & Services** → **Credentials**
3. Busca clientes Android con package name `org.vidaabundante.app`

### Opción 2: Buscar por Client ID (Si Lo Conoces)

Si conoces el Client ID del cliente duplicado:

1. Ve a: https://console.cloud.google.com/apis/credentials
2. Busca el Client ID en la lista
3. Haz clic para ver en qué proyecto está

## 📋 Checklist para Encontrar el Cliente Duplicado

- [ ] Abrir Google Cloud Console
- [ ] Ver lista de todos los proyectos
- [ ] Para cada proyecto (excepto `amva-auth`):
  - [ ] Seleccionar el proyecto
  - [ ] Ir a APIs & Services → Credentials
  - [ ] Buscar sección "OAuth 2.0 Client IDs"
  - [ ] Buscar clientes de tipo "Android"
  - [ ] Verificar package name y SHA-1
- [ ] Identificar el cliente duplicado
- [ ] Verificar que NO sea del proyecto `amva-auth`

## 🎯 Una Vez Encontrado el Cliente Duplicado

### Eliminar el Cliente

1. **Haz clic en el cliente** Android duplicado
2. Se abrirá la página de detalles
3. **Opción A**: Eliminar solo el SHA-1
   - Busca el SHA-1: `4B:24:0F:1B:6A:E6:3D:71:38:77:D1:E7:69:40:D2:1D:5D:30:7C:40`
   - Haz clic en el icono de eliminar (🗑️) junto a ese SHA-1
   - Haz clic en **"Save"** (Guardar)
4. **Opción B**: Eliminar el cliente completo
   - Haz clic en **"Delete"** (Eliminar) en la parte superior
   - Confirma la eliminación

## ⚠️ Precauciones

### Antes de Eliminar

1. **Verifica el nombre del proyecto** donde está el cliente
2. **Si es `amva-auth`**: ❌ **NO ELIMINES**
3. **Si es otro proyecto**: ✅ Puedes eliminar

### Después de Eliminar

1. **Espera 5-10 minutos** para sincronización
2. **Ve a Firebase Console** e intenta agregar el SHA-1
3. **Si ya no aparece el error**: ✅ Éxito

## 📝 Resumen de Ubicación

**Dónde buscar**:
- ✅ Google Cloud Console (NO Firebase Console)
- ✅ Cada proyecto en tu lista (excepto `amva-auth`)
- ✅ APIs & Services → Credentials
- ✅ Sección "OAuth 2.0 Client IDs"
- ✅ Clientes de tipo "Android"

**Qué buscar**:
- ✅ Package name: `org.vidaabundante.app`
- ✅ SHA-1: `4B:24:0F:1B:6A:E6:3D:71:38:77:D1:E7:69:40:D2:1D:5D:30:7C:40`

**Qué NO tocar**:
- ❌ Proyecto `amva-auth`
- ❌ Cliente en `amva-auth`

## 🎉 Siguiente Paso

Una vez que encuentres y elimines el cliente duplicado:

1. ✅ Espera 5-10 minutos
2. ✅ Verifica en Firebase Console que el error desapareció
3. ✅ Descarga el APK y prueba Google OAuth

