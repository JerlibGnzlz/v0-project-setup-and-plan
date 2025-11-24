import { Injectable } from "@nestjs/common"
import { PrismaService } from "../../prisma/prisma.service"
import { CreateInscripcionDto, UpdateInscripcionDto, CreatePagoDto, UpdatePagoDto } from "./dto/inscripcion.dto"

@Injectable()
export class InscripcionesService {
    constructor(private prisma: PrismaService) { }

    async findAllInscripciones() {
        return this.prisma.inscripcion.findMany({
            include: {
                convencion: true,
                pagos: true,
            },
            orderBy: { fechaInscripcion: "desc" },
        })
    }

    async findOneInscripcion(id: string) {
        return this.prisma.inscripcion.findUnique({
            where: { id },
            include: {
                convencion: true,
                pagos: true,
            },
        })
    }

    async createInscripcion(dto: CreateInscripcionDto) {
        return this.prisma.inscripcion.create({
            data: dto,
            include: {
                convencion: true,
                pagos: true,
            },
        })
    }

    async updateInscripcion(id: string, dto: UpdateInscripcionDto) {
        return this.prisma.inscripcion.update({
            where: { id },
            data: dto,
            include: {
                convencion: true,
                pagos: true,
            },
        })
    }

    async removeInscripcion(id: string) {
        return this.prisma.inscripcion.delete({
            where: { id },
        })
    }

    // Pagos
    async findAllPagos() {
        return this.prisma.pago.findMany({
            include: {
                inscripcion: {
                    include: {
                        convencion: true,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        })
    }

    async findOnePago(id: string) {
        return this.prisma.pago.findUnique({
            where: { id },
            include: {
                inscripcion: {
                    include: {
                        convencion: true,
                    },
                },
            },
        })
    }

    async createPago(dto: CreatePagoDto) {
        return this.prisma.pago.create({
            data: {
                ...dto,
                monto: parseFloat(dto.monto),
            },
            include: {
                inscripcion: {
                    include: {
                        convencion: true,
                    },
                },
            },
        })
    }

    async updatePago(id: string, dto: UpdatePagoDto) {
        const data: any = { ...dto }
        if (dto.monto) {
            data.monto = parseFloat(dto.monto)
        }
        return this.prisma.pago.update({
            where: { id },
            data,
            include: {
                inscripcion: {
                    include: {
                        convencion: true,
                    },
                },
            },
        })
    }

    async removePago(id: string) {
        return this.prisma.pago.delete({
            where: { id },
        })
    }
}
