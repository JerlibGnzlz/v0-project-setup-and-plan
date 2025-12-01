import { Injectable, Logger, NotFoundException, BadRequestException, ConflictException, Inject, forwardRef } from "@nestjs/common"
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

        // Validar que la convención esté activa
        if (!convencion.activa) {
            throw new BadRequestException('Esta convención no está disponible para inscripciones')
        }

        // Validar email duplicado ANTES de crear (usando transacción para evitar race conditions)
        const emailExistente = await this.checkInscripcionByEmail(dto.email, dto.convencionId)
        if (emailExistente) {
            throw new ConflictException(`El correo ${dto.email} ya está inscrito en esta convención`)
        }

        // Validar cupos disponibles ANTES de crear la inscripción
        if (convencion.cupoMaximo !== null && convencion.cupoMaximo !== undefined) {
            const inscripcionesConfirmadas = await this.prisma.inscripcion.count({
                where: {
                    convencionId: dto.convencionId,
                    estado: {
                        in: ['pendiente', 'confirmado'], // Contar pendientes y confirmados
                    },
                },
            })

            const cuposDisponibles = convencion.cupoMaximo - inscripcionesConfirmadas

            if (cuposDisponibles <= 0) {
                this.logger.warn(`⚠️ No hay cupos disponibles para convención ${convencion.titulo}. Cupos: ${convencion.cupoMaximo}, Inscritos: ${inscripcionesConfirmadas}`)
                throw new BadRequestException(
                    `Lo sentimos, no hay cupos disponibles para esta convención. ` +
                    `Cupos totales: ${convencion.cupoMaximo}, Inscritos: ${inscripcionesConfirmadas}`
                )
            }

            this.logger.log(`✅ Cupos disponibles: ${cuposDisponibles} de ${convencion.cupoMaximo}`)
        }

        // Calcular el costo (puede venir como Decimal de Prisma)
        const costoTotal = typeof convencion.costo === 'number'
            ? convencion.costo
            : parseFloat(String(convencion.costo || 0))

        const montoPorCuota = costoTotal / numeroCuotas

        // Generar código de referencia único
        const generarCodigoReferencia = async (): Promise<string> => {
            const año = new Date().getFullYear()
            let codigo: string
            let existe = true
            let intentos = 0
            const maxIntentos = 10

            while (existe && intentos < maxIntentos) {
                // Formato: AMVA-YYYY-XXXXXX (6 caracteres alfanuméricos)
                const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase()
                codigo = `AMVA-${año}-${randomPart}`

                const codigoExistente = await this.prisma.inscripcion.findFirst({
                    where: { codigoReferencia: codigo } as any,
                })

                existe = !!codigoExistente
                intentos++
            }

            if (intentos >= maxIntentos) {
                // Fallback: usar timestamp
                const timestamp = Date.now().toString(36).toUpperCase()
                codigo = `AMVA-${año}-${timestamp.slice(-6)}`
            }

            return codigo!
        }

        const codigoReferencia = await generarCodigoReferencia()
        this.logger.log(`🔖 Código de referencia generado: ${codigoReferencia}`)

        // Usar transacción para crear inscripción y pagos de forma atómica
        const inscripcion = await this.prisma.$transaction(async (tx) => {
            // Verificar nuevamente email duplicado dentro de la transacción (evitar race conditions)
            const emailDuplicado = await tx.inscripcion.findFirst({
                where: {
                    email: dto.email.toLowerCase(),
                    convencionId: dto.convencionId,
                },
            })

            if (emailDuplicado) {
                throw new ConflictException(`El correo ${dto.email} ya está inscrito en esta convención`)
            }

            // Verificar cupos nuevamente dentro de la transacción
            if (convencion.cupoMaximo !== null && convencion.cupoMaximo !== undefined) {
                const inscripcionesConfirmadas = await tx.inscripcion.count({
                    where: {
                        convencionId: dto.convencionId,
                        estado: {
                            in: ['pendiente', 'confirmado'],
                        },
                    },
                })

                const cuposDisponibles = convencion.cupoMaximo - inscripcionesConfirmadas
                if (cuposDisponibles <= 0) {
                    throw new BadRequestException('No hay cupos disponibles para esta convención')
                }
            }

            // Crear la inscripción
            const nuevaInscripcion = await tx.inscripcion.create({
                data: {
                    ...dto,
                    origenRegistro,
                    codigoReferencia,
                } as any,
                include: this.inscripcionIncludes,
            })

            // Si el origen es 'web' o 'mobile', crear automáticamente los pagos dentro de la transacción
            if (origenRegistro === 'web' || origenRegistro === 'mobile') {
                this.logger.log(`💰 Creando ${numeroCuotas} pago(s) automático(s) para inscripción ${nuevaInscripcion.id}`)

                // Si hay un documentoUrl en la inscripción, asignarlo al primer pago como comprobanteUrl
                const comprobanteUrl = dto.documentoUrl || null

                // Crear los pagos según el número de cuotas
                const pagos = []
                for (let i = 1; i <= numeroCuotas; i++) {
                    const pago = await tx.pago.create({
                        data: {
                            inscripcionId: nuevaInscripcion.id,
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

            // Recargar la inscripción con los pagos incluidos
            return await tx.inscripcion.findUnique({
                where: { id: nuevaInscripcion.id },
                include: this.inscripcionIncludes,
            })
        })

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

            // Obtener información de pagos para la notificación
            const pagosInfo = inscripcion.pagos || []
            const cuotasPendientes = pagosInfo.filter((p: any) => p.estado === 'PENDIENTE').length
            const cuotasPagadas = pagosInfo.filter((p: any) => p.estado === 'COMPLETADO').length
            const numeroCuotas = inscripcion.numeroCuotas || 3

            // Construir mensaje con información de pagos
            let mensaje = `${inscripcion.nombre} ${inscripcion.apellido} se ha inscrito a "${convencion.titulo}" desde ${origenTexto}.`
            if (numeroCuotas > 0) {
                mensaje += `\n💰 ${numeroCuotas} cuota(s) - ${cuotasPendientes} pendiente(s), ${cuotasPagadas} pagada(s)`
            }

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
                        numeroCuotas: numeroCuotas,
                        cuotasPendientes: cuotasPendientes,
                        cuotasPagadas: cuotasPagadas,
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
            // Obtener código de referencia de la inscripción actualizada
            const inscripcionCompleta = await this.prisma.inscripcion.findUnique({
                where: { id: inscripcion.id },
            })
            const codigoRef = (inscripcionCompleta as any)?.codigoReferencia || 'Pendiente'
            const cuerpoEmail = `
<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto;">
    <div style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">✅ Inscripción Recibida</h1>
    </div>
    
    <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
        <p style="font-size: 16px; margin-bottom: 20px;">¡Hola <strong>${inscripcion.nombre}</strong>!</p>
        
        <p style="font-size: 16px; margin-bottom: 20px;">
            Tu inscripción a la convención <strong>"${convencion.titulo}"</strong> ha sido recibida exitosamente.
        </p>
        
        <div style="background: #fef3c7; border: 2px solid #f59e0b; padding: 20px; margin: 25px 0; border-radius: 5px; text-align: center;">
            <h3 style="color: #92400e; margin: 0 0 10px 0; font-size: 18px;">🔖 Código de Referencia para Transferencia</h3>
            <p style="font-size: 24px; font-weight: bold; color: #d97706; margin: 0; letter-spacing: 2px; font-family: monospace;">
                ${codigoRef}
            </p>
            <p style="font-size: 12px; color: #78350f; margin: 10px 0 0 0;">
                ⚠️ <strong>IMPORTANTE:</strong> Incluye este código en el concepto de tu transferencia para facilitar la validación del pago.
            </p>
        </div>
        
        <div style="background: #f0f9ff; border-left: 4px solid #3b82f6; padding: 20px; margin: 25px 0; border-radius: 5px;">
            <h2 style="color: #1e40af; margin-top: 0; margin-bottom: 15px; font-size: 20px;">📋 Detalles de tu inscripción</h2>
            <table style="width: 100%; border-collapse: collapse;">
                <tr>
                    <td style="padding: 8px 0; font-weight: bold; color: #374151; width: 160px;">Convención:</td>
                    <td style="padding: 8px 0; color: #1f2937;">${convencion.titulo}</td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; font-weight: bold; color: #374151;">Fechas:</td>
                    <td style="padding: 8px 0; color: #1f2937;">${fechaInicio} al ${fechaFin}</td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; font-weight: bold; color: #374151;">Ubicación:</td>
                    <td style="padding: 8px 0; color: #1f2937;">${convencion.ubicacion}</td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; font-weight: bold; color: #374151;">Costo total:</td>
                    <td style="padding: 8px 0; color: #1f2937; font-weight: bold;">${costoTotalFormateado}</td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; font-weight: bold; color: #374151;">Número de cuotas:</td>
                    <td style="padding: 8px 0; color: #1f2937;">${numeroCuotas}</td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; font-weight: bold; color: #374151;">Monto por cuota:</td>
                    <td style="padding: 8px 0; color: #1f2937; font-weight: bold;">${montoPorCuotaFormateado}</td>
                </tr>
            </table>
        </div>
        
        <div style="background: #fffbeb; border-left: 4px solid #f59e0b; padding: 20px; margin: 25px 0; border-radius: 5px;">
            <p style="margin: 0; color: #92400e; font-weight: bold; font-size: 16px;">
                ⏳ Estado actual: <span style="color: #d97706;">Pendiente de pago</span>
            </p>
        </div>
        
        <div style="background: #f0fdf4; border-left: 4px solid #10b981; padding: 20px; margin: 25px 0; border-radius: 5px;">
            <h2 style="color: #059669; margin-top: 0; margin-bottom: 15px; font-size: 20px;">📝 Próximos Pasos</h2>
            
            <div style="margin-bottom: 20px;">
                <h3 style="color: #047857; margin: 0 0 10px 0; font-size: 16px;">1. Realizar el pago de tu(s) cuota(s):</h3>
                <ul style="margin: 0; padding-left: 20px; color: #1f2937;">
                    <li style="margin-bottom: 8px;">Puedes pagar en <strong>${numeroCuotas} cuota(s)</strong> de <strong>${montoPorCuotaFormateado}</strong> cada una</li>
                    <li style="margin-bottom: 8px;">O pagar el monto total de <strong>${costoTotalFormateado}</strong> de una vez</li>
                    <li style="margin-bottom: 8px;"><strong>⚠️ No olvides incluir el código de referencia <span style="font-family: monospace; background: #fef3c7; padding: 2px 6px; border-radius: 3px;">${codigoRef}</span> en el concepto de tu transferencia</strong></li>
                </ul>
            </div>
            
            <div style="margin-bottom: 20px;">
                <h3 style="color: #047857; margin: 0 0 10px 0; font-size: 16px;">2. Métodos de pago aceptados:</h3>
                <ul style="margin: 0; padding-left: 20px; color: #1f2937;">
                    <li style="margin-bottom: 8px;"><strong>Transferencia bancaria:</strong> Contacta a la administración para obtener los datos bancarios</li>
                    <li style="margin-bottom: 8px;"><strong>Mercado Pago:</strong> Solicita el link de pago a la administración</li>
                    <li style="margin-bottom: 8px;"><strong>Efectivo:</strong> Acércate a tu sede más cercana</li>
                </ul>
            </div>
            
            <div style="margin-bottom: 20px;">
                <h3 style="color: #047857; margin: 0 0 10px 0; font-size: 16px;">3. Subir comprobante de pago:</h3>
                <ul style="margin: 0; padding-left: 20px; color: #1f2937;">
                    <li style="margin-bottom: 8px;">Una vez realizado el pago, puedes subir el comprobante desde el dashboard administrativo</li>
                    <li style="margin-bottom: 8px;">O enviarlo por email a: <a href="mailto:contacto@vidaabundante.org" style="color: #3b82f6; text-decoration: none; font-weight: bold;">contacto@vidaabundante.org</a></li>
                </ul>
            </div>
            
            <div style="margin-bottom: 20px;">
                <h3 style="color: #047857; margin: 0 0 10px 0; font-size: 16px;">4. Validación:</h3>
                <ul style="margin: 0; padding-left: 20px; color: #1f2937;">
                    <li style="margin-bottom: 8px;">Nuestro equipo validará tu pago y te notificará por email</li>
                    <li style="margin-bottom: 8px;">Una vez validado, recibirás un email de confirmación</li>
                </ul>
            </div>
            
            <div style="margin-bottom: 0;">
                <h3 style="color: #047857; margin: 0 0 10px 0; font-size: 16px;">5. Confirmación final:</h3>
                <p style="margin: 0; color: #1f2937;">
                    Cuando todas las cuotas estén pagadas y validadas, recibirás la confirmación final de tu inscripción.
                </p>
            </div>
        </div>
        
        <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin: 25px 0; border-radius: 5px;">
            <h3 style="color: #92400e; margin-top: 0; margin-bottom: 10px; font-size: 18px;">💡 Importante</h3>
            <ul style="margin: 0; padding-left: 20px; color: #78350f;">
                <li style="margin-bottom: 8px;">Guarda este email como comprobante de tu inscripción</li>
                <li style="margin-bottom: 8px;">Si tienes alguna pregunta, contáctanos a: <a href="mailto:contacto@vidaabundante.org" style="color: #d97706; text-decoration: none; font-weight: bold;">contacto@vidaabundante.org</a></li>
                <li style="margin-bottom: 0;">El estado de tu inscripción se actualizará automáticamente cuando valides tus pagos</li>
            </ul>
        </div>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 25px; border-top: 2px solid #e5e7eb;">
            <p style="font-size: 18px; font-weight: bold; color: #059669; margin: 0;">
                ¡Te esperamos en la convención!
            </p>
        </div>
    </div>
    
    <div style="background: #f9fafb; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb; border-top: none;">
        <p style="font-size: 12px; color: #6b7280; margin: 0;">
            Asociación Misionera Vida Abundante - AMVA Digital
        </p>
    </div>
</div>
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
            const convencion = inscripcionCompleta.convencion
            const tituloConvencion = convencion?.titulo || 'la convención'

            let titulo = `✅ Pago de Cuota ${numeroCuota} Validado - ${tituloConvencion}`

            // Obtener información de pagos pendientes
            const pagosPendientes = inscripcionCompleta.pagos
                .filter((p) => p.estado === EstadoPago.PENDIENTE)
                .sort((a, b) => (a.numeroCuota || 0) - (b.numeroCuota || 0))

            const montoPorCuota = typeof convencion?.costo === 'number'
                ? convencion.costo / numeroCuotas
                : parseFloat(String(convencion?.costo || 0)) / numeroCuotas
            const montoPorCuotaFormateado = new Intl.NumberFormat('es-AR', {
                style: 'currency',
                currency: 'ARS',
            }).format(montoPorCuota)

            // Construir mensaje mejorado
            let mensaje = `
¡Hola ${inscripcion.nombre}!

Tu pago de la <strong>Cuota ${numeroCuota}</strong> por un monto de <strong>${montoFormateado}</strong> ha sido validado exitosamente.

📋 <strong>Resumen de tu inscripción:</strong>
• Convención: ${tituloConvencion}
• Progreso de pagos: ${cuotasPagadas} de ${numeroCuotas} cuotas pagadas
            `.trim()

            // Agregar información de cuotas pendientes si las hay
            if (cuotasPendientes > 0 && pagosPendientes.length > 0) {
                mensaje += `

---

<h3>📊 Cuotas Pendientes:</h3>
<ul>
${pagosPendientes.map((p) => {
                    const numCuota = p.numeroCuota || 0
                    const montoP = typeof p.monto === 'number' ? p.monto : parseFloat(String(p.monto || montoPorCuota))
                    const montoPFormateado = new Intl.NumberFormat('es-AR', {
                        style: 'currency',
                        currency: 'ARS',
                    }).format(montoP)
                    return `    <li><strong>Cuota ${numCuota}:</strong> ${montoPFormateado} - Estado: Pendiente</li>`
                }).join('\n')}
</ul>

---

<h3>💳 Próximos pasos para completar tu inscripción:</h3>
<ol>
    <li><strong>Realiza el pago de la siguiente cuota:</strong> ${montoPorCuotaFormateado}</li>
    <li><strong>Métodos de pago disponibles:</strong>
        <ul>
            <li><strong>Transferencia Bancaria:</strong> Contacta a la administración para obtener los datos bancarios.</li>
            <li><strong>Mercado Pago:</strong> Solicita el link de pago a la administración.</li>
            <li><strong>En efectivo:</strong> Acércate a tu sede más cercana.</li>
        </ul>
    </li>
    <li><strong>Envía tu comprobante:</strong> Una vez realizado el pago, envía el comprobante a la administración para su validación.</li>
    <li><strong>Contacto:</strong> Si tienes dudas sobre el pago o necesitas los datos bancarios, no dudes en contactarnos.</li>
</ol>
                `.trim()
            } else {
                mensaje += `

---

✅ <strong>¡Felicidades!</strong> Has completado todos los pagos. Tu inscripción será confirmada en breve y recibirás un email de confirmación final con todos los detalles del evento.
                `.trim()
            }

            mensaje += `

---

Si tienes alguna pregunta o necesitas asistencia, no dudes en contactarnos.

¡Te esperamos en la convención!
            `.trim()

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

            // Obtener información completa de la convención para el mensaje
            const convencion = await this.prisma.convencion.findUnique({
                where: { id: inscripcion.convencionId },
            })

            const tituloConvencion = convencion?.titulo || 'la convención'

            // Formatear fechas de la convención
            const fechaInicio = convencion?.fechaInicio
                ? new Date(convencion.fechaInicio).toLocaleDateString('es-AR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                })
                : 'Fecha por confirmar'
            const fechaFin = convencion?.fechaFin
                ? new Date(convencion.fechaFin).toLocaleDateString('es-AR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                })
                : 'Fecha por confirmar'
            const ubicacion = convencion?.ubicacion || 'Ubicación por confirmar'

            // Construir mensaje mejorado con información completa del evento
            const titulo = `🎉 ¡Inscripción Confirmada - ${tituloConvencion}!`
            const mensaje = `
<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto;">
    <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">🎉 ¡Inscripción Confirmada!</h1>
    </div>
    
    <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
        <p style="font-size: 16px; margin-bottom: 20px;">¡Hola <strong>${inscripcion.nombre}</strong>!</p>
        
        <p style="font-size: 16px; margin-bottom: 20px;">
            <strong>¡Felicidades!</strong> Tu inscripción a la convención <strong>"${tituloConvencion}"</strong> ha sido confirmada exitosamente. 
            Todos los pagos han sido validados.
        </p>
        
        <div style="background: #f0fdf4; border-left: 4px solid #10b981; padding: 20px; margin: 25px 0; border-radius: 5px;">
            <h2 style="color: #059669; margin-top: 0; margin-bottom: 15px; font-size: 20px;">📅 Información del Evento</h2>
            <table style="width: 100%; border-collapse: collapse;">
                <tr>
                    <td style="padding: 8px 0; font-weight: bold; color: #374151; width: 140px;">Convención:</td>
                    <td style="padding: 8px 0; color: #1f2937;">${tituloConvencion}</td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; font-weight: bold; color: #374151;">Fechas:</td>
                    <td style="padding: 8px 0; color: #1f2937;">${fechaInicio} al ${fechaFin}</td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; font-weight: bold; color: #374151;">Ubicación:</td>
                    <td style="padding: 8px 0; color: #1f2937;">${ubicacion}</td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; font-weight: bold; color: #374151;">Estado:</td>
                    <td style="padding: 8px 0; color: #059669; font-weight: bold;">✅ Confirmado</td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; font-weight: bold; color: #374151;">Pagos:</td>
                    <td style="padding: 8px 0; color: #1f2937;">${cuotasCompletadas} de ${numeroCuotas} cuotas completadas</td>
                </tr>
            </table>
        </div>
        
        <div style="background: #fffbeb; border-left: 4px solid #f59e0b; padding: 20px; margin: 25px 0; border-radius: 5px;">
            <h2 style="color: #d97706; margin-top: 0; margin-bottom: 15px; font-size: 20px;">📋 Información Importante</h2>
            <ul style="margin: 0; padding-left: 20px; color: #1f2937;">
                <li style="margin-bottom: 10px;"><strong>Llegada:</strong> Te recomendamos llegar con anticipación el día del evento.</li>
                <li style="margin-bottom: 10px;"><strong>Documentación:</strong> Asegúrate de traer un documento de identidad.</li>
                <li style="margin-bottom: 10px;"><strong>Contacto:</strong> Si tienes alguna pregunta o necesitas asistencia, no dudes en contactarnos.</li>
            </ul>
        </div>
        
        <div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 20px; margin: 25px 0; border-radius: 5px;">
            <h2 style="color: #2563eb; margin-top: 0; margin-bottom: 15px; font-size: 20px;">📞 Contacto de Emergencia</h2>
            <p style="margin: 0 0 10px 0; color: #1f2937;">
                Si necesitas comunicarte con nosotros antes o durante el evento, puedes hacerlo a través de:
            </p>
            <ul style="margin: 0; padding-left: 20px; color: #1f2937;">
                <li style="margin-bottom: 8px;"><strong>Email:</strong> Contacta a la administración</li>
                <li style="margin-bottom: 8px;"><strong>Teléfono:</strong> Contacta a tu sede más cercana</li>
            </ul>
        </div>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 25px; border-top: 2px solid #e5e7eb;">
            <p style="font-size: 18px; font-weight: bold; color: #059669; margin-bottom: 10px;">
                ¡Te esperamos en la convención!
            </p>
            <p style="font-size: 14px; color: #6b7280; margin: 0;">
                Estamos emocionados de tenerte con nosotros.
            </p>
            <p style="font-size: 14px; color: #6b7280; margin-top: 15px; font-style: italic;">
                Que Dios bendiga tu participación en este evento.
            </p>
        </div>
    </div>
    
    <div style="background: #f9fafb; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb; border-top: none;">
        <p style="font-size: 12px; color: #6b7280; margin: 0;">
            Asociación Misionera Vida Abundante - AMVA Digital
        </p>
    </div>
</div>
            `.trim()

            // Enviar notificación push al usuario con mensaje más detallado
            try {
                // Intentar enviar notificación (puede ser pastor o usuario regular)
                const notificationResult = await this.notificationsService.sendNotificationToUser(
                    inscripcion.email,
                    titulo,
                    mensaje,
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
                        titulo,
                        mensaje,
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
