import { IsString, IsOptional, IsDateString, IsNumber, IsBoolean, IsInt } from 'class-validator';

export class CreateConvencionDto {
  @IsString()
  titulo: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsDateString()
  fechaInicio: string; // ISO 8601 format: "2025-06-15T09:00:00Z"

  @IsDateString()
  fechaFin: string; // ISO 8601 format: "2025-06-17T18:00:00Z"

  @IsString()
  ubicacion: string;

  @IsOptional()
  @IsNumber()
  costo?: number;

  @IsOptional()
  @IsInt()
  cupoMaximo?: number;

  @IsOptional()
  @IsString()
  imagenUrl?: string;

  @IsOptional()
  @IsBoolean()
  activa?: boolean;
}

export class UpdateConvencionDto {
  @IsOptional()
  @IsString()
  titulo?: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsDateString()
  fechaInicio?: string;

  @IsOptional()
  @IsDateString()
  fechaFin?: string;

  @IsOptional()
  @IsString()
  ubicacion?: string;

  @IsOptional()
  @IsNumber()
  costo?: number;

  @IsOptional()
  @IsInt()
  cupoMaximo?: number;

  @IsOptional()
  @IsString()
  imagenUrl?: string;

  @IsOptional()
  @IsBoolean()
  activa?: boolean;
}
