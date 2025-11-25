import { IsString, IsOptional, IsInt, IsBoolean } from 'class-validator';

export class CreateGaleriaDto {
    @IsString()
    titulo: string;

    @IsOptional()
    @IsString()
    descripcion?: string;

    @IsString()
    imagenUrl: string;

    @IsOptional()
    @IsString()
    categoria?: string;

    @IsOptional()
    @IsString()
    convencionId?: string;

    @IsOptional()
    @IsInt()
    orden?: number;

    @IsOptional()
    @IsBoolean()
    activa?: boolean;
}

export class UpdateGaleriaDto {
    @IsOptional()
    @IsString()
    titulo?: string;

    @IsOptional()
    @IsString()
    descripcion?: string;

    @IsOptional()
    @IsString()
    imagenUrl?: string;

    @IsOptional()
    @IsString()
    categoria?: string;

    @IsOptional()
    @IsString()
    convencionId?: string;

    @IsOptional()
    @IsInt()
    orden?: number;

    @IsOptional()
    @IsBoolean()
    activa?: boolean;
}

