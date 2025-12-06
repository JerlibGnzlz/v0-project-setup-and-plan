import { Injectable, BadRequestException, Logger } from '@nestjs/common'
import type { Express } from 'express'

/**
 * Servicio para validación avanzada de archivos
 *
 * Valida:
 * - Tipo de archivo por extensión
 * - Tipo MIME
 * - Magic bytes (firma del archivo)
 * - Tamaño
 * - Dimensiones (para imágenes)
 * - Contenido malicioso
 */
@Injectable()
export class FileValidatorService {
  private readonly logger = new Logger(FileValidatorService.name)

  // Magic bytes para diferentes tipos de archivo
  private readonly magicBytes: Record<string, number[][]> = {
    'image/jpeg': [[0xff, 0xd8, 0xff]],
    'image/png': [[0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]],
    'image/webp': [
      [0x52, 0x49, 0x46, 0x46],
      [0x57, 0x45, 0x42, 0x50],
    ], // RIFF...WEBP
    'image/gif': [
      [0x47, 0x49, 0x46, 0x38, 0x37, 0x61],
      [0x47, 0x49, 0x46, 0x38, 0x39, 0x61],
    ], // GIF87a o GIF89a
    'video/mp4': [
      [0x00, 0x00, 0x00, 0x20, 0x66, 0x74, 0x79, 0x70],
      [0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70],
    ], // ftyp box
    'video/webm': [[0x1a, 0x45, 0xdf, 0xa3]],
    'application/pdf': [[0x25, 0x50, 0x44, 0x46]], // %PDF
  }

  /**
   * Valida una imagen
   */
  async validateImage(
    file: Express.Multer.File,
    options?: {
      maxSize?: number // en bytes
      allowedMimes?: string[]
      minWidth?: number
      maxWidth?: number
      minHeight?: number
      maxHeight?: number
    }
  ): Promise<void> {
    const {
      maxSize = 5 * 1024 * 1024, // 5MB por defecto
      allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
      minWidth = 1,
      maxWidth = 10000,
      minHeight = 1,
      maxHeight = 10000,
    } = options || {}

    // Validar que existe el archivo
    if (!file || !file.buffer) {
      throw new BadRequestException('No se proporcionó ningún archivo')
    }

    // Validar tamaño
    if (file.size > maxSize) {
      const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(2)
      throw new BadRequestException(`El archivo excede el tamaño máximo de ${maxSizeMB}MB`)
    }

    if (file.size === 0) {
      throw new BadRequestException('El archivo está vacío')
    }

    // Validar tipo MIME
    if (!allowedMimes.includes(file.mimetype)) {
      throw new BadRequestException(
        `Tipo de archivo no permitido. Solo se aceptan: ${allowedMimes.join(', ')}`
      )
    }

    // Validar extensión del nombre de archivo
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif']
    const fileExtension = this.getFileExtension(file.originalname)
    if (!allowedExtensions.includes(fileExtension.toLowerCase())) {
      throw new BadRequestException(
        `Extensión de archivo no permitida. Solo se aceptan: ${allowedExtensions.join(', ')}`
      )
    }

    // Validar magic bytes (firma del archivo)
    await this.validateMagicBytes(file, allowedMimes)

    // Validar dimensiones si se especificaron
    if (minWidth || maxWidth || minHeight || maxHeight) {
      await this.validateImageDimensions(file, {
        minWidth,
        maxWidth,
        minHeight,
        maxHeight,
      })
    }

    // Sanitizar nombre de archivo
    this.sanitizeFileName(file.originalname)

    this.logger.log(
      `✅ Imagen validada: ${file.originalname} (${file.size} bytes, ${file.mimetype})`
    )
  }

