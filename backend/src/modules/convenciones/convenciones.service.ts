import { BadRequestException, Injectable, Logger } from '@nestjs/common'
import { CreateConvencionDto, UpdateConvencionDto } from './dto/convencion.dto'
import { ConvencionRepository } from './repositories/convencion.repository'
import { Convencion, Prisma } from '@prisma/client'
import { DataSyncGateway } from '../data-sync/data-sync.gateway'

/**
 * Servicio para gestión de Convenciones
 *
 * Clean Architecture:
 * - El servicio contiene la lógica de negocio
 * - Usa el repositorio para acceso a datos (no conoce Prisma directamente)
 * - Fácil de testear con mocks del repositorio
 *
 * SOLID:
 * - S: Solo maneja lógica de negocio de convenciones
 * - O: Abierto para extensión (métodos pueden añadirse)
 * - D: Depende de la abstracción (repositorio), no de Prisma
 */
/** Parsea solo YYYY-MM-DD (o ISO que empiece así) a Date en UTC mediodía. Así todos los meses coinciden con la cuenta regresiva. */
function parseFechaUnica(iso: string): Date {
  const str = String(iso).trim()
  const match = str.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (match) {
    const [, y, m, d] = match.map(Number)
    if (m >= 1 && m <= 12 && d >= 1 && d <= 31) {
      return new Date(Date.UTC(y, m - 1, d, 12, 0, 0))
    }
  }
  throw new BadRequestException(
    'fechaInicio y fechaFin deben estar en formato YYYY-MM-DD (ej: 2026-07-12)'
  )
}

@Injectable()
export class ConvencionesService {
  private readonly logger = new Logger(ConvencionesService.name)

  constructor(
    private readonly repository: ConvencionRepository,
    private readonly dataSyncGateway: DataSyncGateway
  ) { }

  /**
   * Obtiene todas las convenciones
   */
  async findAll(): Promise<Convencion[]> {
    return this.repository.findAll()
  }

  /**
   * Obtiene una convención por ID
   */
  async findOne(id: string): Promise<Convencion> {
    return this.repository.findByIdOrFail(id)
  }

  /**
   * Encuentra la convención activa actual.
   * fechaInicio/fechaFin se guardan como DateTime (ISO) y el controller las serializa
   * a ISO string; el frontend usa el día (YYYY-MM-DD) en hora local para la cuenta regresiva.
   */
  async findActive(): Promise<Convencion | null> {
    const convencion = await this.repository.findActive()

    this.logger.log(
      convencion ? `✅ Convención activa: ${convencion.titulo}` : '📭 No hay convención activa'
    )

    return convencion
  }

  /**
   * Crea una nueva convención
   */
  async create(dto: CreateConvencionDto): Promise<Convencion> {
    this.logger.log(`📝 Creando convención: ${dto.titulo}`)
    // Convertir fechas de string a Date y costo a Decimal si es necesario
    const data: Prisma.ConvencionCreateInput = {
      titulo: dto.titulo,
      descripcion: dto.descripcion || null,
      fechaInicio: parseFechaUnica(dto.fechaInicio),
      fechaFin: parseFechaUnica(dto.fechaFin),
      ubicacion: dto.ubicacion,
      costo: dto.costo !== undefined ? new Prisma.Decimal(dto.costo) : undefined,
      cupoMaximo: dto.cupoMaximo,
      imagenUrl: dto.imagenUrl || null,
      activa: dto.activa ?? false,
      archivada: dto.archivada ?? false,
      invitadoNombre: dto.invitadoNombre || null,
      invitadoFotoUrl: dto.invitadoFotoUrl || null,
      aliasCbu: dto.aliasCbu || null,
      titularTransferencia: dto.titularTransferencia || null,
      numeroCuenta: dto.numeroCuenta || null,
      cbu: dto.cbu || null,
      cuil: dto.cuil || null,
    }
    const convencion = await this.repository.create(data as unknown as Partial<Convencion>)

    // Emitir evento de sincronización
    this.dataSyncGateway.emitConvencionCreated(convencion.id)

    return convencion
  }

