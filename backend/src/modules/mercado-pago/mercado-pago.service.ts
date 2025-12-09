import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { InscripcionesService } from '../inscripciones/inscripciones.service'
import { CreatePaymentPreferenceDto } from './dto/mercado-pago.dto'
import type {
    MercadoPagoPreference,
    MercadoPagoPayment,
    WebhookNotification,
    CreatePreferenceRequest,
} from './types/mercado-pago.types'
import { MercadoPagoConfig, Preference, Payment } from 'mercadopago'
import type { PreferenceRequest } from 'mercadopago/dist/clients/preference/commonTypes'
import { EstadoPago } from '../inscripciones/dto/inscripcion.dto'

@Injectable()
export class MercadoPagoService {
    private readonly logger = new Logger(MercadoPagoService.name)
    private readonly accessToken: string | null
    private readonly isTestMode: boolean
    private readonly preferenceClient: Preference | null
    private readonly paymentClient: Payment | null

    constructor(
        private prisma: PrismaService,
        private inscripcionesService: InscripcionesService
    ) {
        this.accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN || null
        this.isTestMode = process.env.MERCADO_PAGO_TEST_MODE === 'true' || !this.accessToken

        if (!this.accessToken) {
            this.logger.warn('⚠️ MERCADO_PAGO_ACCESS_TOKEN no configurado. Mercado Pago deshabilitado.')
            this.preferenceClient = null
            this.paymentClient = null
        } else {
            // Inicializar cliente de Mercado Pago
            const config = new MercadoPagoConfig({ accessToken: this.accessToken })
            this.preferenceClient = new Preference(config)
            this.paymentClient = new Payment(config)
            this.logger.log(`✅ Mercado Pago inicializado (modo: ${this.isTestMode ? 'TEST' : 'PRODUCCIÓN'})`)
        }
    }

    /**
     * Verifica si Mercado Pago está configurado
     */
    isConfigured(): boolean {
        return !!this.accessToken && !!this.preferenceClient
    }

