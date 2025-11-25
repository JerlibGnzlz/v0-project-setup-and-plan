import { IsString, IsEmail, IsBoolean, IsOptional } from "class-validator"

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

  @IsOptional()
  @IsString()
  sede?: string

  @IsOptional()
  @IsString()
  cargo?: string

  @IsOptional()
  @IsString()
  fotoUrl?: string

  @IsOptional()
  @IsString()
  biografia?: string

  @IsOptional()
  @IsBoolean()
  activo?: boolean
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

  @IsOptional()
  @IsString()
  sede?: string

  @IsOptional()
  @IsString()
  cargo?: string

  @IsOptional()
  @IsString()
  fotoUrl?: string

  @IsOptional()
  @IsString()
  biografia?: string

  @IsOptional()
  @IsBoolean()
  activo?: boolean
}
