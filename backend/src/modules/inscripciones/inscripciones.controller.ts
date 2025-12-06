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
  BadRequestException,
  Query,
  Res,
} from '@nestjs/common'
import { Response } from 'express'
import { InscripcionesService } from './inscripciones.service'
import {
  CreateInscripcionDto,
  UpdateInscripcionDto,
  CreatePagoDto,
  UpdatePagoDto,
} from './dto/inscripcion.dto'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { Throttle } from '@nestjs/throttler'
import { PaginationDto } from '../../common/dto/pagination.dto'
import { InscripcionFilterDto, PagoFilterDto } from '../../common/dto/search-filter.dto'
import { CsvExportUtil } from '../../common/utils/csv-export.util'

@Controller('inscripciones')
export class InscripcionesController {
  constructor(private inscripcionesService: InscripcionesService) {}

  @Get()
  findAll(@Query() query: PaginationDto & InscripcionFilterDto) {
    const page = query.page || 1
    const limit = query.limit || 20
    const filters: InscripcionFilterDto = {
      search: query.search,
      q: query.q,
      estado: query.estado,
      origen: query.origen,
      convencionId: query.convencionId,
    }
    return this.inscripcionesService.findAllInscripciones(page, limit, filters)
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.inscripcionesService.findOneInscripcion(id)
  }

  @Get('check/:convencionId/:email')
  checkInscripcion(@Param('convencionId') convencionId: string, @Param('email') email: string) {
    return this.inscripcionesService.checkInscripcionByEmail(email, convencionId)
  }

