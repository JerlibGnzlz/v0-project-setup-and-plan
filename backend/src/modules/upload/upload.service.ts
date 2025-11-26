import { Injectable, BadRequestException } from "@nestjs/common"
import { cloudinary } from "./cloudinary.config"
import * as streamifier from "streamifier"
import * as fs from "fs"
import * as path from "path"
import type { Express } from "express"

export interface UploadResult {
  url: string
  publicId: string
}

@Injectable()
export class UploadService {
  private isCloudinaryConfigured(): boolean {
    return !!(
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
    )
  }

  async uploadImage(file: Express.Multer.File, folder = "ministerio-amva"): Promise<UploadResult> {
    if (!file) {
      throw new BadRequestException("No se proporcionó ningún archivo")
    }

    // Validar tipo de archivo
    const allowedMimes = ["image/jpeg", "image/png", "image/webp", "image/gif"]
    if (!allowedMimes.includes(file.mimetype)) {
      throw new BadRequestException("Tipo de archivo no permitido. Solo se aceptan imágenes JPG, PNG, WEBP o GIF")
    }

    // Validar tamaño (max 5MB)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      throw new BadRequestException("El archivo excede el tamaño máximo de 5MB")
    }

    // Si Cloudinary está configurado, intentar usarlo
    if (this.isCloudinaryConfigured()) {
      try {
        return await this.uploadToCloudinary(file, folder)
      } catch (error) {
        console.log("⚠️ Cloudinary falló, usando guardado local como fallback")
        return this.uploadLocally(file, folder)
      }
    }

