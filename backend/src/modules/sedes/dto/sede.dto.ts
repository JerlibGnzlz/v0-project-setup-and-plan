import { IsString, IsNotEmpty, IsBoolean, IsInt, IsOptional, Min } from 'class-validator'

export class CreateSedeDto {
  @IsString()
  @IsNotEmpty()
  pais!: string

  @IsString()
  @IsNotEmpty()
  ciudad!: string

  @IsString()
  @IsNotEmpty()
  descripcion!: string

  @IsString()
  @IsNotEmpty()
  imagenUrl!: string

  @IsString()
  @IsNotEmpty()
  bandera!: string

  @IsBoolean()
  @IsOptional()
  activa?: boolean

  @IsInt()
  @Min(0)
  @IsOptional()
  orden?: number
}

export class UpdateSedeDto {
  @IsString()
  @IsOptional()
  pais?: string

  @IsString()
  @IsOptional()
  ciudad?: string

  @IsString()
  @IsOptional()
  descripcion?: string

  @IsString()
  @IsOptional()
  imagenUrl?: string

  @IsString()
  @IsOptional()
  bandera?: string

  @IsBoolean()
  @IsOptional()
  activa?: boolean

  @IsInt()
  @Min(0)
  @IsOptional()
  orden?: number
}

export class SedeFilterDto {
  @IsString()
  @IsOptional()
  pais?: string

  @IsBoolean()
  @IsOptional()
  activa?: boolean
}

