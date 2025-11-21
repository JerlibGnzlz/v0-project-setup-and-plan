import { PrismaService } from "../../prisma/prisma.service";
import { CreateConvencionDto, UpdateConvencionDto } from "./dto/convencion.dto";
export declare class ConvencionesService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        titulo: string;
        descripcion: string | null;
        ubicacion: string;
        activa: boolean;
        fechaInicio: Date;
        fechaFin: Date;
        costo: import("@prisma/client/runtime/library").Decimal;
        cupoMaximo: number | null;
        imagenUrl: string | null;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        titulo: string;
        descripcion: string | null;
        ubicacion: string;
        activa: boolean;
        fechaInicio: Date;
        fechaFin: Date;
        costo: import("@prisma/client/runtime/library").Decimal;
        cupoMaximo: number | null;
        imagenUrl: string | null;
    }>;
    create(dto: CreateConvencionDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        titulo: string;
        descripcion: string | null;
        ubicacion: string;
        activa: boolean;
        fechaInicio: Date;
        fechaFin: Date;
        costo: import("@prisma/client/runtime/library").Decimal;
        cupoMaximo: number | null;
        imagenUrl: string | null;
    }>;
    update(id: string, dto: UpdateConvencionDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        titulo: string;
        descripcion: string | null;
        ubicacion: string;
        activa: boolean;
        fechaInicio: Date;
        fechaFin: Date;
        costo: import("@prisma/client/runtime/library").Decimal;
        cupoMaximo: number | null;
        imagenUrl: string | null;
    }>;
    remove(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        titulo: string;
        descripcion: string | null;
        ubicacion: string;
        activa: boolean;
        fechaInicio: Date;
        fechaFin: Date;
        costo: import("@prisma/client/runtime/library").Decimal;
        cupoMaximo: number | null;
        imagenUrl: string | null;
    }>;
}
