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
  async create(@Body() dto: CreateUsuarioDto) {
    return this.usuariosService.create(dto)
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
  async update(@Param('id') id: string, @Body() dto: UpdateUsuarioDto) {
    return this.usuariosService.update(id, dto)
  }

  /**
   * Eliminar usuario
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.usuariosService.remove(id)
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
   */
  @Post('me/change-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  async changePassword(
    @Request() req: AuthenticatedRequest,
    @Body() body: ChangePasswordDto & { currentPassword: string }
  ) {
    await this.usuariosService.changePassword(req.user.id, body.currentPassword, body)
  }
}

