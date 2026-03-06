import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsInt,
  Min,
  Max,
  IsDateString,
  Length,
  MaxLength,
  ValidateIf,
} from 'class-validator'
import { Transform, Type } from 'class-transformer'

export enum TipoCredencial {
  MINISTERIAL = 'ministerial',
  CAPELLANIA = 'capellania',
}

export enum EstadoSolicitud {
  PENDIENTE = 'pendiente',
  APROBADA = 'aprobada',
  RECHAZADA = 'rechazada',
  COMPLETADA = 'completada',
}

export class CreateSolicitudCredencialDto {
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  @IsEnum(TipoCredencial, { message: 'El tipo debe ser "ministerial" o "capellania"' })
  @IsNotEmpty({ message: 'El tipo de credencial es requerido' })
  tipo!: TipoCredencial

  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @IsNotEmpty({ message: 'El DNI es requerido' })
  @Length(5, 30, { message: 'El DNI debe tener entre 5 y 30 caracteres' })
  dni!: string

  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @IsNotEmpty({ message: 'El nombre es requerido' })
  @MaxLength(100, { message: 'El nombre no puede exceder 100 caracteres' })
  nombre!: string

  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @IsNotEmpty({ message: 'El apellido es requerido' })
  @MaxLength(100, { message: 'El apellido no puede exceder 100 caracteres' })
  apellido!: string

  @IsOptional()
  @ValidateIf((_o, v) => v != null && v !== '')
  @IsString()
  @MaxLength(50, { message: 'La nacionalidad no puede exceder 50 caracteres' })
  nacionalidad?: string

  @IsOptional()
  @ValidateIf((_o, v) => v != null && v !== '')
  @IsString()
  @MaxLength(50, { message: 'El tipo de pastor no puede exceder 50 caracteres' })
  tipoPastor?: string

  @IsOptional()
  @ValidateIf((_o, v) => v != null && v !== '')
  @IsDateString()
  fechaNacimiento?: string

  @IsOptional()
  @ValidateIf((_o, v) => v != null && v !== '')
  @IsString()
  @MaxLength(500, { message: 'El motivo no puede exceder 500 caracteres' })
  motivo?: string
}

/**
 * Query params para GET /solicitudes-credenciales (admin).
 * Incluir estado y tipo evita que ValidationPipe (whitelist) los elimine.
 */
export class FindAllSolicitudesQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20

  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  @IsEnum(EstadoSolicitud)
  estado?: EstadoSolicitud

  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  @IsEnum(TipoCredencial)
  tipo?: TipoCredencial
}

export class UpdateSolicitudCredencialDto {
  @IsEnum(EstadoSolicitud)
  @IsOptional()
  estado?: EstadoSolicitud

  @IsString()
  @IsOptional()
  @MaxLength(1000, { message: 'Las observaciones no pueden exceder 1000 caracteres' })
  observaciones?: string

  @IsString()
  @IsOptional()
  credencialMinisterialId?: string

  @IsString()
  @IsOptional()
  credencialCapellaniaId?: string
}

