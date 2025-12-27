# 🔄 Firebase vs Google Cloud Console: Sincronización

## ⚠️ Problema Potencial: Desincronización

**SÍ, es posible que Firebase y Google Cloud Console NO estén sincronizados.**

Esto puede causar que Google OAuth no funcione aunque todo parezca estar bien configurado.

## 🔍 Cómo Funcionan Juntos

### Firebase Console
- ✅ Genera el archivo `google-services.json`
- ✅ Incluye SHA-1 en el archivo cuando los agregas en Firebase
- ⚠️ **PERO** Firebase NO configura automáticamente Google Cloud Console

### Google Cloud Console
- ✅ Es donde Google OAuth realmente verifica los SHA-1
- ✅ Debe tener los mismos SHA-1 que Firebase
- ⚠️ **Si falta aquí, Google OAuth NO funcionará**

## 🎯 El Problema Común

### Escenario 1: SHA-1 Solo en Firebase

```
Firebase Console:
  ✅ SHA-1: 4B:24:0F... (en google-services.json)
  
Google Cloud Console:
  ❌ SHA-1: 4B:24:0F... (NO está configurado)
  
Resultado: ❌ Google OAuth NO funciona
```

### Escenario 2: SHA-1 Solo en Google Cloud Console

```
Firebase Console:
  ❌ SHA-1: 4B:24:0F... (NO está en google-services.json)
  
Google Cloud Console:
  ✅ SHA-1: 4B:24:0F... (está configurado)
  
Resultado: ⚠️ Puede funcionar, pero google-services.json está incompleto
```

### Escenario 3: SHA-1 en Ambos (Correcto)

```
Firebase Console:
  ✅ SHA-1: 4B:24:0F... (en google-services.json)
  
Google Cloud Console:
  ✅ SHA-1: 4B:24:0F... (está configurado)
  
Resultado: ✅ Google OAuth funciona correctamente
```

## 🔍 Cómo Verificar la Sincronización

### Paso 1: Verificar SHA-1 en Firebase

1. Ve a: https://console.firebase.google.com/project/amva-auth/settings/general
2. Ve a la sección **"Tus aplicaciones"**
3. Selecciona la app Android
4. Busca **"Huellas digitales del certificado SHA"**
5. Anota los SHA-1 que aparecen

### Paso 2: Verificar SHA-1 en Google Cloud Console

1. Ve a: https://console.cloud.google.com/apis/credentials
2. Busca el cliente Android: `378853205278-c2e1gcjn06mg857rcvprns01fu8pduat`
3. Haz clic para editarlo
4. Busca **"SHA-1 certificate fingerprint"**
5. Anota los SHA-1 que aparecen

### Paso 3: Comparar

Compara los SHA-1 de ambos lugares:

| SHA-1 | En Firebase | En Google Cloud Console | Estado |
|-------|------------|------------------------|--------|
| `4B:24:0F:1B:6A:E6:3D:71:38:77:D1:E7:69:40:D2:1D:5D:30:7C:40` | ✅ | ❓ | Verificar |
| `BC:0C:2C:C3:68:D1:50:C3:7E:07:17:EE:49:8F:D0:35:7D:0F:1E:E3` | ✅ | ❓ | Verificar |

## ⚠️ Problemas Comunes de Desincronización

### Problema 1: SHA-1 Agregado Solo en Firebase

**Síntoma**: 
- `google-services.json` tiene el SHA-1
- Google OAuth NO funciona
- Error: `DEVELOPER_ERROR` o `10: ...`

**Solución**:
1. Ve a Google Cloud Console
2. Agrega el SHA-1 manualmente al cliente Android OAuth
3. Espera 30 minutos para propagación

### Problema 2: SHA-1 Agregado Solo en Google Cloud Console

**Síntoma**:
- Google OAuth funciona
- Pero `google-services.json` no tiene el SHA-1
- Puede causar problemas en builds futuros

**Solución**:
1. Ve a Firebase Console
2. Agrega el SHA-1 en la configuración de la app Android
3. Descarga el nuevo `google-services.json`
4. Reemplaza el archivo en tu proyecto

### Problema 3: Proyectos No Vinculados

**Síntoma**:
- Firebase y Google Cloud Console parecen ser proyectos diferentes
- Los SHA-1 no se sincronizan automáticamente

