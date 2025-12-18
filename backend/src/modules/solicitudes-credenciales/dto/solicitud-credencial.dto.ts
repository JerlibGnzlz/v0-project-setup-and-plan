import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsDateString,
  Length,
  MaxLength,
} from 'class-validator'

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
  @IsEnum(TipoCredencial)
  @IsNotEmpty({ message: 'El tipo de credencial es requerido' })
  tipo!: TipoCredencial

  @IsString()
  @IsNotEmpty({ message: 'El DNI es requerido' })
  @Length(5, 20, { message: 'El DNI debe tener entre 5 y 20 caracteres' })
  dni!: string

  @IsString()
  @IsNotEmpty({ message: 'El nombre es requerido' })
  @MaxLength(100, { message: 'El nombre no puede exceder 100 caracteres' })
  nombre!: string

  @IsString()
  @IsNotEmpty({ message: 'El apellido es requerido' })
  @MaxLength(100, { message: 'El apellido no puede exceder 100 caracteres' })
  apellido!: string

  @IsString()
  @IsOptional()
  @MaxLength(50, { message: 'La nacionalidad no puede exceder 50 caracteres' })
  nacionalidad?: string

  @IsDateString()
  @IsOptional()
  fechaNacimiento?: string

  @IsString()
  @IsOptional()
  @MaxLength(500, { message: 'El motivo no puede exceder 500 caracteres' })
  motivo?: string
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

