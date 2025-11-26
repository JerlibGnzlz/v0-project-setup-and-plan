import { IsString, IsEmail, IsBoolean, IsOptional, IsEnum, IsInt, Min } from "class-validator"

// Enum que coincide con Prisma
export enum TipoPastor {
  DIRECTIVA = "DIRECTIVA",
  SUPERVISOR = "SUPERVISOR",
  PRESIDENTE = "PRESIDENTE",
  PASTOR = "PASTOR",
}

export class CreatePastorDto {
  @IsString()
  nombre: string

  @IsString()
  apellido: string

  @IsOptional()
  @IsEmail()
  email?: string

  @IsOptional()
  @IsString()
  telefono?: string

  // Clasificación
  @IsOptional()
  @IsEnum(TipoPastor)
  tipo?: TipoPastor

  @IsOptional()
  @IsString()
  cargo?: string

  @IsOptional()
  @IsString()
  ministerio?: string

  // Ubicación
  @IsOptional()
  @IsString()
  sede?: string

  @IsOptional()
  @IsString()
  region?: string

  @IsOptional()
  @IsString()
  pais?: string

  // Contenido
  @IsOptional()
  @IsString()
  fotoUrl?: string

  @IsOptional()
  @IsString()
  biografia?: string

  @IsOptional()
  @IsString()
  trayectoria?: string

  // Control
  @IsOptional()
  @IsInt()
  @Min(0)
  orden?: number

  @IsOptional()
  @IsBoolean()
  activo?: boolean

  @IsOptional()
  @IsBoolean()
  mostrarEnLanding?: boolean
}

export class UpdatePastorDto {
  @IsOptional()
  @IsString()
  nombre?: string

  @IsOptional()
  @IsString()
  apellido?: string

  @IsOptional()
  @IsEmail()
  email?: string

  @IsOptional()
  @IsString()
  telefono?: string

  // Clasificación
  @IsOptional()
  @IsEnum(TipoPastor)
  tipo?: TipoPastor

  @IsOptional()
  @IsString()
  cargo?: string

  @IsOptional()
  @IsString()
  ministerio?: string

  // Ubicación
  @IsOptional()
  @IsString()
  sede?: string

  @IsOptional()
  @IsString()
  region?: string

  @IsOptional()
  @IsString()
  pais?: string

  // Contenido
  @IsOptional()
  @IsString()
  fotoUrl?: string

  @IsOptional()
  @IsString()
  biografia?: string

  @IsOptional()
  @IsString()
  trayectoria?: string

  // Control
  @IsOptional()
  @IsInt()
  @Min(0)
  orden?: number

  @IsOptional()
  @IsBoolean()
  activo?: boolean

  @IsOptional()
  @IsBoolean()
  mostrarEnLanding?: boolean
}