  /**
   * Actualiza una convención
   * Si se activa, desactiva todas las demás
   */
  async update(id: string, dto: UpdateConvencionDto): Promise<Convencion> {
    // Convertir fechas de string a Date si vienen y costo a Decimal
    const data: Prisma.ConvencionUpdateInput = {}

    if (dto.titulo !== undefined) data.titulo = dto.titulo
    if (dto.descripcion !== undefined) data.descripcion = dto.descripcion
    if (dto.fechaInicio !== undefined) data.fechaInicio = parseFechaUnica(dto.fechaInicio)
    if (dto.fechaFin !== undefined) data.fechaFin = parseFechaUnica(dto.fechaFin)
    if (dto.ubicacion !== undefined) data.ubicacion = dto.ubicacion
    if (dto.costo !== undefined) data.costo = new Prisma.Decimal(dto.costo)
    if (dto.cupoMaximo !== undefined) data.cupoMaximo = dto.cupoMaximo
    if (dto.imagenUrl !== undefined) data.imagenUrl = dto.imagenUrl
    if (dto.activa !== undefined) data.activa = dto.activa
    if (dto.invitadoNombre !== undefined) data.invitadoNombre = dto.invitadoNombre
    if (dto.invitadoFotoUrl !== undefined) data.invitadoFotoUrl = dto.invitadoFotoUrl
    if (dto.contactoNombre !== undefined) data.contactoNombre = dto.contactoNombre
    if (dto.contactoTelefono !== undefined) data.contactoTelefono = dto.contactoTelefono
    if (dto.aliasCbu !== undefined) data.aliasCbu = dto.aliasCbu
    if (dto.titularTransferencia !== undefined) data.titularTransferencia = dto.titularTransferencia
    if (dto.numeroCuenta !== undefined) data.numeroCuenta = dto.numeroCuenta
    if (dto.cbu !== undefined) data.cbu = dto.cbu
    if (dto.cuil !== undefined) data.cuil = dto.cuil

    this.logger.log(`📝 Actualizando convención: ${id}`)

    try {
      // Lógica de negocio: Si se activa, desactivar las demás
      if (data.activa === true) {
        await this.deactivateOthers(id)
      }

      const result = await this.repository.update(id, data as unknown as Partial<Convencion>)

      this.logger.log(`✅ Convención actualizada: ${result.titulo} (activa: ${result.activa})`)

      // Emitir evento de sincronización
      this.dataSyncGateway.emitConvencionUpdated(id)

      return result
    } catch (error) {
      this.logger.error(`❌ Error actualizando convención: ${error}`)
      throw error
    }
  }

  /**
   * Archiva una convención
   */
  async archivar(id: string): Promise<Convencion> {
    this.logger.log(`📦 Archiving convención: ${id}`)
    const convencion = await this.repository.findByIdOrFail(id)

    return this.repository.update(id, {
      archivada: true,
      fechaArchivado: new Date(),
      activa: false, // Desactivar automáticamente al archivar
    })
  }

  /**
   * Desarchiva una convención
   */
  async desarchivar(id: string): Promise<Convencion> {
    this.logger.log(`📦 Unarchiving convención: ${id}`)
    return this.repository.update(id, {
      archivada: false,
      fechaArchivado: null,
    })
  }

  /**
   * Elimina una convención
   */
  async remove(id: string): Promise<Convencion> {
    this.logger.warn(`🗑️ Eliminando convención: ${id}`)
    const convencion = await this.repository.delete(id)

    // Emitir evento de sincronización
    this.dataSyncGateway.emitConvencionDeleted(id)

    return convencion
  }

  /**
   * Activa una convención específica
   * Desactiva todas las demás automáticamente
   */
  async activate(id: string): Promise<Convencion> {
    this.logger.log(`🔓 Activando convención: ${id}`)

    await this.deactivateOthers(id)
    return this.repository.activate(id)
  }

  /**
   * Desactiva una convención
   */
  async deactivate(id: string): Promise<Convencion> {
    this.logger.log(`🔒 Desactivando convención: ${id}`)
    return this.repository.deactivate(id)
  }

  /**
   * Obtiene convenciones próximas
   */
  async findUpcoming(): Promise<Convencion[]> {
    return this.repository.findUpcoming()
  }

  /**
   * Obtiene convenciones pasadas
   */
  async findPast(): Promise<Convencion[]> {
    return this.repository.findPast()
  }

  /**
   * Verifica si hay una convención activa
   */
  async hasActiveConvention(): Promise<boolean> {
    return this.repository.hasActiveConvention()
  }

  /**
   * Cuenta el total de convenciones
   */
  async count(): Promise<number> {
    return this.repository.count()
  }

  /**
   * Obtiene estadísticas de convenciones
   */
  async getStats(): Promise<{
    total: number
    activas: number
    proximas: number
    pasadas: number
  }> {
    const [total, activas, proximas, pasadas] = await Promise.all([
      this.repository.count(),
      this.repository.count({ activa: true }),
      this.repository.findUpcoming().then(c => c.length),
      this.repository.findPast().then(c => c.length),
    ])

    return { total, activas, proximas, pasadas }
  }

  // ==================== MÉTODOS PRIVADOS ====================

  /**
   * Desactiva todas las convenciones excepto la especificada
   */
  private async deactivateOthers(excludeId: string): Promise<void> {
    this.logger.log('🔄 Desactivando otras convenciones...')
    await this.repository.deactivateAll(excludeId)
  }
}
