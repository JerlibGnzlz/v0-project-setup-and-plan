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
  iglesia?: string

  @IsOptional()
  @IsString()
  cargo?: string

  @IsOptional()
  @IsString()
  foto?: string

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
  iglesia?: string

  @IsOptional()
  @IsString()
  cargo?: string

  @IsOptional()
  @IsString()
  foto?: string

  @IsOptional()
  @IsBoolean()
  activo?: boolean
}
