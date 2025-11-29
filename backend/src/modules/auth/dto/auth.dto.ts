import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator'

export class LoginDto {
  @IsEmail({}, { message: 'El correo electrónico debe ser válido' })
  email: string

  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password: string
}

export class RegisterDto {
  @IsEmail({}, { message: 'El correo electrónico debe ser válido' })
  email: string

  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password: string

  @IsString()
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  name: string
}

// DTO para refresh token (compartido entre admin y mobile)
export class RefreshTokenDto {
  @IsString()
  refreshToken: string
}

// DTO para registro de dispositivo (notificaciones push)
export class RegisterDeviceDto {
  @IsString()
  deviceToken: string

  @IsString()
  @IsOptional()
  deviceType?: 'ios' | 'android'

  @IsString()
  @IsOptional()
  deviceId?: string
}
