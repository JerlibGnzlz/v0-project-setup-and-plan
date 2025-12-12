import {
  IsString,
  IsNotEmpty,
  IsDateString,
  IsEnum,
  IsOptional,
  IsBoolean,
  IsUUID,
  Length,
} from 'class-validator'
import { EstadoCredencial } from '@prisma/client'

export class CreateCredencialPastoralDto {
  @IsUUID()
  @IsNotEmpty()
  pastorId!: string

  @IsString()
  @IsNotEmpty()
  @Length(1, 50)
  numeroCredencial!: string

  @IsDateString()
  @IsNotEmpty()
  fechaEmision!: string

  @IsDateString()
  @IsNotEmpty()
  fechaVencimiento!: string

  @IsEnum(EstadoCredencial)
  @IsOptional()
  estado?: EstadoCredencial

  @IsBoolean()
  @IsOptional()
  activa?: boolean

  @IsString()
  @IsOptional()
  notas?: string
}

export class UpdateCredencialPastoralDto {
  @IsString()
  @IsOptional()
  @Length(1, 50)
  numeroCredencial?: string

  @IsDateString()
  @IsOptional()
  fechaEmision?: string

  @IsDateString()
  @IsOptional()
  fechaVencimiento?: string

  @IsEnum(EstadoCredencial)
  @IsOptional()
  estado?: EstadoCredencial

  @IsBoolean()
  @IsOptional()
  activa?: boolean

  @IsString()
  @IsOptional()
  notas?: string
}

export class CredencialFilterDto {
  @IsEnum(EstadoCredencial)
  @IsOptional()
  estado?: EstadoCredencial

  @IsBoolean()
  @IsOptional()
  activa?: boolean

  @IsUUID()
  @IsOptional()
  pastorId?: string

  @IsString()
  @IsOptional()
  numeroCredencial?: string
}

