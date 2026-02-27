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
          subtituloJustificacion: 'left',
          misionTitulo: 'Nuestra Misión',
          misionContenido:
            'Capacitar, fortalecer y empoderar a pastores y líderes cristianos de habla hispana a través de convenciones, seminarios y recursos de formación continua, promoviendo el crecimiento espiritual y ministerial efectivo.',
          misionJustificacion: 'left',
          visionTitulo: 'Nuestra Visión',
          visionContenido:
            'Ser una red global de formación pastoral reconocida por su excelencia e impacto, transformando vidas y fortaleciendo iglesias en toda América Latina y el mundo de habla hispana.',
          visionJustificacion: 'left',
          ofrendasHabilitado: true,
          ofrendasTitulo: 'Ofrendas para la Misión',
          ofrendasContenido:
            'En AMVA (Asociación Misionera Vida Abundante) creemos que la fe se expresa plenamente cuando se comparte con los demás y se traduce en acciones que transforman vidas. Nuestras misiones cristianas llevan esperanza, acompañamiento espiritual y apoyo comunitario a pueblos y comunidades que enfrentan necesidades profundas.\n\nTu ofrenda es una herramienta real para sostener:\n\n• El envío y cuidado de nuestros misioneros y misioneras en campo.\n• Proyectos de evangelización, educación y salud en territorios con recursos escasos.\n• Capacitación continua para líderes cristianos y pastores locales.\n• Recursos logísticos, materiales y operativos para actividades misioneras.\n\nCada aporte —grande o pequeño— multiplica vida abundante en Cristo y fortalece la obra que Dios está realizando a través de nuestros enviados a diferentes regiones del mundo.\n\n¡Gracias por tu generosidad y tu compromiso con la misión!',
          ofrendasCuentaBancaria: '',
          ofrendasJustificacion: 'left',
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
      // Normalizar justificación vacía a 'left' cuando el campo viene en el body
      const justificacion = (v: string | undefined): string =>
        v && v.trim() !== '' ? v : 'left'
      const data: UpdateConfiguracionLandingDto = { ...dto }
      if (dto.subtituloJustificacion !== undefined) data.subtituloJustificacion = justificacion(dto.subtituloJustificacion)
      if (dto.misionJustificacion !== undefined) data.misionJustificacion = justificacion(dto.misionJustificacion)
      if (dto.visionJustificacion !== undefined) data.visionJustificacion = justificacion(dto.visionJustificacion)
      if (dto.ofrendasJustificacion !== undefined) data.ofrendasJustificacion = justificacion(dto.ofrendasJustificacion)
      config = await this.prisma.configuracionLanding.update({
        where: { id: config.id },
        data,
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
          subtituloJustificacion: dto.subtituloJustificacion ?? 'left',
          misionTitulo: dto.misionTitulo ?? 'Nuestra Misión',
          misionContenido:
            dto.misionContenido ??
            'Capacitar, fortalecer y empoderar a pastores y líderes cristianos de habla hispana a través de convenciones, seminarios y recursos de formación continua, promoviendo el crecimiento espiritual y ministerial efectivo.',
          misionJustificacion: dto.misionJustificacion ?? 'left',
          visionTitulo: dto.visionTitulo ?? 'Nuestra Visión',
          visionContenido:
            dto.visionContenido ??
            'Ser una red global de formación pastoral reconocida por su excelencia e impacto, transformando vidas y fortaleciendo iglesias en toda América Latina y el mundo de habla hispana.',
          visionJustificacion: dto.visionJustificacion ?? 'left',
          ofrendasHabilitado: dto.ofrendasHabilitado ?? true,
          ofrendasTitulo: dto.ofrendasTitulo ?? 'Ofrendas para la Misión',
          ofrendasContenido:
            dto.ofrendasContenido ??
            'En AMVA (Asociación Misionera Vida Abundante) creemos que la fe se expresa plenamente cuando se comparte con los demás y se traduce en acciones que transforman vidas. Nuestras misiones cristianas llevan esperanza, acompañamiento espiritual y apoyo comunitario a pueblos y comunidades que enfrentan necesidades profundas.\n\nTu ofrenda es una herramienta real para sostener:\n\n• El envío y cuidado de nuestros misioneros y misioneras en campo.\n• Proyectos de evangelización, educación y salud en territorios con recursos escasos.\n• Capacitación continua para líderes cristianos y pastores locales.\n• Recursos logísticos, materiales y operativos para actividades misioneras.\n\nCada aporte —grande o pequeño— multiplica vida abundante en Cristo y fortalece la obra que Dios está realizando a través de nuestros enviados a diferentes regiones del mundo.\n\n¡Gracias por tu generosidad y tu compromiso con la misión!',
          ofrendasCuentaBancaria: dto.ofrendasCuentaBancaria ?? '',
          ofrendasJustificacion: dto.ofrendasJustificacion ?? 'left',
        },
      })
      this.logger.log('✅ Configuración creada exitosamente')
    }

    return config
  }
}

