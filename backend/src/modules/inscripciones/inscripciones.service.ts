import {
    Injectable,
    Logger,
    NotFoundException,
    BadRequestException,
    ConflictException,
    Inject,
    forwardRef,
    Optional,
} from '@nestjs/common'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { PrismaService } from '../../prisma/prisma.service'
import {
    CreateInscripcionDto,
    UpdateInscripcionDto,
    CreatePagoDto,
    UpdatePagoDto,
    EstadoPago,
} from './dto/inscripcion.dto'
import { Inscripcion, Pago, Convencion } from '@prisma/client'
import { InscripcionFilterDto, PagoFilterDto } from '../../common/dto/search-filter.dto'
import { Prisma } from '@prisma/client'
import {
    InscripcionWithRelations,
    InscripcionWithConvencion,
    PagoWithInscripcionAndConvencion,
    PagoWithInscripcion,
    PagosInfo,
    InscripcionSearchFilters,
    PagoSearchFilters,
} from './types/inscripcion.types'
import {
    PagoValidadoEvent,
    PagoRechazadoEvent,
    PagoRehabilitadoEvent,
    PagoRecordatorioEvent,
    InscripcionCreadaEvent,
    InscripcionConfirmadaEvent,
    InscripcionCanceladaEvent,
    NotificationEventType,
} from '../notifications/events/notification.events'
import { NotificationsService } from '../notifications/notifications.service'
import { AuditService } from '../../common/services/audit.service'

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
        @Optional()
        @Inject(forwardRef(() => NotificationsService))
        private notificationsService?: NotificationsService
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
        data: InscripcionWithRelations[]
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
                orderBy: { fechaInscripcion: 'desc' },
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
    async findOneInscripcion(id: string): Promise<InscripcionWithRelations> {
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
        this.logger.log(
            `📝 Creando inscripción para: ${dto.nombre} (origen: ${dto.origenRegistro || 'web'})`
        )

        const origenRegistro = dto.origenRegistro || 'web'

        // Validar que el origen de registro sea válido
        if (origenRegistro && !['web', 'mobile', 'dashboard'].includes(origenRegistro)) {
            throw new BadRequestException(
                `Origen de registro inválido: ${origenRegistro}. Debe ser: web, mobile o dashboard`
            )
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
                this.logger.warn(
                    `⚠️ No hay cupos disponibles para convención ${convencion.titulo}. Cupos: ${convencion.cupoMaximo}, Inscritos: ${inscripcionesConfirmadas}`
                )
                throw new BadRequestException(
                    `Lo sentimos, no hay cupos disponibles para esta convención. ` +
                    `Cupos totales: ${convencion.cupoMaximo}, Inscritos: ${inscripcionesConfirmadas}`
                )
            }

            this.logger.log(`✅ Cupos disponibles: ${cuposDisponibles} de ${convencion.cupoMaximo}`)
        }

        // Calcular el costo (puede venir como Decimal de Prisma)
        const costoTotal =
            typeof convencion.costo === 'number'
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
                    where: { codigoReferencia: codigo },
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
        const inscripcion = await this.prisma.$transaction(async tx => {
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
            const txInvitado = tx.invitado
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
                this.logger.log(
                    `✅ Invitado creado automáticamente en tabla 'invitados': ${invitado.email}`
                )
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
                } as unknown as Prisma.InscripcionCreateInput,
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
                this.logger.error(
                    `⚠️ ERROR: Se detectó un pastor creado recientemente con el mismo email. Esto NO debería pasar.`
                )
                this.logger.error(`⚠️ Email: ${dto.email}, Pastor ID: ${pastorCreadoPorError.id}`)
            }

            // Crear automáticamente los pagos para TODOS los orígenes (web, mobile, dashboard)
            // Esto asegura que siempre haya pagos asociados a la inscripción
            this.logger.log(
                `💰 Creando ${numeroCuotas} pago(s) automático(s) para inscripción ${nuevaInscripcion.id} (origen: ${origenRegistro})`
            )

            // Si hay un documentoUrl en la inscripción, asignarlo al primer pago como comprobanteUrl
            const comprobanteUrl = dto.documentoUrl || null

            // Crear los pagos según el número de cuotas
            const pagos: Pago[] = []
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

            // Recargar la inscripción con los pagos incluidos
            return await tx.inscripcion.findUnique({
                where: { id: nuevaInscripcion.id },
                include: this.inscripcionIncludes,
            })
        })

        if (!inscripcion) {
            throw new Error('Error al crear la inscripción')
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

            const origenTexto =
                origenRegistro === 'web'
                    ? 'formulario web'
                    : origenRegistro === 'mobile'
                        ? 'app móvil'
                        : 'dashboard'
            const titulo = '📝 Nueva Inscripción Recibida'

            // Obtener información de pagos para la notificación
            const pagosInfo = inscripcion.pagos || []
            const cuotasPendientes = pagosInfo.filter((p: Pago) => p.estado === 'PENDIENTE').length
            const cuotasPagadas = pagosInfo.filter((p: Pago) => p.estado === 'COMPLETADO').length
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
                        await this.notificationsService.sendNotificationToAdmin(admin.email, titulo, mensaje, {
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
                        })
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
            const codigoRef = inscripcionCompleta?.codigoReferencia || 'Pendiente'
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

            // Enviar email inmediatamente al usuario (sin pasar por cola para reducir latencia)
            // Esto asegura que el email llegue rápido mientras push/web pueden ser asíncronos
            if (this.notificationsService) {
                try {
                    // Enviar email directamente usando el servicio de notificaciones
                    // que tiene acceso directo al EmailService
                    const { getEmailTemplate } = await import('../notifications/templates/email.templates')
                    const template = getEmailTemplate('inscripcion_creada', {
                        inscripcionId: inscripcion.id,
                        convencionTitulo: convencion.titulo,
                        numeroCuotas: numeroCuotas,
                        montoTotal: costoTotal,
                        origenRegistro: origenRegistro,
                        nombre: inscripcion.nombre,
                        apellido: inscripcion.apellido || '',
                    })

                    // Enviar email directamente usando EmailService (sin depender de si es pastor)
                    const emailSent = await this.notificationsService.sendEmailToUser(
                        inscripcion.email,
                        template.title,
                        template.body, // Mantener HTML completo
                        {
                            type: 'inscripcion_creada',
                            inscripcionId: inscripcion.id,
                            convencionTitulo: convencion.titulo,
                            numeroCuotas: numeroCuotas,
                            montoTotal: costoTotal,
                            origenRegistro: origenRegistro,
                            nombre: inscripcion.nombre,
                            apellido: inscripcion.apellido || '',
                        }
                    )
                    if (emailSent) {
                        this.logger.log(`✅ Email de inscripción enviado exitosamente a ${inscripcion.email}`)
                    } else {
                        this.logger.warn(`⚠️ No se pudo enviar email de inscripción a ${inscripcion.email}`)
                    }
                } catch (emailError) {
                    this.logger.error(`Error enviando email inmediato a ${inscripcion.email}:`, emailError)
                    // Continuar con el evento por si acaso
                }
            }

            // Emitir evento de inscripción creada (para push/web notifications asíncronas)
            const event = new InscripcionCreadaEvent({
                email: inscripcion.email,
                inscripcionId: inscripcion.id,
                convencionTitulo: convencion.titulo,
                numeroCuotas: numeroCuotas,
                montoTotal: costoTotal,
                origenRegistro: origenRegistro,
                nombre: inscripcion.nombre,
                apellido: inscripcion.apellido || '',
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
    async updateInscripcion(
        id: string,
        dto: UpdateInscripcionDto,
        userId?: string,
        userEmail?: string
    ): Promise<Inscripcion> {
        try {
            const inscripcionExistente = await this.findOneInscripcion(id) // Verifica existencia

            // Si se está actualizando el email, validar que no esté duplicado en la misma convención
            if (dto.email && dto.email.toLowerCase() !== inscripcionExistente.email.toLowerCase()) {
                const emailDuplicado = await this.checkInscripcionByEmail(
                    dto.email,
                    inscripcionExistente.convencionId
                )
                if (emailDuplicado && emailDuplicado.id !== id) {
                    throw new ConflictException(`El correo ${dto.email} ya está inscrito en esta convención`)
                }
            }

            // Preparar datos para actualizar (filtrar undefined y null innecesarios)
            const dataToUpdate: Prisma.InscripcionUpdateInput = {}
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
            if (dto.pais !== undefined) {
                dataToUpdate.pais = dto.pais && dto.pais.trim() ? dto.pais.trim() : null
            }
            if (dto.provincia !== undefined) {
                dataToUpdate.provincia = dto.provincia && dto.provincia.trim() ? dto.provincia.trim() : null
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
            try {
                const auditData = this.auditService.createAuditDataFromChanges(
                    'INSCRIPCION',
                    id,
                    'UPDATE',
                    inscripcionExistente,
                    dataToUpdate as Record<string, unknown>,
                    userId,
                    userEmail
                )
                await this.auditService.log(auditData)
            } catch (auditError) {
                this.logger.warn(`⚠️ Error registrando auditoría para inscripción ${id}:`, auditError)
                // No fallar la actualización si la auditoría falla
            }

            return updated
        } catch (error) {
            this.logger.error(`❌ Error actualizando inscripción ${id}:`, error)
            throw error
        }
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
            orderBy: { fechaInscripcion: 'desc' },
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
        data: PagoWithInscripcionAndConvencion[]
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

        this.logger.log(
            `🔍 findAllPagos llamado - página: ${pageNum}, límite: ${limitNum}, filtros: ${JSON.stringify(filters)}`
        )

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

        // Aplicar filtro de inscripción (debe ir ANTES de otros filtros de inscripción)
        if (filters?.inscripcionId) {
            where.inscripcionId = filters.inscripcionId
        }

        // Construir filtro de inscripción (puede incluir convencionId y origenRegistro)
        // NOTA: Si ya hay inscripcionId, no agregar filtros adicionales de inscripción
        // para evitar conflictos
        if (!filters?.inscripcionId) {
            const inscripcionFilter: Prisma.InscripcionWhereInput = {}

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
        }

        // Aplicar búsqueda (busca en referencia, notas, y datos de la inscripción relacionada)
        if (filters?.search || filters?.q) {
            const searchTerm = (filters.search || filters.q || '').trim()
            if (searchTerm) {
                // Si hay inscripcionId, preservarlo pero NO duplicarlo en el OR
                const inscripcionIdPreservado = where.inscripcionId

                // Guardar el filtro de inscripción existente si existe
                const inscripcionFilter = where.inscripcion

                // Construir el OR para la búsqueda
                const searchOR: Prisma.PagoWhereInput[] = [
                    { referencia: { contains: searchTerm, mode: 'insensitive' } },
                    { notas: { contains: searchTerm, mode: 'insensitive' } },
                ]

                // Agregar búsqueda en inscripción
                const inscripcionSearch: Prisma.InscripcionWhereInput = {
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

                // Si hay inscripcionId, agregarlo al filtro de inscripción para buscar dentro de esa inscripción
                // PERO NO duplicarlo en el where principal
                if (inscripcionIdPreservado) {
                    const andArray = Array.isArray(inscripcionSearch.AND)
                        ? inscripcionSearch.AND
                        : inscripcionSearch.AND
                            ? [inscripcionSearch.AND]
                            : []
                    andArray.push({ id: inscripcionIdPreservado as string })
                    inscripcionSearch.AND = andArray
                    // Eliminar inscripcionId del where principal para evitar duplicación
                    delete where.inscripcionId
                }

                searchOR.push({ inscripcion: inscripcionSearch })

                // Si ya hay un OR, combinarlo con AND
                if (where.OR) {
                    where.AND = [{ OR: where.OR }, { OR: searchOR }]
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
            orderBy: { createdAt: 'desc' },
            skip,
            take,
        }

        const countOptions: Prisma.PagoCountArgs = {
            where: whereClause,
        }

        this.logger.log(`📋 Buscando pagos - página: ${pageNum}, límite: ${limitNum}`)
        this.logger.log(`📋 Filtros recibidos: ${JSON.stringify(filters || {}, null, 2)}`)
        try {
            this.logger.log(`📋 WHERE clause: ${JSON.stringify(whereClause, null, 2)}`)
        } catch (e) {
            this.logger.log(`📋 WHERE clause (no serializable): ${Object.keys(whereClause).join(', ')}`)
        }
        this.logger.log(
            `📋 FindManyOptions - skip: ${findManyOptions.skip}, take: ${findManyOptions.take}`
        )

        try {
            const [data, total] = await Promise.all([
                this.prisma.pago.findMany(findManyOptions),
                this.prisma.pago.count(countOptions),
            ])

            this.logger.log(`✅ Encontrados ${data.length} pagos de ${total} totales`)
            if (data.length > 0) {
                this.logger.log(
                    `📋 Primer pago encontrado - id: ${data[0].id}, inscripcionId: ${data[0].inscripcionId}, estado: ${data[0].estado}`
                )
            } else if (filters?.inscripcionId) {
                // Si no se encontraron pagos pero hay filtro de inscripción, verificar si la inscripción existe
                try {
                    const inscripcionExiste = await this.prisma.inscripcion.findUnique({
                        where: { id: filters.inscripcionId },
                        select: { id: true, nombre: true, apellido: true },
                    })
                    this.logger.log(
                        `🔍 Inscripción ${filters.inscripcionId} existe: ${inscripcionExiste ? `${inscripcionExiste.nombre} ${inscripcionExiste.apellido}` : 'NO'}`
                    )

                    // Verificar si hay pagos para esa inscripción sin filtros
                    const pagosSinFiltros = await this.prisma.pago.count({
                        where: { inscripcionId: filters.inscripcionId },
                    })
                    this.logger.log(
                        `🔍 Pagos sin filtros para inscripción ${filters.inscripcionId}: ${pagosSinFiltros}`
                    )
                } catch (debugError) {
                    this.logger.error(`❌ Error en debug de inscripción:`, debugError)
                }
            }

            const totalPages = Math.ceil(total / limitNum)

            return {
                data: data as PagoWithInscripcionAndConvencion[],
                meta: {
                    page: pageNum,
                    limit: limitNum,
                    total,
                    totalPages,
                    hasNextPage: pageNum < totalPages,
                    hasPreviousPage: pageNum > 1,
                },
            }
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
            const errorCode = this.getErrorCode(error)
            const errorMeta = this.getErrorProperty(error, 'meta')
            const errorStack = error instanceof Error ? error.stack : undefined

            this.logger.error(`❌ Error al buscar pagos:`, error)
            this.logger.error(`WHERE clause que causó el error:`, JSON.stringify(whereClause, null, 2))
            this.logger.error(`Filtros recibidos:`, JSON.stringify(filters, null, 2))
            this.logger.error(`Error completo:`, {
                message: errorMessage,
                code: errorCode,
                meta: errorMeta,
                stack: errorStack,
            })
            // Re-lanzar el error para que el controlador lo maneje
            throw error
        }
    }

    /**
     * Obtiene un pago por ID
     */
    async findOnePago(id: string): Promise<PagoWithInscripcionAndConvencion> {
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
        try {
            this.logger.log(`💰 Creando pago: ${dto.metodoPago} - ${dto.monto}`)

            // Validar que la inscripción exista
            if (!dto.inscripcionId) {
                throw new BadRequestException('El ID de inscripción es requerido')
            }

            const inscripcion = await this.prisma.inscripcion.findUnique({
                where: { id: dto.inscripcionId },
                include: { convencion: true },
            })

            if (!inscripcion) {
                throw new NotFoundException(`Inscripción con ID "${dto.inscripcionId}" no encontrada`)
            }

            // Validar y sanitizar monto
            let monto: number
            if (typeof dto.monto === 'string') {
                monto = parseFloat(dto.monto)
                if (isNaN(monto) || monto <= 0) {
                    throw new BadRequestException(
                        `Monto inválido: ${dto.monto}. Debe ser un número positivo.`
                    )
                }
            } else if (typeof dto.monto === 'number') {
                monto = dto.monto
                if (monto <= 0 || !isFinite(monto)) {
                    throw new BadRequestException(
                        `Monto inválido: ${dto.monto}. Debe ser un número positivo.`
                    )
                }
            } else {
                throw new BadRequestException('El monto es requerido y debe ser un número válido')
            }

            // Validar método de pago
            const metodosValidos = ['transferencia', 'mercadopago', 'efectivo', 'otro']
            if (!dto.metodoPago || !metodosValidos.includes(dto.metodoPago)) {
                throw new BadRequestException(
                    `Método de pago inválido: ${dto.metodoPago}. Debe ser uno de: ${metodosValidos.join(', ')}`
                )
            }

            // Validar número de cuota si se proporciona
            if (dto.numeroCuota !== undefined) {
                if (!Number.isInteger(dto.numeroCuota) || dto.numeroCuota < 1 || dto.numeroCuota > 3) {
                    throw new BadRequestException(
                        `Número de cuota inválido: ${dto.numeroCuota}. Debe ser un entero entre 1 y 3.`
                    )
                }
            }

            // Sanitizar referencia (eliminar espacios y caracteres especiales peligrosos)
            let referencia: string | undefined = undefined
            if (dto.referencia) {
                referencia = dto.referencia.trim()
                if (referencia.length > 100) {
                    referencia = referencia.substring(0, 100)
                }
                // Permitir solo caracteres alfanuméricos, guiones, espacios y algunos caracteres especiales
                referencia = referencia.replace(/[<>\"'&]/g, '')
            }

            // Sanitizar notas
            let notas: string | undefined = undefined
            if (dto.notas) {
                notas = dto.notas.trim()
                if (notas.length > 500) {
                    notas = notas.substring(0, 500)
                }
                // Eliminar caracteres peligrosos pero permitir saltos de línea
                notas = notas.replace(/[<>\"'&]/g, '')
            }

            // Validar URL del comprobante si se proporciona
            let comprobanteUrl: string | undefined = undefined
            if (dto.comprobanteUrl) {
                comprobanteUrl = dto.comprobanteUrl.trim()
                try {
                    new URL(comprobanteUrl)
                } catch {
                    throw new BadRequestException('URL del comprobante inválida')
                }
            }

            // Preparar datos del pago
            const pagoData: Prisma.PagoCreateInput = {
                inscripcion: {
                    connect: { id: dto.inscripcionId },
                },
                monto: monto,
                metodoPago: dto.metodoPago,
                estado: dto.estado || EstadoPago.PENDIENTE, // Por defecto PENDIENTE
                referencia: referencia,
                comprobanteUrl: comprobanteUrl,
                notas: notas,
            }

            // Agregar número de cuota si se proporciona
            if (dto.numeroCuota !== undefined) {
                pagoData.numeroCuota = dto.numeroCuota
            }

            // Si el estado es COMPLETADO, establecer fechaPago
            if (pagoData.estado === EstadoPago.COMPLETADO) {
                pagoData.fechaPago = new Date()
            }

            this.logger.log(
                `📝 Datos del pago a crear: ${JSON.stringify({ ...pagoData, monto: monto }, null, 2)}`
            )

            const pagoCreado = await this.prisma.pago.create({
                data: pagoData,
                include: this.pagoIncludes,
            })

            this.logger.log(`✅ Pago creado exitosamente: ${pagoCreado.id}`)

            // Si el pago se creó como COMPLETADO, verificar si se debe confirmar la inscripción
            if (pagoData.estado === EstadoPago.COMPLETADO) {
                // Verificar si todas las cuotas están completadas
                const inscripcionCompleta = await this.prisma.inscripcion.findUnique({
                    where: { id: inscripcion.id },
                    include: {
                        pagos: true,
                        convencion: true,
                    },
                })

                if (inscripcionCompleta) {
                    const numeroCuotas = inscripcionCompleta.numeroCuotas || 3
                    const pagosCompletados = inscripcionCompleta.pagos.filter(
                        (p: Pago) => p.estado === EstadoPago.COMPLETADO
                    ).length

                    // Si todas las cuotas están completadas, confirmar la inscripción
                    if (pagosCompletados >= numeroCuotas && inscripcionCompleta.estado !== 'confirmado') {
                        await this.prisma.inscripcion.update({
                            where: { id: inscripcion.id },
                            data: { estado: 'confirmado' },
                        })
                        this.logger.log(
                            `✅ Inscripción ${inscripcion.id} confirmada automáticamente (todas las cuotas pagadas)`
                        )
                    }
                }
            }

            return pagoCreado
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
            const errorCode = this.getErrorCode(error)
            const errorStack = error instanceof Error ? error.stack : undefined

            this.logger.error(`❌ Error creando pago:`, {
                message: errorMessage,
                code: errorCode,
                stack: errorStack,
                dto: {
                    inscripcionId: dto.inscripcionId,
                    monto: dto.monto,
                    metodoPago: dto.metodoPago,
                    numeroCuota: dto.numeroCuota,
                },
            })
            throw error
        }
    }

    /**
     * Actualiza un pago
     */
    async updatePago(
        id: string,
        dto: UpdatePagoDto,
        userId?: string
    ): Promise<Pago & { advertenciaMonto?: string }> {
        const pago = await this.findOnePago(id) // Verifica existencia

        const data: Prisma.PagoUpdateInput = { ...dto }
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
                const costoTotal =
                    typeof inscripcionCompleta.convencion.costo === 'number'
                        ? inscripcionCompleta.convencion.costo
                        : parseFloat(String(inscripcionCompleta.convencion.costo || 0))
                const numeroCuotas = inscripcionCompleta.numeroCuotas || 3
                const montoEsperadoPorCuota = costoTotal / numeroCuotas
                const montoPago = dto.monto
                    ? parseFloat(dto.monto)
                    : typeof pago.monto === 'number'
                        ? pago.monto
                        : parseFloat(String(pago.monto || 0))

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
                accion:
                    dto.estado === EstadoPago.COMPLETADO
                        ? 'VALIDAR'
                        : dto.estado === EstadoPago.CANCELADO
                            ? 'RECHAZAR'
                            : 'ACTUALIZAR',
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
            this.enviarNotificacionPagoValidado(pagoActualizado).catch(error => {
                this.logger.warn(`No se pudo enviar notificación para pago ${pagoActualizado.id}:`, error)
            })

            // Verificar si todas las cuotas están pagadas (no bloqueante)
            this.verificarYActualizarEstadoInscripcion(pagoActualizado.inscripcionId).catch(error => {
                this.logger.warn(
                    `No se pudo verificar estado de inscripción ${pagoActualizado.inscripcionId}:`,
                    error
                )
            })
        }

        return { ...pagoActualizado, advertenciaMonto }
    }

    /**
     * Emite evento cuando se valida un pago individual (cuota)
     */
    private async enviarNotificacionPagoValidado(pago: PagoWithInscripcion): Promise<void> {
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
                p => p.estado === EstadoPago.COMPLETADO
            ).length

            const monto =
                typeof pago.monto === 'number' ? pago.monto : parseFloat(String(pago.monto || 0))

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
                nombre: inscripcion.nombre,
                apellido: inscripcion.apellido || '',
            })

            this.eventEmitter.emit(NotificationEventType.PAGO_VALIDADO, event)
            this.logger.log(`📬 Evento PAGO_VALIDADO emitido para ${inscripcion.email}`)

            // Enviar email directamente al usuario usando EmailService
            if (this.notificationsService) {
                try {
                    const { getEmailTemplate } = await import('../notifications/templates/email.templates')
                    const template = getEmailTemplate('pago_validado', {
                        pagoId: pago.id,
                        inscripcionId: inscripcion.id,
                        monto,
                        numeroCuota,
                        cuotasTotales: numeroCuotas,
                        cuotasPagadas,
                        convencionTitulo: convencion?.titulo || 'Convención',
                        metodoPago: pago.metodoPago || undefined,
                        nombre: inscripcion.nombre,
                        apellido: inscripcion.apellido || '',
                    })

                    const emailSent = await this.notificationsService.sendEmailToUser(
                        inscripcion.email,
                        template.title,
                        template.body,
                        {
                            type: 'pago_validado',
                            pagoId: pago.id,
                            inscripcionId: inscripcion.id,
                            monto,
                            numeroCuota,
                            cuotasTotales: numeroCuotas,
                            cuotasPagadas,
                            convencionTitulo: convencion?.titulo || 'Convención',
                            metodoPago: pago.metodoPago || undefined,
                            nombre: inscripcion.nombre,
                            apellido: inscripcion.apellido || '',
                        }
                    )

                    if (emailSent) {
                        this.logger.log(`✅ Email de pago validado enviado exitosamente a ${inscripcion.email}`)
                    } else {
                        this.logger.warn(`⚠️ No se pudo enviar email de pago validado a ${inscripcion.email}`)
                    }
                } catch (emailError) {
                    this.logger.error(`Error enviando email de pago validado a ${inscripcion.email}:`, emailError)
                }
            }

            // Enviar notificación a todos los admins
            if (this.notificationsService) {
                try {
                    const admins = await this.prisma.user.findMany({
                        where: {
                            rol: {
                                in: ['ADMIN', 'EDITOR'],
                            },
                        },
                    })

                    const montoFormateado = new Intl.NumberFormat('es-AR', {
                        style: 'currency',
                        currency: 'ARS',
                    }).format(monto)

                    const titulo = '✅ Pago Validado'
                    const mensaje = `El pago de ${montoFormateado} (Cuota ${numeroCuota}/${numeroCuotas}) de ${inscripcion.nombre} ${inscripcion.apellido} ha sido validado exitosamente.`

                    for (const admin of admins) {
                        await this.notificationsService.sendNotificationToAdmin(admin.email, titulo, mensaje, {
                            type: 'pago_validado',
                            pagoId: pago.id,
                            inscripcionId: inscripcion.id,
                            inscripcionNombre: `${inscripcion.nombre} ${inscripcion.apellido}`,
                            monto,
                            numeroCuota,
                            cuotasTotales: numeroCuotas,
                            cuotasPagadas,
                            convencionTitulo: convencion?.titulo || 'Convención',
                        })
                    }

                    this.logger.log(`📬 Notificaciones de pago validado enviadas a ${admins.length} admin(s)`)
                } catch (error) {
                    this.logger.error(`Error enviando notificaciones a admins:`, error)
                }
            }
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
            p => p.numeroCuota && p.estado === EstadoPago.COMPLETADO
        ).length

        // Si todas las cuotas están completadas, actualizar el estado de la inscripción a "confirmado"
        if (cuotasCompletadas >= numeroCuotas) {
            await this.prisma.inscripcion.update({
                where: { id: inscripcionId },
                data: { estado: 'confirmado' },
            })
            this.logger.log(
                `✅ Inscripción ${inscripcionId} marcada como confirmada (${cuotasCompletadas}/${numeroCuotas} cuotas pagadas)`
            )

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
                        nombre: inscripcionCompleta.nombre,
                        apellido: inscripcionCompleta.apellido || '',
                    })

                    this.eventEmitter.emit(NotificationEventType.INSCRIPCION_CONFIRMADA, event)
                    this.logger.log(
                        `📬 Evento INSCRIPCION_CONFIRMADA emitido para ${inscripcionCompleta.email}`
                    )

                    // Enviar email directamente al usuario usando EmailService
                    if (this.notificationsService) {
                        try {
                            const { getEmailTemplate } = await import('../notifications/templates/email.templates')
                            const template = getEmailTemplate('inscripcion_confirmada', {
                                inscripcionId: inscripcionCompleta.id,
                                convencionTitulo: convencion?.titulo || 'Convención',
                                nombre: inscripcionCompleta.nombre,
                                apellido: inscripcionCompleta.apellido || '',
                            })

                            const emailSent = await this.notificationsService.sendEmailToUser(
                                inscripcionCompleta.email,
                                template.title,
                                template.body,
                                {
                                    type: 'inscripcion_confirmada',
                                    inscripcionId: inscripcionCompleta.id,
                                    convencionTitulo: convencion?.titulo || 'Convención',
                                    nombre: inscripcionCompleta.nombre,
                                    apellido: inscripcionCompleta.apellido || '',
                                }
                            )

                            if (emailSent) {
                                this.logger.log(`✅ Email de inscripción confirmada enviado exitosamente a ${inscripcionCompleta.email}`)
                            } else {
                                this.logger.warn(`⚠️ No se pudo enviar email de inscripción confirmada a ${inscripcionCompleta.email}`)
                            }
                        } catch (emailError) {
                            this.logger.error(`Error enviando email de inscripción confirmada a ${inscripcionCompleta.email}:`, emailError)
                        }
                    }
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
     * Valida/confirma un pago y envía notificación al usuario
     */
    async validatePago(id: string, userId?: string): Promise<Pago> {
        this.logger.log(`✅ Validando pago: ${id}`)

        const pago = await this.findOnePago(id)
        const estadoAnterior = pago.estado

        const pagoValidado = await this.prisma.pago.update({
            where: { id },
            data: {
                estado: EstadoPago.COMPLETADO,
                fechaPago: new Date(),
            },
            include: this.pagoIncludes,
        })

        // Registrar auditoría
        if (userId) {
            await this.registrarAuditoriaPago({
                pagoId: id,
                inscripcionId: pago.inscripcionId,
                accion: 'VALIDAR',
                estadoAnterior,
                estadoNuevo: EstadoPago.COMPLETADO,
                usuarioId: userId,
            })
        }

        // Enviar notificación de pago validado
        await this.enviarNotificacionPagoValidado(pagoValidado as PagoWithInscripcion).catch(error => {
            this.logger.warn(`No se pudo enviar notificación para pago ${id}:`, error)
        })

        // Verificar si todas las cuotas están pagadas
        await this.verificarYActualizarEstadoInscripcion(pago.inscripcionId).catch(error => {
            this.logger.warn(`No se pudo verificar estado de inscripción ${pago.inscripcionId}:`, error)
        })

        return pagoValidado
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
            throw new BadRequestException('Solo se pueden rehabilitar pagos cancelados')
        }

        const pagoRehabilitado = await this.prisma.pago.update({
            where: { id },
            data: {
                estado: EstadoPago.PENDIENTE,
                notas: pago.notas
                    ? `${pago.notas}\nRehabilitado: ${new Date().toLocaleString()}`
                    : `Rehabilitado: ${new Date().toLocaleString()}`,
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
        metadata?: Prisma.InputJsonValue
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
    async getHistorialAuditoriaPago(pagoId: string): Promise<Prisma.AuditoriaPagoGetPayload<{}>[]> {
        return this.prisma.auditoriaPago.findMany({
            where: { pagoId },
            orderBy: { createdAt: 'desc' },
        })
    }

    /**
     * Obtiene el historial de auditoría de una inscripción
     */
    async getHistorialAuditoriaInscripcion(inscripcionId: string): Promise<Prisma.AuditoriaPagoGetPayload<{ include: { pago: { select: { id: true; numeroCuota: true; monto: true; metodoPago: true } } } }>[]> {
        return this.prisma.auditoriaPago.findMany({
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
    async validarPagosMasivos(
        ids: string[],
        userId?: string
    ): Promise<{
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
                    throw new BadRequestException(
                        `El pago ${id} no está en estado PENDIENTE (estado actual: ${pagoExistente.estado})`
                    )
                }

                const resultado = await this.updatePago(id, { estado: EstadoPago.COMPLETADO }, userId)

                if (resultado && resultado.advertenciaMonto) {
                    advertencias++
                    detalles.push({ id, exito: true, advertencia: resultado.advertenciaMonto })
                } else {
                    exitosos++
                    detalles.push({ id, exito: true })
                }
            } catch (error: unknown) {
                fallidos++
                const errorMessage = error instanceof Error ? error.message : this.getErrorProperty(error, 'response') ? (this.getErrorProperty(error, 'response') as { message?: string })?.message : 'Error desconocido'
                detalles.push({
                    id,
                    exito: false,
                    error: errorMessage,
                })
                this.logger.error(`Error validando pago ${id}:`, errorMessage)
            }
        }

        this.logger.log(
            `✅ Validación masiva completada: ${exitosos} exitosos, ${advertencias} con advertencias, ${fallidos} fallidos`
        )

        return { exitosos, fallidos, advertencias, detalles }
    }

    /**
     * Emite evento cuando se rechaza un pago
     * También envía notificación a todos los admins
     */
    private async enviarNotificacionPagoRechazado(
        pago: PagoWithInscripcion,
        motivo?: string
    ): Promise<void> {
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

            const monto = typeof pago.monto === 'number' ? pago.monto : parseFloat(String(pago.monto || 0))
            const montoFormateado = new Intl.NumberFormat('es-AR', {
                style: 'currency',
                currency: 'ARS',
            }).format(monto)

            // Emitir evento de pago rechazado para el usuario
            const event = new PagoRechazadoEvent({
                email: inscripcion.email,
                pagoId: pago.id,
                inscripcionId: inscripcion.id,
                motivo,
                convencionTitulo: inscripcionCompleta.convencion?.titulo || 'Convención',
                monto,
                nombre: inscripcion.nombre,
                apellido: inscripcion.apellido || '',
            })

            this.eventEmitter.emit(NotificationEventType.PAGO_RECHAZADO, event)
            this.logger.log(`📬 Evento PAGO_RECHAZADO emitido para ${inscripcion.email}`)

            // Enviar email directamente al usuario usando EmailService
            if (this.notificationsService) {
                try {
                    const { getEmailTemplate } = await import('../notifications/templates/email.templates')
                    const template = getEmailTemplate('pago_rechazado', {
                        pagoId: pago.id,
                        inscripcionId: inscripcion.id,
                        monto,
                        numeroCuota: pago.numeroCuota || 1,
                        motivo: motivo || 'No especificado',
                        convencionTitulo: inscripcionCompleta.convencion?.titulo || 'Convención',
                        nombre: inscripcion.nombre,
                        apellido: inscripcion.apellido || '',
                    })

                    const emailSent = await this.notificationsService.sendEmailToUser(
                        inscripcion.email,
                        template.title,
                        template.body,
                        {
                            type: 'pago_rechazado',
                            pagoId: pago.id,
                            inscripcionId: inscripcion.id,
                            monto,
                            numeroCuota: pago.numeroCuota || 1,
                            motivo: motivo || 'No especificado',
                            convencionTitulo: inscripcionCompleta.convencion?.titulo || 'Convención',
                            nombre: inscripcion.nombre,
                            apellido: inscripcion.apellido || '',
                        }
                    )

                    if (emailSent) {
                        this.logger.log(`✅ Email de pago rechazado enviado exitosamente a ${inscripcion.email}`)
                    } else {
                        this.logger.warn(`⚠️ No se pudo enviar email de pago rechazado a ${inscripcion.email}`)
                    }
                } catch (emailError) {
                    this.logger.error(`Error enviando email de pago rechazado a ${inscripcion.email}:`, emailError)
                }
            }

            // Enviar notificación a todos los admins
            if (this.notificationsService) {
                try {
                    const admins = await this.prisma.user.findMany({
                        where: {
                            rol: {
                                in: ['ADMIN', 'EDITOR'],
                            },
                        },
                    })

                    const titulo = '❌ Pago Rechazado'
                    const mensaje = `El pago de ${montoFormateado} de ${inscripcion.nombre} ${inscripcion.apellido} ha sido rechazado.${motivo ? ` Motivo: ${motivo}` : ''}`

                    for (const admin of admins) {
                        await this.notificationsService.sendNotificationToAdmin(admin.email, titulo, mensaje, {
                            type: 'pago_rechazado',
                            pagoId: pago.id,
                            inscripcionId: inscripcion.id,
                            inscripcionNombre: `${inscripcion.nombre} ${inscripcion.apellido}`,
                            monto,
                            motivo,
                            convencionTitulo: inscripcionCompleta.convencion?.titulo || 'Convención',
                        })
                    }

                    this.logger.log(`📬 Notificaciones de pago rechazado enviadas a ${admins.length} admin(s)`)
                } catch (error) {
                    this.logger.error(`Error enviando notificaciones a admins:`, error)
                }
            }
        } catch (error) {
            this.logger.error(`Error emitiendo evento de pago rechazado:`, error)
        }
    }

    /**
     * Emite evento cuando se rehabilita un pago
     */
    private async enviarNotificacionPagoRehabilitado(
        pago: PagoWithInscripcion
    ): Promise<void> {
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

            const monto = typeof pago.monto === 'number' ? pago.monto : parseFloat(String(pago.monto || 0))
            const event = new PagoRehabilitadoEvent({
                email: inscripcion.email,
                pagoId: pago.id,
                inscripcionId: inscripcion.id,
                convencionTitulo: inscripcionCompleta.convencion?.titulo || 'Convención',
                monto,
                nombre: inscripcion.nombre,
                apellido: inscripcion.apellido || '',
            })

            this.eventEmitter.emit(NotificationEventType.PAGO_REHABILITADO, event)
            this.logger.log(`📬 Evento PAGO_REHABILITADO emitido para ${inscripcion.email}`)

            // Enviar notificación a todos los admins
            if (this.notificationsService) {
                try {
                    const admins = await this.prisma.user.findMany({
                        where: {
                            rol: {
                                in: ['ADMIN', 'EDITOR'],
                            },
                        },
                    })

                    const monto = typeof pago.monto === 'number' ? pago.monto : parseFloat(String(pago.monto || 0))
                    const montoFormateado = new Intl.NumberFormat('es-AR', {
                        style: 'currency',
                        currency: 'ARS',
                    }).format(monto)

                    const titulo = '🔄 Pago Rehabilitado'
                    const mensaje = `El pago de ${montoFormateado} de ${inscripcion.nombre} ${inscripcion.apellido} ha sido rehabilitado. El usuario puede volver a enviar su comprobante.`

                    for (const admin of admins) {
                        await this.notificationsService.sendNotificationToAdmin(admin.email, titulo, mensaje, {
                            type: 'pago_rehabilitado',
                            pagoId: pago.id,
                            inscripcionId: inscripcion.id,
                            inscripcionNombre: `${inscripcion.nombre} ${inscripcion.apellido}`,
                            monto,
                            convencionTitulo: inscripcionCompleta.convencion?.titulo || 'Convención',
                        })
                    }

                    this.logger.log(`📬 Notificaciones de pago rehabilitado enviadas a ${admins.length} admin(s)`)
                } catch (error) {
                    this.logger.error(`Error enviando notificaciones a admins:`, error)
                }
            }
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
            orderBy: { createdAt: 'desc' },
        })
    }

    /**
     * Obtiene pagos de una inscripción específica
     */
    async findPagosByInscripcion(inscripcionId: string): Promise<Pago[]> {
        return this.prisma.pago.findMany({
            where: { inscripcionId },
            include: this.pagoIncludes,
            orderBy: { createdAt: 'desc' },
        })
    }

    // ==================== ESTADÍSTICAS ====================

    /**
     * Obtiene estadísticas generales mejoradas para el dashboard
     */
    async getStats(): Promise<{
        totalInscripciones: number
        totalPagos: number
        pagosPendientes: number
        pagosCompletados: number
        pagosCancelados: number
        totalRecaudado: number
        totalPendiente: number
        pagosConComprobante: number
        pagosSinComprobante: number
        promedioPorPago: number
        ultimosPagos: Array<{
            id: string
            monto: number
            estado: string
            fechaPago: Date | null
            inscripcion: { nombre: string; apellido: string; email: string }
        }>
    }> {
        const [totalInscripciones, totalPagos, pagosPendientes, pagosCompletados, pagosCancelados, pagosConComprobante, pagosSinComprobante] =
            await Promise.all([
                this.prisma.inscripcion.count(),
                this.prisma.pago.count(),
                this.prisma.pago.count({ where: { estado: EstadoPago.PENDIENTE } }),
                this.prisma.pago.count({ where: { estado: EstadoPago.COMPLETADO } }),
                this.prisma.pago.count({ where: { estado: EstadoPago.CANCELADO } }),
                this.prisma.pago.count({ where: { comprobanteUrl: { not: null } } }),
                this.prisma.pago.count({ where: { comprobanteUrl: null, estado: EstadoPago.PENDIENTE } }),
            ])

        // Calcular totales de montos
        const [pagosCompletadosData, pagosPendientesData] = await Promise.all([
            this.prisma.pago.findMany({
                where: { estado: EstadoPago.COMPLETADO },
                select: { monto: true },
            }),
            this.prisma.pago.findMany({
                where: { estado: EstadoPago.PENDIENTE },
                select: { monto: true },
            }),
        ])

        const totalRecaudado = pagosCompletadosData.reduce(
            (sum, p) => sum + Number(p.monto),
            0
        )
        const totalPendiente = pagosPendientesData.reduce(
            (sum, p) => sum + Number(p.monto),
            0
        )
        const promedioPorPago = pagosCompletados > 0 ? totalRecaudado / pagosCompletados : 0

        // Obtener últimos 5 pagos completados
        const ultimosPagos = await this.prisma.pago.findMany({
            where: { estado: EstadoPago.COMPLETADO },
            include: {
                inscripcion: {
                    select: {
                        nombre: true,
                        apellido: true,
                        email: true,
                    },
                },
            },
            orderBy: { fechaPago: 'desc' },
            take: 5,
        })

        return {
            totalInscripciones,
            totalPagos,
            pagosPendientes,
            pagosCompletados,
            pagosCancelados,
            totalRecaudado,
            totalPendiente,
            pagosConComprobante,
            pagosSinComprobante,
            promedioPorPago,
            ultimosPagos: ultimosPagos.map(p => ({
                id: p.id,
                monto: Number(p.monto),
                estado: p.estado,
                fechaPago: p.fechaPago,
                inscripcion: {
                    nombre: p.inscripcion.nombre,
                    apellido: p.inscripcion.apellido,
                    email: p.inscripcion.email,
                },
            })),
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
                const monto =
                    typeof pago.monto === 'number' ? pago.monto : parseFloat(String(pago.monto || 0))

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
        try {
            this.logger.log('📧 Iniciando envío de recordatorios de pago...', { convencionId })

            // Verificar que el eventEmitter esté disponible
            if (!this.eventEmitter) {
                this.logger.error('❌ EventEmitter2 no está disponible')
                throw new Error('EventEmitter2 no está disponible. Verifica la configuración del módulo.')
            }

            const whereConvencion = convencionId ? { convencionId } : {}

            // Obtener inscripciones pendientes (con o sin pagos)
            // Luego verificaremos y crearemos pagos si no existen
            let inscripciones
            try {
                inscripciones = await this.prisma.inscripcion.findMany({
                    where: {
                        ...whereConvencion,
                        estado: 'pendiente',
                    },
                    include: {
                        pagos: true,
                        convencion: true,
                    },
                })
            } catch (dbError) {
                this.logger.error('❌ Error consultando inscripciones:', dbError)
                throw new Error(
                    `Error al consultar inscripciones: ${dbError instanceof Error ? dbError.message : 'Unknown error'}`
                )
            }

            this.logger.log(`📋 Encontradas ${inscripciones.length} inscripciones pendientes`)

            // Filtrar y crear pagos si no existen
            const inscripcionesConPagosPendientes: Array<typeof inscripciones[0]> = []
            for (const inscripcion of inscripciones) {
                // Si no tiene pagos, crearlos automáticamente
                if (!inscripcion.pagos || inscripcion.pagos.length === 0) {
                    this.logger.warn(
                        `⚠️ Inscripción ${inscripcion.id} no tiene pagos, creándolos automáticamente...`
                    )
                    try {
                        const numeroCuotas = inscripcion.numeroCuotas || 3
                        const costoTotal =
                            typeof inscripcion.convencion?.costo === 'number'
                                ? inscripcion.convencion.costo
                                : parseFloat(String(inscripcion.convencion?.costo || 0))
                        const montoPorCuota = costoTotal / numeroCuotas

                        const pagosCreados: Pago[] = []
                        for (let i = 1; i <= numeroCuotas; i++) {
                            const pago = await this.prisma.pago.create({
                                data: {
                                    inscripcionId: inscripcion.id,
                                    monto: montoPorCuota,
                                    metodoPago: 'pendiente',
                                    numeroCuota: i,
                                    estado: EstadoPago.PENDIENTE,
                                },
                            })
                            pagosCreados.push(pago)
                        }
                        inscripcion.pagos = pagosCreados
                        this.logger.log(
                            `✅ Creados ${pagosCreados.length} pagos para inscripción ${inscripcion.id}`
                        )
                    } catch (error) {
                        this.logger.error(`❌ Error creando pagos para inscripción ${inscripcion.id}:`, error)
                        continue // Saltar esta inscripción
                    }
                }

                // Verificar si tiene pagos pendientes
                const pagosPendientes = inscripcion.pagos.filter(p => p.estado === EstadoPago.PENDIENTE)
                if (pagosPendientes.length > 0) {
                    inscripcionesConPagosPendientes.push(inscripcion)
                }
            }

            this.logger.log(
                `📋 ${inscripcionesConPagosPendientes.length} inscripciones con pagos pendientes listas para recordatorio`
            )
            inscripciones = inscripcionesConPagosPendientes

            let enviados = 0
            let fallidos = 0
            const detalles: {
                email: string
                nombre: string
                cuotasPendientes: number
                exito: boolean
            }[] = []

            // Procesar cada inscripción de forma secuencial para evitar saturar la cola
            for (let i = 0; i < inscripciones.length; i++) {
                const inscripcion = inscripciones[i]
                this.logger.log(
                    `📧 [${i + 1}/${inscripciones.length}] Procesando recordatorio para ${inscripcion.email} (ID: ${inscripcion.id})...`
                )

                try {
                    // Función helper para detectar si una nota indica explícitamente que no asistirán
                    // Solo excluimos si la nota es muy clara sobre no asistir (no solo contiene palabras sueltas)
                    const notaIndicaNoAsistencia = (nota: string | null | undefined): boolean => {
                        if (!nota) return false
                        const notaLower = nota.toLowerCase().trim()

                        // Patrones más específicos que indican claramente que no asistirán
                        const patronesExcluyentes = [
                            /no\s+vendr[áa]/i, // "no vendrá" o "no vendra"
                            /no\s+asistir[áa]/i, // "no asistirá" o "no asistira"
                            /no\s+asistir\b/i, // "no asistir" (palabra completa)
                            /no\s+viene\b/i, // "no viene" (palabra completa)
                            /no\s+participar[áa]/i, // "no participará" o "no participara"
                            /no\s+participa\b/i, // "no participa" (palabra completa)
                            /no\s+ir[áa]\b/i, // "no irá" o "no ira" (palabra completa)
                            /no\s+va\b/i, // "no va" (palabra completa)
                            /no\s+asistencia\b/i, // "no asistencia" (palabra completa)
                            /^cancelado\s*$/i, // Solo "cancelado" (exacto)
                            /^cancelada\s*$/i, // Solo "cancelada" (exacto)
                            /no\s+vendr[áa]\s+al/i, // "no vendrá al" o "no vendra al"
                            /no\s+asistir[áa]\s+al/i, // "no asistirá al" o "no asistira al"
                        ]

                        // Verificar si alguno de los patrones coincide
                        return patronesExcluyentes.some(patron => patron.test(notaLower))
                    }

                    // Verificar si la inscripción tiene notas que indiquen explícitamente que no asistirán
                    // Solo excluimos si es muy claro, de lo contrario enviamos el recordatorio
                    if (notaIndicaNoAsistencia(inscripcion.notas)) {
                        this.logger.warn(
                            `⚠️ Inscripción ${inscripcion.id} tiene nota indicando que no asistirá: "${inscripcion.notas}", saltando...`
                        )
                        continue
                    }

                    // Filtrar SOLO pagos en estado PENDIENTE
                    // Solo excluimos pagos con notas muy claras sobre no asistir
                    const pagosPendientes = inscripcion.pagos.filter(p => {
                        // Solo procesar pagos pendientes
                        if (p.estado !== EstadoPago.PENDIENTE) {
                            return false
                        }

                        // Excluir solo si la nota es muy clara sobre no asistir
                        if (notaIndicaNoAsistencia(p.notas)) {
                            this.logger.warn(
                                `⚠️ Pago ${p.id} tiene nota indicando que no asistirá: "${p.notas}", excluyendo del recordatorio`
                            )
                            return false
                        }

                        return true
                    })

                    // Si no hay pagos pendientes válidos (después de filtrar), saltar esta inscripción
                    if (pagosPendientes.length === 0) {
                        this.logger.warn(
                            `⚠️ Inscripción ${inscripcion.id} no tiene pagos pendientes válidos para recordatorio, saltando...`
                        )
                        continue
                    }

                    const cuotasPendientes = pagosPendientes.length
                    const convencion = inscripcion.convencion

                    // Calcular monto pendiente
                    const montoPendiente = pagosPendientes.reduce((sum, p) => {
                        const monto = typeof p.monto === 'number' ? p.monto : parseFloat(String(p.monto || 0))
                        return sum + monto
                    }, 0)

                    this.logger.log(
                        `💰 Inscripción ${inscripcion.email}: ${cuotasPendientes} cuota(s) pendiente(s), monto: $${montoPendiente}`
                    )

                    this.logger.log(
                        `💰 Inscripción ${inscripcion.email}: ${cuotasPendientes} cuota(s) pendiente(s), monto: $${montoPendiente}`
                    )

                    // Emitir evento de recordatorio de pago
                    // Si el eventEmitter está disponible, usarlo (con cola)
                    // Si no, enviar directamente por email (fallback)
                    let emailEnviado = false

                    if (this.eventEmitter) {
                        try {
                            const event = new PagoRecordatorioEvent({
                                email: inscripcion.email,
                                inscripcionId: inscripcion.id,
                                cuotasPendientes,
                                montoPendiente,
                                convencionTitulo: convencion?.titulo || 'Convención',
                                nombre: inscripcion.nombre,
                                apellido: inscripcion.apellido || '',
                            })

                            // Usar emitAsync para esperar a que el listener procese el evento
                            // Esto asegura que cada evento se procese antes de continuar
                            await this.eventEmitter.emitAsync(NotificationEventType.PAGO_RECORDATORIO, event)
                            this.logger.log(
                                `📬 Evento PAGO_RECORDATORIO emitido para ${inscripcion.email}`
                            )
                            
                            // IMPORTANTE: Enviar email directamente usando sendEmailToUser
                            // Esto asegura que el email se envíe usando el EmailService correctamente configurado
                            this.logger.log(`📧 Enviando email directamente a ${inscripcion.email}...`)
                            emailEnviado = await this.enviarEmailRecordatorioDirecto(
                                inscripcion,
                                cuotasPendientes,
                                montoPendiente,
                                convencion
                            )

                            // Pequeño delay para evitar saturar la cola de emails
                            await new Promise(resolve => setTimeout(resolve, 100))
                        } catch (eventError) {
                            this.logger.error(`❌ Error emitiendo evento para ${inscripcion.email}:`, eventError)
                            // Fallback a envío directo
                            this.logger.warn(
                                `⚠️ Intentando envío directo como fallback para ${inscripcion.email}`
                            )
                            emailEnviado = await this.enviarEmailRecordatorioDirecto(
                                inscripcion,
                                cuotasPendientes,
                                montoPendiente,
                                convencion
                            )
                        }
                    } else {
                        // Fallback: enviar directamente por email si no hay eventEmitter
                        this.logger.warn(
                            `⚠️ EventEmitter no disponible, enviando email directamente a ${inscripcion.email}`
                        )
                        emailEnviado = await this.enviarEmailRecordatorioDirecto(
                            inscripcion,
                            cuotasPendientes,
                            montoPendiente,
                            convencion
                        )
                    }

                    if (emailEnviado) {
                        enviados++
                        detalles.push({
                            email: inscripcion.email,
                            nombre: `${inscripcion.nombre} ${inscripcion.apellido}`,
                            cuotasPendientes,
                            exito: true,
                        })
                        this.logger.log(`✅ Recordatorio procesado exitosamente para ${inscripcion.email}`)
                    } else {
                        fallidos++
                        detalles.push({
                            email: inscripcion.email,
                            nombre: `${inscripcion.nombre} ${inscripcion.apellido}`,
                            cuotasPendientes,
                            exito: false,
                        })
                        this.logger.error(`❌ No se pudo enviar recordatorio a ${inscripcion.email}`)
                    }
                } catch (error) {
                    fallidos++
                    const nombreCompleto = inscripcion
                        ? `${inscripcion.nombre} ${inscripcion.apellido}`
                        : 'Desconocido'
                    const email = inscripcion?.email || 'desconocido'
                    detalles.push({
                        email,
                        nombre: nombreCompleto,
                        cuotasPendientes: 0,
                        exito: false,
                    })
                    this.logger.error(`❌ Error procesando recordatorio para ${email}:`, {
                        error: error instanceof Error ? error.message : 'Unknown error',
                        stack: error instanceof Error ? error.stack : undefined,
                    })
                }
            }

            this.logger.log(`📊 Recordatorios: ${enviados} enviados, ${fallidos} fallidos`)

            return { enviados, fallidos, detalles }
        } catch (error) {
            this.logger.error('❌ Error en enviarRecordatoriosPago:', error)
            throw error
        }
    }

    /**
     * Envía email de recordatorio directamente usando NotificationsService.sendEmailToUser
     * Esto asegura que se use el EmailService correctamente configurado
     */
    private async enviarEmailRecordatorioDirecto(
        inscripcion: InscripcionWithRelations,
        cuotasPendientes: number,
        montoPendiente: number,
        convencion: Convencion
    ): Promise<boolean> {
        try {
            this.logger.log(`📧 Enviando email directo a ${inscripcion.email}...`)

            // Verificar que notificationsService esté disponible
            if (!this.notificationsService) {
                this.logger.error('❌ NotificationsService no está disponible')
                return false
            }

            // Obtener template de email
            const { getEmailTemplate } = await import('../notifications/templates/email.templates')
            const template = getEmailTemplate('pago_recordatorio', {
                inscripcionId: inscripcion.id,
                cuotasPendientes,
                montoPendiente,
                convencionTitulo: convencion?.titulo || 'Convención',
                nombre: inscripcion.nombre,
                apellido: inscripcion.apellido || '',
                inscripcionNombre: `${inscripcion.nombre} ${inscripcion.apellido || ''}`.trim(),
            })

            this.logger.log(`📧 Template obtenido: ${template.title}`)

            // Enviar email usando sendEmailToUser (usa EmailService correctamente configurado)
            const resultado = await this.notificationsService.sendEmailToUser(
                inscripcion.email,
                template.title,
                template.body,
                {
                    inscripcionId: inscripcion.id,
                    cuotasPendientes,
                    montoPendiente,
                    convencionTitulo: convencion?.titulo || 'Convención',
                    nombre: inscripcion.nombre,
                    apellido: inscripcion.apellido || '',
                    inscripcionNombre: `${inscripcion.nombre} ${inscripcion.apellido || ''}`.trim(),
                }
            )

            if (resultado) {
                this.logger.log(`✅ Email enviado exitosamente a ${inscripcion.email}`)
            } else {
                this.logger.error(`❌ EmailService retornó false para ${inscripcion.email}`)
            }

            return resultado
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
            this.logger.error(`❌ Error enviando email de recordatorio a ${inscripcion.email}:`, errorMessage)
            return false
        }
    }

    /**
     * Cancela una inscripción y sus pagos pendientes
     */
    async cancelarInscripcion(
        id: string,
        motivo?: string,
        userId?: string,
        userEmail?: string
    ): Promise<Inscripcion> {
        this.logger.log(`❌ Cancelando inscripción: ${id}`)

        const inscripcion = await this.findOneInscripcion(id)

        if (inscripcion.estado === 'cancelado') {
            throw new BadRequestException('Esta inscripción ya está cancelada')
        }

        const estadoAnterior = inscripcion.estado

        // Cancelar la inscripción y sus pagos pendientes
        const inscripcionCancelada = await this.prisma.$transaction(async tx => {
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
            changes: [
                {
                    field: 'estado',
                    oldValue: estadoAnterior,
                    newValue: 'cancelado',
                },
            ],
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
     * Rehabilita una inscripción cancelada, restaurándola al estado pendiente
     */
    async rehabilitarInscripcion(
        id: string,
        userId?: string,
        userEmail?: string
    ): Promise<Inscripcion> {
        this.logger.log(`🔄 Rehabilitando inscripción: ${id}`)

        const inscripcion = await this.findOneInscripcion(id)

        if (inscripcion.estado !== 'cancelado') {
            throw new BadRequestException('Solo se pueden rehabilitar inscripciones canceladas')
        }

        const estadoAnterior = inscripcion.estado

        // Rehabilitar la inscripción y sus pagos cancelados
        const inscripcionRehabilitada = await this.prisma.$transaction(async tx => {
            // Obtener pagos cancelados para rehabilitarlos
            const pagosCancelados = await tx.pago.findMany({
                where: {
                    inscripcionId: id,
                    estado: EstadoPago.CANCELADO,
                },
            })

            // Rehabilitar cada pago cancelado
            for (const pago of pagosCancelados) {
                const notas = pago.notas || ''
                const notasSinCancelacion = notas
                    .replace(/CANCELACIÓN:.*?(\||$)/g, '')
                    .replace(/Pago cancelado por cancelación de inscripción/g, '')
                    .trim()
                const nuevasNotas = notasSinCancelacion
                    ? `${notasSinCancelacion}\nRehabilitado: ${new Date().toLocaleString()}`
                    : `Rehabilitado: ${new Date().toLocaleString()}`

                await tx.pago.update({
                    where: { id: pago.id },
                    data: {
                        estado: EstadoPago.PENDIENTE,
                        notas: nuevasNotas,
                    },
                })
            }

            // Limpiar la nota de cancelación y agregar nota de rehabilitación
            const notas = inscripcion.notas || ''
            const notasSinCancelacion = notas.replace(/CANCELACIÓN:.*?(\||$)/g, '').trim()
            const nuevasNotasInscripcion = notasSinCancelacion
                ? `${notasSinCancelacion} | REHABILITADO: ${new Date().toLocaleString()}`
                : `REHABILITADO: ${new Date().toLocaleString()}`

            // Actualizar inscripción a estado pendiente
            return tx.inscripcion.update({
                where: { id },
                data: {
                    estado: 'pendiente',
                    notas: nuevasNotasInscripcion,
                },
                include: this.inscripcionIncludes,
            })
        })

        // Registrar auditoría
        await this.auditService.log({
            entityType: 'INSCRIPCION',
            entityId: id,
            action: 'REHABILITAR',
            userId,
            userEmail,
            changes: [
                {
                    field: 'estado',
                    oldValue: estadoAnterior,
                    newValue: 'pendiente',
                },
            ],
            metadata: {
                inscripcionId: id,
            },
        })

        // Log de rehabilitación
        this.logger.log(
            `✅ Inscripción ${id} rehabilitada exitosamente, estado restaurado a 'pendiente'`
        )

        return inscripcionRehabilitada
    }

    /**
     * Emite evento de cancelación de inscripción
     */
    private async enviarNotificacionCancelacion(
        inscripcion: InscripcionWithConvencion,
        motivo?: string
    ): Promise<void> {
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

    /**
     * Helper para obtener el código de error de forma segura
     */
    private getErrorCode(error: unknown): string | undefined {
        if (error && typeof error === 'object' && 'code' in error) {
            return typeof error.code === 'string' ? error.code : undefined
        }
        return undefined
    }

    /**
     * Helper para obtener propiedades de error de forma segura
     */
    private getErrorProperty(error: unknown, property: string): unknown {
        if (error && typeof error === 'object' && property in error) {
            return (error as Record<string, unknown>)[property]
        }
        return undefined
    }
}
