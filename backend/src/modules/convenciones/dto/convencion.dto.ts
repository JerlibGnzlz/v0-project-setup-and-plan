import { IsString, IsDate, IsBoolean, IsOptional } from "class-validator"
import { Type } from "class-transformer"

export class CreateConvencionDto {
  @IsString()
  titulo: string

  @IsOptional()
  @IsString()
  descripcion?: string

  @Type(() => Date)
  @IsDate()
  fecha: Date

  @IsString()
  ubicacion: string

  @IsOptional()
  @IsString()
  imagen?: string

  @IsOptional()
  @IsBoolean()
  activa?: boolean
}

export class UpdateConvencionDto {
  @IsOptional()
  @IsString()
  titulo?: string

  @IsOptional()
  @IsString()
  descripcion?: string

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  fecha?: Date

  @IsOptional()
  @IsString()
  ubicacion?: string

  @IsOptional()
  @IsString()
  imagen?: string

  @IsOptional()
  @IsBoolean()
  activa?: boolean
}
