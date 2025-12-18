import {
  IsString,
  IsOptional,
  IsEmail,
  IsEnum,
  IsNumber,
  Min,
  Max,
  Length,
  Matches,
  ValidateIf,
} from 'class-validator'

export enum EstadoPago {
  PENDIENTE = 'PENDIENTE',
  COMPLETADO = 'COMPLETADO',
  CANCELADO = 'CANCELADO',
  REEMBOLSADO = 'REEMBOLSADO',
}

export class CreateInscripcionDto {
  @IsString()
  convencionId: string

  @IsString()
  @Length(1, 50, { message: 'El nombre debe tener entre 1 y 50 caracteres' })
  @Matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s'-]+$/, {
    message: 'El nombre solo puede contener letras, espacios, guiones y apóstrofes',
  })
  nombre: string

  @IsString()
  @Length(0, 50, { message: 'El apellido no puede exceder 50 caracteres' })
  @ValidateIf(o => o.apellido && o.apellido.length > 0)
  @Matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s'-]+$/, {
    message: 'El apellido solo puede contener letras, espacios, guiones y apóstrofes',
  })
  apellido: string // Puede estar vacío si el usuario no tiene apellido (ej: Google OAuth)

  @IsEmail({}, { message: 'Correo electrónico inválido' })
  @Length(5, 254, { message: 'El correo electrónico debe tener entre 5 y 254 caracteres' })
  email: string

  @IsOptional()
  @IsString()
  @Length(8, 20, { message: 'El teléfono debe tener entre 8 y 20 caracteres' })
  @Matches(/^\+?[\d\s\-()]+$/, {
    message:
      'El teléfono solo puede contener números, espacios, guiones, paréntesis y el símbolo +',
  })
  telefono?: string

  @IsOptional()
  @IsString()
  @Length(0, 200, { message: 'La sede no puede exceder 200 caracteres' })
  sede?: string

  @IsOptional()
  @IsString()
  @Length(0, 100, { message: 'El país no puede exceder 100 caracteres' })
  pais?: string

  @IsOptional()
  @IsString()
  @Length(0, 100, { message: 'La provincia no puede exceder 100 caracteres' })
  provincia?: string

  @IsOptional()
  @IsString()
  @Length(0, 50, { message: 'El tipo de inscripción no puede exceder 50 caracteres' })
  tipoInscripcion?: string

  @IsOptional()
  @IsString()
  @Length(0, 1000, { message: 'Las notas no pueden exceder 1000 caracteres' })
  notas?: string

  @IsOptional()
  @IsString()
  @Length(0, 20, { message: 'El DNI no puede exceder 20 caracteres' })
  dni?: string // DNI para relacionar con credenciales ministeriales y de capellanía

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(3)
  numeroCuotas?: number // 1, 2 o 3 cuotas

  @IsOptional()
  @IsString()
  @Matches(/^(web|mobile|dashboard)$/, {
    message: 'El origen de registro debe ser: web, mobile o dashboard',
  })
  origenRegistro?: string // "web", "mobile", "dashboard"

  @IsOptional()
  @IsString()
  documentoUrl?: string // URL del documento/comprobante subido
}

export class UpdateInscripcionDto {
  @IsOptional()
  @ValidateIf(o => o.nombre !== null && o.nombre !== undefined)
  @IsString()
  @Length(2, 50, { message: 'El nombre debe tener entre 2 y 50 caracteres' })
  @Matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s'-]+$/, {
    message: 'El nombre solo puede contener letras, espacios, guiones y apóstrofes',
  })
  nombre?: string

  @IsOptional()
  @ValidateIf(o => o.apellido !== null && o.apellido !== undefined)
  @IsString()
  @Length(2, 50, { message: 'El apellido debe tener entre 2 y 50 caracteres' })
  @Matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s'-]+$/, {
    message: 'El apellido solo puede contener letras, espacios, guiones y apóstrofes',
  })
  apellido?: string

  @IsOptional()
  @ValidateIf(o => o.email !== null && o.email !== undefined)
  @IsEmail({}, { message: 'Correo electrónico inválido' })
  @Length(5, 254, { message: 'El correo electrónico debe tener entre 5 y 254 caracteres' })
  email?: string

  @IsOptional()
  @ValidateIf(o => o.telefono !== null && o.telefono !== undefined && o.telefono !== '')
  @IsString()
  @Length(8, 20, { message: 'El teléfono debe tener entre 8 y 20 caracteres' })
  @Matches(/^\+?[\d\s\-()]+$/, {
    message:
      'El teléfono solo puede contener números, espacios, guiones, paréntesis y el símbolo +',
  })
  telefono?: string | null

  @IsOptional()
  @IsString()
  @Length(0, 200, { message: 'La sede no puede exceder 200 caracteres' })
  sede?: string | null

  @IsOptional()
  @IsString()
  @Length(0, 100, { message: 'El país no puede exceder 100 caracteres' })
  pais?: string | null

  @IsOptional()
  @IsString()
  @Length(0, 100, { message: 'La provincia no puede exceder 100 caracteres' })
  provincia?: string | null

  @IsOptional()
  @IsString()
  @Length(0, 50, { message: 'El tipo de inscripción no puede exceder 50 caracteres' })
  tipoInscripcion?: string

  @IsOptional()
  @IsString()
  estado?: string

  @IsOptional()
  @IsString()
  @Length(0, 1000, { message: 'Las notas no pueden exceder 1000 caracteres' })
  notas?: string | null

  @IsOptional()
  @ValidateIf(o => o.dni !== null && o.dni !== undefined)
  @IsString()
  @Length(0, 20, { message: 'El DNI no puede exceder 20 caracteres' })
  dni?: string | null // DNI para relacionar con credenciales ministeriales y de capellanía

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(3)
  numeroCuotas?: number // 1, 2 o 3 cuotas
}

export class CreatePagoDto {
  @IsString()
  inscripcionId: string

  @IsString()
  monto: string // Decimal as string

  @IsString()
  metodoPago: string

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(3)
  numeroCuota?: number // 1, 2, o 3 para identificar la cuota

  @IsOptional()
  @IsEnum(EstadoPago)
  estado?: EstadoPago

  @IsOptional()
  @IsString()
  referencia?: string

  @IsOptional()
  @IsString()
  comprobanteUrl?: string // URL de la imagen del comprobante

  @IsOptional()
  @IsString()
  notas?: string
}

export class UpdatePagoDto {
  @IsOptional()
  @IsString()
  monto?: string

  @IsOptional()
  @IsString()
  metodoPago?: string

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(3)
  numeroCuota?: number // 1, 2, o 3 para identificar la cuota

  @IsOptional()
  @IsEnum(EstadoPago)
  estado?: EstadoPago

  @IsOptional()
  @IsString()
  referencia?: string

  @IsOptional()
  @IsString()
  comprobanteUrl?: string // URL de la imagen del comprobante

  @IsOptional()
  @IsString()
  notas?: string
}