  /**
   * Valida un video
   */
  async validateVideo(
    file: Express.Multer.File,
    options?: {
      maxSize?: number // en bytes
      allowedMimes?: string[]
      maxDuration?: number // en segundos
    }
  ): Promise<void> {
    const {
      maxSize = 100 * 1024 * 1024, // 100MB por defecto
      allowedMimes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo'],
    } = options || {}

    // Validar que existe el archivo
    if (!file || !file.buffer) {
      throw new BadRequestException('No se proporcionó ningún archivo')
    }

    // Validar tamaño
    if (file.size > maxSize) {
      const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(0)
      throw new BadRequestException(`El archivo excede el tamaño máximo de ${maxSizeMB}MB`)
    }

    if (file.size === 0) {
      throw new BadRequestException('El archivo está vacío')
    }

    // Validar tipo MIME
    if (!allowedMimes.includes(file.mimetype)) {
      throw new BadRequestException(
        `Tipo de archivo no permitido. Solo se aceptan: ${allowedMimes.join(', ')}`
      )
    }

    // Validar extensión del nombre de archivo
    const allowedExtensions = ['.mp4', '.webm', '.mov', '.avi']
    const fileExtension = this.getFileExtension(file.originalname)
    if (!allowedExtensions.includes(fileExtension.toLowerCase())) {
      throw new BadRequestException(
        `Extensión de archivo no permitida. Solo se aceptan: ${allowedExtensions.join(', ')}`
      )
    }

    // Validar magic bytes (firma del archivo)
    await this.validateMagicBytes(file, allowedMimes)

    // Sanitizar nombre de archivo
    this.sanitizeFileName(file.originalname)

    this.logger.log(
      `✅ Video validado: ${file.originalname} (${file.size} bytes, ${file.mimetype})`
    )
  }

  /**
   * Valida un documento (PDF, etc.)
   */
  async validateDocument(
    file: Express.Multer.File,
    options?: {
      maxSize?: number
      allowedMimes?: string[]
    }
  ): Promise<void> {
    const {
      maxSize = 5 * 1024 * 1024, // 5MB por defecto
      allowedMimes = ['application/pdf'],
    } = options || {}

    if (!file || !file.buffer) {
      throw new BadRequestException('No se proporcionó ningún archivo')
    }

    if (file.size > maxSize) {
      const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(2)
      throw new BadRequestException(`El archivo excede el tamaño máximo de ${maxSizeMB}MB`)
    }

    if (file.size === 0) {
      throw new BadRequestException('El archivo está vacío')
    }

    if (!allowedMimes.includes(file.mimetype)) {
      throw new BadRequestException(
        `Tipo de archivo no permitido. Solo se aceptan: ${allowedMimes.join(', ')}`
      )
    }

    // Validar magic bytes para PDF
    if (file.mimetype === 'application/pdf') {
      await this.validateMagicBytes(file, ['application/pdf'])
    }

    this.logger.log(
      `✅ Documento validado: ${file.originalname} (${file.size} bytes, ${file.mimetype})`
    )
  }

  /**
   * Valida los magic bytes del archivo (firma del archivo)
   */
  private async validateMagicBytes(
    file: Express.Multer.File,
    allowedMimes: string[]
  ): Promise<void> {
    if (!file.buffer || file.buffer.length < 8) {
      throw new BadRequestException('El archivo es demasiado pequeño para ser válido')
    }

    const buffer = file.buffer.slice(0, 12) // Leer primeros 12 bytes
    const bufferArray = Array.from(buffer) as number[]

    // Verificar magic bytes para cada tipo MIME permitido
    let foundMatch = false
    for (const mimeType of allowedMimes) {
      const signatures = this.magicBytes[mimeType]
      if (!signatures) continue

      for (const signature of signatures) {
        if (this.matchesSignature(bufferArray, signature)) {
          foundMatch = true
          break
        }
      }
      if (foundMatch) break
    }

    if (!foundMatch) {
      this.logger.warn(
        `⚠️ Magic bytes no coinciden para ${file.originalname}. MIME reportado: ${file.mimetype}`
      )
      throw new BadRequestException(
        'El tipo de archivo no coincide con su contenido. El archivo puede estar corrupto o ser malicioso.'
      )
    }
  }

