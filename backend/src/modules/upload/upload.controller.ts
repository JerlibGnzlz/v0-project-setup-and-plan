import { Controller, Post, UseGuards, UseInterceptors, UploadedFile, BadRequestException } from "@nestjs/common"
import { FileInterceptor } from "@nestjs/platform-express"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"
import { UploadService } from "./upload.service"
import { memoryStorage } from "multer"
import type { Express } from "express"

@Controller("upload")
@UseGuards(JwtAuthGuard)
export class UploadController {
  constructor(private readonly uploadService: UploadService) { }

  @Post('image')
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

  @Post('galeria')
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

  @Post('video')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 50 * 1024 * 1024 }, // 50MB para videos
    }),
  )
  async uploadVideo(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No se proporcionó ningún archivo');
    }

    const result = await this.uploadService.uploadVideo(file, 'ministerio-amva/videos');

    return {
      success: true,
      url: result.url,
      publicId: result.publicId,
    };
  }
}
