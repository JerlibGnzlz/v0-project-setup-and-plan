import { Injectable } from "@nestjs/common"
import type { PrismaService } from "../../prisma/prisma.service"
import type { CreatePastorDto, UpdatePastorDto } from "./dto/pastor.dto"

@Injectable()
export class PastoresService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.pastor.findMany({
      where: { activo: true },
      orderBy: { nombre: "asc" },
    })
  }

  async findOne(id: string) {
    return this.prisma.pastor.findUnique({
      where: { id },
    })
  }

  async create(dto: CreatePastorDto) {
    return this.prisma.pastor.create({
      data: dto,
    })
  }

  async update(id: string, dto: UpdatePastorDto) {
    return this.prisma.pastor.update({
      where: { id },
      data: dto,
    })
  }

  async remove(id: string) {
    return this.prisma.pastor.update({
      where: { id },
      data: { activo: false },
    })
  }
}