**Solución**:
1. Verifica que ambos proyectos estén vinculados
2. Firebase debe estar vinculado al proyecto de Google Cloud
3. Si no están vinculados, vincúlalos en Firebase Console

## ✅ Cómo Sincronizar Correctamente

### Método 1: Agregar SHA-1 en Firebase (Recomendado)

1. Ve a: https://console.firebase.google.com/project/amva-auth/settings/general
2. Ve a **"Tus aplicaciones"** → Selecciona app Android
3. Haz clic en **"Agregar huella digital"**
4. Agrega el SHA-1: `4B:24:0F:1B:6A:E6:3D:71:38:77:D1:E7:69:40:D2:1D:5D:30:7C:40`
5. Firebase debería sincronizar con Google Cloud Console automáticamente
6. Descarga el nuevo `google-services.json`

### Método 2: Agregar SHA-1 en Google Cloud Console (Si Firebase No Sincroniza)

1. Ve a: https://console.cloud.google.com/apis/credentials
2. Busca: `378853205278-c2e1gcjn06mg857rcvprns01fu8pduat`
3. Haz clic para editarlo
4. En **"SHA-1 certificate fingerprint"**, haz clic en **"+ Agregar huella digital"**
5. Agrega el SHA-1: `4B:24:0F:1B:6A:E6:3D:71:38:77:D1:E7:69:40:D2:1D:5D:30:7C:40`
6. Guarda los cambios
7. Espera 30 minutos para propagación

### Método 3: Verificar Vinculación de Proyectos

1. Ve a: https://console.firebase.google.com/project/amva-auth/settings/general
2. Busca la sección **"Configuración del proyecto"**
3. Verifica que el **"ID del proyecto de Google Cloud"** sea: `amva-auth`
4. Si no coincide, los proyectos pueden no estar vinculados

## 🔍 Verificación de Tu Configuración Actual

### SHA-1 en google-services.json (Firebase)

Tu `google-services.json` tiene:
- ✅ `4B:24:0F:1B:6A:E6:3D:71:38:77:D1:E7:69:40:D2:1D:5D:30:7C:40`
- ✅ `BC:0C:2C:C3:68:D1:50:C3:7E:07:17:EE:49:8F:D0:35:7D:0F:1E:E3`

### Verificación Necesaria en Google Cloud Console

Debes verificar que estos mismos SHA-1 estén en:
- https://console.cloud.google.com/apis/credentials
- Cliente Android: `378853205278-c2e1gcjn06mg857rcvprns01fu8pduat`

## 🎯 Diagnóstico Rápido

### Si Google OAuth NO Funciona

1. **Verifica SHA-1 en Google Cloud Console**:
   - Ve a: https://console.cloud.google.com/apis/credentials
   - Busca el cliente Android
   - Verifica que los SHA-1 estén ahí

2. **Si faltan SHA-1**:
   - Agrégalos manualmente
   - Espera 30 minutos
   - Prueba nuevamente

3. **Si los SHA-1 están pero aún no funciona**:
   - Verifica que OAuth Consent Screen esté publicado
   - Verifica que Google Sign-In API esté habilitada
   - Verifica que el package name coincida

## ✅ Checklist de Sincronización

- [ ] SHA-1 `4B:24:0F...` en Firebase Console
- [ ] SHA-1 `4B:24:0F...` en Google Cloud Console
- [ ] SHA-1 `BC:0C:2C...` en Firebase Console
- [ ] SHA-1 `BC:0C:2C...` en Google Cloud Console
- [ ] Proyectos Firebase y Google Cloud vinculados
- [ ] `google-services.json` actualizado con todos los SHA-1
- [ ] OAuth Consent Screen publicado
- [ ] Google Sign-In API habilitada

## 🎉 Conclusión

**SÍ, es posible que Firebase y Google Cloud Console NO estén sincronizados.**

**Para que Google OAuth funcione:**
- ✅ Los SHA-1 deben estar en **AMBOS** lugares
- ✅ Firebase (en `google-services.json`)
- ✅ Google Cloud Console (en el cliente Android OAuth)

**Si falta en alguno de los dos, Google OAuth NO funcionará.**

## 📝 Próximos Pasos

1. **Verifica en Google Cloud Console** que los SHA-1 estén configurados
2. **Si faltan**, agrégalos manualmente
3. **Espera 30 minutos** para propagación
4. **Prueba Google OAuth** nuevamente

