import { Module } from '@nestjs/common'
import { UploadController } from './upload.controller'
import { UploadService } from './upload.service'
import { FileValidatorService } from './file-validator.service'

@Module({
  controllers: [UploadController],
  providers: [UploadService, FileValidatorService],
  exports: [UploadService, FileValidatorService],
})
export class UploadModule {}