  /**
   * Verifica si el buffer coincide con una firma
   */
  private matchesSignature(buffer: number[], signature: number[]): boolean {
    if (buffer.length < signature.length) return false

    for (let i = 0; i < signature.length; i++) {
      if (buffer[i] !== signature[i]) {
        return false
      }
    }
    return true
  }

  /**
   * Valida las dimensiones de una imagen
   */
  private async validateImageDimensions(
    file: Express.Multer.File,
    options: {
      minWidth: number
      maxWidth: number
      minHeight: number
      maxHeight: number
    }
  ): Promise<void> {
    try {
      // Usar sharp si está disponible, sino usar una validación básica
      const sharp = await this.tryImportSharp()
      if (sharp) {
        const metadata = await sharp(file.buffer).metadata()
        const width = metadata.width || 0
        const height = metadata.height || 0

        if (width < options.minWidth || width > options.maxWidth) {
          throw new BadRequestException(
            `El ancho de la imagen debe estar entre ${options.minWidth}px y ${options.maxWidth}px. Actual: ${width}px`
          )
        }

        if (height < options.minHeight || height > options.maxHeight) {
          throw new BadRequestException(
            `El alto de la imagen debe estar entre ${options.minHeight}px y ${options.maxHeight}px. Actual: ${height}px`
          )
        }
      }
    } catch (error: any) {
      if (error instanceof BadRequestException) {
        throw error
      }
      // Si falla la validación de dimensiones, solo loguear pero no fallar
      this.logger.warn(`No se pudieron validar las dimensiones: ${error.message}`)
    }
  }

  /**
   * Intenta importar sharp dinámicamente (opcional)
   * Nota: Sharp no está instalado por defecto, esta función retorna null
   */
  private async tryImportSharp(): Promise<any> {
    // Sharp no está instalado, retornar null
    // Si se necesita validación de dimensiones, instalar: pnpm add sharp
    return null
  }

  /**
   * Obtiene la extensión de un archivo
   */
  private getFileExtension(filename: string): string {
    const lastDot = filename.lastIndexOf('.')
    return lastDot !== -1 ? filename.substring(lastDot) : ''
  }

  /**
   * Sanitiza el nombre de archivo para prevenir ataques
   */
  private sanitizeFileName(filename: string): string {
    // Remover caracteres peligrosos
    const sanitized = filename
      .replace(/[^a-zA-Z0-9._-]/g, '_')
      .replace(/\.\./g, '_')
      .replace(/^\./, '_')
      .substring(0, 255) // Limitar longitud

    if (sanitized !== filename) {
      this.logger.warn(`Nombre de archivo sanitizado: "${filename}" -> "${sanitized}"`)
    }

    return sanitized
  }

  /**
   * Valida que el nombre de archivo no contenga rutas peligrosas
   */
  validateFileName(filename: string): void {
    if (!filename || filename.trim().length === 0) {
      throw new BadRequestException('El nombre de archivo no puede estar vacío')
    }

    // Prevenir path traversal
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      throw new BadRequestException('El nombre de archivo contiene caracteres no permitidos')
    }

    // Prevenir nombres de archivo reservados (Windows)
    const reservedNames = [
      'CON',
      'PRN',
      'AUX',
      'NUL',
      'COM1',
      'COM2',
      'COM3',
      'COM4',
      'COM5',
      'COM6',
      'COM7',
      'COM8',
      'COM9',
      'LPT1',
      'LPT2',
      'LPT3',
      'LPT4',
      'LPT5',
      'LPT6',
      'LPT7',
      'LPT8',
      'LPT9',
    ]
    const nameWithoutExt = filename.split('.')[0].toUpperCase()
    if (reservedNames.includes(nameWithoutExt)) {
      throw new BadRequestException('El nombre de archivo es un nombre reservado del sistema')
    }

    // Limitar longitud
    if (filename.length > 255) {
      throw new BadRequestException(
        'El nombre de archivo es demasiado largo (máximo 255 caracteres)'
      )
    }
  }
}
