import { Injectable } from "@nestjs/common"
import type { PrismaService } from "../../prisma/prisma.service"
import type { CreateConvencionDto, UpdateConvencionDto } from "./dto/convencion.dto"

@Injectable()
export class ConvencionesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.convencion.findMany({
      orderBy: { fecha: "desc" },
    })
  }

  async findOne(id: string) {
    return this.prisma.convencion.findUnique({
      where: { id },
    })
  }

  async create(dto: CreateConvencionDto) {
    return this.prisma.convencion.create({
      data: dto,
    })
  }

  async update(id: string, dto: UpdateConvencionDto) {
    return this.prisma.convencion.update({
      where: { id },
      data: dto,
    })
  }

  async remove(id: string) {
    return this.prisma.convencion.delete({
      where: { id },
    })
  }
}
