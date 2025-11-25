import { Injectable, BadRequestException } from "@nestjs/common"
import { cloudinary } from "./cloudinary.config"
import * as streamifier from "streamifier"
import type { Express } from "express"

export interface UploadResult {
  url: string
  publicId: string
}

@Injectable()
export class UploadService {
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

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: "image",
          transformation: [{ width: 800, height: 800, crop: "limit" }, { quality: "auto" }, { format: "webp" }],
        },
        (error, result) => {
          if (error) {
            reject(new BadRequestException("Error al subir imagen: " + error.message))
          } else {
            resolve({
              url: result.secure_url,
              publicId: result.public_id,
            })
          }
        },
      )

      streamifier.createReadStream(file.buffer).pipe(uploadStream)
    })
  }

  async deleteImage(publicId: string): Promise<void> {
    try {
      await cloudinary.uploader.destroy(publicId)
    } catch (error) {
      console.error("Error al eliminar imagen de Cloudinary:", error)
    }
  }
}
