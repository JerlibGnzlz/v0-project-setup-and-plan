# 🔥 Pasos Inmediatos para Completar Firebase

## ✅ Lo que Ya Tienes

- ✅ Proyecto Firebase: `amva-digital`
- ✅ `google-services.json` en `android/app/`
- ✅ Package name configurado: `org.vidaabundante.app`

## 🎯 Lo que Falta (2 Pasos)

### PASO 1: Habilitar Cloud Messaging API

**Opción A: Desde Google Cloud Console** (Más Directo)
1. Abre: **https://console.cloud.google.com/apis/library/cloudmessaging.googleapis.com?project=amva-digital**
2. Haz clic en **"Habilitar"** o **"Enable"**
3. Espera 10-30 segundos

**Opción B: Desde Firebase Console**
1. Abre: **https://console.firebase.google.com/project/amva-digital/settings/cloudmessaging**
2. Si ves "Cloud Messaging API (Legacy) is not enabled", haz clic en **"Habilitar"**

### PASO 2: Obtener Server Key

Una vez habilitada la API:

1. Ve a: **https://console.firebase.google.com/project/amva-digital/settings/cloudmessaging**
2. Busca **"Cloud Messaging API (Legacy)"**
3. Verás el **Server key** (cadena que empieza con `AAAA...`)
4. **Copia** toda la cadena

## 🚀 Una Vez que Tengas el Server Key

Ejecuta este comando:

```bash
cd /home/jerlibgnzlz/Escritorio/v0-project-setup-and-plan/amva-mobile
./scripts/setup-firebase-credentials.sh
```

El script te pedirá:
- **Server Key**: Pega la cadena que copiaste
- **Sender ID**: `804089781668` (ya lo tienes)

## 📋 Información que Necesitas

- **Server Key**: (lo obtendrás de Firebase Console después de habilitar la API)
- **Sender ID**: `804089781668` ✅ (ya lo tienes)

## 🔗 Enlaces Directos

- **Habilitar Cloud Messaging API**: https://console.cloud.google.com/apis/library/cloudmessaging.googleapis.com?project=amva-digital
- **Obtener Server Key**: https://console.firebase.google.com/project/amva-digital/settings/cloudmessaging

---

**¿Listo para continuar?** 

1. Primero habilita Cloud Messaging API
2. Luego obtén el Server Key
3. Finalmente ejecuta el script de configuración

¡Avísame cuando tengas el Server Key y te ayudo a configurarlo! 🚀

