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
import { CreatePaymentPreferenceDto, GetPaymentStatusDto, ProcessWebhookDto } from './dto/mercado-pago.dto'
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
            testMode: process.env.MERCADO_PAGO_TEST_MODE === 'true',
        }
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

