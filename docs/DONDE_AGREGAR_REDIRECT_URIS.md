# 📍 Dónde Agregar los Redirect URIs en Google Cloud Console

## 🎯 Respuesta Rápida

Los redirect URIs van en **"URIs de redireccionamiento autorizados"** (Authorized redirect URIs), **NO** en "Orígenes autorizados de JavaScript".

## 📋 Diferencia Entre los Dos Campos

### 1. Orígenes autorizados de JavaScript (Authorized JavaScript origins)

**¿Qué es?**: URLs desde las cuales se pueden hacer solicitudes OAuth (dominios permitidos)

**Ejemplos**:
```
https://tu-dominio.com
https://www.tu-dominio.com
http://localhost:3000
```

**Para qué sirve**: Para aplicaciones web que hacen OAuth desde el navegador

**❌ NO es donde van los redirect URIs de expo-auth-session**

### 2. URIs de redireccionamiento autorizados (Authorized redirect URIs)

**¿Qué es?**: URLs a las que Google redirige después de la autenticación

**Ejemplos**:
```
https://auth.expo.io/@jerlibgnzlz/amva-movil
amva-app://
exp://localhost:8081
exp://192.168.*.*:8081
```

**Para qué sirve**: Para aplicaciones móviles y web que reciben el token después del login

**✅ SÍ, aquí es donde van los redirect URIs de expo-auth-session**

## ✅ Pasos Exactos

### Paso 1: Abrir el Cliente OAuth Web

1. Ve a: https://console.cloud.google.com/apis/credentials?project=amva-digital
2. Busca el cliente OAuth de tipo **"Web application"**
3. Haz clic en el **nombre** del cliente (no en el Client ID)

### Paso 2: Agregar en "URIs de redireccionamiento autorizados"

1. En la página de edición, busca la sección **"URIs de redireccionamiento autorizados"** (Authorized redirect URIs)
2. **NO** uses "Orígenes autorizados de JavaScript"
3. Haz clic en **"+ ADD URI"** dentro de "URIs de redireccionamiento autorizados"
4. Agrega estos URIs uno por uno:

```
https://auth.expo.io/@jerlibgnzlz/amva-movil
```

Luego haz clic en **"+ ADD URI"** nuevamente y agrega:

```
amva-app://
```

Luego haz clic en **"+ ADD URI"** nuevamente y agrega:

```
exp://localhost:8081
```

Luego haz clic en **"+ ADD URI"** nuevamente y agrega:

```
exp://192.168.*.*:8081
```

### Paso 3: Guardar

1. Haz clic en **"SAVE"** (botón azul)
2. Espera el mensaje de confirmación

## 📸 Visualización

```
┌─────────────────────────────────────────────────────────┐
│  Edit OAuth 2.0 Client ID                               │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Name: Web client                                       │
│  Application type: Web application                      │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Orígenes autorizados de JavaScript              │  │
│  │ (Authorized JavaScript origins)                 │  │
│  │                                                  │  │
│  │ [Aquí NO van los redirect URIs]                 │  │
│  │                                                  │  │
│  │ + ADD URI                                       │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │ ✅ URIs de redireccionamiento autorizados        │  │
│  │ (Authorized redirect URIs)                      │  │
│  │                                                  │  │
│  │ [Aquí SÍ van los redirect URIs]                 │  │
│  │                                                  │  │
│  │ https://auth.expo.io/@jerlibgnzlz/amva-movil    │  │
│  │ amva-app://                                      │  │
│  │ exp://localhost:8081                             │  │
│  │ exp://192.168.*.*:8081                           │  │
│  │                                                  │  │
│  │ + ADD URI                                       │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
│  [SAVE] [CANCEL]                                        │
└─────────────────────────────────────────────────────────┘
```

## 🔍 Cómo Identificar el Campo Correcto

### ✅ Campo Correcto: "URIs de redireccionamiento autorizados"

**Señales de que es el correcto**:
- Dice "redirect" o "redireccionamiento"
- Puede tener URIs que empiezan con `https://`, `http://`, o schemes personalizados como `amva-app://`
- Está en la misma sección que el cliente OAuth Web

### ❌ Campo Incorrecto: "Orígenes autorizados de JavaScript"

**Señales de que NO es el correcto**:
- Dice "JavaScript origins" o "orígenes de JavaScript"
- Solo acepta URLs que empiezan con `http://` o `https://`
- No acepta schemes personalizados como `amva-app://`

## 📝 Resumen

| Campo | ¿Dónde van los redirect URIs? |
|-------|-------------------------------|
| **Orígenes autorizados de JavaScript** | ❌ NO |
| **URIs de redireccionamiento autorizados** | ✅ SÍ |

## ✅ Checklist

- [ ] Abrí el cliente OAuth Web en Google Cloud Console
- [ ] Encontré la sección "URIs de redireccionamiento autorizados"
- [ ] Agregué `https://auth.expo.io/@jerlibgnzlz/amva-movil`
- [ ] Agregué `amva-app://`
- [ ] Agregué `exp://localhost:8081`
- [ ] Agregué `exp://192.168.*.*:8081`
- [ ] Hice clic en "SAVE"
- [ ] Esperé el mensaje de confirmación

## 🎯 Respuesta Directa

**Los redirect URIs van en:**
- ✅ **"URIs de redireccionamiento autorizados"** (Authorized redirect URIs)

**NO van en:**
- ❌ "Orígenes autorizados de JavaScript" (Authorized JavaScript origins)

¡Agrega los 4 URIs en "URIs de redireccionamiento autorizados" y haz clic en SAVE! 🚀

