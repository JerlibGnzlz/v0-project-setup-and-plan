import { IsString, IsInt, IsOptional, Min, IsIn } from 'class-validator'

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
  @IsIn(['left', 'center', 'right', 'justify'])
  visionJustificacion?: string
}