  // Rate limiting para prevenir spam de inscripciones
  // 5 inscripciones por hora por IP, 20 por día
  @Throttle({ default: { limit: 5, ttl: 3600000 } }) // 5 por hora
  @Throttle({ default: { limit: 20, ttl: 86400000 } }) // 20 por día
  @Post()
  create(@Body() dto: CreateInscripcionDto) {
    return this.inscripcionesService.createInscripcion(dto)
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateInscripcionDto, @Request() req) {
    try {
      return await this.inscripcionesService.updateInscripcion(
        id,
        dto,
        req.user?.id,
        req.user?.email
      )
    } catch (error) {
      console.error('[InscripcionesController] Error en update:', error)
      throw error
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/cancelar')
  cancelar(@Request() req, @Param('id') id: string, @Body() body: { motivo?: string }) {
    return this.inscripcionesService.cancelarInscripcion(
      id,
      body.motivo,
      req.user?.id,
      req.user?.email
    )
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/rehabilitar')
  rehabilitar(@Request() req, @Param('id') id: string) {
    return this.inscripcionesService.rehabilitarInscripcion(id, req.user?.id, req.user?.email)
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.inscripcionesService.removeInscripcion(id)
  }

  @UseGuards(JwtAuthGuard)
  @Get('stats/reporte-ingresos')
  getReporteIngresos() {
    return this.inscripcionesService.getReporteIngresos()
  }

  @UseGuards(JwtAuthGuard)
  @Get('export/csv')
  async exportToCSV(@Query() query: InscripcionFilterDto, @Res() res: Response) {
    // Obtener todas las inscripciones (sin paginación para exportación completa)
    const inscripciones = await this.inscripcionesService.findAllInscripciones(1, 10000, query)

    // Preparar datos para CSV
    const csvData = inscripciones.data.map(insc => ({
      ID: insc.id,
      Nombre: insc.nombre,
      Apellido: insc.apellido,
      Email: insc.email,
      Teléfono: insc.telefono || '',
      Sede: insc.sede || '',
      Estado: insc.estado,
      'Tipo Inscripción': insc.tipoInscripcion || '',
      'Número Cuotas': insc.numeroCuotas || 0,
      'Origen Registro': insc.origenRegistro || '',
      'Fecha Inscripción': insc.fechaInscripcion,
      'Código Referencia': insc.codigoReferencia || '',
      Convención: insc.convencion?.titulo || '',
      Notas: insc.notas || '',
    }))

    const csv = CsvExportUtil.toCSV(csvData)
    const fileName = CsvExportUtil.generateFileName('inscripciones')

    res.setHeader('Content-Type', 'text/csv; charset=utf-8')
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`)
    res.send('\ufeff' + csv) // BOM para Excel UTF-8
  }

  @UseGuards(JwtAuthGuard)
  @Post('acciones/enviar-recordatorios')
  async enviarRecordatorios(@Body() body: { convencionId?: string }) {
    try {
      const resultado = await this.inscripcionesService.enviarRecordatoriosPago(body.convencionId)

      // Log detallado del resultado
      console.log('📊 Resultado de recordatorios:', {
        enviados: resultado.enviados,
        fallidos: resultado.fallidos,
        total: resultado.detalles.length,
      })

      if (resultado.fallidos > 0) {
        console.warn(
          '⚠️ Algunos recordatorios fallaron. Revisa los logs del backend para más detalles.'
        )
      }

      return resultado
    } catch (error) {
      console.error('[InscripcionesController] Error en enviarRecordatorios:', error)
      throw error
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/auditoria')
  getHistorialAuditoriaInscripcion(@Param('id') id: string) {
    return this.inscripcionesService.getHistorialAuditoriaInscripcion(id)
  }
}

@Controller('pagos')
export class PagosController {
  constructor(private inscripcionesService: InscripcionesService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Query() query: PaginationDto & PagoFilterDto) {
    try {
      // Siempre usar paginación por defecto
      const page = query.page ? Number(query.page) : 1
      const limit = query.limit ? Number(query.limit) : 20

      // Construir filtros, filtrando valores undefined/null y 'todos'
      const filters: PagoFilterDto = {}

      if (query.search) filters.search = query.search
      if (query.q) filters.q = query.q
      if (query.estado && query.estado !== 'todos') filters.estado = query.estado as any
      if (query.metodoPago && query.metodoPago !== 'todos')
        filters.metodoPago = query.metodoPago as any
      if (query.origen && query.origen !== 'todos') filters.origen = query.origen as any
      if (query.inscripcionId) filters.inscripcionId = query.inscripcionId
      if (query.convencionId) filters.convencionId = query.convencionId

      return this.inscripcionesService.findAllPagos(page, limit, filters)
    } catch (error: any) {
      // Log del error para depuración
      console.error('[PagosController] Error en findAll:', error)
      throw error
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('export/csv')
  async exportPagosToCSV(@Query() query: PagoFilterDto, @Res() res: Response) {
    // Obtener todos los pagos (sin paginación para exportación completa)
    const pagos = await this.inscripcionesService.findAllPagos(1, 10000, query)

    // Preparar datos para CSV
    const csvData = pagos.data.map(pago => ({
      ID: pago.id,
      'Inscripción ID': pago.inscripcionId,
      Nombre: pago.inscripcion?.nombre || '',
      Apellido: pago.inscripcion?.apellido || '',
      Email: pago.inscripcion?.email || '',
      Monto: typeof pago.monto === 'number' ? pago.monto : parseFloat(String(pago.monto || '0')),
      'Método Pago': pago.metodoPago || '',
      'Número Cuota': pago.numeroCuota || '',
      Estado: pago.estado,
      Referencia: pago.referencia || '',
      'Fecha Pago': pago.fechaPago || '',
      'Fecha Creación': pago.createdAt,
      Notas: pago.notas || '',
      Convención: pago.inscripcion?.convencion?.titulo || '',
    }))

    const csv = CsvExportUtil.toCSV(csvData)
    const fileName = CsvExportUtil.generateFileName('pagos')

    res.setHeader('Content-Type', 'text/csv; charset=utf-8')
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`)
    res.send('\ufeff' + csv) // BOM para Excel UTF-8
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.inscripcionesService.findOnePago(id)
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() dto: CreatePagoDto) {
    return this.inscripcionesService.createPago(dto)
  }

  // IMPORTANTE: Las rutas específicas deben ir ANTES de las rutas con parámetros dinámicos
  @UseGuards(JwtAuthGuard)
  @Post('acciones/validar-masivo')
  validarMasivo(@Request() req, @Body() body: { ids: string[] }) {
    if (!body.ids || !Array.isArray(body.ids) || body.ids.length === 0) {
      throw new BadRequestException('Se requiere un array de IDs de pagos para validar')
    }
    return this.inscripcionesService.validarPagosMasivos(body.ids, req.user?.id)
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Request() req, @Param('id') id: string, @Body() dto: UpdatePagoDto) {
    return this.inscripcionesService.updatePago(id, dto, req.user?.id)
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/rechazar')
  rechazar(@Request() req, @Param('id') id: string, @Body() body: { motivo?: string }) {
    return this.inscripcionesService.rejectPago(id, body.motivo, req.user?.id)
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/rehabilitar')
  rehabilitar(@Request() req, @Param('id') id: string) {
    return this.inscripcionesService.rehabilitarPago(id, req.user?.id)
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/auditoria')
  getHistorialAuditoria(@Param('id') id: string) {
    return this.inscripcionesService.getHistorialAuditoriaPago(id)
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.inscripcionesService.removePago(id)
  }
}
