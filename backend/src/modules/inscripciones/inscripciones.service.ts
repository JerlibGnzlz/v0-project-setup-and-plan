import { Injectable, Logger, NotFoundException } from "@nestjs/common"
import { PrismaService } from "../../prisma/prisma.service"
import { CreateInscripcionDto, UpdateInscripcionDto, CreatePagoDto, UpdatePagoDto } from "./dto/inscripcion.dto"
import { Inscripcion, Pago, EstadoPago } from "@prisma/client"

/**
 * Servicio para gestión de Inscripciones y Pagos
 * 
 * Este servicio maneja dos entidades relacionadas:
 * - Inscripciones: Registro de participantes a convenciones
 * - Pagos: Transacciones asociadas a inscripciones
 * 
 * Nota: No usa BaseService directamente porque maneja dos modelos
 * pero sigue los mismos patrones de diseño
 */
@Injectable()
export class InscripcionesService {
    private readonly logger = new Logger(InscripcionesService.name)

    // Include queries reutilizables
    private readonly inscripcionIncludes = {
        convencion: true,
        pagos: true,
    }

    private readonly pagoIncludes = {
        inscripcion: {
            include: {
                convencion: true,
            },
        },
    }

    constructor(private prisma: PrismaService) { }

    // ==================== INSCRIPCIONES ====================

    /**
     * Obtiene todas las inscripciones con relaciones
     */
    async findAllInscripciones(): Promise<(Inscripcion & { convencion: any; pagos: any[] })[]> {
        return this.prisma.inscripcion.findMany({
            include: this.inscripcionIncludes,
            orderBy: { fechaInscripcion: "desc" },
        })
    }

    /**
     * Obtiene una inscripción por ID
     */
    async findOneInscripcion(id: string): Promise<Inscripcion & { convencion: any; pagos: any[] }> {
        const inscripcion = await this.prisma.inscripcion.findUnique({
            where: { id },
            include: this.inscripcionIncludes,
        })

        if (!inscripcion) {
            throw new NotFoundException(`Inscripción con ID "${id}" no encontrada`)
        }

        return inscripcion
    }

    /**
     * Crea una nueva inscripción
     */
    async createInscripcion(dto: CreateInscripcionDto): Promise<Inscripcion> {
        this.logger.log(`📝 Creando inscripción para: ${dto.nombre}`)

        return this.prisma.inscripcion.create({
            data: dto,
            include: this.inscripcionIncludes,
        })
    }

    /**
     * Actualiza una inscripción
     */
    async updateInscripcion(id: string, dto: UpdateInscripcionDto): Promise<Inscripcion> {
        await this.findOneInscripcion(id) // Verifica existencia

        return this.prisma.inscripcion.update({
            where: { id },
            data: dto,
            include: this.inscripcionIncludes,
        })
    }

    /**
     * Elimina una inscripción
     */
    async removeInscripcion(id: string): Promise<Inscripcion> {
        await this.findOneInscripcion(id) // Verifica existencia

        this.logger.warn(`🗑️ Eliminando inscripción: ${id}`)

        return this.prisma.inscripcion.delete({
            where: { id },
        })
    }

    /**
     * Obtiene inscripciones por convención
     */
    async findByConvencion(convencionId: string): Promise<Inscripcion[]> {
        return this.prisma.inscripcion.findMany({
            where: { convencionId },
            include: this.inscripcionIncludes,
            orderBy: { fechaInscripcion: "desc" },
        })
    }

    /**
     * Cuenta inscripciones por convención
     */
    async countByConvencion(convencionId: string): Promise<number> {
        return this.prisma.inscripcion.count({
            where: { convencionId },
        })
    }

    // ==================== PAGOS ====================

    /**
     * Obtiene todos los pagos con relaciones
     */
    async findAllPagos(): Promise<(Pago & { inscripcion: any })[]> {
        return this.prisma.pago.findMany({
            include: this.pagoIncludes,
            orderBy: { createdAt: "desc" },
        })
    }

    /**
     * Obtiene un pago por ID
     */
    async findOnePago(id: string): Promise<Pago & { inscripcion: any }> {
        const pago = await this.prisma.pago.findUnique({
            where: { id },
            include: this.pagoIncludes,
        })

        if (!pago) {
            throw new NotFoundException(`Pago con ID "${id}" no encontrado`)
        }

        return pago
    }

    /**
     * Crea un nuevo pago
     */
    async createPago(dto: CreatePagoDto): Promise<Pago> {
        this.logger.log(`💰 Creando pago: ${dto.metodoPago} - ${dto.monto}`)

        return this.prisma.pago.create({
            data: {
                ...dto,
                monto: parseFloat(dto.monto),
            },
            include: this.pagoIncludes,
        })
    }

    /**
     * Actualiza un pago
     */
    async updatePago(id: string, dto: UpdatePagoDto): Promise<Pago> {
        await this.findOnePago(id) // Verifica existencia

        const data: any = { ...dto }
        if (dto.monto) {
            data.monto = parseFloat(dto.monto)
        }

        return this.prisma.pago.update({
            where: { id },
            data,
            include: this.pagoIncludes,
        })
    }

    /**
     * Elimina un pago
     */
    async removePago(id: string): Promise<Pago> {
        await this.findOnePago(id) // Verifica existencia

        this.logger.warn(`🗑️ Eliminando pago: ${id}`)

        return this.prisma.pago.delete({
            where: { id },
        })
    }

    /**
     * Valida/confirma un pago
     */
    async validatePago(id: string): Promise<Pago> {
        this.logger.log(`✅ Validando pago: ${id}`)

        return this.prisma.pago.update({
            where: { id },
            data: { estado: EstadoPago.COMPLETADO },
            include: this.pagoIncludes,
        })
    }

    /**
     * Rechaza/cancela un pago
     */
    async rejectPago(id: string, motivo?: string): Promise<Pago> {
        this.logger.log(`❌ Rechazando pago: ${id}`)

        return this.prisma.pago.update({
            where: { id },
            data: {
                estado: EstadoPago.CANCELADO,
            },
            include: this.pagoIncludes,
        })
    }

    /**
     * Obtiene pagos por estado
     */
    async findPagosByEstado(estado: EstadoPago): Promise<Pago[]> {
        return this.prisma.pago.findMany({
            where: { estado },
            include: this.pagoIncludes,
            orderBy: { createdAt: "desc" },
        })
    }

    /**
     * Obtiene pagos de una inscripción específica
     */
    async findPagosByInscripcion(inscripcionId: string): Promise<Pago[]> {
        return this.prisma.pago.findMany({
            where: { inscripcionId },
            include: this.pagoIncludes,
            orderBy: { createdAt: "desc" },
        })
    }

    // ==================== ESTADÍSTICAS ====================

    /**
     * Obtiene estadísticas generales
     */
    async getStats(): Promise<{
        totalInscripciones: number
        totalPagos: number
        pagosPendientes: number
        pagosCompletados: number
        pagosCancelados: number
    }> {
        const [
            totalInscripciones,
            totalPagos,
            pagosPendientes,
            pagosCompletados,
            pagosCancelados,
        ] = await Promise.all([
            this.prisma.inscripcion.count(),
            this.prisma.pago.count(),
            this.prisma.pago.count({ where: { estado: EstadoPago.PENDIENTE } }),
            this.prisma.pago.count({ where: { estado: EstadoPago.COMPLETADO } }),
            this.prisma.pago.count({ where: { estado: EstadoPago.CANCELADO } }),
        ])

        return {
            totalInscripciones,
            totalPagos,
            pagosPendientes,
            pagosCompletados,
            pagosCancelados,
        }
    }
}
