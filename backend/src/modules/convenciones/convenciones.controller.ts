import { Controller, Get, Post, Body, Patch, Delete, UseGuards } from "@nestjs/common"
import { ConvencionesService } from "./convenciones.service"
import { CreateConvencionDto, UpdateConvencionDto } from "./dto/convencion.dto"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"

@Controller("convenciones")
export class ConvencionesController {
  constructor(private convencionesService: ConvencionesService) { }

  @Get()
  findAll() {
    return this.convencionesService.findAll()
  }

  @Get(":id")
  findOne(id: string) {
    return this.convencionesService.findOne(id)
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() dto: CreateConvencionDto) {
    return this.convencionesService.create(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(":id")
  update(id: string, @Body() dto: UpdateConvencionDto) {
    return this.convencionesService.update(id, dto)
  }

  @UseGuards(JwtAuthGuard)
  @Delete(":id")
  remove(id: string) {
    return this.convencionesService.remove(id)
  }
}
