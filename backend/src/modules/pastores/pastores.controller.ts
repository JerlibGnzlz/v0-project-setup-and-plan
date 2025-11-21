import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from "@nestjs/common"
import { PastoresService } from "./pastores.service"
import { CreatePastorDto, UpdatePastorDto } from "./dto/pastor.dto"
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard"

@Controller("pastores")
export class PastoresController {
  constructor(private pastoresService: PastoresService) { }

  @Get()
  findAll() {
    return this.pastoresService.findAll()
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.pastoresService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() dto: CreatePastorDto) {
    return this.pastoresService.create(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(":id")
  update(@Param('id') id: string, @Body() dto: UpdatePastorDto) {
    return this.pastoresService.update(id, dto)
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.pastoresService.remove(id);
  }
}