    /**
     * Crea una preferencia de pago en Mercado Pago
     */
    async createPaymentPreference(dto: CreatePaymentPreferenceDto): Promise<MercadoPagoPreference> {
        if (!this.isConfigured()) {
            throw new BadRequestException('Mercado Pago no está configurado. Contacta al administrador.')
        }

        this.logger.log(`Creando preferencia de pago para inscripción: ${dto.inscripcionId}, pago: ${dto.pagoId}`)

        // Obtener información de la inscripción
        const inscripcion = await this.prisma.inscripcion.findUnique({
            where: { id: dto.inscripcionId },
            include: {
                convencion: true,
                pagos: true,
            },
        })

        if (!inscripcion) {
            throw new NotFoundException(`Inscripción con ID "${dto.inscripcionId}" no encontrada`)
        }

        // Obtener información del pago
        const pago = await this.prisma.pago.findUnique({
            where: { id: dto.pagoId },
        })

        if (!pago) {
            throw new NotFoundException(`Pago con ID "${dto.pagoId}" no encontrado`)
        }

        // Validar que el pago pertenece a la inscripción
        if (pago.inscripcionId !== dto.inscripcionId) {
            throw new BadRequestException('El pago no pertenece a esta inscripción')
        }

        // Construir URL base para callbacks (asegurar que sea una URL válida)
        const baseUrl = (process.env.FRONTEND_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').trim()
        const backendUrl = (process.env.BACKEND_URL || 'http://localhost:4000').trim()
        const webhookUrl = `${backendUrl}/api/mercado-pago/webhook`

        // Validar que baseUrl sea una URL válida
        if (!baseUrl || (!baseUrl.startsWith('http://') && !baseUrl.startsWith('https://'))) {
            this.logger.error(`❌ FRONTEND_URL inválido: ${baseUrl}`)
            throw new BadRequestException(`FRONTEND_URL inválido: ${baseUrl}. Debe ser una URL válida (http:// o https://)`)
        }

        this.logger.log(`🔗 URLs configuradas: baseUrl=${baseUrl}, backendUrl=${backendUrl}`)

        // Crear request para Mercado Pago (usando el tipo del SDK)
        // Asegurar que el monto sea un número válido
        const monto = typeof dto.monto === 'number' ? dto.monto : parseFloat(String(dto.monto))

        if (isNaN(monto) || monto <= 0) {
            throw new BadRequestException(`Monto inválido: ${dto.monto}. Debe ser un número mayor a 0.`)
        }

        // Construir URLs de callback (asegurar que sean absolutas y válidas)
        const successUrl = dto.successUrl || `${baseUrl}/convencion/pago-exitoso?payment_id={PAYMENT_ID}`
        const failureUrl = dto.failureUrl || `${baseUrl}/convencion/pago-fallido?payment_id={PAYMENT_ID}`
        const pendingUrl = dto.pendingUrl || `${baseUrl}/convencion/pago-pendiente?payment_id={PAYMENT_ID}`

        // Validar que las URLs sean válidas
        try {
            new URL(successUrl.replace('{PAYMENT_ID}', 'test'))
            new URL(failureUrl.replace('{PAYMENT_ID}', 'test'))
            new URL(pendingUrl.replace('{PAYMENT_ID}', 'test'))
        } catch (error) {
            this.logger.error('❌ URLs de callback inválidas:', { successUrl, failureUrl, pendingUrl })
            throw new BadRequestException('URLs de callback inválidas. Verifica FRONTEND_URL en tu .env')
        }

        // Logging de información importante antes de crear la preferencia
        this.logger.log('📋 Información de la Preferencia:')
        this.logger.log(`   • Inscripción ID: ${dto.inscripcionId}`)
        this.logger.log(`   • Pago ID: ${dto.pagoId}`)
        this.logger.log(`   • Monto: ${monto}`)
        this.logger.log(`   • Moneda: ARS`)
        this.logger.log(`   • Modo Test: ${this.isTestMode ? 'SÍ' : 'NO'}`)
        this.logger.log(`   • Email: ${dto.emailPayer || inscripcion.email}`)
        this.logger.log(`   • Nombre: ${dto.nombrePayer || inscripcion.nombre} ${dto.apellidoPayer || inscripcion.apellido}`)

        const preferenceRequest: PreferenceRequest = {
            items: [
                {
                    id: dto.pagoId, // ID del pago en nuestra BD
                    title: `${inscripcion.convencion.titulo} - Cuota ${dto.numeroCuota || pago.numeroCuota || 1}`,
                    description: dto.descripcion || `Pago de cuota ${dto.numeroCuota || pago.numeroCuota || 1} para ${inscripcion.nombre} ${inscripcion.apellido}`,
                    quantity: 1,
                    unit_price: monto,
                },
            ],
            payer: {
                name: dto.nombrePayer || inscripcion.nombre,
                surname: dto.apellidoPayer || inscripcion.apellido,
                email: dto.emailPayer || inscripcion.email,
                phone: dto.telefonoPayer
                    ? (() => {
                        // Formatear teléfono: extraer área y número si es posible
                        const phoneStr = dto.telefonoPayer.replace(/\D/g, '') // Solo números
                        if (phoneStr.length >= 10) {
                            // Asumir formato argentino: +54 9 11 1234-5678
                            const areaCode = phoneStr.substring(phoneStr.length - 10, phoneStr.length - 8) || '11'
                            const number = phoneStr.substring(phoneStr.length - 8) || phoneStr
                            return {
                                area_code: areaCode,
                                number: number,
                            }
                        }
                        return {
                            number: phoneStr || dto.telefonoPayer,
                        }
                    })()
                    : undefined,
            },
            back_urls: {
                success: successUrl,
                failure: failureUrl,
                pending: pendingUrl,
            },
            auto_return: 'approved',
            external_reference: `${dto.pagoId}`, // ID del pago en nuestra BD
            notification_url: webhookUrl,
            statement_descriptor: 'AMVA Digital',
            metadata: {
                inscripcionId: dto.inscripcionId,
                pagoId: dto.pagoId,
                convencionId: inscripcion.convencionId,
                numeroCuota: dto.numeroCuota || pago.numeroCuota || 1,
            },
        }

        if (!this.preferenceClient) {
            throw new BadRequestException('Mercado Pago no está configurado')
        }

        // Logging detallado para debugging
        this.logger.log('📤 Enviando preferencia a Mercado Pago:', {
            back_urls: preferenceRequest.back_urls,
            auto_return: preferenceRequest.auto_return,
            has_back_urls: !!preferenceRequest.back_urls,
            has_success_url: !!preferenceRequest.back_urls?.success,
            success_url: preferenceRequest.back_urls?.success,
            baseUrl,
        })

        // Validar que back_urls.success esté definido antes de enviar
        if (!preferenceRequest.back_urls || !preferenceRequest.back_urls.success) {
            this.logger.error('❌ back_urls.success no está definido:', {
                back_urls: preferenceRequest.back_urls,
                baseUrl,
                successUrl,
            })
            throw new BadRequestException(
                `back_urls.success no está definido. baseUrl: ${baseUrl}, successUrl: ${successUrl}`
            )
        }

        try {
            // Construir back_urls primero y validar
            const backUrls = {
                success: String(preferenceRequest.back_urls.success).trim(),
                failure: String(preferenceRequest.back_urls.failure || preferenceRequest.back_urls.success).trim(),
                pending: String(preferenceRequest.back_urls.pending || preferenceRequest.back_urls.success).trim(),
            }

            // Validación crítica: back_urls.success DEBE estar definido y no vacío
            if (!backUrls.success || backUrls.success === '' || backUrls.success === 'undefined') {
                this.logger.error('❌ ERROR CRÍTICO: back_urls.success está vacío o undefined', {
                    success: backUrls.success,
                    original: preferenceRequest.back_urls.success,
                })
                throw new BadRequestException('back_urls.success no puede estar vacío')
            }

            // Construir el objeto de manera explícita
            // NOTA: El orden de las propiedades puede ser importante para el SDK
            // IMPORTANTE: Mercado Pago rechaza back_urls y redirect_urls con localhost en modo sandbox
            // En desarrollo local, NO incluimos URLs de redirección, solo el webhook
            // El webhook SÍ funciona con localhost, así que el pago se procesará correctamente
            const isLocalhost = backUrls.success.includes('localhost') || backUrls.success.includes('127.0.0.1')

            const requestBody: PreferenceRequest = {
                items: preferenceRequest.items.map((item) => ({
                    id: String(item.id || ''),
                    title: String(item.title || ''),
                    description: item.description ? String(item.description) : undefined,
                    quantity: Number(item.quantity) || 1,
                    unit_price: Number(item.unit_price) || 0,
                    currency_id: 'ARS', // Forzar moneda argentina para tarjetas de prueba
                })),
                payer: preferenceRequest.payer
                    ? {
                        name: preferenceRequest.payer.name ? String(preferenceRequest.payer.name) : undefined,
                        surname: preferenceRequest.payer.surname ? String(preferenceRequest.payer.surname) : undefined,
                        email: String(preferenceRequest.payer.email || ''),
                        phone: preferenceRequest.payer.phone,
                    }
                    : undefined,
                // CRÍTICO: En desarrollo local (localhost), NO incluimos URLs de redirección
                // Mercado Pago las rechaza en modo sandbox, pero el webhook SÍ funciona
                // El usuario tendrá que hacer clic en "Volver al sitio" manualmente después del pago
                // En producción (URLs públicas), usamos back_urls con auto_return
                ...(isLocalhost
                    ? {
                        // No incluir back_urls ni redirect_urls para localhost
                        // El webhook procesará el pago correctamente
                    }
                    : {
                        back_urls: backUrls,
                        auto_return: 'approved' as const,
                    }),
                external_reference: String(preferenceRequest.external_reference || ''),
                notification_url: String(preferenceRequest.notification_url || ''),
                statement_descriptor: preferenceRequest.statement_descriptor,
                metadata: preferenceRequest.metadata,
                // IMPORTANTE: No incluir payment_methods vacíos que puedan bloquear métodos de pago
                // Si no especificamos payment_methods, Mercado Pago permite todos los métodos
                // Esto es necesario para que funcionen las tarjetas de prueba
            }

            if (isLocalhost) {
                this.logger.warn(`⚠️ Desarrollo local detectado: No se incluyen URLs de redirección`)
                this.logger.warn(`⚠️ El webhook procesará el pago correctamente (funciona con localhost)`)
                this.logger.warn(`⚠️ El usuario deberá hacer clic en "Volver al sitio" manualmente después del pago`)
            } else {
                this.logger.log(`🔗 URLs configuradas: back_urls (público) con auto_return`)
            }

            this.logger.log('📤 Request body final:', JSON.stringify(requestBody, null, 2))
            if (requestBody.back_urls) {
                this.logger.log('📤 back_urls.success:', requestBody.back_urls.success)
                this.logger.log('📤 Tipo de back_urls.success:', typeof requestBody.back_urls.success)
                this.logger.log('📤 back_urls completo:', JSON.stringify(requestBody.back_urls, null, 2))
            }

            // Enviar al SDK de Mercado Pago
            this.logger.log('📤 Enviando request a Mercado Pago SDK...')
            this.logger.debug('📤 Request completo:', JSON.stringify(requestBody, null, 2))

            const preference = await this.preferenceClient.create({ body: requestBody })

            // Logging detallado de la respuesta
            this.logger.log(`✅ Preferencia creada exitosamente`)
            this.logger.log(`📋 ID de Preferencia: ${preference.id}`)
            this.logger.log(`🔗 Init Point (Producción): ${preference.init_point || 'N/A'}`)
            this.logger.log(`🔗 Sandbox Init Point (TEST): ${preference.sandbox_init_point || 'N/A'}`)
            this.logger.log(`🧪 Modo Test: ${this.isTestMode ? 'SÍ' : 'NO'}`)
            this.logger.log(`💰 Monto Total: ${monto}`)
            this.logger.log(`📧 Email Payer: ${dto.emailPayer || inscripcion.email}`)
            this.logger.log(`👤 Nombre Payer: ${dto.nombrePayer || inscripcion.nombre} ${dto.apellidoPayer || inscripcion.apellido}`)

            // Verificar URLs de redirección en la respuesta
            const responseRedirectUrls = (preference as unknown as { redirect_urls?: { success?: string; failure?: string; pending?: string } }).redirect_urls
            const responseBackUrls = (preference as unknown as { back_urls?: { success?: string; failure?: string; pending?: string } }).back_urls

            if (isLocalhost) {
                // En localhost, es normal que no haya URLs de redirección
                this.logger.log(`ℹ️ Desarrollo local: URLs de redirección no incluidas (normal)`)
                this.logger.log(`ℹ️ El webhook procesará el pago: ${preferenceRequest.notification_url}`)
            } else {
                // En producción, verificar que las URLs estén presentes
                if (responseBackUrls) {
                    this.logger.log(`🔗 Back URLs en respuesta:`)
                    this.logger.log(`   • Success: ${responseBackUrls.success || 'VACÍO'}`)
                    this.logger.log(`   • Failure: ${responseBackUrls.failure || 'VACÍO'}`)
                    this.logger.log(`   • Pending: ${responseBackUrls.pending || 'VACÍO'}`)
                } else if (responseRedirectUrls) {
                    this.logger.log(`🔗 Redirect URLs en respuesta:`)
                    this.logger.log(`   • Success: ${responseRedirectUrls.success || 'VACÍO'}`)
                    this.logger.log(`   • Failure: ${responseRedirectUrls.failure || 'VACÍO'}`)
                    this.logger.log(`   • Pending: ${responseRedirectUrls.pending || 'VACÍO'}`)
                } else {
                    this.logger.warn(`⚠️ URLs de redirección no presentes en la respuesta`)
                }
            }

            // Logging de la respuesta completa (solo en modo debug)
            if (process.env.NODE_ENV === 'development') {
                this.logger.debug('📦 Respuesta completa de Mercado Pago:', JSON.stringify(preference, null, 2))
            }

            // Validar que la preferencia tenga un ID antes de actualizar el pago
            if (!preference || typeof preference !== 'object' || !('id' in preference) || !preference.id) {
                this.logger.error('❌ ERROR: La preferencia no tiene ID válido')
                this.logger.error('📦 Preferencia recibida:', JSON.stringify(preference, null, 2))
                throw new BadRequestException('La preferencia creada no tiene un ID válido')
            }

            const preferenceId = String(preference.id)

            // CRÍTICO: Actualizar el pago para indicar que está en proceso con Mercado Pago
            // Esto permite que la UI muestre que el pago está pendiente confirmación de Mercado Pago
            try {
                await this.prisma.pago.update({
                    where: { id: dto.pagoId },
                    data: {
                        metodoPago: 'Mercado Pago',
                        referencia: preferenceId, // ID de la preferencia de Mercado Pago
                        notas: `Pago iniciado con Mercado Pago. Preferencia ID: ${preferenceId}. Pendiente confirmación.`,
                        // Mantener el estado como PENDIENTE, pero ahora con información de Mercado Pago
                    },
                })
                this.logger.log(`✅ Pago ${dto.pagoId} actualizado: método=Mercado Pago, referencia=${preferenceId}`)
            } catch (updateError: unknown) {
                const errorMessage = updateError instanceof Error ? updateError.message : 'Error desconocido'
                this.logger.warn(`⚠️ No se pudo actualizar el pago ${dto.pagoId} después de crear la preferencia: ${errorMessage}`)
                // No lanzar error, ya que la preferencia se creó correctamente
            }

            // Retornar la preferencia con validación de tipos
            return preference as unknown as MercadoPagoPreference
        } catch (error: unknown) {
            // Mejorar el manejo de errores para capturar detalles de Mercado Pago
            let errorMessage = 'Error desconocido'
            let errorDetails: unknown = null

            if (error instanceof Error) {
                errorMessage = error.message
                errorDetails = {
                    name: error.name,
                    message: error.message,
                    stack: error.stack,
                }
            } else if (typeof error === 'object' && error !== null) {
                // Intentar extraer información del error de Mercado Pago
                const mpError = error as Record<string, unknown>
                if (mpError.message) {
                    errorMessage = String(mpError.message)
                } else if (mpError.error) {
                    errorMessage = String(mpError.error)
                } else if (mpError.status) {
                    errorMessage = `Status ${mpError.status}: ${JSON.stringify(mpError)}`
                } else {
                    errorMessage = JSON.stringify(error)
                }
                errorDetails = mpError
            } else {
                errorMessage = String(error)
                errorDetails = error
            }

            this.logger.error(`❌ Error creando preferencia de Mercado Pago:`, {
                message: errorMessage,
                details: errorDetails,
                request: {
                    inscripcionId: dto.inscripcionId,
                    pagoId: dto.pagoId,
                    monto: dto.monto,
                    numeroCuota: dto.numeroCuota,
                },
            })

            throw new BadRequestException(`Error al crear preferencia de pago: ${errorMessage}`)
        }
    }

    /**
     * Obtiene el estado de un pago de Mercado Pago
     */
    async getPaymentStatus(paymentId: string): Promise<MercadoPagoPayment> {
        if (!this.paymentClient) {
            throw new BadRequestException('Mercado Pago no está configurado')
        }

        this.logger.log(`🔍 Obteniendo estado de pago: ${paymentId}`)

        try {
            const payment = await this.paymentClient.get({ id: parseInt(paymentId, 10) })

            // Logging detallado del estado del pago
            this.logger.log(`📊 Estado del Pago ${paymentId}:`)
            this.logger.log(`   • Status: ${payment.status}`)
            this.logger.log(`   • Status Detail: ${payment.status_detail || 'N/A'}`)
            this.logger.log(`   • Monto: ${payment.transaction_amount} ${payment.currency_id}`)
            this.logger.log(`   • External Reference: ${payment.external_reference || 'N/A'}`)
            this.logger.log(`   • Fecha Creación: ${payment.date_created}`)
            this.logger.log(`   • Fecha Aprobación: ${payment.date_approved || 'N/A'}`)

            if (process.env.NODE_ENV === 'development') {
                this.logger.debug('📦 Respuesta completa del pago:', JSON.stringify(payment, null, 2))
            }

            return payment as unknown as MercadoPagoPayment
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
            this.logger.error(`❌ Error obteniendo estado de pago ${paymentId}:`, {
                error: errorMessage,
                paymentId,
                errorDetails: error instanceof Error ? {
                    name: error.name,
                    message: error.message,
                    stack: error.stack,
                } : error,
            })
            throw new BadRequestException(`Error al obtener estado de pago: ${errorMessage}`)
        }
    }

    /**
     * Procesa una notificación webhook de Mercado Pago
     */
    async processWebhook(notification: WebhookNotification): Promise<void> {
        if (!this.isConfigured()) {
            this.logger.warn('⚠️ Webhook recibido pero Mercado Pago no está configurado')
            return
        }

        this.logger.log(`📥 Webhook recibido: tipo=${notification.type}, action=${notification.action}, id=${notification.data.id}`)
        this.logger.debug('📦 Notificación completa:', JSON.stringify(notification, null, 2))

        try {
            if (notification.type === 'payment') {
                const paymentId = notification.data.id
                this.logger.log(`🔍 Procesando pago desde webhook: ${paymentId}`)
                const payment = await this.getPaymentStatus(paymentId)

                // Buscar el pago en nuestra BD usando external_reference
                const pagoId = payment.external_reference
                if (!pagoId) {
                    this.logger.warn(`⚠️ Pago ${paymentId} no tiene external_reference`)
                    return
                }

                const pago = await this.prisma.pago.findUnique({
                    where: { id: pagoId },
                    include: {
                        inscripcion: {
                            include: {
                                convencion: true,
                            },
                        },
                    },
                })

                if (!pago) {
                    this.logger.warn(`⚠️ Pago ${pagoId} no encontrado en BD`)
                    return
                }

                // Actualizar estado del pago según el estado de Mercado Pago
                let nuevoEstado: EstadoPago
                switch (payment.status) {
                    case 'approved':
                        nuevoEstado = EstadoPago.COMPLETADO
                        break
                    case 'rejected':
                    case 'cancelled':
                        nuevoEstado = EstadoPago.CANCELADO
                        break
                    case 'refunded':
                    case 'charged_back':
                        nuevoEstado = EstadoPago.REEMBOLSADO
                        break
                    case 'pending':
                    case 'in_process':
                    case 'in_mediation':
                    default:
                        nuevoEstado = EstadoPago.PENDIENTE
                        break
                }

                // Solo actualizar si el estado cambió
                if (pago.estado !== nuevoEstado) {
                    await this.prisma.pago.update({
                        where: { id: pagoId },
                        data: {
                            estado: nuevoEstado,
                            fechaPago: payment.status === 'approved' && payment.date_approved ? new Date(payment.date_approved) : pago.fechaPago,
                            referencia: payment.id.toString(),
                            notas: `Mercado Pago - Status: ${payment.status}, Status Detail: ${payment.status_detail || 'N/A'}`,
                        },
                    })

                    this.logger.log(`✅ Pago ${pagoId} actualizado: ${pago.estado} → ${nuevoEstado}`)

                    // Si el pago fue aprobado, usar el método público de validación que emite notificaciones
                    if (nuevoEstado === EstadoPago.COMPLETADO && pago.estado !== EstadoPago.COMPLETADO) {
                        // Usar el método público validatePago que maneja notificaciones y verificación automáticamente
                        await this.inscripcionesService.validatePago(pagoId).catch(error => {
                            this.logger.warn(`No se pudo validar pago ${pagoId} automáticamente:`, error)
                        })
                    }
                }
            }
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
            this.logger.error(`❌ Error procesando webhook: ${errorMessage}`)
            throw error
        }
    }
}

