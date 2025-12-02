import { Controller, Post, UseGuards, UseInterceptors, UploadedFile, BadRequestException, Body } from "@nestjs/common"
import { FileInterceptor } from "@nestjs/platform-express"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"
import { UploadService } from "./upload.service"
import { memoryStorage } from "multer"
import type { Express } from "express"
import { ThrottleUpload } from "../../common/decorators/throttle-auth.decorator"

@Controller("upload")
export class UploadController {
  constructor(private readonly uploadService: UploadService) { }

  @ThrottleUpload()
  @Post('image')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    }),
  )
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No se proporcionó ningún archivo');
    }

    const result = await this.uploadService.uploadImage(file, 'ministerio-amva/pastores');

    return {
      success: true,
      url: result.url,
      publicId: result.publicId,
    };
  }

  @ThrottleUpload()
  @Post('galeria')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async uploadGaleriaImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No se proporcionó ningún archivo');
    }

    const result = await this.uploadService.uploadImage(file, 'ministerio-amva/galeria');

    return {
      success: true,
      url: result.url,
      publicId: result.publicId,
    };
  }

  @ThrottleUpload()
  @Post('video')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 100 * 1024 * 1024 }, // 100MB para videos (aumentado para permitir recortes)
    }),
  )
  async uploadVideo(
    @UploadedFile() file: Express.Multer.File,
    @Body('startTime') startTime?: string,
    @Body('endTime') endTime?: string,
  ) {
    if (!file) {
      throw new BadRequestException('No se proporcionó ningún archivo');
    }

    // Parsear opciones de recorte si se proporcionaron
    let trimOptions: { startTime: number; endTime: number } | undefined;

    if (startTime !== undefined && endTime !== undefined) {
      const start = parseFloat(startTime);
      const end = parseFloat(endTime);

      if (!isNaN(start) && !isNaN(end) && end > start) {
        trimOptions = { startTime: start, endTime: end };
        console.log(`✂️ Opciones de recorte recibidas: ${start}s - ${end}s (duración: ${(end - start).toFixed(1)}s)`);
      }
    }

    const result = await this.uploadService.uploadVideo(file, 'ministerio-amva/videos', trimOptions);

    return {
      success: true,
      url: result.url,
      publicId: result.publicId,
      trimmed: !!trimOptions,
    };
  }

  // Endpoint público para documentos de inscripción
  @ThrottleUpload()
  @Post('inscripcion-documento')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    }),
  )
  async uploadInscripcionDocumento(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No se proporcionó ningún archivo');
    }

    const result = await this.uploadService.uploadImage(file, 'ministerio-amva/inscripciones');

    return {
      success: true,
      url: result.url,
      publicId: result.publicId,
    };
  }
}
