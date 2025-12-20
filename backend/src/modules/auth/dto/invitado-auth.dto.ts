import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator'

export class InvitadoRegisterDto {
  @IsEmail({}, { message: 'El correo electrónico debe ser válido' })
  email: string

  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  password: string

  @IsString()
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  nombre: string

  @IsString()
  @MinLength(2, { message: 'El apellido debe tener al menos 2 caracteres' })
  apellido: string

  @IsOptional()
  @IsString()
  telefono?: string

  @IsOptional()
  @IsString()
  sede?: string
}

export class InvitadoLoginDto {
  @IsEmail({}, { message: 'El correo electrónico debe ser válido' })
  email: string

  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password: string

  @IsOptional()
  @IsString()
  deviceToken?: string

  @IsOptional()
  @IsString()
  platform?: 'ios' | 'android'

  @IsOptional()
  @IsString()
  deviceId?: string
}

export class InvitadoCompleteRegisterDto {
  @IsEmail({}, { message: 'El correo electrónico debe ser válido' })
  email: string

  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  password: string

  @IsString()
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  nombre: string

  @IsString()
  @MinLength(2, { message: 'El apellido debe tener al menos 2 caracteres' })
  apellido: string

  @IsOptional()
  @IsString()
  telefono?: string

  @IsOptional()
  @IsString()
  sede?: string
}

export class GoogleIdTokenDto {
  @IsString()
  idToken: string
}
