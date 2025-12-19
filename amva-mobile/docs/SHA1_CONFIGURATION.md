# SHA-1 para Google Sign-In

## 🔑 SHA-1 del Keystore de Debug

**SHA-1**: `5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25`

## 📋 Pasos para Configurar en Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Selecciona tu proyecto: **AMVA Digital** (o el nombre de tu proyecto)
3. Ve a **APIs & Services** → **Credentials**
4. Busca o crea un **OAuth 2.0 Client ID** de tipo **Android**
5. En la sección **SHA-1 certificate fingerprint**, agrega:
   ```
   5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25
   ```
6. Guarda los cambios

## ⚠️ Importante

- Este SHA-1 es para el **keystore de debug** (desarrollo)
- Para producción, necesitarás obtener el SHA-1 del **keystore de producción**
- El SHA-1 debe estar configurado ANTES de probar Google Sign-In
- Los cambios pueden tardar 5-15 minutos en aplicarse

## 🔄 Obtener SHA-1 Nuevamente

Si necesitas obtener el SHA-1 nuevamente:

```bash
cd amva-mobile
./scripts/get-sha1.sh
```

O manualmente:

```bash
cd amva-mobile/android
./gradlew signingReport
```

## 📝 Para Producción

Cuando hagas un build de producción, necesitarás:

1. Crear un keystore de producción
2. Obtener el SHA-1 del keystore de producción
3. Agregarlo en Google Cloud Console (puedes tener múltiples SHA-1)

