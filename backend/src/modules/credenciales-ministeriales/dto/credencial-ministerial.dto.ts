import {
  IsString,
  IsNotEmpty,
  IsDateString,
  IsOptional,
  IsBoolean,
  Length,
} from 'class-validator'
import { Type } from 'class-transformer'

export class CreateCredencialMinisterialDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  apellido!: string

  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  nombre!: string

  @IsString()
  @IsNotEmpty()
  @Length(1, 50)
  documento!: string

  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  nacionalidad!: string

  @IsDateString()
  @IsNotEmpty()
  fechaNacimiento!: string

  @IsString()
  @IsOptional()
  tipoPastor?: string

  @IsDateString()
  @IsNotEmpty()
  fechaVencimiento!: string

  @IsString()
  @IsOptional()
  fotoUrl?: string

  @IsBoolean()
  @IsOptional()
  activa?: boolean
}

export class UpdateCredencialMinisterialDto {
  @IsString()
  @IsOptional()
  @Length(1, 100)
  apellido?: string

  @IsString()
  @IsOptional()
  @Length(1, 100)
  nombre?: string

  @IsString()
  @IsOptional()
  @Length(1, 50)
  documento?: string

  @IsString()
  @IsOptional()
  @Length(1, 100)
  nacionalidad?: string

  @IsDateString()
  @IsOptional()
  fechaNacimiento?: string

  @IsString()
  @IsOptional()
  tipoPastor?: string

  @IsDateString()
  @IsOptional()
  fechaVencimiento?: string

  @IsString()
  @IsOptional()
  fotoUrl?: string

  @IsBoolean()
  @IsOptional()
  activa?: boolean
}

export class CredencialMinisterialFilterDto {
  @IsOptional()
  @IsString()
  documento?: string

  @IsOptional()
  @IsString()
  estado?: string

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  activa?: boolean
}

