import { Controller, Post, UseGuards, Body } from '@nestjs/common'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { EmailService } from './email.service'
import { Logger } from '@nestjs/common'

@Controller('notifications/test-email')
export class EmailTestController {
  private readonly logger = new Logger(EmailTestController.name)

  constructor(private emailService: EmailService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async testEmail(@Body() body: { to: string }) {
    try {
      const result = await this.emailService.sendNotificationEmail(
        body.to,
        '🧪 Prueba de Email - AMVA Digital',
        'Este es un email de prueba para verificar que la configuración SMTP está funcionando correctamente.',
        {
          type: 'test',
          message: 'Si recibes este email, la configuración está correcta ✅',
        }
      )

      if (result) {
        return {
          success: true,
          message: 'Email enviado exitosamente',
        }
      } else {
        return {
          success: false,
          message: 'No se pudo enviar el email. Verifica la configuración SMTP.',
        }
      }
    } catch (error: any) {
      this.logger.error('Error en test de email:', error)
      return {
        success: false,
        message: error.message || 'Error desconocido',
        error: error.toString(),
      }
    }
  }
}

