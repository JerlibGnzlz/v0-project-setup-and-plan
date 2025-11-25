import { Injectable } from "@nestjs/common"
import { PrismaService } from "../../prisma/prisma.service"
import { CreateConvencionDto, UpdateConvencionDto } from "./dto/convencion.dto"

@Injectable()
export class ConvencionesService {
  constructor(private prisma: PrismaService) { }

  async findAll() {
    return this.prisma.convencion.findMany({
      orderBy: { fechaFin: "desc" },
    })
  }

  async findOne(id: string) {
    return this.prisma.convencion.findUnique({
      where: { id },
    })
  }

  async findActive() {
    return this.prisma.convencion.findFirst({
      where: { activa: true },
      orderBy: { fechaInicio: "desc" },
    })
  }

  async create(dto: CreateConvencionDto) {
    return this.prisma.convencion.create({
      data: dto,
    })
  }

  async update(id: string, dto: UpdateConvencionDto) {
    // Convertir costo a Decimal si viene como number
    const data: any = { ...dto }
    if (data.costo !== undefined) {
      data.costo = Number(data.costo)
    }

    console.log('Updating convencion:', id, data)

    try {
      return await this.prisma.convencion.update({
        where: { id },
        data,
      })
    } catch (error) {
      console.error('Error updating convencion:', error)
      throw error
    }
  }

  async remove(id: string) {
    return this.prisma.convencion.delete({
      where: { id },
    })
  }
}
