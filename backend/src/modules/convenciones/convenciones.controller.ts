import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Delete,
  UseGuards,
  Param,
  NotFoundException,
  Logger,
} from '@nestjs/common'
import { ConvencionesService } from './convenciones.service'
import { CreateConvencionDto, UpdateConvencionDto } from './dto/convencion.dto'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'

@Controller('convenciones')
export class ConvencionesController {
  private readonly logger = new Logger(ConvencionesController.name)

  constructor(private convencionesService: ConvencionesService) {}

  /**
   * Día de fechaInicio en YYYY-MM-DD usando componentes UTC (evita desfase en junio+).
   */
  private toDateOnlyUTC(date: Date): string {
    const y = date.getUTCFullYear()
    const m = String(date.getUTCMonth() + 1).padStart(2, '0')
    const d = String(date.getUTCDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
  }

  /**
   * Serializa fechaInicio/fechaFin. El día se toma siempre de componentes UTC y se devuelve
   * como YYYY-MM-DD y como ISO con ese mismo día (T12:00:00.000Z), así la cuenta regresiva
   * es correcta en todos los meses (evita desfase junio+ por toISOString en otras zonas).
   */
  private serializeConvencionDates<T extends { fechaInicio?: Date | string; fechaFin?: Date | string }>(
    convencion: T
  ): T & { fechaInicioDateOnly?: string } {
    let fechaInicioDateOnly: string | undefined
    let isoInicio: string
    if (convencion.fechaInicio instanceof Date) {
      fechaInicioDateOnly = this.toDateOnlyUTC(convencion.fechaInicio)
      isoInicio = `${fechaInicioDateOnly}T12:00:00.000Z`
    } else if (typeof convencion.fechaInicio === 'string' && convencion.fechaInicio.length >= 10) {
      const pref = convencion.fechaInicio.slice(0, 10)
      if (/^\d{4}-\d{2}-\d{2}$/.test(pref)) {
        fechaInicioDateOnly = pref
        isoInicio = convencion.fechaInicio
      } else {
        isoInicio = convencion.fechaInicio
      }
    } else {
      isoInicio = convencion.fechaInicio as string
    }
    const isoFin =
      convencion.fechaFin instanceof Date
        ? convencion.fechaFin.toISOString()
        : convencion.fechaFin
    return {
      ...convencion,
      fechaInicio: isoInicio,
      fechaFin: isoFin,
      ...(fechaInicioDateOnly && { fechaInicioDateOnly }),
    }
  }

  @Get()
  findAll() {
    return this.convencionesService.findAll().then((list) => list.map((c) => this.serializeConvencionDates(c)))
  }

  /**
   * Convención activa para la landing (cuenta regresiva, inscripciones).
   * Las fechas se devuelven en ISO 8601 para que el frontend las interprete
   * como día del evento (YYYY-MM-DD) en hora local y calcule bien la cuenta regresiva.
   */
  @Get('active')
  async findActive() {
    const convencion = await this.convencionesService.findActive()
    if (!convencion) {
      throw new NotFoundException('No hay convención activa')
    }
    return this.serializeConvencionDates(convencion)
  }

  /**
   * Fecha del evento activo en YYYY-MM-DD. Sirve como única fuente de verdad para la cuenta regresiva.
   * La landing puede usar solo este valor para el countdown y evitar desfases por caché o parsing.
   */
  @Get('event-date')
  async getEventDate() {
    const convencion = await this.convencionesService.findActive()
    if (!convencion) {
      throw new NotFoundException('No hay convención activa')
    }
    const dateOnly = this.toDateOnlyUTC(convencion.fechaInicio)
    this.logger.log(`event-date: dateOnly=${dateOnly} (desde BD fechaInicio UTC)`)
    return { dateOnly }
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.convencionesService.findOne(id).then((c) => this.serializeConvencionDates(c))
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() dto: CreateConvencionDto) {
    return this.convencionesService.create(dto).then((c) => this.serializeConvencionDates(c))
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateConvencionDto) {
    return this.convencionesService.update(id, dto).then((c) => this.serializeConvencionDates(c))
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/archivar')
  archivar(@Param('id') id: string) {
    return this.convencionesService.archivar(id).then((c) => this.serializeConvencionDates(c))
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/desarchivar')
  desarchivar(@Param('id') id: string) {
    return this.convencionesService.desarchivar(id).then((c) => this.serializeConvencionDates(c))
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.convencionesService.remove(id)
  }
}
