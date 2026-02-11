import { IsString, IsOptional, IsInt, Min, IsArray, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'

export class UpdateProgramaEducacionItemDto {
  @IsString()
  clave!: string // instituto_biblico | escuela_capellania | misiones

  @IsOptional()
  @IsString()
  titulo?: string

  @IsOptional()
  @IsString()
  duracion?: string

  @IsOptional()
  @IsString()
  modalidad?: string

  @IsOptional()
  @IsString()
  inscripcion?: string

  @IsOptional()
  @IsString()
  cuotaMensual?: string

  @IsOptional()
  @IsString()
  requisitos?: string

  @IsOptional()
  @IsInt()
  @Min(0)
  orden?: number
}

export class UpdateProgramasEducacionDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateProgramaEducacionItemDto)
  programas!: UpdateProgramaEducacionItemDto[]

  @IsOptional()
  @IsString()
  contactEmail?: string

  @IsOptional()
  @IsString()
  contactTelefono?: string
}
