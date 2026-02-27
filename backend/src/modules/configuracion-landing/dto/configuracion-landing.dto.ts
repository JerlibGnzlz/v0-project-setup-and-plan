import { IsString, IsInt, IsOptional, Min, IsIn, IsBoolean, ValidateIf } from 'class-validator'

// Solo validar IsIn cuando el valor está presente y no es cadena vacía (aceptar '' como opcional).
function cuandoJustificacionPresente(_o: unknown, v: unknown): boolean {
  return v !== undefined && v !== null && v !== ''
}

export class UpdateConfiguracionLandingDto {
  @IsOptional()
  @IsInt()
  @Min(0)
  pastoresFormados?: number

  @IsOptional()
  @IsString()
  pastoresFormadosSuffix?: string

  @IsOptional()
  @IsInt()
  @Min(0)
  anosMinisterio?: number

  @IsOptional()
  @IsString()
  anosMinisterioSuffix?: string

  @IsOptional()
  @IsInt()
  @Min(0)
  convenciones?: number

  @IsOptional()
  @IsString()
  convencionesSuffix?: string

  @IsOptional()
  @IsInt()
  @Min(0)
  paisesOverride?: number | null

  @IsOptional()
  @IsString()
  titulo?: string

  @IsOptional()
  @IsString()
  subtitulo?: string

  @IsOptional()
  @IsString()
  @ValidateIf(cuandoJustificacionPresente)
  @IsIn(['left', 'center', 'right', 'justify'])
  subtituloJustificacion?: string

  @IsOptional()
  @IsString()
  misionTitulo?: string

  @IsOptional()
  @IsString()
  misionContenido?: string

  @IsOptional()
  @IsString()
  @ValidateIf(cuandoJustificacionPresente)
  @IsIn(['left', 'center', 'right', 'justify'])
  misionJustificacion?: string

  @IsOptional()
  @IsString()
  visionTitulo?: string

  @IsOptional()
  @IsString()
  visionContenido?: string

  @IsOptional()
  @IsString()
  @ValidateIf(cuandoJustificacionPresente)
  @IsIn(['left', 'center', 'right', 'justify'])
  visionJustificacion?: string

  @IsOptional()
  @IsBoolean()
  ofrendasHabilitado?: boolean

  @IsOptional()
  @IsString()
  ofrendasTitulo?: string

  @IsOptional()
  @IsString()
  ofrendasContenido?: string

  @IsOptional()
  @IsString()
  ofrendasCuentaBancaria?: string

  @IsOptional()
  @IsString()
  @ValidateIf(cuandoJustificacionPresente)
  @IsIn(['left', 'center', 'right', 'justify'])
  ofrendasJustificacion?: string
}

