import {
    Controller,
    Post,
    Get,
    Body,
    Param,
    Query,
    UseGuards,
    BadRequestException,
    Logger,
} from '@nestjs/common'
import { MercadoPagoService } from './mercado-pago.service'
import { CreatePaymentPreferenceDto, GetPaymentStatusDto, ProcessWebhookDto, ProcessPaymentManuallyDto, ProcessPaymentByPreferenceDto, ProcessPaymentByPagoIdDto } from './dto/mercado-pago.dto'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import type { MercadoPagoPreference, MercadoPagoPayment } from './types/mercado-pago.types'

@Controller('mercado-pago')
export class MercadoPagoController {
    private readonly logger = new Logger(MercadoPagoController.name)

    constructor(private readonly mercadoPagoService: MercadoPagoService) { }

    /**
     * Crea una preferencia de pago en Mercado Pago
     * POST /api/mercado-pago/create-preference
     */
    @Post('create-preference')
    async createPreference(@Body() dto: CreatePaymentPreferenceDto): Promise<MercadoPagoPreference> {
        this.logger.log(`Creando preferencia de pago para inscripción: ${dto.inscripcionId}`)
        return this.mercadoPagoService.createPaymentPreference(dto)
    }

    /**
     * Obtiene el estado de un pago de Mercado Pago
     * GET /api/mercado-pago/payment/:paymentId
     */
    @Get('payment/:paymentId')
    async getPaymentStatus(@Param('paymentId') paymentId: string): Promise<MercadoPagoPayment> {
        this.logger.log(`Obteniendo estado de pago: ${paymentId}`)
        return this.mercadoPagoService.getPaymentStatus(paymentId)
    }

    /**
     * Webhook para recibir notificaciones de Mercado Pago
     * POST /api/mercado-pago/webhook
     * IMPORTANTE: Este endpoint NO debe requerir autenticación
     */
    @Post('webhook')
    async processWebhook(
        @Body() body: ProcessWebhookDto,
        @Query('id') notificationId?: string,
        @Query('topic') topic?: string,
        @Query('type') type?: string
    ): Promise<{ status: string; message: string }> {
        this.logger.log(`Webhook recibido: id=${notificationId || 'N/A'}, topic=${topic || 'N/A'}, type=${type || body.type}`)

        try {
            // Mercado Pago puede enviar webhooks de dos formas:
            // 1. Como query params (id, topic, type)
            // 2. Como body (type, action, data)

            if (notificationId && topic) {
                // Formato con query params - necesitamos obtener la información del pago
                const paymentId = notificationId
                const payment = await this.mercadoPagoService.getPaymentStatus(paymentId)

                // Crear estructura de notificación
                const notification = {
                    id: parseInt(notificationId, 10),
                    live_mode: true, // Asumir producción si viene con id
                    type: topic as 'payment',
                    date_created: new Date().toISOString(),
                    application_id: 0,
                    user_id: '',
                    version: 1,
                    api_version: 'v1',
                    action: 'payment.updated',
                    data: {
                        id: paymentId,
                    },
                }

                await this.mercadoPagoService.processWebhook(notification)
            } else if (body.type && body.action && body.data_id) {
                // Formato con body
                const notification = {
                    id: parseInt(body.data_id, 10) || 0,
                    live_mode: true,
                    type: body.type as 'payment',
                    date_created: new Date().toISOString(),
                    application_id: 0,
                    user_id: '',
                    version: 1,
                    api_version: 'v1',
                    action: body.action,
                    data: {
                        id: body.data_id,
                    },
                }

                await this.mercadoPagoService.processWebhook(notification)
            } else {
                throw new BadRequestException('Formato de webhook inválido. Se requiere id y topic, o type, action y data_id')
            }

            return { status: 'ok', message: 'Webhook procesado correctamente' }
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
            this.logger.error(`Error procesando webhook: ${errorMessage}`)
            throw new BadRequestException(`Error procesando webhook: ${errorMessage}`)
        }
    }

    /**
     * Verifica si Mercado Pago está configurado
     * GET /api/mercado-pago/status
     */
    @Get('status')
    getStatus(): { configured: boolean; testMode: boolean } {
        return {
            configured: this.mercadoPagoService.isConfigured(),
            testMode: this.mercadoPagoService.getTestMode(),
        }
    }

    /**
     * Procesa el webhook manualmente desde el frontend
     * POST /api/mercado-pago/process-payment
     * Útil cuando el webhook no llega automáticamente (localhost)
     */
    @Post('process-payment')
    async processPaymentManually(@Body() dto: ProcessPaymentManuallyDto): Promise<{ status: string; message: string; payment?: MercadoPagoPayment }> {
        this.logger.log(`Procesando pago manualmente: ${dto.paymentId}`)

        try {
            // Obtener estado del pago desde Mercado Pago
            const payment = await this.mercadoPagoService.getPaymentStatus(dto.paymentId)

            // Crear estructura de notificación para procesar como webhook
            const notification = {
                id: typeof payment.id === 'number' ? payment.id : parseInt(String(payment.id), 10) || 0,
                live_mode: true,
                type: 'payment' as const,
                date_created: payment.date_created || new Date().toISOString(),
                application_id: 0,
                user_id: '',
                version: 1,
                api_version: 'v1',
                action: 'payment.updated',
                data: {
                    id: String(payment.id),
                },
            }

            // Procesar el webhook
            await this.mercadoPagoService.processWebhook(notification)

            return {
                status: 'ok',
                message: 'Pago procesado correctamente',
                payment,
            }
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
            this.logger.error(`Error procesando pago manualmente para ${dto.paymentId}: ${errorMessage}`)
            throw new BadRequestException(`Error procesando pago: ${errorMessage}`)
        }
    }

    /**
     * Procesa el pago basándose en el preference_id
     * POST /api/mercado-pago/process-by-preference
     * Útil cuando Mercado Pago redirige con preference_id en lugar de payment_id
     */
    @Post('process-by-preference')
    async processPaymentByPreference(@Body() dto: ProcessPaymentByPreferenceDto): Promise<{ status: string; message: string; payments: MercadoPagoPayment[] }> {
        this.logger.log(`Procesando pago por preference_id: ${dto.preferenceId}`)
        return this.mercadoPagoService.processPaymentByPreferenceId(dto.preferenceId)
    }

    /**
     * Procesa el pago basándose en el pagoId (external_reference)
     * POST /api/mercado-pago/process-by-pago-id
     * Útil cuando se conoce el pagoId de nuestra BD
     */
    @Post('process-by-pago-id')
    async processPaymentByPagoId(@Body() dto: ProcessPaymentByPagoIdDto): Promise<{ status: string; message: string; payments: MercadoPagoPayment[] }> {
        this.logger.log(`Procesando pago por pagoId: ${dto.pagoId}`)
        return this.mercadoPagoService.processPaymentByPagoId(dto.pagoId)
    }

    /**
     * Verifica que el endpoint de webhook está disponible
     * GET /api/mercado-pago/webhook
     * NOTA: El webhook real es POST, este endpoint solo verifica disponibilidad
     */
    @Get('webhook')
    webhookInfo(): {
        message: string
        method: string
        endpoint: string
        note: string
    } {
        return {
            message: 'Endpoint de webhook disponible',
            method: 'POST',
            endpoint: '/api/mercado-pago/webhook',
            note: 'Este endpoint solo acepta POST. Mercado Pago enviará notificaciones POST automáticamente cuando haya un pago.',
        }
    }
}

