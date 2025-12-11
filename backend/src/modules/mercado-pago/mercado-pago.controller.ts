import { Controller, Get, Post, Body, Param, HttpCode, HttpStatus } from '@nestjs/common'
import { MercadoPagoService } from './mercado-pago.service'
import { CreatePreferenceDto } from './dto/mercado-pago.dto'

@Controller('mercado-pago')
export class MercadoPagoController {
  constructor(private readonly mercadoPagoService: MercadoPagoService) {}

  /**
   * Obtiene el estado de configuración de Mercado Pago
   * GET /api/mercado-pago/status
   */
  @Get('status')
  getStatus() {
    return this.mercadoPagoService.getStatus()
  }

  /**
   * Crea una preferencia de pago
   * POST /api/mercado-pago/preference
   */
  @Post('preference')
  @HttpCode(HttpStatus.CREATED)
  async createPreference(@Body() dto: CreatePreferenceDto) {
    return this.mercadoPagoService.createPreference(dto)
  }

  /**
   * Obtiene el estado de un pago por su ID
   * GET /api/mercado-pago/payment/:id
   */
  @Get('payment/:id')
  async getPaymentStatus(@Param('id') id: string) {
    const payment = await this.mercadoPagoService.getPaymentStatus(id)
    
    if (!payment) {
      return { error: 'Pago no encontrado' }
    }

    return payment
  }

  /**
   * Webhook de Mercado Pago
   * POST /api/mercado-pago/webhook
   */
  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async handleWebhook(@Body() data: { id: string; type: string; action: string }) {
    await this.mercadoPagoService.processWebhook(data)
    return { received: true }
  }
}
