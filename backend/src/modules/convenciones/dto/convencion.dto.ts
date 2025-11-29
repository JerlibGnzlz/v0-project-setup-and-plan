import { IsString, IsOptional, IsDateString, IsNumber, IsBoolean, IsInt, Min, Max, Length } from 'class-validator';

export class CreateConvencionDto {
  @IsString()
  @Length(5, 100, { message: 'El título debe tener entre 5 y 100 caracteres' })
  titulo: string;

  @IsOptional()
  @IsString()
  @Length(0, 500, { message: 'La descripción no puede exceder 500 caracteres' })
  descripcion?: string;

  @IsDateString()
  fechaInicio: string; // ISO 8601 format: "2025-06-15T09:00:00Z"

  @IsDateString()
  fechaFin: string; // ISO 8601 format: "2025-06-17T18:00:00Z"

  @IsString()
  @Length(3, 200, { message: 'La ubicación debe tener entre 3 y 200 caracteres' })
  ubicacion: string;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'El costo solo puede tener hasta 2 decimales' })
  @Min(0.01, { message: 'El costo debe ser mayor a 0' })
  @Max(999999.99, { message: 'El costo no puede exceder $999,999.99' })
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

  @IsOptional()
  @IsBoolean()
  archivada?: boolean;
}

export class UpdateConvencionDto {
  @IsOptional()
  @IsString()
  @Length(5, 100, { message: 'El título debe tener entre 5 y 100 caracteres' })
  titulo?: string;

  @IsOptional()
  @IsString()
  @Length(0, 500, { message: 'La descripción no puede exceder 500 caracteres' })
  descripcion?: string;

  @IsOptional()
  @IsDateString()
  fechaInicio?: string;

  @IsOptional()
  @IsDateString()
  fechaFin?: string;

  @IsOptional()
  @IsString()
  @Length(3, 200, { message: 'La ubicación debe tener entre 3 y 200 caracteres' })
  ubicacion?: string;

  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'El costo solo puede tener hasta 2 decimales' })
  @Min(0.01, { message: 'El costo debe ser mayor a 0' })
  @Max(999999.99, { message: 'El costo no puede exceder $999,999.99' })
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
