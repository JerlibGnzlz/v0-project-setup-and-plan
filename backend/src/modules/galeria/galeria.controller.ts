import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from "@nestjs/common"
import { GaleriaService } from "./galeria.service"
import { CreateGaleriaDto, UpdateGaleriaDto } from "./dto/galeria.dto"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"

@Controller("galeria")
export class GaleriaController {
    constructor(private galeriaService: GaleriaService) { }

    @Get()
    findAll() {
        return this.galeriaService.findAll()
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.galeriaService.findOne(id)
    }

    @UseGuards(JwtAuthGuard)
    @Post()
    create(@Body() dto: CreateGaleriaDto) {
        return this.galeriaService.create(dto)
    }

    @UseGuards(JwtAuthGuard)
    @Patch(":id")
    update(@Param('id') id: string, @Body() dto: UpdateGaleriaDto) {
        return this.galeriaService.update(id, dto)
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.galeriaService.remove(id)
    }
}



