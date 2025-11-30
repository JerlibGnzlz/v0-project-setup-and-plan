import { Injectable, Logger, NotFoundException, Inject, forwardRef } from "@nestjs/common"
import { PrismaService } from "../../prisma/prisma.service"
import { CreateInscripcionDto, UpdateInscripcionDto, CreatePagoDto, UpdatePagoDto } from "./dto/inscripcion.dto"
import { Inscripcion, Pago, EstadoPago } from "@prisma/client"
import { NotificationsService } from "../notifications/notifications.service"
import { EmailService } from "../notifications/email.service"

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

    constructor(
        private prisma: PrismaService,
        @Inject(forwardRef(() => NotificationsService))
        private notificationsService: NotificationsService,
        private emailService: EmailService,
    ) { }

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
     * Verifica si un email ya está inscrito en una convención
     */
    async checkInscripcionByEmail(email: string, convencionId: string): Promise<Inscripcion | null> {
        const inscripcion = await this.prisma.inscripcion.findFirst({
            where: {
                email: email.toLowerCase(),
                convencionId,
            },
            include: this.inscripcionIncludes,
            orderBy: { fechaInscripcion: 'desc' },
        })

        return inscripcion
    }

    /**
     * Crea una nueva inscripción
     * Si el origen es 'web' o 'mobile', crea automáticamente los pagos según numeroCuotas
     */
    async createInscripcion(dto: CreateInscripcionDto): Promise<Inscripcion> {
        this.logger.log(`📝 Creando inscripción para: ${dto.nombre}`)

        const origenRegistro = dto.origenRegistro || 'web'
        const numeroCuotas = dto.numeroCuotas || 3

        // Obtener la convención para calcular el monto por cuota
        const convencion = await this.prisma.convencion.findUnique({
            where: { id: dto.convencionId },
        })

        if (!convencion) {
            throw new NotFoundException(`Convención con ID "${dto.convencionId}" no encontrada`)
        }

        // Calcular el costo (puede venir como Decimal de Prisma)
        const costoTotal = typeof convencion.costo === 'number' 
            ? convencion.costo 
            : parseFloat(String(convencion.costo || 0))
        
        const montoPorCuota = costoTotal / numeroCuotas

        // Crear la inscripción
        const inscripcion = await this.prisma.inscripcion.create({
            data: {
                ...dto,
                origenRegistro,
            },
            include: this.inscripcionIncludes,
        })

        // Si el origen es 'web' o 'mobile', crear automáticamente los pagos
        if (origenRegistro === 'web' || origenRegistro === 'mobile') {
            this.logger.log(`💰 Creando ${numeroCuotas} pago(s) automático(s) para inscripción ${inscripcion.id}`)
            
            // Si hay un documentoUrl en la inscripción, asignarlo al primer pago como comprobanteUrl
            const comprobanteUrl = dto.documentoUrl || null
            
            // Crear los pagos según el número de cuotas
            const pagos = []
            for (let i = 1; i <= numeroCuotas; i++) {
                const pago = await this.prisma.pago.create({
                    data: {
                        inscripcionId: inscripcion.id,
                        monto: montoPorCuota, // Prisma maneja la conversión a Decimal automáticamente
                        metodoPago: 'pendiente', // Se actualizará cuando se registre el pago
                        numeroCuota: i,
                        estado: EstadoPago.PENDIENTE,
                        // Asignar el comprobante solo al primer pago si existe
                        comprobanteUrl: i === 1 && comprobanteUrl ? comprobanteUrl : null,
                    },
                })
                pagos.push(pago)
            }
            
            if (comprobanteUrl) {
                this.logger.log(`📎 Comprobante asignado al primer pago: ${comprobanteUrl}`)
            }
            
            this.logger.log(`✅ ${pagos.length} pago(s) creado(s) exitosamente`)
        }

        // Enviar notificación a todos los admins sobre la nueva inscripción
        try {
            const admins = await this.prisma.user.findMany({
                where: {
                    rol: {
                        in: ['ADMIN', 'EDITOR'],
                    },
                },
            })

            const origenTexto = origenRegistro === 'web' ? 'formulario web' : origenRegistro === 'mobile' ? 'app móvil' : 'dashboard'
            const titulo = '📝 Nueva Inscripción Recibida'
            const mensaje = `${inscripcion.nombre} ${inscripcion.apellido} se ha inscrito a "${convencion.titulo}" desde ${origenTexto}.`

            // Enviar notificación a cada admin
            for (const admin of admins) {
                await this.notificationsService.sendNotificationToAdmin(
                    admin.email,
                    titulo,
                    mensaje,
                    {
                        type: 'nueva_inscripcion',
                        inscripcionId: inscripcion.id,
                        convencionId: convencion.id,
                        convencionTitulo: convencion.titulo,
                        nombre: inscripcion.nombre,
                        apellido: inscripcion.apellido,
                        email: inscripcion.email,
                        origenRegistro: origenRegistro,
                    }
                )
            }

            this.logger.log(`📬 Notificaciones de nueva inscripción enviadas a ${admins.length} admin(s)`)
        } catch (error) {
            this.logger.error(`Error enviando notificaciones de nueva inscripción:`, error)
            // No fallar si la notificación falla
        }

        // Enviar email de confirmación al usuario que se inscribió
        try {
            const costoTotalFormateado = new Intl.NumberFormat('es-AR', {
                style: 'currency',
                currency: 'ARS',
            }).format(costoTotal)

            const montoPorCuotaFormateado = new Intl.NumberFormat('es-AR', {
                style: 'currency',
                currency: 'ARS',
            }).format(montoPorCuota)

            // Formatear fechas de la convención
            const fechaInicio = new Date(convencion.fechaInicio).toLocaleDateString('es-AR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            })
            const fechaFin = new Date(convencion.fechaFin).toLocaleDateString('es-AR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            })

            const tituloEmail = `✅ Inscripción Recibida - ${convencion.titulo}`
            const cuerpoEmail = `
¡Hola ${inscripcion.nombre}!

Tu inscripción a la convención "${convencion.titulo}" ha sido recibida exitosamente.

📋 Detalles de tu inscripción:
• Convención: ${convencion.titulo}
• Fechas: ${fechaInicio} al ${fechaFin}
• Ubicación: ${convencion.ubicacion}
• Costo total: ${costoTotalFormateado}
• Número de cuotas: ${numeroCuotas}
• Monto por cuota: ${montoPorCuotaFormateado}

⏳ Estado actual: Pendiente de pago

Para completar tu inscripción, necesitas realizar el pago de las ${numeroCuotas} cuota(s). Una vez que valides los pagos, recibirás una confirmación.

Si tienes alguna pregunta, no dudes en contactarnos.

¡Te esperamos en la convención!
            `.trim()

            const emailEnviado = await this.emailService.sendNotificationEmail(
                inscripcion.email,
                tituloEmail,
                cuerpoEmail,
                {
                    type: 'inscripcion_recibida',
                    inscripcionId: inscripcion.id,
                    convencionId: convencion.id,
                    convencionTitulo: convencion.titulo,
                    nombre: inscripcion.nombre,
                    apellido: inscripcion.apellido,
                    costoTotal: costoTotal,
                    numeroCuotas: numeroCuotas,
                    montoPorCuota: montoPorCuota,
                }
            )

            if (emailEnviado) {
                this.logger.log(`📧 Email de confirmación de inscripción enviado a ${inscripcion.email}`)
            } else {
                this.logger.warn(`⚠️ No se pudo enviar email de confirmación a ${inscripcion.email} (servicio no configurado o error)`)
            }
        } catch (error) {
            this.logger.error(`Error enviando email de confirmación a ${inscripcion.email}:`, error)
            // No fallar si el email falla
        }

        // Retornar la inscripción con los pagos incluidos
        return this.findOneInscripcion(inscripcion.id)
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
        const pago = await this.findOnePago(id) // Verifica existencia

        const data: any = { ...dto }
        if (dto.monto) {
            data.monto = parseFloat(dto.monto)
        }

        // Si se está marcando como COMPLETADO, actualizar fechaPago si no existe
        if (dto.estado === EstadoPago.COMPLETADO && !pago.fechaPago) {
            data.fechaPago = new Date()
        }

        const pagoActualizado = await this.prisma.pago.update({
            where: { id },
            data,
            include: this.pagoIncludes,
        })

        // Si el pago se completó, enviar notificación y verificar si todas las cuotas están pagadas
        if (dto.estado === EstadoPago.COMPLETADO && pagoActualizado.inscripcionId) {
            // Enviar notificación de pago individual validado
            await this.enviarNotificacionPagoValidado(pagoActualizado)
            
            // Verificar si todas las cuotas están pagadas
            await this.verificarYActualizarEstadoInscripcion(pagoActualizado.inscripcionId)
        }

        return pagoActualizado
    }

    /**
     * Envía notificación cuando se valida un pago individual (cuota)
     */
    private async enviarNotificacionPagoValidado(pago: Pago & { inscripcion: any }): Promise<void> {
        try {
            const inscripcion = pago.inscripcion
            if (!inscripcion || !inscripcion.email) {
                return
            }

            // Obtener información de la inscripción y pagos
            const inscripcionCompleta = await this.prisma.inscripcion.findUnique({
                where: { id: inscripcion.id },
                include: { pagos: true, convencion: true },
            })

            if (!inscripcionCompleta) {
                return
            }

            const numeroCuotas = inscripcionCompleta.numeroCuotas || 3
            const cuotasPagadas = inscripcionCompleta.pagos.filter(
                (p) => p.estado === EstadoPago.COMPLETADO
            ).length
            const cuotasPendientes = numeroCuotas - cuotasPagadas

            // Formatear monto
            const monto = typeof pago.monto === 'number' 
                ? pago.monto 
                : parseFloat(String(pago.monto || 0))
            const montoFormateado = new Intl.NumberFormat('es-AR', {
                style: 'currency',
                currency: 'ARS',
            }).format(monto)

            // Determinar mensaje según el número de cuota
            const numeroCuota = pago.numeroCuota || 1
            let titulo = `✅ Pago de Cuota ${numeroCuota} Validado`
            let mensaje = `Tu pago de ${montoFormateado} ha sido validado exitosamente.`

            // Agregar información de progreso
            if (cuotasPendientes > 0) {
                mensaje += ` Has pagado ${cuotasPagadas} de ${numeroCuotas} cuotas. ${cuotasPendientes} cuota(s) pendiente(s).`
            } else {
                mensaje += ` ¡Has completado todos los pagos! Tu inscripción será confirmada.`
            }

            // Intentar enviar notificación (puede ser pastor o usuario regular)
            // Primero intentar con sendNotificationToUser (si es pastor registrado)
            const notificationResult = await this.notificationsService.sendNotificationToUser(
                inscripcion.email,
                titulo,
                mensaje,
                {
                    type: 'pago_validado',
                    pagoId: pago.id,
                    inscripcionId: inscripcion.id,
                    convencionId: inscripcionCompleta.convencionId,
                    numeroCuota: numeroCuota,
                    cuotasPagadas: cuotasPagadas,
                    cuotasTotales: numeroCuotas,
                    monto: monto,
                    metodoPago: pago.metodoPago,
                }
            )

            // Si no es pastor registrado, enviar email directamente
            if (!notificationResult.success || !notificationResult.emailSuccess) {
                const emailEnviado = await this.emailService.sendNotificationEmail(
                    inscripcion.email,
                    titulo,
                    mensaje,
                    {
                        type: 'pago_validado',
                        pagoId: pago.id,
                        inscripcionId: inscripcion.id,
                        convencionId: inscripcionCompleta.convencionId,
                        numeroCuota: numeroCuota,
                        cuotasPagadas: cuotasPagadas,
                        cuotasTotales: numeroCuotas,
                        monto: monto,
                        metodoPago: pago.metodoPago,
                    }
                )

                if (emailEnviado) {
                    this.logger.log(`📧 Email de pago validado enviado directamente a ${inscripcion.email} (Cuota ${numeroCuota}/${numeroCuotas})`)
                } else {
                    this.logger.warn(`⚠️ No se pudo enviar email de pago validado a ${inscripcion.email}`)
                }
            } else {
                this.logger.log(`📬 Notificación de pago validado enviada a ${inscripcion.email} (Cuota ${numeroCuota}/${numeroCuotas})`)
            }
        } catch (error) {
            this.logger.error(`Error enviando notificación de pago validado:`, error)
            // No fallar si la notificación falla
        }
    }

    /**
     * Verifica si todas las cuotas están pagadas y actualiza el estado de la inscripción
     */
    private async verificarYActualizarEstadoInscripcion(inscripcionId: string): Promise<void> {
        const inscripcion = await this.prisma.inscripcion.findUnique({
            where: { id: inscripcionId },
            include: { pagos: true },
        })

        if (!inscripcion) return

        // Obtener el número de cuotas configurado (por defecto 3)
        const numeroCuotas = inscripcion.numeroCuotas || 3

        // Contar cuotas completadas (pagos con numeroCuota y estado COMPLETADO)
        const cuotasCompletadas = inscripcion.pagos.filter(
            (p) => p.numeroCuota && p.estado === EstadoPago.COMPLETADO
        ).length

        // Si todas las cuotas están completadas, actualizar el estado de la inscripción a "confirmado"
        if (cuotasCompletadas >= numeroCuotas) {
            await this.prisma.inscripcion.update({
                where: { id: inscripcionId },
                data: { estado: 'confirmado' },
            })
            this.logger.log(`✅ Inscripción ${inscripcionId} marcada como confirmada (${cuotasCompletadas}/${numeroCuotas} cuotas pagadas)`)
            
            // Obtener información de la convención para el mensaje
            const convencion = await this.prisma.convencion.findUnique({
                where: { id: inscripcion.convencionId },
            })

            const tituloConvencion = convencion?.titulo || 'la convención'
            
            // Enviar notificación push al usuario con mensaje más detallado
            try {
                // Intentar enviar notificación (puede ser pastor o usuario regular)
                const notificationResult = await this.notificationsService.sendNotificationToUser(
                    inscripcion.email,
                    '🎉 ¡Inscripción Confirmada!',
                    `Tu inscripción a "${tituloConvencion}" ha sido confirmada. Todos los pagos han sido validados exitosamente. ¡Te esperamos!`,
                    {
                        type: 'inscripcion_confirmada',
                        inscripcionId: inscripcion.id,
                        convencionId: inscripcion.convencionId,
                        convencionTitulo: tituloConvencion,
                        cuotasPagadas: cuotasCompletadas,
                        cuotasTotales: numeroCuotas,
                    }
                )

                // Si no es pastor registrado, enviar email directamente
                if (!notificationResult.success || !notificationResult.emailSuccess) {
                    const emailEnviado = await this.emailService.sendNotificationEmail(
                        inscripcion.email,
                        '🎉 ¡Inscripción Confirmada!',
                        `Tu inscripción a "${tituloConvencion}" ha sido confirmada. Todos los pagos han sido validados exitosamente. ¡Te esperamos!`,
                        {
                            type: 'inscripcion_confirmada',
                            inscripcionId: inscripcion.id,
                            convencionId: inscripcion.convencionId,
                            convencionTitulo: tituloConvencion,
                            cuotasPagadas: cuotasCompletadas,
                            cuotasTotales: numeroCuotas,
                        }
                    )

                    if (emailEnviado) {
                        this.logger.log(`📧 Email de inscripción confirmada enviado directamente a ${inscripcion.email}`)
                    } else {
                        this.logger.warn(`⚠️ No se pudo enviar email de inscripción confirmada a ${inscripcion.email}`)
                    }
                } else {
                    this.logger.log(`📬 Notificación de inscripción confirmada enviada a ${inscripcion.email}`)
                }
            } catch (error) {
                this.logger.error(`Error enviando notificación a ${inscripcion.email}:`, error)
                // No fallar si la notificación falla
            }
        }
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
