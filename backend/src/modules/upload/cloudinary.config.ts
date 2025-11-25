import { v2 as cloudinary } from "cloudinary"

export const configureCloudinary = () => {
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
    const maskedSecret = apiSecret.substring(0, 4) + "..." + apiSecret.substring(apiSecret.length - 4)
    console.log(`☁️ Cloudinary configurado:`)
    console.log(`   - Cloud Name: ${cloudName}`)
    console.log(`   - API Key: ${apiKey}`)
    console.log(`   - API Secret: ${maskedSecret} (${apiSecret.length} caracteres)`)
  } else {
    console.log("⚠️ Cloudinary NO configurado - las imágenes se guardarán localmente")
    if (!cloudName) console.log("   - Falta CLOUDINARY_CLOUD_NAME")
    if (!apiKey) console.log("   - Falta CLOUDINARY_API_KEY")
    if (!apiSecret) console.log("   - Falta CLOUDINARY_API_SECRET")
  }
}

export { cloudinary }
