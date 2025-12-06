import {
  IsString,
  IsOptional,
  IsBoolean,
  IsEnum,
  IsDateString,
  MinLength,
  MaxLength,
} from 'class-validator'
import { CategoriaNoticia } from '@prisma/client'

export class CreateNoticiaDto {
  @IsString()
  @MinLength(5, { message: 'El título debe tener al menos 5 caracteres' })
  @MaxLength(200, { message: 'El título no puede exceder 200 caracteres' })
  titulo: string

  @IsOptional()
  @IsString()
  slug?: string

  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'El extracto no puede exceder 500 caracteres' })
  extracto?: string

  @IsString()
  @MinLength(10, { message: 'El contenido debe tener al menos 10 caracteres' })
  contenido: string

  @IsOptional()
  @IsString()
  imagenUrl?: string

  @IsOptional()
  @IsEnum(CategoriaNoticia, { message: 'Categoría no válida' })
  categoria?: CategoriaNoticia

  @IsOptional()
  @IsString()
  autor?: string

  @IsOptional()
  @IsBoolean()
  publicado?: boolean

  @IsOptional()
  @IsBoolean()
  destacado?: boolean

  @IsOptional()
  @IsDateString()
  fechaPublicacion?: string

  @IsOptional()
  @IsString()
  metaTitle?: string

  @IsOptional()
  @IsString()
  metaDescription?: string
}

export class UpdateNoticiaDto {
  @IsOptional()
  @IsString()
  @MinLength(5, { message: 'El título debe tener al menos 5 caracteres' })
  @MaxLength(200, { message: 'El título no puede exceder 200 caracteres' })
  titulo?: string

  @IsOptional()
  @IsString()
  slug?: string

  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'El extracto no puede exceder 500 caracteres' })
  extracto?: string

  @IsOptional()
  @IsString()
  @MinLength(10, { message: 'El contenido debe tener al menos 10 caracteres' })
  contenido?: string

  @IsOptional()
  @IsString()
  imagenUrl?: string

  @IsOptional()
  @IsEnum(CategoriaNoticia, { message: 'Categoría no válida' })
  categoria?: CategoriaNoticia

  @IsOptional()
  @IsString()
  autor?: string

  @IsOptional()
  @IsBoolean()
  publicado?: boolean

  @IsOptional()
  @IsBoolean()
  destacado?: boolean

  @IsOptional()
  @IsDateString()
  fechaPublicacion?: string

  @IsOptional()
  @IsString()
  metaTitle?: string

  @IsOptional()
  @IsString()
  metaDescription?: string
}
