import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common'
import { UsuariosService } from './usuarios.service'
import { CreateUsuarioDto, UpdateUsuarioDto, ChangePasswordDto, AdminResetPasswordDto } from './dto/usuario.dto'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { RolesGuard } from '../auth/guards/roles.guard'
import { Roles } from '../auth/decorators/roles.decorator'
import { AuthenticatedRequest } from '../auth/types/request.types'

@Controller('usuarios')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN') // Solo ADMIN puede acceder a estos endpoints
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  /**
   * Crear nuevo usuario
   * Solo ADMIN puede crear usuarios
   */
  @Post()
  async create(@Body() dto: CreateUsuarioDto, @Request() req: AuthenticatedRequest) {
    const forwardedFor = Array.isArray(req.headers['x-forwarded-for'])
      ? req.headers['x-forwarded-for'][0]
      : req.headers['x-forwarded-for']
    const clientIp = req.ip || forwardedFor || undefined
    return this.usuariosService.create(dto, req.user.id, req.user.email, clientIp)
  }

  /**
   * Obtener todos los usuarios
   */
  @Get()
  async findAll() {
    return this.usuariosService.findAll()
  }

  /**
   * Obtener usuario por ID
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.usuariosService.findOne(id)
  }

  /**
   * Actualizar usuario
   */
  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateUsuarioDto, @Request() req: AuthenticatedRequest) {
    const forwardedFor = Array.isArray(req.headers['x-forwarded-for'])
      ? req.headers['x-forwarded-for'][0]
      : req.headers['x-forwarded-for']
    const clientIp = req.ip || forwardedFor || undefined
    return this.usuariosService.update(id, dto, req.user.id, req.user.email, clientIp)
  }

  /**
   * Eliminar usuario
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    const forwardedFor = Array.isArray(req.headers['x-forwarded-for'])
      ? req.headers['x-forwarded-for'][0]
      : req.headers['x-forwarded-for']
    const clientIp = req.ip || forwardedFor || undefined
    await this.usuariosService.remove(id, req.user.id, req.user.email, clientIp)
  }

  /**
   * Resetear contraseña de usuario (desde admin)
   */
  @Post(':id/reset-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  async adminResetPassword(@Param('id') id: string, @Body() dto: AdminResetPasswordDto) {
    await this.usuariosService.adminResetPassword(id, dto)
  }

  /**
   * Cambiar contraseña propia
   * No requiere rol específico, solo autenticación (cualquier usuario puede cambiar su propia contraseña)
   */
  @Post('me/change-password')
  @UseGuards(JwtAuthGuard) // Solo requiere autenticación, sobrescribe los guards del controlador
  @HttpCode(HttpStatus.NO_CONTENT)
  async changePassword(
    @Request() req: AuthenticatedRequest,
    @Body() body: ChangePasswordDto & { currentPassword: string }
  ) {
    await this.usuariosService.changePassword(req.user.id, body.currentPassword, body)
  }

  /**
   * Cambiar email propio
   * No requiere rol específico, solo autenticación (cualquier usuario puede cambiar su propio email)
   */
  @Patch('me/change-email')
  @UseGuards(JwtAuthGuard) // Solo requiere autenticación, sobrescribe los guards del controlador
  async changeEmail(
    @Request() req: AuthenticatedRequest,
    @Body() body: { newEmail: string; password: string }
  ) {
    return this.usuariosService.changeEmail(req.user.id, body.newEmail, body.password)
  }

  /**
   * Activar/Desactivar usuario (toggle)
   */
  @Patch(':id/toggle-activo')
  async toggleActivo(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    const forwardedFor = Array.isArray(req.headers['x-forwarded-for'])
      ? req.headers['x-forwarded-for'][0]
      : req.headers['x-forwarded-for']
    const clientIp = req.ip || forwardedFor || undefined
    return this.usuariosService.toggleActivo(id, req.user.id, req.user.email, clientIp)
  }
}

