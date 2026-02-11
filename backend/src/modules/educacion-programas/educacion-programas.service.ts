import { Injectable, Logger } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { ProgramaEducacion } from '@prisma/client'
import { UpdateProgramasEducacionDto } from './dto/educacion-programa.dto'

const DEFAULT_DURACION = '2 años.'
const DEFAULT_REQUISITOS =
  'Internet, dispositivo electrónico y compromiso con estudios, trabajos y exámenes.'

const PROGRAMAS_DEFAULT: Array<{
  clave: string
  titulo: string
  duracion: string
  modalidad: string
  inscripcion: string
  cuotaMensual: string
  requisitos: string
  orden: number
}> = [
  {
    clave: 'instituto_biblico',
    titulo: 'Instituto Bíblico',
    duracion: DEFAULT_DURACION,
    modalidad: 'Clases virtuales en vivo vía Google Meet (acceso simple sin instalaciones).',
    inscripcion: '$25.000',
    cuotaMensual: '$35.000',
    requisitos: DEFAULT_REQUISITOS,
    orden: 0,
  },
  {
    clave: 'escuela_capellania',
    titulo: 'Escuela de Capellanía',
    duracion: DEFAULT_DURACION,
    modalidad: 'Clases virtuales en vivo vía Google Meet (acceso simple sin instalaciones).',
    inscripcion: '$25.000',
    cuotaMensual: '$35.000',
    requisitos: DEFAULT_REQUISITOS,
    orden: 1,
  },
  {
    clave: 'misiones',
    titulo: 'Misiones',
    duracion: DEFAULT_DURACION,
    modalidad: 'Clases virtuales en vivo vía Google Meet (acceso simple sin instalaciones).',
    inscripcion: '$25.000',
    cuotaMensual: '$35.000',
    requisitos: DEFAULT_REQUISITOS,
    orden: 2,
  },
]

const CONFIG_SINGLETON_ID = 'educacion-contacto'

export interface EducacionProgramasResponse {
  programas: ProgramaEducacion[]
  contactEmail: string
  contactTelefono: string
}

@Injectable()
export class EducacionProgramasService {
  private readonly logger = new Logger(EducacionProgramasService.name)

  constructor(private readonly prisma: PrismaService) {}

  private async getOrCreateConfig(): Promise<{ email: string; telefono: string }> {
    let config = await this.prisma.configuracionEducacion.findFirst()
    if (!config) {
      config = await this.prisma.configuracionEducacion.create({
        data: {
          id: CONFIG_SINGLETON_ID,
          email: 'educacion@vidaabundante.org',
          telefono: '+54 11 xxxx-xxxx',
        },
      })
      this.logger.log('📝 Creada configuración de contacto de educación')
    }
    return { email: config.email, telefono: config.telefono }
  }

  /**
   * Obtiene todos los programas de educación y contacto (público).
   * Si no existen programas, crea los 3 por defecto.
   */
  async findAll(): Promise<EducacionProgramasResponse> {
    let list = await this.prisma.programaEducacion.findMany({
      orderBy: { orden: 'asc' },
    })
    if (list.length === 0) {
      this.logger.log('📝 No hay programas de educación, creando valores por defecto')
      for (const p of PROGRAMAS_DEFAULT) {
        await this.prisma.programaEducacion.create({ data: p })
      }
      list = await this.prisma.programaEducacion.findMany({
        orderBy: { orden: 'asc' },
      })
    }
    const { email: contactEmail, telefono: contactTelefono } =
      await this.getOrCreateConfig()
    return { programas: list, contactEmail, contactTelefono }
  }

  /**
   * Actualiza los programas y/o contacto desde el panel de control (admin).
   */
  async updateFromAdmin(
    dto: UpdateProgramasEducacionDto
  ): Promise<EducacionProgramasResponse> {
    this.logger.log('📝 Actualizando programas de educación AMVA Digital')
    if (dto.programas.length > 0) {
      for (const item of dto.programas) {
        await this.prisma.programaEducacion.upsert({
          where: { clave: item.clave },
          create: {
            clave: item.clave,
            titulo:
              item.titulo ??
              PROGRAMAS_DEFAULT.find(x => x.clave === item.clave)?.titulo ??
              item.clave,
            duracion: item.duracion ?? PROGRAMAS_DEFAULT[0].duracion,
            modalidad: item.modalidad ?? PROGRAMAS_DEFAULT[0].modalidad,
            inscripcion: item.inscripcion ?? PROGRAMAS_DEFAULT[0].inscripcion,
            cuotaMensual: item.cuotaMensual ?? PROGRAMAS_DEFAULT[0].cuotaMensual,
            requisitos: item.requisitos ?? PROGRAMAS_DEFAULT[0].requisitos,
            orden: item.orden ?? 0,
          },
          update: {
            ...(item.titulo !== undefined && { titulo: item.titulo }),
            ...(item.duracion !== undefined && { duracion: item.duracion }),
            ...(item.modalidad !== undefined && { modalidad: item.modalidad }),
            ...(item.inscripcion !== undefined && { inscripcion: item.inscripcion }),
            ...(item.cuotaMensual !== undefined && {
              cuotaMensual: item.cuotaMensual,
            }),
            ...(item.requisitos !== undefined && { requisitos: item.requisitos }),
            ...(item.orden !== undefined && { orden: item.orden }),
          },
        })
      }
    }
    if (
      dto.contactEmail !== undefined ||
      dto.contactTelefono !== undefined
    ) {
      const config = await this.prisma.configuracionEducacion.findFirst()
      if (config) {
        await this.prisma.configuracionEducacion.update({
          where: { id: config.id },
          data: {
            ...(dto.contactEmail !== undefined && { email: dto.contactEmail }),
            ...(dto.contactTelefono !== undefined && {
              telefono: dto.contactTelefono,
            }),
          },
        })
      } else {
        await this.prisma.configuracionEducacion.create({
          data: {
            id: CONFIG_SINGLETON_ID,
            email: dto.contactEmail ?? 'educacion@vidaabundante.org',
            telefono: dto.contactTelefono ?? '+54 11 xxxx-xxxx',
          },
        })
      }
      this.logger.log('✅ Contacto de educación actualizado')
    }
    this.logger.log('✅ Programas de educación actualizados')
    return this.findAll()
  }
}
