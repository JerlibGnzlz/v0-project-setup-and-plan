import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import axios, { AxiosInstance } from 'axios'
import {
  MercadoPagoConfig,
  MercadoPagoPreference,
  CreatePreferenceRequest,
  MercadoPagoPayment,
} from './types/mercado-pago.types'
import { CreatePreferenceDto } from './dto/mercado-pago.dto'

@Injectable()
export class MercadoPagoService {
  private readonly logger = new Logger(MercadoPagoService.name)
  private readonly apiClient: AxiosInstance
  private readonly config: MercadoPagoConfig | null

  constructor(private prisma: PrismaService) {
    // Obtener configuración de variables de entorno
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN
    const publicKey = process.env.MERCADOPAGO_PUBLIC_KEY
    const isTestMode = process.env.MERCADOPAGO_TEST_MODE === 'true' || !accessToken

    if (accessToken) {
      this.config = {
        accessToken,
        publicKey,
        isTestMode,
      }

      // Crear cliente HTTP para Mercado Pago API
      this.apiClient = axios.create({
        baseURL: 'https://api.mercadopago.com',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      })

      this.logger.log('✅ Mercado Pago configurado correctamente')
      this.logger.log(`   Modo: ${isTestMode ? 'TEST' : 'PRODUCCIÓN'}`)
    } else {
      this.config = null
      this.apiClient = axios.create()
      this.logger.warn('⚠️ Mercado Pago no configurado (MERCADOPAGO_ACCESS_TOKEN no encontrado)')
    }
  }

  /**
   * Verifica si Mercado Pago está configurado
   */
  getStatus(): { configured: boolean; testMode: boolean } {
    return {
      configured: this.config !== null,
      testMode: this.config?.isTestMode ?? true,
    }
  }

  /**
   * Crea una preferencia de pago en Mercado Pago
   */
  async createPreference(dto: CreatePreferenceDto): Promise<MercadoPagoPreference> {
    if (!this.config) {
      throw new BadRequestException('Mercado Pago no está configurado')
    }

    try {
      // Construir URL de retorno basada en el entorno
      const baseUrl = process.env.FRONTEND_URL || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
      const backUrls = {
        success: `${baseUrl}/convencion/pago-exitoso`,
        failure: `${baseUrl}/convencion/pago-fallido`,
        pending: `${baseUrl}/convencion/pago-pendiente`,
      }

      // Construir request para Mercado Pago
      const preferenceRequest: CreatePreferenceRequest = {
        items: [
          {
            title: dto.descripcion,
            description: `Cuota ${dto.numeroCuota} - ${dto.descripcion}`,
            quantity: 1,
            unit_price: dto.monto,
          },
        ],
        payer: {
          name: dto.nombrePayer,
          surname: dto.apellidoPayer,
          email: dto.emailPayer,
          phone: dto.telefonoPayer
            ? {
                number: dto.telefonoPayer.replace(/\D/g, ''), // Solo números
              }
            : undefined,
        },
        back_urls,
        auto_return: 'approved',
        external_reference: `pago_${dto.pagoId}`,
        notification_url: `${process.env.BACKEND_URL || baseUrl}/api/mercado-pago/webhook`,
        metadata: {
          inscripcionId: dto.inscripcionId,
          pagoId: dto.pagoId,
          numeroCuota: dto.numeroCuota,
        },
      }

      this.logger.log(`📝 Creando preferencia de pago para pago ${dto.pagoId}`)
      this.logger.log(`   Monto: $${dto.monto}`)
      this.logger.log(`   Email: ${dto.emailPayer}`)

      const response = await this.apiClient.post<MercadoPagoPreference>(
        '/checkout/preferences',
        preferenceRequest
      )

      this.logger.log(`✅ Preferencia creada: ${response.data.id}`)

      return response.data
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      this.logger.error(`❌ Error creando preferencia: ${errorMessage}`)
      
      if (axios.isAxiosError(error)) {
        const responseData = error.response?.data
        this.logger.error(`   Detalles: ${JSON.stringify(responseData)}`)
        throw new BadRequestException(
          `Error al crear preferencia de pago: ${responseData?.message || errorMessage}`
        )
      }

      throw new BadRequestException(`Error al crear preferencia de pago: ${errorMessage}`)
    }
  }

  /**
   * Obtiene el estado de un pago por su ID
   */
  async getPaymentStatus(paymentId: string): Promise<MercadoPagoPayment | null> {
    if (!this.config) {
      this.logger.warn('⚠️ Mercado Pago no configurado, no se puede obtener estado del pago')
      return null
    }

    try {
      this.logger.log(`🔍 Obteniendo estado del pago: ${paymentId}`)

      const response = await this.apiClient.get<MercadoPagoPayment>(`/v1/payments/${paymentId}`)

      this.logger.log(`✅ Estado obtenido: ${response.data.status}`)

      return response.data
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      this.logger.warn(`⚠️ Error obteniendo estado del pago ${paymentId}: ${errorMessage}`)

      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null
      }

      // No lanzar error, solo retornar null
      return null
    }
  }

  /**
   * Procesa un webhook de Mercado Pago
   */
  async processWebhook(data: { id: string; type: string; action: string }): Promise<void> {
    if (!this.config) {
      this.logger.warn('⚠️ Mercado Pago no configurado, ignorando webhook')
      return
    }

    try {
      this.logger.log(`📬 Webhook recibido: ${data.type} - ${data.action}`)
      this.logger.log(`   ID: ${data.id}`)

      if (data.type === 'payment') {
        const payment = await this.getPaymentStatus(data.id)

        if (!payment) {
          this.logger.warn(`⚠️ Pago ${data.id} no encontrado`)
          return
        }

        // Buscar el pago en la base de datos por external_reference
        const externalRef = payment.external_reference
        if (!externalRef || !externalRef.startsWith('pago_')) {
          this.logger.warn(`⚠️ External reference inválido: ${externalRef}`)
          return
        }

        const pagoId = externalRef.replace('pago_', '')
        const pago = await this.prisma.pago.findUnique({
          where: { id: pagoId },
        })

        if (!pago) {
          this.logger.warn(`⚠️ Pago ${pagoId} no encontrado en la base de datos`)
          return
        }

        // Actualizar estado del pago según el estado de Mercado Pago
        let nuevoEstado: string = pago.estado

        switch (payment.status) {
          case 'approved':
            nuevoEstado = 'COMPLETADO'
            break
          case 'rejected':
          case 'cancelled':
            nuevoEstado = 'CANCELADO'
            break
          case 'pending':
          case 'in_process':
            nuevoEstado = 'PENDIENTE'
            break
          case 'refunded':
          case 'charged_back':
            nuevoEstado = 'REEMBOLSADO'
            break
        }

        if (nuevoEstado !== pago.estado) {
          await this.prisma.pago.update({
            where: { id: pagoId },
            data: {
              estado: nuevoEstado as any,
              fechaPago: payment.status === 'approved' ? new Date(payment.date_approved || Date.now()) : null,
              comprobanteUrl: payment.statement_descriptor || null,
            },
          })

          this.logger.log(`✅ Pago ${pagoId} actualizado a estado: ${nuevoEstado}`)
        }
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      this.logger.error(`❌ Error procesando webhook: ${errorMessage}`)
      // No lanzar error para que Mercado Pago no reintente
    }
  }
}
