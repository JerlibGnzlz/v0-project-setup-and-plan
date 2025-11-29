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
} from '@nestjs/common';
import { NoticiasService } from './noticias.service';
import { CreateNoticiaDto, UpdateNoticiaDto } from './dto/noticia.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CategoriaNoticia } from '@prisma/client';

@Controller('noticias')
export class NoticiasController {
  constructor(private readonly noticiasService: NoticiasService) {}

  // ========== RUTAS PÚBLICAS ==========

  // Obtener noticias publicadas
  @Get('publicadas')
  findPublished(@Query('limit') limit?: string) {
    return this.noticiasService.findPublished(limit ? parseInt(limit) : undefined);
  }

  // Obtener noticias destacadas
  @Get('destacadas')
  findDestacadas(@Query('limit') limit?: string) {
    return this.noticiasService.findDestacadas(limit ? parseInt(limit) : 3);
  }

  // Obtener noticias por categoría
  @Get('categoria/:categoria')
  findByCategoria(
    @Param('categoria') categoria: CategoriaNoticia,
    @Query('limit') limit?: string,
  ) {
    return this.noticiasService.findByCategoria(
      categoria,
      limit ? parseInt(limit) : undefined,
    );
  }

  // Obtener noticia por slug (público)
  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.noticiasService.findBySlug(slug);
  }

  // Incrementar vista (público, optimizado)
  @Post('slug/:slug/vista')
  async incrementarVista(@Param('slug') slug: string) {
    console.log(`📥 [Controller] POST /noticias/slug/${slug}/vista recibido`);
    
    try {
      // Ahora esperamos la respuesta para poder manejar errores
      await this.noticiasService.incrementarVista(slug);
      console.log(`✅ [Controller] Vista incrementada exitosamente para "${slug}"`);
      return { success: true, message: 'Vista incrementada' };
    } catch (error) {
      console.error(`❌ [Controller] Error al incrementar vista para "${slug}":`, error);
      // Retornar éxito de todas formas para no afectar UX, pero loguear el error
      return { success: false, message: 'Error al incrementar vista' };
    }
  }

  // ========== RUTAS PROTEGIDAS (ADMIN) ==========

  // Obtener todas las noticias (admin)
  @Get()
  @UseGuards(JwtAuthGuard)
  findAll() {
    return this.noticiasService.findAll();
  }

  // Obtener noticia por ID (admin)
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string) {
    return this.noticiasService.findOne(id);
  }

  // Crear noticia
  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createNoticiaDto: CreateNoticiaDto) {
    return this.noticiasService.create(createNoticiaDto);
  }

  // Actualizar noticia
  @Put(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() updateNoticiaDto: UpdateNoticiaDto) {
    return this.noticiasService.update(id, updateNoticiaDto);
  }

  // Eliminar noticia
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.noticiasService.remove(id);
  }

  // Toggle publicado
  @Patch(':id/toggle-publicado')
  @UseGuards(JwtAuthGuard)
  togglePublicado(@Param('id') id: string) {
    return this.noticiasService.togglePublicado(id);
  }

  // Toggle destacado
  @Patch(':id/toggle-destacado')
  @UseGuards(JwtAuthGuard)
  toggleDestacado(@Param('id') id: string) {
    return this.noticiasService.toggleDestacado(id);
  }
}
