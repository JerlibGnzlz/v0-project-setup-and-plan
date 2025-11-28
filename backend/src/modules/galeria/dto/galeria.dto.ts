import { IsString, IsOptional, IsInt, IsBoolean, IsEnum, IsNumber } from 'class-validator';

export enum TipoGaleria {
    IMAGEN = 'IMAGEN',
    VIDEO = 'VIDEO',
}

export class CreateGaleriaDto {
    @IsString()
    titulo: string;

    @IsOptional()
    @IsString()
    descripcion?: string;

    @IsString()
    imagenUrl: string;

    @IsOptional()
    @IsEnum(TipoGaleria)
    tipo?: TipoGaleria;

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

    // Video metadata fields
    @IsOptional()
    @IsString()
    videoOriginalUrl?: string;

    @IsOptional()
    @IsNumber()
    videoStartTime?: number;

    @IsOptional()
    @IsNumber()
    videoEndTime?: number;

    @IsOptional()
    @IsNumber()
    thumbnailTime?: number;
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
    @IsEnum(TipoGaleria)
    tipo?: TipoGaleria;

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

    // Video metadata fields
    @IsOptional()
    @IsString()
    videoOriginalUrl?: string;

    @IsOptional()
    @IsNumber()
    videoStartTime?: number;

    @IsOptional()
    @IsNumber()
    videoEndTime?: number;

    @IsOptional()
    @IsNumber()
    thumbnailTime?: number;
}
