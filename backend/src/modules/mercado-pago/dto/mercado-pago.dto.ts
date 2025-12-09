import { IsString, IsNumber, IsEmail, IsOptional, IsBoolean, Min, IsEnum, ValidateIf } from 'class-validator'

export enum MetodoPagoMercadoPago {
  MERCADO_PAGO = 'MERCADO_PAGO',
  MANUAL = 'MANUAL', // Para mantener compatibilidad con el sistema actual
}

export class CreatePaymentPreferenceDto {
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

  @IsOptional()
  @IsString()
  nombrePayer?: string

  @IsOptional()
  @IsString()
  apellidoPayer?: string

  @IsOptional()
  @IsString()
  telefonoPayer?: string

  @IsOptional()
  @IsString()
  successUrl?: string

  @IsOptional()
  @IsString()
  failureUrl?: string

  @IsOptional()
  @IsString()
  pendingUrl?: string

  @IsOptional()
  @IsNumber()
  @Min(1)
  numeroCuota?: number
}

export class ProcessWebhookDto {
  @IsString()
  type!: string

  @IsString()
  action!: string

  @IsString()
  data_id!: string
}

export class GetPaymentStatusDto {
  @IsString()
  paymentId!: string
}

export class ProcessPaymentManuallyDto {
  @IsString()
  paymentId!: string
}

export class ProcessPaymentByPreferenceDto {
  @IsString()
  preferenceId!: string
}

export class ProcessPaymentByPagoIdDto {
  @IsString()
  pagoId!: string
}

