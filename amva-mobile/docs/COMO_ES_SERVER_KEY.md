# 🔑 ¿Cómo es el Server Key?

## 📝 Formato del Server Key

El **Server Key** es una cadena larga de texto que se ve así:

```
AAAA... (muchos caracteres más)
```

**Ejemplo** (formato típico):
```
AAAAxYz123abc456def789ghi012jkl345mno678pqr901stu234vwx567yz
```

**Características**:
- ✅ Empieza con `AAAA`
- ✅ Es muy largo (típicamente 150+ caracteres)
- ✅ Contiene letras y números
- ✅ Es único para tu proyecto Firebase

## 🔍 Dónde Encontrarlo

### Opción 1: Firebase Console (Más Fácil)

1. Ve a: **https://console.firebase.google.com/project/amva-digital/settings/cloudmessaging**
2. Busca la sección **"Cloud Messaging API (Legacy)"**
3. Verás algo como:

```
Server key
AAAAxYz123abc456def789ghi012jkl345mno678pqr901stu234vwx567yz
[COPIAR]
```

4. Haz clic en **"COPIAR"** o selecciona y copia toda la cadena

### Opción 2: Google Cloud Console

1. Ve a: **https://console.cloud.google.com/apis/credentials?project=amva-digital**
2. Busca **"Cloud Messaging API (Legacy)"** en la lista
3. Haz clic en el nombre
4. Verás el Server Key

## ⚠️ Si No Lo Encuentras

Si no ves el Server Key, puede que necesites habilitar Cloud Messaging API:

1. Ve a Firebase Console → Cloud Messaging
2. Si ves **"Cloud Messaging API (Legacy) is not enabled"**
3. Haz clic en **"Habilitar"** o **"Enable"**
4. Espera unos segundos
5. Recarga la página
6. Ahora deberías ver el Server Key

## 📋 Información que Necesitas para EAS

Cuando ejecutes `eas credentials`, necesitarás:

1. **Server Key**: La cadena larga que empieza con `AAAA...`
2. **Sender ID**: `804089781668` (ya lo tienes)

## ✅ Una Vez que Tengas el Server Key

Ejecuta:
```bash
cd amva-mobile
./scripts/setup-firebase-credentials.sh
```

Pega el Server Key cuando te lo pida.

