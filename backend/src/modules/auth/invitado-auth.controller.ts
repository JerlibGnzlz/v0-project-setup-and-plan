import { Controller, Post, UseGuards, Get, Request, Body } from '@nestjs/common'
import { InvitadoAuthService } from './invitado-auth.service'
import {
  InvitadoRegisterDto,
  InvitadoLoginDto,
  InvitadoCompleteRegisterDto,
} from './dto/invitado-auth.dto'
import { RefreshTokenDto } from './dto/auth.dto'
import { InvitadoJwtAuthGuard } from './guards/invitado-jwt-auth.guard'
import { ThrottleAuth, ThrottleRegister } from '../../common/decorators/throttle-auth.decorator'

@Controller('auth/invitado')
export class InvitadoAuthController {
  constructor(private invitadoAuthService: InvitadoAuthService) {}

  @ThrottleRegister()
  @Post('register')
  async register(@Body() dto: InvitadoRegisterDto) {
    return this.invitadoAuthService.register(dto)
  }

  @ThrottleRegister()
  @Post('register-complete')
  async registerComplete(@Body() dto: InvitadoCompleteRegisterDto) {
    return this.invitadoAuthService.registerComplete(dto)
  }

  @ThrottleAuth()
  @Post('login')
  async login(@Body() dto: InvitadoLoginDto) {
    return this.invitadoAuthService.login(dto)
  }

  @UseGuards(InvitadoJwtAuthGuard)
  @Get('me')
  async getProfile(@Request() req) {
    return {
      id: req.user.id,
      nombre: req.user.nombre,
      apellido: req.user.apellido,
      email: req.user.email,
      telefono: req.user.telefono,
      sede: req.user.sede,
      tipo: 'INVITADO',
    }
  }
}

