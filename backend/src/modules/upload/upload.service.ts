import { Injectable, BadRequestException, Logger } from '@nestjs/common'
import { cloudinary } from './cloudinary.config'
import { FileValidatorService } from './file-validator.service'
import { createReadStream } from 'streamifier'
import * as fs from 'fs'
import * as path from 'path'
import type { Express } from 'express'

export interface UploadResult {
  url: string
  publicId: string
}

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name)

  constructor(private readonly fileValidator: FileValidatorService) { }

  private isCloudinaryConfigured(): boolean {
    return !!(
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
    )
  }

  async uploadImage(file: Express.Multer.File, folder = 'ministerio-amva'): Promise<UploadResult> {
    // Validación avanzada usando FileValidatorService
    await this.fileValidator.validateImage(file, {
      maxSize: 5 * 1024 * 1024, // 5MB
      allowedMimes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
      minWidth: 1,
      maxWidth: 10000,
      minHeight: 1,
      maxHeight: 10000,
    })

    // Validar nombre de archivo
    this.fileValidator.validateFileName(file.originalname)

    // Si Cloudinary está configurado, intentar usarlo
    if (this.isCloudinaryConfigured()) {
      try {
        return await this.uploadToCloudinary(file, folder)
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
        this.logger.warn(`Cloudinary falló, usando guardado local como fallback: ${errorMessage}`)
        return this.uploadLocally(file, folder)
      }
    }

    // Si no, guardar localmente (modo desarrollo)
    return this.uploadLocally(file, folder)
  }

  private async uploadToCloudinary(
    file: Express.Multer.File,
    folder: string
  ): Promise<UploadResult> {
    this.logger.debug(`Subiendo a Cloudinary: ${file.originalname} (${file.size} bytes) -> ${folder}`)

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'image',
          transformation: [
            { width: 800, height: 800, crop: 'limit' },
            { quality: 'auto' },
            { format: 'webp' },
          ],
        },
        (error, result) => {
          if (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
            this.logger.error(`Error de Cloudinary: ${errorMessage}`)
            reject(new BadRequestException(`Error al subir imagen a Cloudinary: ${errorMessage}`))
          } else if (result) {
            this.logger.debug(`Imagen subida a Cloudinary: ${result.secure_url}`)
            resolve({
              url: result.secure_url,
              publicId: result.public_id,
            })
          } else {
            reject(new BadRequestException('No se recibió respuesta de Cloudinary'))
          }
        }
      )

      createReadStream(file.buffer).pipe(uploadStream)
    })
  }

  private async uploadLocally(file: Express.Multer.File, folder: string): Promise<UploadResult> {
    // Crear directorio de uploads si no existe
    const uploadDir = path.join(process.cwd(), 'uploads', folder)
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }

    // Generar nombre único
    const ext = path.extname(file.originalname) || '.jpg'
    const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}${ext}`
    const filepath = path.join(uploadDir, filename)

    // Guardar archivo
    fs.writeFileSync(filepath, file.buffer)

    // Retornar URL local (usar BACKEND_URL en producción)
    const publicId = `${folder}/${filename}`
    const baseUrl =
      process.env.BACKEND_URL || process.env.API_URL || 'http://localhost:4000'
    const url = `${baseUrl.replace(/\/$/, '')}/uploads/${folder}/${filename}`

    this.logger.debug(`Imagen guardada localmente: ${filepath}`)
    this.logger.debug(`URL: ${url}`)

    return { url, publicId }
  }

  async uploadVideo(
    file: Express.Multer.File,
    folder = 'ministerio-amva/videos',
    trimOptions?: { startTime: number; endTime: number }
  ): Promise<UploadResult> {
    // Validación avanzada usando FileValidatorService
    await this.fileValidator.validateVideo(file, {
      maxSize: 100 * 1024 * 1024, // 100MB
      allowedMimes: ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'],
    })

    // Validar nombre de archivo
    this.fileValidator.validateFileName(file.originalname)

    // Si Cloudinary está configurado, intentar usarlo
    if (this.isCloudinaryConfigured()) {
      try {
        return await this.uploadVideoToCloudinary(file, folder, trimOptions)
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
        this.logger.warn(`Cloudinary falló para video, usando guardado local como fallback: ${errorMessage}`)
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
    const hasTrim =
      trimOptions && trimOptions.startTime !== undefined && trimOptions.endTime !== undefined

    if (hasTrim) {
      this.logger.debug(`Recortando video: ${trimOptions.startTime}s - ${trimOptions.endTime}s`)
    }
    this.logger.debug(
      `Subiendo video a Cloudinary: ${file.originalname} (${file.size} bytes) -> ${folder}`
    )

    return new Promise((resolve, reject) => {
      // Construir transformaciones
      type CloudinaryTransformation =
        | { start_offset: string; end_offset: string }
        | { quality: string }
        | { format: string }
      const transformations: CloudinaryTransformation[] = []

      // Agregar recorte si se especificó
      if (hasTrim) {
        transformations.push({
          start_offset: trimOptions.startTime.toFixed(1),
          end_offset: trimOptions.endTime.toFixed(1),
        })
      }

      // Agregar optimizaciones
      transformations.push({ quality: 'auto' }, { format: 'mp4' })

      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'video',
          eager: hasTrim
            ? [
              {
                start_offset: trimOptions.startTime.toFixed(1),
                end_offset: trimOptions.endTime.toFixed(1),
                quality: 'auto',
                format: 'mp4',
              },
            ]
            : undefined,
          eager_async: false, // Esperar a que se procese el recorte
        },
        (error, result) => {
          if (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
            this.logger.error(`Error de Cloudinary: ${errorMessage}`)
            reject(new BadRequestException(`Error al subir video a Cloudinary: ${errorMessage}`))
          } else if (result) {
            // Si hay recorte, usar la URL del video procesado (eager)
            let finalUrl = result.secure_url

            if (hasTrim && result.eager && result.eager.length > 0) {
              finalUrl = result.eager[0].secure_url
              this.logger.debug(`Video recortado y subido: ${finalUrl}`)
            } else if (hasTrim) {
              // Construir URL con transformaciones manualmente si eager no funcionó
              const baseUrl = result.secure_url
              const parts = baseUrl.split('/upload/')
              if (parts.length === 2) {
                finalUrl = `${parts[0]}/upload/so_${trimOptions.startTime.toFixed(1)},eo_${trimOptions.endTime.toFixed(1)},q_auto,f_mp4/${parts[1]}`
              }
              this.logger.debug(`Video subido con URL de recorte: ${finalUrl}`)
            } else {
              this.logger.debug(`Video subido a Cloudinary: ${finalUrl}`)
            }

            resolve({
              url: finalUrl,
              publicId: result.public_id,
            })
          } else {
            reject(new BadRequestException('No se recibió respuesta de Cloudinary'))
          }
        }
      )

      createReadStream(file.buffer).pipe(uploadStream)
    })
  }

  private async uploadVideoLocally(
    file: Express.Multer.File,
    folder: string
  ): Promise<UploadResult> {
    // Crear directorio de uploads si no existe
    const uploadDir = path.join(process.cwd(), 'uploads', folder)
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }

    // Generar nombre único
    const ext = path.extname(file.originalname) || '.mp4'
    const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}${ext}`
    const filepath = path.join(uploadDir, filename)

    // Guardar archivo
    fs.writeFileSync(filepath, file.buffer)

    // Retornar URL local (usar BACKEND_URL en producción)
    const publicId = `${folder}/${filename}`
    const baseUrl =
      process.env.BACKEND_URL || process.env.API_URL || 'http://localhost:4000'
    const url = `${baseUrl.replace(/\/$/, '')}/uploads/${folder}/${filename}`

    this.logger.debug(`Video guardado localmente: ${filepath}`)
    this.logger.debug(`URL: ${url}`)

    return { url, publicId }
  }

  async deleteImage(publicId: string): Promise<void> {
    if (this.isCloudinaryConfigured()) {
      try {
        await cloudinary.uploader.destroy(publicId)
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
        this.logger.error(`Error al eliminar imagen de Cloudinary: ${errorMessage}`)
      }
    } else {
      // Eliminar archivo local
      const filepath = path.join(process.cwd(), 'uploads', publicId)
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath)
        this.logger.debug(`Imagen eliminada: ${filepath}`)
      }
    }
  }
}
