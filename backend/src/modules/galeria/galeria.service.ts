import { Injectable } from "@nestjs/common"
import { PrismaService } from "../../prisma/prisma.service"
import { CreateGaleriaDto, UpdateGaleriaDto } from "./dto/galeria.dto"

@Injectable()
export class GaleriaService {
    constructor(private prisma: PrismaService) { }

    async findAll() {
        return this.prisma.galeriaImagen.findMany({
            where: { activa: true },
            orderBy: { orden: "asc" },
        })
    }

    async findOne(id: string) {
        return this.prisma.galeriaImagen.findUnique({
            where: { id },
        })
    }

    async create(dto: CreateGaleriaDto) {
        return this.prisma.galeriaImagen.create({
            data: dto,
        })
    }

    async update(id: string, dto: UpdateGaleriaDto) {
        return this.prisma.galeriaImagen.update({
            where: { id },
            data: dto,
        })
    }

    async remove(id: string) {
        return this.prisma.galeriaImagen.delete({
            where: { id },
        })
    }
}
