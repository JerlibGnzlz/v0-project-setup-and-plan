import { IsString, IsNumber, IsEmail, IsOptional, Min, Max } from 'class-validator'

export class CreatePreferenceDto {
  @IsString()
  inscripcionId!: string

  @IsString()
  pagoId!: string

  @IsNumber()
  @Min(0.01)
  monto!: number

  @IsString()
  descripcion!: string

  @IsEmail()
  emailPayer!: string

  @IsString()
  nombrePayer!: string

  @IsString()
  apellidoPayer!: string

  @IsOptional()
  @IsString()
  telefonoPayer?: string

  @IsNumber()
  @Min(1)
  @Max(12)
  numeroCuota!: number
}
