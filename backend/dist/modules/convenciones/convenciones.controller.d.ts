import { ConvencionesService } from "./convenciones.service";
import { CreateConvencionDto, UpdateConvencionDto } from "./dto/convencion.dto";
export declare class ConvencionesController {
    private convencionesService;
    constructor(convencionesService: ConvencionesService);
    findAll(): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        titulo: string;
        descripcion: string | null;
        fechaInicio: Date;
        fechaFin: Date;
        ubicacion: string;
        costo: import("@prisma/client/runtime/library").Decimal;
        cupoMaximo: number | null;
        imagenUrl: string | null;
        activa: boolean;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        titulo: string;
        descripcion: string | null;
        fechaInicio: Date;
        fechaFin: Date;
        ubicacion: string;
        costo: import("@prisma/client/runtime/library").Decimal;
        cupoMaximo: number | null;
        imagenUrl: string | null;
        activa: boolean;
    }>;
    create(dto: CreateConvencionDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        titulo: string;
        descripcion: string | null;
        fechaInicio: Date;
        fechaFin: Date;
        ubicacion: string;
        costo: import("@prisma/client/runtime/library").Decimal;
        cupoMaximo: number | null;
        imagenUrl: string | null;
        activa: boolean;
    }>;
    update(id: string, dto: UpdateConvencionDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        titulo: string;
        descripcion: string | null;
        fechaInicio: Date;
        fechaFin: Date;
        ubicacion: string;
        costo: import("@prisma/client/runtime/library").Decimal;
        cupoMaximo: number | null;
        imagenUrl: string | null;
        activa: boolean;
    }>;
    remove(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        titulo: string;
        descripcion: string | null;
        fechaInicio: Date;
        fechaFin: Date;
        ubicacion: string;
        costo: import("@prisma/client/runtime/library").Decimal;
        cupoMaximo: number | null;
        imagenUrl: string | null;
        activa: boolean;
    }>;
}
