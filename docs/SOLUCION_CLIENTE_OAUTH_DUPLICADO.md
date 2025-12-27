# 🔧 Solución: Cliente OAuth 2.0 Duplicado

## ⚠️ Error en Firebase

```
Otro proyecto contiene un cliente de OAuth 2.0 que usa esta misma 
combinación de huella digital SHA-1 y nombre de paquete.
```

**SHA-1**: `4B:24:0F:1B:6A:E6:3D:71:38:77:D1:E7:69:40:D2:1D:5D:30:7C:40`  
**Package Name**: `org.vidaabundante.app`

## 🔍 Causa del Problema

Este error ocurre cuando:
- ✅ El mismo SHA-1 + package name están en **múltiples proyectos** de Google Cloud/Firebase
- ✅ Puede ser un proyecto anterior o duplicado
- ✅ Google no permite la misma combinación en diferentes proyectos

## ✅ Solución: Identificar y Eliminar el Cliente Duplicado

### Paso 1: Identificar Qué Proyecto Tiene el Cliente Duplicado

1. **Ve a Google Cloud Console**:
   - https://console.cloud.google.com/apis/credentials

2. **Cambia entre proyectos**:
   - En la parte superior, haz clic en el selector de proyectos
   - Revisa **TODOS** tus proyectos de Google Cloud

3. **Para cada proyecto**:
   - Ve a **"APIs & Services"** → **"Credentials"**
   - Busca clientes OAuth 2.0 de tipo **"Android"**
   - Busca el que tenga:
     - Package name: `org.vidaabundante.app`
     - SHA-1: `4B:24:0F:1B:6A:E6:3D:71:38:77:D1:E7:69:40:D2:1D:5D:30:7C:40`

### Paso 2: Decidir Qué Hacer con el Cliente Duplicado

#### Opción A: Eliminar el Cliente del Proyecto Incorrecto (Recomendado)

Si encuentras el cliente en un proyecto que **NO es** `amva-digital`:

1. **Abre ese proyecto** en Google Cloud Console
2. **Ve a**: APIs & Services → Credentials
3. **Busca el cliente Android** con ese SHA-1 y package name
4. **Haz clic en el cliente** para editarlo
5. **Elimina el SHA-1** o **elimina el cliente completo** si no lo necesitas
6. **Guarda los cambios**

#### Opción B: Mover el Cliente al Proyecto Correcto

Si el cliente está en un proyecto que **SÍ necesitas** pero es diferente:

1. **Anota el Client ID** del cliente duplicado
2. **Elimina el cliente** del proyecto incorrecto
3. **Agrega el SHA-1** en el proyecto correcto (`amva-digital`)

### Paso 3: Verificar en el Proyecto Correcto

1. **Ve al proyecto correcto**: `amva-digital`
2. **Ve a**: https://console.cloud.google.com/apis/credentials?project=amva-digital
3. **Busca el cliente Android**: `378853205278-c2e1gcjn06mg857rcvprns01fu8pduat`
4. **Verifica que tenga**:
   - Package name: `org.vidaabundante.app`
   - SHA-1: `4B:24:0F:1B:6A:E6:3D:71:38:77:D1:E7:69:40:D2:1D:5D:30:7C:40`

## 🔍 Método Alternativo: Buscar en Todos los Proyectos

### Usando Google Cloud Console

1. **Ve a**: https://console.cloud.google.com/apis/credentials
2. **En la parte superior**, haz clic en el **selector de proyectos**
3. **Revisa cada proyecto** de la lista:
   - Haz clic en cada proyecto
   - Ve a **"APIs & Services"** → **"Credentials"**
   - Busca clientes OAuth 2.0 de tipo Android
   - Busca el que tenga el SHA-1 `4B:24:0F...`

### Usando Firebase Console

1. **Ve a**: https://console.firebase.google.com/
2. **Revisa cada proyecto** de Firebase:
   - Haz clic en cada proyecto
   - Ve a **"Project Settings"** → **"Your apps"**
   - Busca apps Android con package name `org.vidaabundante.app`
   - Verifica los SHA-1 configurados

## ⚠️ Precauciones

### Antes de Eliminar

1. **Verifica que el proyecto** donde está el cliente duplicado **NO esté en uso**
2. **Asegúrate de que** el proyecto correcto (`amva-digital`) tenga el cliente configurado
3. **No elimines** si no estás seguro de qué proyecto es el correcto

### Si No Estás Seguro

1. **Anota el Client ID** del cliente duplicado
2. **Verifica en qué proyecto** está ese Client ID
3. **Si es un proyecto antiguo** que no usas → Elimínalo
4. **Si es un proyecto activo** → Contacta al administrador del proyecto

## ✅ Pasos Específicos para Tu Caso

### 1. Identificar el Proyecto Duplicado

```bash
# Ve a Google Cloud Console y revisa estos proyectos comunes:
- amva-digital (tu proyecto actual)
- Cualquier proyecto anterior relacionado
- Proyectos de prueba o desarrollo
```

### 2. Eliminar el Cliente Duplicado

1. **Abre el proyecto** donde está el cliente duplicado
2. **Ve a**: APIs & Services → Credentials
3. **Busca el cliente Android** con:
   - Package: `org.vidaabundante.app`
   - SHA-1: `4B:24:0F:1B:6A:E6:3D:71:38:77:D1:E7:69:40:D2:1D:5D:30:7C:40`
4. **Elimina ese cliente** o elimina solo ese SHA-1
5. **Guarda los cambios**

### 3. Verificar en Firebase

1. **Ve a**: https://console.firebase.google.com/project/amva-digital/settings/general
2. **Ve a**: "Your apps" → Selecciona app Android
3. **Intenta agregar el SHA-1** nuevamente
4. **Si aún aparece el error**, espera unos minutos y vuelve a intentar

## 🎯 Solución Rápida

### Si Encuentras el Cliente Duplicado

1. **Elimínalo** del proyecto incorrecto
2. **Espera 5-10 minutos** para que Google sincronice
3. **Vuelve a Firebase** e intenta agregar el SHA-1 nuevamente
4. **Debería funcionar** ahora

### Si No Encuentras el Cliente Duplicado

1. **Verifica que** el SHA-1 esté en el proyecto correcto (`amva-digital`)
2. **Espera 30 minutos** y vuelve a intentar
3. **Si persiste**, puede ser un problema de caché de Google
4. **Contacta soporte de Firebase** si el problema continúa

## 📋 Checklist de Resolución

- [ ] Identificar qué proyecto tiene el cliente duplicado
- [ ] Verificar que el proyecto correcto (`amva-digital`) tenga el cliente
- [ ] Eliminar el cliente del proyecto incorrecto
- [ ] Esperar 5-10 minutos para sincronización
- [ ] Intentar agregar el SHA-1 en Firebase nuevamente
- [ ] Verificar que funcione correctamente

## 🎉 Resultado Esperado

Después de eliminar el cliente duplicado:

- ✅ El error desaparecerá en Firebase
- ✅ Podrás agregar el SHA-1 sin problemas
- ✅ Google OAuth funcionará correctamente
- ✅ Solo un proyecto tendrá esa combinación SHA-1 + package name

## ⚠️ Nota Importante

**NO elimines el cliente** del proyecto `amva-digital` (tu proyecto actual).  
Solo elimina el cliente del proyecto **incorrecto** o **duplicado**.

## 📝 Próximos Pasos

1. **Revisa todos tus proyectos** en Google Cloud Console
2. **Identifica** cuál tiene el cliente duplicado
3. **Elimínalo** del proyecto incorrecto
4. **Espera** unos minutos
5. **Vuelve a intentar** en Firebase

