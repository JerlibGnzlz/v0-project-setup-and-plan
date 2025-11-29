import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from "@nestjs/common"
import { InscripcionesService } from "./inscripciones.service"
import { CreateInscripcionDto, UpdateInscripcionDto, CreatePagoDto, UpdatePagoDto } from "./dto/inscripcion.dto"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"

@Controller("inscripciones")
export class InscripcionesController {
  constructor(private inscripcionesService: InscripcionesService) { }

  @Get()
  findAll() {
    return this.inscripcionesService.findAllInscripciones()
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.inscripcionesService.findOneInscripcion(id)
  }

  @Get('check/:convencionId/:email')
  checkInscripcion(@Param('convencionId') convencionId: string, @Param('email') email: string) {
    return this.inscripcionesService.checkInscripcionByEmail(email, convencionId)
  }

  @Post()
  create(@Body() dto: CreateInscripcionDto) {
    return this.inscripcionesService.createInscripcion(dto)
  }

  @UseGuards(JwtAuthGuard)
  @Patch(":id")
  update(@Param('id') id: string, @Body() dto: UpdateInscripcionDto) {
    return this.inscripcionesService.updateInscripcion(id, dto)
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.inscripcionesService.removeInscripcion(id)
  }
}

@Controller("pagos")
export class PagosController {
  constructor(private inscripcionesService: InscripcionesService) { }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll() {
    return this.inscripcionesService.findAllPagos()
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

  @UseGuards(JwtAuthGuard)
  @Patch(":id")
  update(@Param('id') id: string, @Body() dto: UpdatePagoDto) {
    return this.inscripcionesService.updatePago(id, dto)
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.inscripcionesService.removePago(id)
  }
}