    // Si no, guardar localmente (modo desarrollo)
    return this.uploadLocally(file, folder)
  }

  private async uploadToCloudinary(file: Express.Multer.File, folder: string): Promise<UploadResult> {
    console.log(`☁️ Subiendo a Cloudinary: ${file.originalname} (${file.size} bytes) -> ${folder}`)

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: "image",
          transformation: [{ width: 800, height: 800, crop: "limit" }, { quality: "auto" }, { format: "webp" }],
        },
        (error, result) => {
          if (error) {
            console.error("❌ Error de Cloudinary:", error)
            reject(new BadRequestException("Error al subir imagen a Cloudinary: " + error.message))
          } else if (result) {
            console.log(`✅ Imagen subida a Cloudinary: ${result.secure_url}`)
            resolve({
              url: result.secure_url,
              publicId: result.public_id,
            })
          } else {
            reject(new BadRequestException("No se recibió respuesta de Cloudinary"))
          }
        },
      )

      streamifier.createReadStream(file.buffer).pipe(uploadStream)
    })
  }

  private async uploadLocally(file: Express.Multer.File, folder: string): Promise<UploadResult> {
    // Crear directorio de uploads si no existe
    const uploadDir = path.join(process.cwd(), "uploads", folder)
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }

    // Generar nombre único
    const ext = path.extname(file.originalname) || ".jpg"
    const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}${ext}`
    const filepath = path.join(uploadDir, filename)

    // Guardar archivo
    fs.writeFileSync(filepath, file.buffer)

    // Retornar URL local
    const publicId = `${folder}/${filename}`
    const url = `http://localhost:4000/uploads/${folder}/${filename}`

    console.log(`📁 Imagen guardada localmente: ${filepath}`)
    console.log(`🔗 URL: ${url}`)

    return { url, publicId }
  }

  async uploadVideo(
    file: Express.Multer.File,
    folder = "ministerio-amva/videos",
    trimOptions?: { startTime: number; endTime: number }
  ): Promise<UploadResult> {
    if (!file) {
      throw new BadRequestException("No se proporcionó ningún archivo")
    }

    // Validar tipo de archivo de video
    const allowedMimes = ["video/mp4", "video/webm", "video/quicktime", "video/x-msvideo"]
    if (!allowedMimes.includes(file.mimetype)) {
      throw new BadRequestException("Tipo de archivo no permitido. Solo se aceptan videos MP4, WebM, MOV o AVI")
    }

    // Validar tamaño (max 100MB para videos - aumentado para permitir recortes)
    const maxSize = 100 * 1024 * 1024
    if (file.size > maxSize) {
      throw new BadRequestException("El archivo excede el tamaño máximo de 100MB")
    }

    // Si Cloudinary está configurado, intentar usarlo
    if (this.isCloudinaryConfigured()) {
      try {
        return await this.uploadVideoToCloudinary(file, folder, trimOptions)
      } catch (error) {
        console.log("⚠️ Cloudinary falló, usando guardado local como fallback")
        return this.uploadVideoLocally(file, folder)
      }
    }

    // Si no, guardar localmente
    return this.uploadVideoLocally(file, folder)
  }

  private async uploadVideoToCloudinary(
    file: Express.Multer.File,
    folder: string,
    trimOptions?: { startTime: number; endTime: number }
  ): Promise<UploadResult> {
    const hasTrim = trimOptions && trimOptions.startTime !== undefined && trimOptions.endTime !== undefined

    if (hasTrim) {
      console.log(`✂️ Recortando video: ${trimOptions.startTime}s - ${trimOptions.endTime}s`)
    }
    console.log(`☁️ Subiendo video a Cloudinary: ${file.originalname} (${file.size} bytes) -> ${folder}`)

    return new Promise((resolve, reject) => {
      // Construir transformaciones
      const transformations: any[] = []

      // Agregar recorte si se especificó
      if (hasTrim) {
        transformations.push({
          start_offset: trimOptions.startTime.toFixed(1),
          end_offset: trimOptions.endTime.toFixed(1),
        })
      }

      // Agregar optimizaciones
      transformations.push(
        { quality: "auto" },
        { format: "mp4" }
      )

      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: "video",
          eager: hasTrim ? [
            {
              start_offset: trimOptions.startTime.toFixed(1),
              end_offset: trimOptions.endTime.toFixed(1),
              quality: "auto",
              format: "mp4"
            }
          ] : undefined,
          eager_async: false, // Esperar a que se procese el recorte
        },
        (error, result) => {
          if (error) {
            console.error("❌ Error de Cloudinary:", error)
            reject(new BadRequestException("Error al subir video a Cloudinary: " + error.message))
          } else if (result) {
            // Si hay recorte, usar la URL del video procesado (eager)
            let finalUrl = result.secure_url

            if (hasTrim && result.eager && result.eager.length > 0) {
              finalUrl = result.eager[0].secure_url
              console.log(`✅ Video recortado y subido: ${finalUrl}`)
            } else if (hasTrim) {
              // Construir URL con transformaciones manualmente si eager no funcionó
              const baseUrl = result.secure_url
              const parts = baseUrl.split('/upload/')
              if (parts.length === 2) {
                finalUrl = `${parts[0]}/upload/so_${trimOptions.startTime.toFixed(1)},eo_${trimOptions.endTime.toFixed(1)},q_auto,f_mp4/${parts[1]}`
              }
              console.log(`✅ Video subido con URL de recorte: ${finalUrl}`)
            } else {
              console.log(`✅ Video subido a Cloudinary: ${finalUrl}`)
            }

            resolve({
              url: finalUrl,
              publicId: result.public_id,
            })
          } else {
            reject(new BadRequestException("No se recibió respuesta de Cloudinary"))
          }
        },
      )

      streamifier.createReadStream(file.buffer).pipe(uploadStream)
    })
  }

  private async uploadVideoLocally(file: Express.Multer.File, folder: string): Promise<UploadResult> {
    // Crear directorio de uploads si no existe
    const uploadDir = path.join(process.cwd(), "uploads", folder)
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }

    // Generar nombre único
    const ext = path.extname(file.originalname) || ".mp4"
    const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}${ext}`
    const filepath = path.join(uploadDir, filename)

    // Guardar archivo
    fs.writeFileSync(filepath, file.buffer)

    // Retornar URL local
    const publicId = `${folder}/${filename}`
    const url = `http://localhost:4000/uploads/${folder}/${filename}`

    console.log(`📁 Video guardado localmente: ${filepath}`)
    console.log(`🔗 URL: ${url}`)

    return { url, publicId }
  }

  async deleteImage(publicId: string): Promise<void> {
    if (this.isCloudinaryConfigured()) {
      try {
        await cloudinary.uploader.destroy(publicId)
      } catch (error) {
        console.error("Error al eliminar imagen de Cloudinary:", error)
      }
    } else {
      // Eliminar archivo local
      const filepath = path.join(process.cwd(), "uploads", publicId)
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath)
        console.log(`🗑️ Imagen eliminada: ${filepath}`)
      }
    }
  }
}
