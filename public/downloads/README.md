# Descargas (APK y otros)

## APK AMVA Móvil (Android)

Para que el botón **"Descargar AMVA Móvil para Android (APK)"** del footer use una URL que **no expire**:

1. **Genera el APK** (EAS o build local):
   ```bash
   cd amva-mobile && eas build --platform android --profile production
   ```
2. **Descarga el .apk** desde el enlace que te da EAS.
3. **Sube el archivo aquí** con el nombre: `amva-movil.apk`  
   (reemplaza este README o déjalo; el APK debe llamarse `amva-movil.apk`).
4. **Configura la variable de entorno** en tu despliegue (Vercel, servidor, etc.):
   ```env
   NEXT_PUBLIC_APK_DOWNLOAD_URL=https://amva.org.es/downloads/amva-movil.apk
   ```
   (Ajusta el dominio si es distinto.)

La URL `https://amva.org.es/downloads/amva-movil.apk` no caduca. Cada vez que publiques una nueva versión, sustituye solo el archivo `amva-movil.apk` en esta carpeta; no hace falta tocar código.

**Nota:** Si el APK es pesado y tu host tiene límites (p. ej. Vercel), puedes subirlo a un almacenamiento (S3, R2, etc.) y usar esa URL en `NEXT_PUBLIC_APK_DOWNLOAD_URL`.
