import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { UpdateConfiguracionLandingDto } from './dto/configuracion-landing.dto'
import { ConfiguracionLanding } from '@prisma/client'

/**
 * Servicio para gestión de Configuración de Landing Page
 * Gestiona las estadísticas y contenido de la sección "Quiénes Somos"
 */
@Injectable()
export class ConfiguracionLandingService {
  private readonly logger = new Logger(ConfiguracionLandingService.name)

  constructor(private prisma: PrismaService) {}

  /**
   * Obtiene la configuración de landing (público)
   * Si no existe, retorna valores por defecto
   */
  async getConfiguracion(): Promise<ConfiguracionLanding> {
    let config = await this.prisma.configuracionLanding.findFirst({
      orderBy: { createdAt: 'desc' },
    })

    // Si no existe configuración, crear una con valores por defecto
    if (!config) {
      this.logger.log('📝 No existe configuración, creando con valores por defecto')
      config = await this.prisma.configuracionLanding.create({
        data: {
          pastoresFormados: 500,
          pastoresFormadosSuffix: '+',
          anosMinisterio: 15,
          anosMinisterioSuffix: '+',
          convenciones: 50,
          convencionesSuffix: '+',
          titulo: 'Quiénes Somos',
          subtitulo:
            'Una organización misionera comprometida con la formación integral de líderes pastorales para el servicio del Reino',
          misionTitulo: 'Nuestra Misión',
          misionContenido:
            'Capacitar, fortalecer y empoderar a pastores y líderes cristianos de habla hispana a través de convenciones, seminarios y recursos de formación continua, promoviendo el crecimiento espiritual y ministerial efectivo.',
          visionTitulo: 'Nuestra Visión',
          visionContenido:
            'Ser una red global de formación pastoral reconocida por su excelencia e impacto, transformando vidas y fortaleciendo iglesias en toda América Latina y el mundo de habla hispana.',
        },
      })
    }

    return config
  }

  /**
   * Actualiza la configuración de landing (admin)
   * Actualiza el primer registro o crea uno nuevo si no existe
   */
  async updateConfiguracion(
    dto: UpdateConfiguracionLandingDto
  ): Promise<ConfiguracionLanding> {
    this.logger.log('📝 Actualizando configuración de landing')

    // Buscar configuración existente
    let config = await this.prisma.configuracionLanding.findFirst({
      orderBy: { createdAt: 'desc' },
    })

    if (config) {
      // Actualizar configuración existente
      config = await this.prisma.configuracionLanding.update({
        where: { id: config.id },
        data: dto,
      })
      this.logger.log('✅ Configuración actualizada exitosamente')
    } else {
      // Crear nueva configuración con valores por defecto + dto
      config = await this.prisma.configuracionLanding.create({
        data: {
          pastoresFormados: dto.pastoresFormados ?? 500,
          pastoresFormadosSuffix: dto.pastoresFormadosSuffix ?? '+',
          anosMinisterio: dto.anosMinisterio ?? 15,
          anosMinisterioSuffix: dto.anosMinisterioSuffix ?? '+',
          convenciones: dto.convenciones ?? 50,
          convencionesSuffix: dto.convencionesSuffix ?? '+',
          paisesOverride: dto.paisesOverride ?? null,
          titulo: dto.titulo ?? 'Quiénes Somos',
          subtitulo:
            dto.subtitulo ??
            'Una organización misionera comprometida con la formación integral de líderes pastorales para el servicio del Reino',
          misionTitulo: dto.misionTitulo ?? 'Nuestra Misión',
          misionContenido:
            dto.misionContenido ??
            'Capacitar, fortalecer y empoderar a pastores y líderes cristianos de habla hispana a través de convenciones, seminarios y recursos de formación continua, promoviendo el crecimiento espiritual y ministerial efectivo.',
          visionTitulo: dto.visionTitulo ?? 'Nuestra Visión',
          visionContenido:
            dto.visionContenido ??
            'Ser una red global de formación pastoral reconocida por su excelencia e impacto, transformando vidas y fortaleciendo iglesias en toda América Latina y el mundo de habla hispana.',
        },
      })
      this.logger.log('✅ Configuración creada exitosamente')
    }

    return config
  }
}

