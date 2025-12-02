import { Injectable, Logger, NotFoundException, BadRequestException, ConflictException, Inject, forwardRef, Optional } from "@nestjs/common"
import { EventEmitter2 } from "@nestjs/event-emitter"
import { PrismaService } from "../../prisma/prisma.service"
import { CreateInscripcionDto, UpdateInscripcionDto, CreatePagoDto, UpdatePagoDto, EstadoPago } from "./dto/inscripcion.dto"
import { Inscripcion, Pago } from "@prisma/client"
import { InscripcionFilterDto, PagoFilterDto } from "../../common/dto/search-filter.dto"
import { Prisma } from "@prisma/client"
import {
    PagoValidadoEvent,
    PagoRechazadoEvent,
    PagoRehabilitadoEvent,
    PagoRecordatorioEvent,
    InscripcionCreadaEvent,
    InscripcionConfirmadaEvent,
    InscripcionCanceladaEvent,
    NotificationEventType,
} from "../notifications/events/notification.events"
import { NotificationsService } from "../notifications/notifications.service"
import { AuditService } from "../../common/services/audit.service"

/**
 * Servicio para gestión de Inscripciones y Pagos
 * 
 * IMPORTANTE: Este servicio gestiona SOLO inscripciones a convenciones.
 * NO gestiona pastores de la estructura organizacional (ver PastoresService).
 * 
 * Separación de conceptos:
 * - Inscripciones: Participantes de convenciones (esta tabla)
 * - Pastores: Estructura organizacional del ministerio (tabla separada)
 * 
 * Las inscripciones se crean desde:
 * - Landing page (origenRegistro: 'web')
 * - Admin dashboard (origenRegistro: 'dashboard')
 * - App móvil (origenRegistro: 'mobile')
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
        private eventEmitter: EventEmitter2,
        private auditService: AuditService,
        @Optional() @Inject(forwardRef(() => NotificationsService))
        private notificationsService?: NotificationsService,
    ) { }

    // ==================== INSCRIPCIONES ====================

    /**
     * Obtiene todas las inscripciones con relaciones (paginado)
     */
    async findAllInscripciones(
        page: number = 1,
        limit: number = 20,
        filters?: InscripcionFilterDto
    ): Promise<{
        data: (Inscripcion & { convencion: any; pagos: any[] })[]
        meta: {
            page: number
            limit: number
            total: number
            totalPages: number
            hasNextPage: boolean
            hasPreviousPage: boolean
        }
    }> {
        const skip = (page - 1) * limit
        const take = limit

        // Construir condiciones WHERE
        const where: Prisma.InscripcionWhereInput = {}

        // Aplicar filtro de estado
        if (filters?.estado && filters.estado !== 'todos') {
            where.estado = filters.estado
        }

        // Aplicar filtro de origen
        if (filters?.origen && filters.origen !== 'todos') {
            where.origenRegistro = filters.origen
        }

        // Aplicar filtro de convención
        if (filters?.convencionId) {
            where.convencionId = filters.convencionId
        }

        // Aplicar búsqueda (busca en nombre, apellido, email, sede)
        if (filters?.search || filters?.q) {
            const searchTerm = (filters.search || filters.q || '').trim()
            if (searchTerm) {
                where.OR = [
                    { nombre: { contains: searchTerm, mode: 'insensitive' } },
                    { apellido: { contains: searchTerm, mode: 'insensitive' } },
                    { email: { contains: searchTerm, mode: 'insensitive' } },
                    { sede: { contains: searchTerm, mode: 'insensitive' } },
                    { telefono: { contains: searchTerm, mode: 'insensitive' } },
                ]
            }
        }

        const [data, total] = await Promise.all([
            this.prisma.inscripcion.findMany({
                where,
                include: this.inscripcionIncludes,
                orderBy: { fechaInscripcion: "desc" },
                skip,
                take,
            }),
            this.prisma.inscripcion.count({ where }),
        ])

        const totalPages = Math.ceil(total / limit)

        return {
            data,
            meta: {
                page,
                limit,
                total,
                totalPages,
                hasNextPage: page < totalPages,
                hasPreviousPage: page > 1,
            },
        }
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
     * 
     * IMPORTANTE: Este método SOLO crea inscripciones en la tabla 'inscripciones'.
     * NO crea pastores en la tabla 'pastores' (estructura organizacional).
     * 
     * Separación de conceptos:
     * - Pastores: Solo se crean desde la gestión de pastores (app/admin/pastores)
     * - Inscripciones: Se crean desde aquí (landing page, admin, o mobile app)
     * 
     * Origen de registro:
     * - 'web': Desde la landing page (formulario público)
     * - 'dashboard': Desde el admin dashboard (inscripción manual)
     * - 'mobile': Desde la app móvil (cuando esté disponible)
     * 
     * Si el origen es 'web' o 'mobile', crea automáticamente los pagos según numeroCuotas
     */
    async createInscripcion(dto: CreateInscripcionDto): Promise<Inscripcion> {
        this.logger.log(`📝 Creando inscripción para: ${dto.nombre} (origen: ${dto.origenRegistro || 'web'})`)

        const origenRegistro = dto.origenRegistro || 'web'

        // Validar que el origen de registro sea válido
        if (origenRegistro && !['web', 'mobile', 'dashboard'].includes(origenRegistro)) {
            throw new BadRequestException(`Origen de registro inválido: ${origenRegistro}. Debe ser: web, mobile o dashboard`)
        }
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

            // Crear invitado si no existe (para que pueda autenticarse después)
            // Esto permite que los invitados puedan usar la app móvil después de inscribirse
            // IMPORTANTE: Usamos el modelo 'invitado' de Prisma, NO 'pastor'
            // El cast es necesario porque Prisma TransactionClient tiene tipos específicos
            const txInvitado = (tx as any).invitado
            let invitado = await txInvitado.findUnique({
                where: { email: dto.email.toLowerCase() },
            })

            if (!invitado) {
                invitado = await txInvitado.create({
                    data: {
                        nombre: dto.nombre,
                        apellido: dto.apellido,
                        email: dto.email.toLowerCase(),
                        telefono: dto.telefono,
                        sede: dto.sede,
                    },
                })
                this.logger.log(`✅ Invitado creado automáticamente en tabla 'invitados': ${invitado.email}`)
                this.logger.log(`📋 NOTA: Este invitado NO se guarda en tabla 'pastores'`)
            } else {
                this.logger.log(`✅ Invitado ya existe: ${invitado.email}`)
            }

            // Crear la inscripción vinculada al invitado
            // IMPORTANTE: Esta acción NO crea un registro en la tabla 'pastores'
            // 
            // Separación clara:
            // - Invitados desde web: Inscripción + Invitado (NO pastor organizacional)
            // - Pastores organizacionales: Se crean desde /admin/pastores
            // - Inscripciones: Se crean desde aquí (web, dashboard, mobile)
            const nuevaInscripcion = await tx.inscripcion.create({
                data: {
                    ...dto,
                    origenRegistro,
                    codigoReferencia,
                    invitadoId: invitado.id, // Vincular con invitado
                } as any,
                include: this.inscripcionIncludes,
            })

            this.logger.log(`✅ Inscripción creada: ${nuevaInscripcion.id} (origen: ${origenRegistro})`)
            this.logger.log(`📋 Nota: Esta inscripción NO crea un pastor en la estructura organizacional`)
            this.logger.log(`📋 Invitados desde web van a inscripciones, NO a estructura organizacional`)

            // Validación explícita: Verificar que NO se creó un pastor por error
            const pastorCreadoPorError = await tx.pastor.findUnique({
                where: { email: dto.email.toLowerCase() },
            })

            if (pastorCreadoPorError && pastorCreadoPorError.createdAt > new Date(Date.now() - 5000)) {
                // Si se creó un pastor en los últimos 5 segundos, es un error
                this.logger.error(`⚠️ ERROR: Se detectó un pastor creado recientemente con el mismo email. Esto NO debería pasar.`)
                this.logger.error(`⚠️ Email: ${dto.email}, Pastor ID: ${pastorCreadoPorError.id}`)
            }

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

            // Enviar notificación a cada admin (usando NotificationsService directamente para admins)
            // Nota: Las notificaciones a admins no usan eventos aún, se mantiene el servicio directo
            if (this.notificationsService) {
                try {
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
                } catch (error) {
                    this.logger.error(`Error enviando notificaciones a admins:`, error)
                }
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

            // Emitir evento de inscripción creada
            const event = new InscripcionCreadaEvent({
                email: inscripcion.email,
                inscripcionId: inscripcion.id,
                convencionTitulo: convencion.titulo,
                numeroCuotas: numeroCuotas,
                montoTotal: costoTotal,
                origenRegistro: origenRegistro,
            })

            this.eventEmitter.emit(NotificationEventType.INSCRIPCION_CREADA, event)
            this.logger.log(`📬 Evento INSCRIPCION_CREADA emitido para ${inscripcion.email}`)
        } catch (error) {
            this.logger.error(`Error emitiendo evento de inscripción creada:`, error)
            // No fallar si el evento falla
        }

        // Retornar la inscripción con los pagos incluidos
        return this.findOneInscripcion(inscripcion.id)
    }

    /**
     * Actualiza una inscripción
     */
    async updateInscripcion(id: string, dto: UpdateInscripcionDto, userId?: string, userEmail?: string): Promise<Inscripcion> {
        const inscripcionExistente = await this.findOneInscripcion(id) // Verifica existencia

        // Si se está actualizando el email, validar que no esté duplicado en la misma convención
        if (dto.email && dto.email.toLowerCase() !== inscripcionExistente.email.toLowerCase()) {
            const emailDuplicado = await this.checkInscripcionByEmail(dto.email, inscripcionExistente.convencionId)
            if (emailDuplicado && emailDuplicado.id !== id) {
                throw new ConflictException(`El correo ${dto.email} ya está inscrito en esta convención`)
            }
        }

        // Preparar datos para actualizar (filtrar undefined y null innecesarios)
        const dataToUpdate: any = {}
        if (dto.nombre !== undefined) dataToUpdate.nombre = dto.nombre
        if (dto.apellido !== undefined) dataToUpdate.apellido = dto.apellido
        if (dto.email !== undefined) dataToUpdate.email = dto.email.toLowerCase()
        if (dto.telefono !== undefined) {
            // Si telefono es null o string vacío, establecer null
            dataToUpdate.telefono = dto.telefono && dto.telefono.trim() ? dto.telefono.trim() : null
        }
        if (dto.sede !== undefined) {
            dataToUpdate.sede = dto.sede && dto.sede.trim() ? dto.sede.trim() : null
        }
        if (dto.tipoInscripcion !== undefined) dataToUpdate.tipoInscripcion = dto.tipoInscripcion
        if (dto.estado !== undefined) dataToUpdate.estado = dto.estado
        if (dto.notas !== undefined) {
            dataToUpdate.notas = dto.notas && dto.notas.trim() ? dto.notas.trim() : null
        }
        if (dto.numeroCuotas !== undefined) dataToUpdate.numeroCuotas = dto.numeroCuotas

        this.logger.log(`✏️ Actualizando inscripción ${id} con datos:`, dataToUpdate)

        const updated = await this.prisma.inscripcion.update({
            where: { id },
            data: dataToUpdate,
            include: this.inscripcionIncludes,
        })

        // Registrar auditoría
        const auditData = this.auditService.createAuditDataFromChanges(
            'INSCRIPCION',
            id,
            'UPDATE',
            inscripcionExistente,
            dataToUpdate,
            userId,
            userEmail
        )
        await this.auditService.log(auditData)

        return updated
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
    async findAllPagos(
        page: number = 1,
        limit: number = 20,
        filters?: PagoFilterDto
    ): Promise<{
        data: any[]
        meta: {
            page: number
            limit: number
            total: number
            totalPages: number
            hasNextPage: boolean
            hasPreviousPage: boolean
        }
    }> {
        // Validar y normalizar parámetros
        const pageNum = Math.max(1, Math.floor(page) || 1)
        const limitNum = Math.max(1, Math.min(100, Math.floor(limit) || 20))
        const skip = (pageNum - 1) * limitNum
        const take = limitNum

        this.logger.log(`🔍 findAllPagos llamado - página: ${pageNum}, límite: ${limitNum}, filtros: ${JSON.stringify(filters)}`)

        // Construir condiciones WHERE
        const where: Prisma.PagoWhereInput = {}

        // Aplicar filtro de estado
        if (filters?.estado && filters.estado !== 'todos') {
            where.estado = filters.estado as EstadoPago
        }

        // Aplicar filtro de método de pago
        if (filters?.metodoPago && filters.metodoPago !== 'todos') {
            where.metodoPago = filters.metodoPago
        }

        // Aplicar filtro de inscripción
        if (filters?.inscripcionId) {
            where.inscripcionId = filters.inscripcionId
        }

        // Construir filtro de inscripción (puede incluir convencionId y origenRegistro)
        const inscripcionFilter: any = {}

        if (filters?.convencionId) {
            inscripcionFilter.convencionId = filters.convencionId
        }

        if (filters?.origen && filters.origen !== 'todos') {
            inscripcionFilter.origenRegistro = filters.origen
        }

        // Solo agregar el filtro de inscripción si tiene al menos una condición
        if (Object.keys(inscripcionFilter).length > 0) {
            where.inscripcion = inscripcionFilter
        }

        // Aplicar búsqueda (busca en referencia, notas, y datos de la inscripción relacionada)
        if (filters?.search || filters?.q) {
            const searchTerm = (filters.search || filters.q || '').trim()
            if (searchTerm) {
                // Guardar el filtro de inscripción existente si existe
                const inscripcionFilter = where.inscripcion

                // Construir el OR para la búsqueda
                const searchOR: any[] = [
                    { referencia: { contains: searchTerm, mode: 'insensitive' } },
                    { notas: { contains: searchTerm, mode: 'insensitive' } },
                ]

                // Agregar búsqueda en inscripción
                const inscripcionSearch: any = {
                    OR: [
                        { nombre: { contains: searchTerm, mode: 'insensitive' } },
                        { apellido: { contains: searchTerm, mode: 'insensitive' } },
                        { email: { contains: searchTerm, mode: 'insensitive' } },
                    ],
                }

                // Si hay un filtro de inscripción existente, combinarlo con la búsqueda
                if (inscripcionFilter) {
                    inscripcionSearch.AND = [inscripcionFilter]
                }

                searchOR.push({ inscripcion: inscripcionSearch })

                // Si ya hay un OR, combinarlo con AND
                if (where.OR) {
                    where.AND = [
                        { OR: where.OR },
                        { OR: searchOR },
                    ]
                    delete where.OR
                } else {
                    where.OR = searchOR
                }

                // Eliminar el filtro de inscripción del where principal ya que está en OR
                delete where.inscripcion
            }
        }

        // Construir opciones de consulta
        // Simplificar: siempre usar where (Prisma maneja objetos vacíos correctamente)
        const whereClause = Object.keys(where).length > 0 ? where : {}

        const findManyOptions: Prisma.PagoFindManyArgs = {
            where: whereClause,
            include: this.pagoIncludes,
            orderBy: { createdAt: "desc" },
            skip,
            take,
        }

        const countOptions: Prisma.PagoCountArgs = {
            where: whereClause,
        }

        this.logger.log(`📋 Buscando pagos - página: ${pageNum}, límite: ${limitNum}`)
        this.logger.log(`📋 Filtros recibidos: ${JSON.stringify(filters, null, 2)}`)
        this.logger.log(`📋 WHERE clause: ${JSON.stringify(whereClause, null, 2)}`)

        try {
            const [data, total] = await Promise.all([
                this.prisma.pago.findMany(findManyOptions),
                this.prisma.pago.count(countOptions),
            ])

            this.logger.log(`✅ Encontrados ${data.length} pagos de ${total} totales`)

            const totalPages = Math.ceil(total / limitNum)

            return {
                data: data as any[],
                meta: {
                    page: pageNum,
                    limit: limitNum,
                    total,
                    totalPages,
                    hasNextPage: pageNum < totalPages,
                    hasPreviousPage: pageNum > 1,
                },
            }
        } catch (error: any) {
            this.logger.error(`❌ Error al buscar pagos:`, error)
            this.logger.error(`WHERE clause que causó el error:`, JSON.stringify(whereClause, null, 2))
            this.logger.error(`Filtros recibidos:`, JSON.stringify(filters, null, 2))
            this.logger.error(`Error completo:`, {
                message: error.message,
                code: error.code,
                meta: error.meta,
                stack: error.stack?.substring(0, 1000),
            })
            // Re-lanzar el error para que el controlador lo maneje
            throw error
        }
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
    async updatePago(id: string, dto: UpdatePagoDto, userId?: string): Promise<Pago & { advertenciaMonto?: string }> {
        const pago = await this.findOnePago(id) // Verifica existencia

        const data: any = { ...dto }
        if (dto.monto) {
            data.monto = parseFloat(dto.monto)
        }

        // Validar monto cuando se marca como COMPLETADO
        let advertenciaMonto: string | undefined
        if (dto.estado === EstadoPago.COMPLETADO) {
            const inscripcionCompleta = await this.prisma.inscripcion.findUnique({
                where: { id: pago.inscripcionId },
                include: { convencion: true },
            })

            if (inscripcionCompleta?.convencion) {
                const costoTotal = typeof inscripcionCompleta.convencion.costo === 'number'
                    ? inscripcionCompleta.convencion.costo
                    : parseFloat(String(inscripcionCompleta.convencion.costo || 0))
                const numeroCuotas = inscripcionCompleta.numeroCuotas || 3
                const montoEsperadoPorCuota = costoTotal / numeroCuotas
                const montoPago = dto.monto ? parseFloat(dto.monto) : (typeof pago.monto === 'number' ? pago.monto : parseFloat(String(pago.monto || 0)))

                // Calcular diferencia porcentual
                const diferencia = Math.abs(montoPago - montoEsperadoPorCuota)
                const diferenciaPorcentual = (diferencia / montoEsperadoPorCuota) * 100

                // Si hay diferencia mayor al 5%, generar advertencia
                if (diferenciaPorcentual > 5) {
                    const montoEsperadoFormateado = new Intl.NumberFormat('es-AR', {
                        style: 'currency',
                        currency: 'ARS',
                    }).format(montoEsperadoPorCuota)
                    const montoRecibidoFormateado = new Intl.NumberFormat('es-AR', {
                        style: 'currency',
                        currency: 'ARS',
                    }).format(montoPago)

                    advertenciaMonto = `⚠️ Advertencia: El monto recibido (${montoRecibidoFormateado}) difiere del monto esperado (${montoEsperadoFormateado}). Diferencia: ${diferenciaPorcentual.toFixed(1)}%`
                    this.logger.warn(`⚠️ Advertencia de monto para pago ${id}: ${advertenciaMonto}`)
                }
            }
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

        // Registrar auditoría si se cambió el estado
        if (dto.estado && dto.estado !== pago.estado && userId) {
            await this.registrarAuditoriaPago({
                pagoId: id,
                inscripcionId: pago.inscripcionId,
                accion: dto.estado === EstadoPago.COMPLETADO ? 'VALIDAR' : dto.estado === EstadoPago.CANCELADO ? 'RECHAZAR' : 'ACTUALIZAR',
                estadoAnterior: pago.estado,
                estadoNuevo: dto.estado,
                usuarioId: userId,
                motivo: dto.notas || undefined,
            })
        }

        // Si el pago se completó, enviar notificación y verificar si todas las cuotas están pagadas
        // Nota: En validación masiva, las notificaciones se envían pero no bloquean el proceso
        if (dto.estado === EstadoPago.COMPLETADO && pagoActualizado.inscripcionId) {
            // Enviar notificación de pago individual validado (no bloqueante)
            this.enviarNotificacionPagoValidado(pagoActualizado).catch((error) => {
                this.logger.warn(`No se pudo enviar notificación para pago ${pagoActualizado.id}:`, error)
            })

            // Verificar si todas las cuotas están pagadas (no bloqueante)
            this.verificarYActualizarEstadoInscripcion(pagoActualizado.inscripcionId).catch((error) => {
                this.logger.warn(`No se pudo verificar estado de inscripción ${pagoActualizado.inscripcionId}:`, error)
            })
        }

        return { ...pagoActualizado, advertenciaMonto }
    }

    /**
     * Emite evento cuando se valida un pago individual (cuota)
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

            const monto = typeof pago.monto === 'number'
                ? pago.monto
                : parseFloat(String(pago.monto || 0))

            const numeroCuota = pago.numeroCuota || 1
            const convencion = inscripcionCompleta.convencion

            // Emitir evento de pago validado
            const event = new PagoValidadoEvent({
                email: inscripcion.email,
                pagoId: pago.id,
                inscripcionId: inscripcion.id,
                monto,
                numeroCuota,
                cuotasTotales: numeroCuotas,
                cuotasPagadas,
                convencionTitulo: convencion?.titulo || 'Convención',
                metodoPago: pago.metodoPago || undefined,
            })

            this.eventEmitter.emit(NotificationEventType.PAGO_VALIDADO, event)
            this.logger.log(`📬 Evento PAGO_VALIDADO emitido para ${inscripcion.email}`)
        } catch (error) {
            this.logger.error(`Error emitiendo evento de pago validado:`, error)
            // No fallar si el evento falla
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

            // Emitir evento de inscripción confirmada
            try {
                const inscripcionCompleta = await this.prisma.inscripcion.findUnique({
                    where: { id: inscripcion.id },
                    include: { convencion: true },
                })

                if (inscripcionCompleta && inscripcionCompleta.email) {
                    const event = new InscripcionConfirmadaEvent({
                        email: inscripcionCompleta.email,
                        inscripcionId: inscripcionCompleta.id,
                        convencionTitulo: inscripcionCompleta.convencion?.titulo || 'Convención',
                        fechaInicio: inscripcionCompleta.convencion?.fechaInicio || new Date(),
                        ubicacion: inscripcionCompleta.convencion?.ubicacion || 'Por confirmar',
                    })

                    this.eventEmitter.emit(NotificationEventType.INSCRIPCION_CONFIRMADA, event)
                    this.logger.log(`📬 Evento INSCRIPCION_CONFIRMADA emitido para ${inscripcionCompleta.email}`)
                }
            } catch (error) {
                this.logger.error(`Error emitiendo evento de inscripción confirmada:`, error)
                // No fallar si el evento falla
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
     * Rechaza/cancela un pago y envía notificación al usuario
     */
    async rejectPago(id: string, motivo?: string, userId?: string): Promise<Pago> {
        this.logger.log(`❌ Rechazando pago: ${id} - Motivo: ${motivo || 'No especificado'}`)

        const pago = await this.findOnePago(id)
        const estadoAnterior = pago.estado

        const pagoRechazado = await this.prisma.pago.update({
            where: { id },
            data: {
                estado: EstadoPago.CANCELADO,
                notas: motivo ? `Rechazado: ${motivo}` : pago.notas,
            },
            include: this.pagoIncludes,
        })

        // Registrar auditoría
        if (userId) {
            await this.registrarAuditoriaPago({
                pagoId: id,
                inscripcionId: pago.inscripcionId,
                accion: 'RECHAZAR',
                estadoAnterior,
                estadoNuevo: EstadoPago.CANCELADO,
                usuarioId: userId,
                motivo,
            })
        }

        // Enviar notificación de rechazo al usuario
        await this.enviarNotificacionPagoRechazado(pagoRechazado, motivo)

        return pagoRechazado
    }

    /**
     * Rehabilita un pago rechazado para que pueda volver a enviarse
     */
    async rehabilitarPago(id: string, userId?: string): Promise<Pago> {
        this.logger.log(`🔄 Rehabilitando pago: ${id}`)

        const pago = await this.findOnePago(id)
        const estadoAnterior = pago.estado

        if (pago.estado !== EstadoPago.CANCELADO) {
            throw new BadRequestException('Solo se pueden rehabilitar pagos rechazados')
        }

        const pagoRehabilitado = await this.prisma.pago.update({
            where: { id },
            data: {
                estado: EstadoPago.PENDIENTE,
                notas: pago.notas ? `${pago.notas}\nRehabilitado: ${new Date().toLocaleString()}` : `Rehabilitado: ${new Date().toLocaleString()}`,
                comprobanteUrl: null, // Limpiar comprobante para que suba uno nuevo
                referencia: null, // Limpiar referencia
            },
            include: this.pagoIncludes,
        })

        // Registrar auditoría
        if (userId) {
            await this.registrarAuditoriaPago({
                pagoId: id,
                inscripcionId: pago.inscripcionId,
                accion: 'REHABILITAR',
                estadoAnterior,
                estadoNuevo: EstadoPago.PENDIENTE,
                usuarioId: userId,
            })
        }

        // Enviar notificación de pago rehabilitado
        await this.enviarNotificacionPagoRehabilitado(pagoRehabilitado)

        return pagoRehabilitado
    }

    /**
     * Registra una acción de auditoría para un pago
     */
    private async registrarAuditoriaPago(data: {
        pagoId: string
        inscripcionId: string
        accion: string
        estadoAnterior?: string
        estadoNuevo?: string
        usuarioId?: string
        motivo?: string
        metadata?: any
    }): Promise<void> {
        try {
            await this.prisma.auditoriaPago.create({
                data: {
                    pagoId: data.pagoId,
                    inscripcionId: data.inscripcionId,
                    accion: data.accion,
                    estadoAnterior: data.estadoAnterior,
                    estadoNuevo: data.estadoNuevo,
                    usuarioId: data.usuarioId,
                    motivo: data.motivo,
                    metadata: data.metadata || {},
                },
            })
            this.logger.log(`📝 Auditoría registrada: ${data.accion} para pago ${data.pagoId}`)
        } catch (error) {
            this.logger.error(`Error registrando auditoría:`, error)
            // No fallar si la auditoría falla
        }
    }

    /**
     * Obtiene el historial de auditoría de un pago
     */
    async getHistorialAuditoriaPago(pagoId: string): Promise<any[]> {
        return (this.prisma as any).auditoriaPago.findMany({
            where: { pagoId },
            orderBy: { createdAt: 'desc' },
        })
    }

    /**
     * Obtiene el historial de auditoría de una inscripción
     */
    async getHistorialAuditoriaInscripcion(inscripcionId: string): Promise<any[]> {
        return (this.prisma as any).auditoriaPago.findMany({
            where: { inscripcionId },
            include: {
                pago: {
                    select: {
                        id: true,
                        numeroCuota: true,
                        monto: true,
                        metodoPago: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        })
    }

    /**
     * Valida múltiples pagos en lote
     */
    async validarPagosMasivos(ids: string[], userId?: string): Promise<{
        exitosos: number
        fallidos: number
        advertencias: number
        detalles: Array<{ id: string; exito: boolean; advertencia?: string; error?: string }>
    }> {
        this.logger.log(`📦 Validando ${ids.length} pagos en lote`)

        if (!ids || ids.length === 0) {
            throw new BadRequestException('No se proporcionaron IDs de pagos para validar')
        }

        let exitosos = 0
        let fallidos = 0
        let advertencias = 0
        const detalles: Array<{ id: string; exito: boolean; advertencia?: string; error?: string }> = []

        for (const id of ids) {
            try {
                if (!id || typeof id !== 'string') {
                    throw new BadRequestException(`ID de pago inválido: ${id}`)
                }

                // Verificar que el pago existe antes de actualizar
                const pagoExistente = await this.findOnePago(id).catch(() => null)
                if (!pagoExistente) {
                    throw new NotFoundException(`Pago con ID "${id}" no encontrado`)
                }

                // Validar que el pago esté en estado PENDIENTE
                if (pagoExistente.estado !== EstadoPago.PENDIENTE) {
                    throw new BadRequestException(`El pago ${id} no está en estado PENDIENTE (estado actual: ${pagoExistente.estado})`)
                }

                const resultado = await this.updatePago(id, { estado: EstadoPago.COMPLETADO }, userId)

                if (resultado && resultado.advertenciaMonto) {
                    advertencias++
                    detalles.push({ id, exito: true, advertencia: resultado.advertenciaMonto })
                } else {
                    exitosos++
                    detalles.push({ id, exito: true })
                }
            } catch (error: any) {
                fallidos++
                const errorMessage = error?.message || error?.response?.message || 'Error desconocido'
                detalles.push({
                    id,
                    exito: false,
                    error: errorMessage,
                })
                this.logger.error(`Error validando pago ${id}:`, errorMessage)
            }
        }

        this.logger.log(`✅ Validación masiva completada: ${exitosos} exitosos, ${advertencias} con advertencias, ${fallidos} fallidos`)

        return { exitosos, fallidos, advertencias, detalles }
    }

    /**
     * Emite evento cuando se rechaza un pago
     */
    private async enviarNotificacionPagoRechazado(pago: Pago & { inscripcion: any }, motivo?: string): Promise<void> {
        try {
            const inscripcion = pago.inscripcion
            if (!inscripcion || !inscripcion.email) {
                return
            }

            const inscripcionCompleta = await this.prisma.inscripcion.findUnique({
                where: { id: inscripcion.id },
                include: { convencion: true },
            })

            if (!inscripcionCompleta) return

            const event = new PagoRechazadoEvent({
                email: inscripcion.email,
                pagoId: pago.id,
                inscripcionId: inscripcion.id,
                motivo,
                convencionTitulo: inscripcionCompleta.convencion?.titulo || 'Convención',
            })

            this.eventEmitter.emit(NotificationEventType.PAGO_RECHAZADO, event)
            this.logger.log(`📬 Evento PAGO_RECHAZADO emitido para ${inscripcion.email}`)
        } catch (error) {
            this.logger.error(`Error emitiendo evento de pago rechazado:`, error)
        }
    }

    /**
     * Emite evento cuando se rehabilita un pago
     */
    private async enviarNotificacionPagoRehabilitado(pago: Pago & { inscripcion: any }): Promise<void> {
        try {
            const inscripcion = pago.inscripcion
            if (!inscripcion || !inscripcion.email) {
                return
            }

            const inscripcionCompleta = await this.prisma.inscripcion.findUnique({
                where: { id: inscripcion.id },
                include: { convencion: true },
            })

            if (!inscripcionCompleta) return

            const event = new PagoRehabilitadoEvent({
                email: inscripcion.email,
                pagoId: pago.id,
                inscripcionId: inscripcion.id,
                convencionTitulo: inscripcionCompleta.convencion?.titulo || 'Convención',
            })

            this.eventEmitter.emit(NotificationEventType.PAGO_REHABILITADO, event)
            this.logger.log(`📬 Evento PAGO_REHABILITADO emitido para ${inscripcion.email}`)
        } catch (error) {
            this.logger.error(`Error emitiendo evento de pago rehabilitado:`, error)
        }
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

    /**
     * Obtiene reporte de ingresos por convención
     */
    async getReporteIngresos(convencionId?: string): Promise<{
        totalRecaudado: number
        totalPendiente: number
        totalInscripciones: number
        inscripcionesConfirmadas: number
        inscripcionesPendientes: number
        detallesPorCuota: { cuota: number; recaudado: number; pendiente: number }[]
    }> {
        const whereConvencion = convencionId ? { convencionId } : {}

        // Obtener todas las inscripciones con sus pagos
        const inscripciones = await this.prisma.inscripcion.findMany({
            where: {
                ...whereConvencion,
                estado: { not: 'cancelado' },
            },
            include: {
                pagos: true,
                convencion: true,
            },
        })

        let totalRecaudado = 0
        let totalPendiente = 0
        const detallesPorCuota: { cuota: number; recaudado: number; pendiente: number }[] = [
            { cuota: 1, recaudado: 0, pendiente: 0 },
            { cuota: 2, recaudado: 0, pendiente: 0 },
            { cuota: 3, recaudado: 0, pendiente: 0 },
        ]

        for (const inscripcion of inscripciones) {
            for (const pago of inscripcion.pagos) {
                const monto = typeof pago.monto === 'number'
                    ? pago.monto
                    : parseFloat(String(pago.monto || 0))

                if (pago.estado === EstadoPago.COMPLETADO) {
                    totalRecaudado += monto
                    const cuotaIndex = (pago.numeroCuota || 1) - 1
                    if (cuotaIndex >= 0 && cuotaIndex < 3) {
                        detallesPorCuota[cuotaIndex].recaudado += monto
                    }
                } else if (pago.estado === EstadoPago.PENDIENTE) {
                    totalPendiente += monto
                    const cuotaIndex = (pago.numeroCuota || 1) - 1
                    if (cuotaIndex >= 0 && cuotaIndex < 3) {
                        detallesPorCuota[cuotaIndex].pendiente += monto
                    }
                }
            }
        }

        const inscripcionesConfirmadas = inscripciones.filter(i => i.estado === 'confirmado').length
        const inscripcionesPendientes = inscripciones.filter(i => i.estado === 'pendiente').length

        return {
            totalRecaudado,
            totalPendiente,
            totalInscripciones: inscripciones.length,
            inscripcionesConfirmadas,
            inscripcionesPendientes,
            detallesPorCuota,
        }
    }

    /**
     * Envía recordatorios de pago a inscritos con cuotas pendientes
     */
    async enviarRecordatoriosPago(convencionId?: string): Promise<{
        enviados: number
        fallidos: number
        detalles: { email: string; nombre: string; cuotasPendientes: number; exito: boolean }[]
    }> {
        this.logger.log('📧 Iniciando envío de recordatorios de pago...')

        const whereConvencion = convencionId ? { convencionId } : {}

        // Obtener inscripciones con pagos pendientes
        const inscripciones = await this.prisma.inscripcion.findMany({
            where: {
                ...whereConvencion,
                estado: 'pendiente',
                pagos: {
                    some: {
                        estado: EstadoPago.PENDIENTE,
                    },
                },
            },
            include: {
                pagos: true,
                convencion: true,
            },
        })

        let enviados = 0
        let fallidos = 0
        const detalles: { email: string; nombre: string; cuotasPendientes: number; exito: boolean }[] = []

        for (const inscripcion of inscripciones) {
            const pagosPendientes = inscripcion.pagos.filter(p => p.estado === EstadoPago.PENDIENTE)
            const cuotasPendientes = pagosPendientes.length
            const convencion = inscripcion.convencion
            const codigoReferencia = (inscripcion as any)?.codigoReferencia || 'N/A'

            // Calcular monto pendiente
            const montoPendiente = pagosPendientes.reduce((sum, p) => {
                const monto = typeof p.monto === 'number' ? p.monto : parseFloat(String(p.monto || 0))
                return sum + monto
            }, 0)
            const montoPendienteFormateado = new Intl.NumberFormat('es-AR', {
                style: 'currency',
                currency: 'ARS',
            }).format(montoPendiente)

            const titulo = `⏰ Recordatorio de Pago - ${convencion?.titulo || 'Convención'}`
            const mensaje = `
<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto;">
    <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">⏰ Recordatorio de Pago</h1>
    </div>
    
    <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none;">
        <p style="font-size: 16px; margin-bottom: 20px;">Hola <strong>${inscripcion.nombre}</strong>,</p>
        
        <p style="font-size: 16px; margin-bottom: 20px;">
            Te recordamos que tienes <strong>${cuotasPendientes} cuota(s) pendiente(s)</strong> de pago 
            para la convención <strong>"${convencion?.titulo}"</strong>.
        </p>
        
        <div style="background: #fef3c7; border: 2px solid #f59e0b; padding: 20px; margin: 25px 0; border-radius: 5px; text-align: center;">
            <h3 style="color: #92400e; margin: 0 0 10px 0; font-size: 16px;">💰 Monto Pendiente</h3>
            <p style="font-size: 28px; font-weight: bold; color: #d97706; margin: 0;">
                ${montoPendienteFormateado}
            </p>
            <p style="font-size: 14px; color: #92400e; margin: 10px 0 0 0;">
                (${cuotasPendientes} cuota${cuotasPendientes > 1 ? 's' : ''})
            </p>
        </div>
        
        <div style="background: #fef3c7; border: 2px solid #f59e0b; padding: 20px; margin: 25px 0; border-radius: 5px; text-align: center;">
            <h3 style="color: #92400e; margin: 0 0 10px 0; font-size: 16px;">🔖 Tu Código de Referencia</h3>
            <p style="font-size: 24px; font-weight: bold; color: #d97706; margin: 0; letter-spacing: 2px; font-family: monospace;">
                ${codigoReferencia}
            </p>
            <p style="font-size: 12px; color: #78350f; margin: 10px 0 0 0;">
                Incluye este código en el concepto de tu transferencia
            </p>
        </div>
        
        <div style="background: #f0fdf4; border-left: 4px solid #10b981; padding: 20px; margin: 25px 0; border-radius: 5px;">
            <h2 style="color: #059669; margin-top: 0; margin-bottom: 15px; font-size: 18px;">💳 Métodos de Pago</h2>
            <ul style="margin: 0; padding-left: 20px; color: #1f2937;">
                <li style="margin-bottom: 8px;"><strong>Transferencia Bancaria:</strong> Contacta a la administración</li>
                <li style="margin-bottom: 8px;"><strong>Mercado Pago:</strong> Solicita el link de pago</li>
                <li style="margin-bottom: 8px;"><strong>Efectivo:</strong> Acércate a tu sede más cercana</li>
            </ul>
        </div>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 25px; border-top: 2px solid #e5e7eb;">
            <p style="font-size: 14px; color: #6b7280; margin: 0;">
                Si ya realizaste el pago, por favor ignora este mensaje.
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

            try {
                // Emitir evento de recordatorio de pago
                const event = new PagoRecordatorioEvent({
                    email: inscripcion.email,
                    inscripcionId: inscripcion.id,
                    cuotasPendientes,
                    montoPendiente,
                    convencionTitulo: convencion?.titulo || 'Convención',
                })

                this.eventEmitter.emit(NotificationEventType.PAGO_RECORDATORIO, event)

                enviados++
                detalles.push({
                    email: inscripcion.email,
                    nombre: `${inscripcion.nombre} ${inscripcion.apellido}`,
                    cuotasPendientes,
                    exito: true,
                })
                this.logger.log(`📬 Evento PAGO_RECORDATORIO emitido para ${inscripcion.email}`)
            } catch (error) {
                fallidos++
                detalles.push({
                    email: inscripcion.email,
                    nombre: `${inscripcion.nombre} ${inscripcion.apellido}`,
                    cuotasPendientes,
                    exito: false,
                })
                this.logger.error(`Error emitiendo evento de recordatorio a ${inscripcion.email}:`, error)
            }
        }

        this.logger.log(`📊 Recordatorios: ${enviados} enviados, ${fallidos} fallidos`)

        return { enviados, fallidos, detalles }
    }

    /**
     * Cancela una inscripción y sus pagos pendientes
     */
    async cancelarInscripcion(id: string, motivo?: string, userId?: string, userEmail?: string): Promise<Inscripcion> {
        this.logger.log(`❌ Cancelando inscripción: ${id}`)

        const inscripcion = await this.findOneInscripcion(id)

        if (inscripcion.estado === 'cancelado') {
            throw new BadRequestException('Esta inscripción ya está cancelada')
        }

        const estadoAnterior = inscripcion.estado

        // Cancelar la inscripción y sus pagos pendientes
        const inscripcionCancelada = await this.prisma.$transaction(async (tx) => {
            // Cancelar pagos pendientes
            await tx.pago.updateMany({
                where: {
                    inscripcionId: id,
                    estado: EstadoPago.PENDIENTE,
                },
                data: {
                    estado: EstadoPago.CANCELADO,
                    notas: motivo || 'Pago cancelado por cancelación de inscripción',
                },
            })

            // Actualizar inscripción
            return tx.inscripcion.update({
                where: { id },
                data: {
                    estado: 'cancelado',
                    notas: motivo
                        ? `${inscripcion.notas ? inscripcion.notas + ' | ' : ''}CANCELACIÓN: ${motivo}`
                        : inscripcion.notas,
                },
                include: this.inscripcionIncludes,
            })
        })

        // Registrar auditoría
        await this.auditService.log({
            entityType: 'INSCRIPCION',
            entityId: id,
            action: 'CANCELAR',
            userId,
            userEmail,
            changes: [{
                field: 'estado',
                oldValue: estadoAnterior,
                newValue: 'cancelado',
            }],
            metadata: {
                motivo,
                inscripcionId: id,
            },
        })

        // Enviar email de cancelación
        await this.enviarNotificacionCancelacion(inscripcionCancelada, motivo)

        return inscripcionCancelada
    }

    /**
     * Emite evento de cancelación de inscripción
     */
    private async enviarNotificacionCancelacion(inscripcion: Inscripcion & { convencion: any }, motivo?: string): Promise<void> {
        try {
            if (!inscripcion.email) return

            const event = new InscripcionCanceladaEvent({
                email: inscripcion.email,
                inscripcionId: inscripcion.id,
                convencionTitulo: inscripcion.convencion?.titulo || 'Convención',
                motivo,
            })

            this.eventEmitter.emit(NotificationEventType.INSCRIPCION_CANCELADA, event)
            this.logger.log(`📬 Evento INSCRIPCION_CANCELADA emitido para ${inscripcion.email}`)
        } catch (error) {
            this.logger.error(`Error emitiendo evento de cancelación:`, error)
        }
    }
}
