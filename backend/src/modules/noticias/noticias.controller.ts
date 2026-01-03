import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Logger,
  Request,
} from '@nestjs/common'
import { NoticiasService } from './noticias.service'
import { CreateNoticiaDto, UpdateNoticiaDto } from './dto/noticia.dto'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { RolesGuard } from '../auth/guards/roles.guard'
import { Roles } from '../auth/decorators/roles.decorator'
import { AuthenticatedRequest } from '../auth/types/request.types'
import { CategoriaNoticia } from '@prisma/client'

@Controller('noticias')
export class NoticiasController {
  private readonly logger = new Logger(NoticiasController.name)

  constructor(private readonly noticiasService: NoticiasService) {}

  // ========== RUTAS PÚBLICAS ==========

  // Obtener noticias publicadas
  @Get('publicadas')
  findPublished(@Query('limit') limit?: string) {
    return this.noticiasService.findPublished(limit ? parseInt(limit) : undefined)
  }

  // Obtener noticias destacadas
  @Get('destacadas')
  findDestacadas(@Query('limit') limit?: string) {
    return this.noticiasService.findDestacadas(limit ? parseInt(limit) : 3)
  }

  // Obtener noticias por categoría
  @Get('categoria/:categoria')
  findByCategoria(@Param('categoria') categoria: CategoriaNoticia, @Query('limit') limit?: string) {
    return this.noticiasService.findByCategoria(categoria, limit ? parseInt(limit) : undefined)
  }

  // Obtener noticia por slug (público)
  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.noticiasService.findBySlug(slug)
  }

  // Incrementar vista (público, optimizado)
  @Post('slug/:slug/vista')
  async incrementarVista(@Param('slug') slug: string) {
    this.logger.debug(`POST /noticias/slug/${slug}/vista recibido`)

    try {
      // Ahora esperamos la respuesta para poder manejar errores
      await this.noticiasService.incrementarVista(slug)
      this.logger.debug(`Vista incrementada exitosamente para "${slug}"`)
      return { success: true, message: 'Vista incrementada' }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      this.logger.error(`Error al incrementar vista para "${slug}": ${errorMessage}`)
      // Retornar éxito de todas formas para no afectar UX, pero loguear el error
      return { success: false, message: 'Error al incrementar vista' }
    }
  }

  // ========== RUTAS PROTEGIDAS (ADMIN) ==========

  // Obtener todas las noticias (admin y editor)
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'EDITOR')
  findAll() {
    return this.noticiasService.findAll()
  }

  // Obtener noticia por ID (admin y editor)
  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'EDITOR')
  findOne(@Param('id') id: string) {
    return this.noticiasService.findOne(id)
  }

  // Crear noticia (admin y editor)
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'EDITOR')
  create(@Body() createNoticiaDto: CreateNoticiaDto, @Request() req: AuthenticatedRequest) {
    const forwardedFor = Array.isArray(req.headers['x-forwarded-for'])
      ? req.headers['x-forwarded-for'][0]
      : req.headers['x-forwarded-for']
    const clientIp = req.ip || forwardedFor || undefined
    return this.noticiasService.create(
      createNoticiaDto,
      req.user.id,
      req.user.email,
      clientIp
    )
  }

  // Actualizar noticia (admin y editor)
  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'EDITOR')
  update(
    @Param('id') id: string,
    @Body() updateNoticiaDto: UpdateNoticiaDto,
    @Request() req: AuthenticatedRequest
  ) {
    const forwardedFor = Array.isArray(req.headers['x-forwarded-for'])
      ? req.headers['x-forwarded-for'][0]
      : req.headers['x-forwarded-for']
    const clientIp = req.ip || forwardedFor || undefined
    return this.noticiasService.update(id, updateNoticiaDto, req.user.id, req.user.email, clientIp)
  }

  // Eliminar noticia (admin y editor)
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'EDITOR')
  remove(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    const forwardedFor = Array.isArray(req.headers['x-forwarded-for'])
      ? req.headers['x-forwarded-for'][0]
      : req.headers['x-forwarded-for']
    const clientIp = req.ip || forwardedFor || undefined
    return this.noticiasService.remove(id, req.user.id, req.user.email, clientIp)
  }

  // Toggle publicado (admin y editor)
  @Patch(':id/toggle-publicado')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'EDITOR')
  togglePublicado(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    const forwardedFor = Array.isArray(req.headers['x-forwarded-for'])
      ? req.headers['x-forwarded-for'][0]
      : req.headers['x-forwarded-for']
    const clientIp = req.ip || forwardedFor || undefined
    return this.noticiasService.togglePublicado(id, req.user.id, req.user.email, clientIp)
  }

  // Toggle destacado (admin y editor)
  @Patch(':id/toggle-destacado')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'EDITOR')
  toggleDestacado(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    const forwardedFor = Array.isArray(req.headers['x-forwarded-for'])
      ? req.headers['x-forwarded-for'][0]
      : req.headers['x-forwarded-for']
    const clientIp = req.ip || forwardedFor || undefined
    return this.noticiasService.toggleDestacado(id, req.user.id, req.user.email, clientIp)
  }
}
