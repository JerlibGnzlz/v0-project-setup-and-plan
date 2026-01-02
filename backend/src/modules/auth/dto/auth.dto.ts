import { IsEmail, IsString, MinLength, IsOptional, Matches } from 'class-validator'

export class LoginDto {
  @IsEmail({}, { message: 'El correo electrónico debe ser válido' })
  email!: string

  @IsString()
  @MinLength(1, { message: 'La contraseña es requerida' })
  password!: string
}

export class RegisterDto {
  @IsEmail({}, { message: 'El correo electrónico debe ser válido' })
  email!: string

  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'La contraseña debe contener al menos una mayúscula, una minúscula y un número',
  })
  password!: string

  @IsString()
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  name!: string
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

// DTO para forgot password (admin)
export class ForgotPasswordDto {
  @IsEmail({}, { message: 'El correo electrónico debe ser válido' })
  email!: string
}

// DTO para reset password (admin)
export class ResetPasswordDto {
  @IsString()
  token!: string

  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/, {
    message:
      'La contraseña debe contener al menos una mayúscula, una minúscula, un número y un carácter especial (!@#$%^&*)',
  })
  newPassword!: string
}

// DTO para change password (cuando estás logueado)
export class ChangePasswordDto {
  @IsString()
  @MinLength(1, { message: 'La contraseña actual es requerida' })
  currentPassword!: string

  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/, {
    message:
      'La contraseña debe contener al menos una mayúscula, una minúscula, un número y un carácter especial (!@#$%^&*)',
  })
  newPassword!: string
}
