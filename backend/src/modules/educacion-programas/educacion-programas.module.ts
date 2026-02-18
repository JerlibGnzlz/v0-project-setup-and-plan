import { Module } from '@nestjs/common'
import { EducacionProgramasController } from './educacion-programas.controller'
import { EducacionProgramasService } from './educacion-programas.service'
import { PrismaModule } from '../../prisma/prisma.module'

@Module({
  imports: [PrismaModule],
  controllers: [EducacionProgramasController],
  providers: [EducacionProgramasService],
  exports: [EducacionProgramasService],
})
export class EducacionProgramasModule {}
