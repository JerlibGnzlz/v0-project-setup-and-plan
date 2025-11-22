export declare class CreateConvencionDto {
    titulo: string;
    descripcion?: string;
    fechaInicio: string;
    fechaFin: string;
    ubicacion: string;
    costo?: number;
    cupoMaximo?: number;
    imagenUrl?: string;
    activa?: boolean;
}
export declare class UpdateConvencionDto {
    titulo?: string;
    descripcion?: string;
    fechaInicio?: string;
    fechaFin?: string;
    ubicacion?: string;
    costo?: number;
    cupoMaximo?: number;
    imagenUrl?: string;
    activa?: boolean;
}
