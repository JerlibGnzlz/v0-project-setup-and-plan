import { v2 as cloudinary } from 'cloudinary'
import { Logger } from '@nestjs/common'

export const configureCloudinary = (logger?: Logger) => {
  const log = logger || new Logger('CloudinaryConfig')
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim()
  const apiKey = process.env.CLOUDINARY_API_KEY?.trim()
  const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim()

  if (cloudName && apiKey && apiSecret) {
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
    })
    // Mostrar info para debug (ocultar parte del secret)
    const maskedSecret =
      apiSecret.substring(0, 4) + '...' + apiSecret.substring(apiSecret.length - 4)
    log.log(`Cloudinary configurado:`)
    log.log(`   - Cloud Name: ${cloudName}`)
    log.log(`   - API Key: ${apiKey}`)
    log.log(`   - API Secret: ${maskedSecret} (${apiSecret.length} caracteres)`)
  } else {
    log.warn('Cloudinary NO configurado - las imágenes se guardarán localmente')
    if (!cloudName) log.warn('   - Falta CLOUDINARY_CLOUD_NAME')
    if (!apiKey) log.warn('   - Falta CLOUDINARY_API_KEY')
    if (!apiSecret) log.warn('   - Falta CLOUDINARY_API_SECRET')
  }
}

export { cloudinary }
