import { PastoresService } from "./pastores.service";
import { CreatePastorDto, UpdatePastorDto } from "./dto/pastor.dto";
export declare class PastoresController {
    private pastoresService;
    constructor(pastoresService: PastoresService);
    findAll(): Promise<{
        email: string | null;
        id: string;
        nombre: string;
        createdAt: Date;
        updatedAt: Date;
        apellido: string;
        telefono: string | null;
        cargo: string | null;
        activo: boolean;
        sede: string | null;
        fotoUrl: string | null;
        biografia: string | null;
    }[]>;
    findOne(id: string): Promise<{
        email: string | null;
        id: string;
        nombre: string;
        createdAt: Date;
        updatedAt: Date;
        apellido: string;
        telefono: string | null;
        cargo: string | null;
        activo: boolean;
        sede: string | null;
        fotoUrl: string | null;
        biografia: string | null;
    }>;
    create(dto: CreatePastorDto): Promise<{
        email: string | null;
        id: string;
        nombre: string;
        createdAt: Date;
        updatedAt: Date;
        apellido: string;
        telefono: string | null;
        cargo: string | null;
        activo: boolean;
        sede: string | null;
        fotoUrl: string | null;
        biografia: string | null;
    }>;
    update(id: string, dto: UpdatePastorDto): Promise<{
        email: string | null;
        id: string;
        nombre: string;
        createdAt: Date;
        updatedAt: Date;
        apellido: string;
        telefono: string | null;
        cargo: string | null;
        activo: boolean;
        sede: string | null;
        fotoUrl: string | null;
        biografia: string | null;
    }>;
    remove(id: string): Promise<{
        email: string | null;
        id: string;
        nombre: string;
        createdAt: Date;
        updatedAt: Date;
        apellido: string;
        telefono: string | null;
        cargo: string | null;
        activo: boolean;
        sede: string | null;
        fotoUrl: string | null;
        biografia: string | null;
    }>;
}
