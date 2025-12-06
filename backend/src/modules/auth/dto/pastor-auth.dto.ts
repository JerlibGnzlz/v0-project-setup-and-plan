import { IsEmail, IsString, MinLength, IsOptional, Matches } from 'class-validator'

export class PastorRegisterDto {
  @IsEmail({}, { message: 'El correo electrónico debe ser válido' })
  email: string

  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'La contraseña debe contener al menos una mayúscula, una minúscula y un número',
  })
  password: string

  @IsString()
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  nombre?: string

  @IsString()
  @MinLength(2, { message: 'El apellido debe tener al menos 2 caracteres' })
  apellido?: string
}

export class PastorLoginDto {
  @IsEmail({}, { message: 'El correo electrónico debe ser válido' })
  email: string

  @IsString()
  @MinLength(1, { message: 'La contraseña es requerida' })
  password: string
}

export class PastorForgotPasswordDto {
  @IsEmail({}, { message: 'El correo electrónico debe ser válido' })
  email: string
}

export class PastorResetPasswordDto {
  @IsString()
  token: string

  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'La contraseña debe contener al menos una mayúscula, una minúscula y un número',
  })
  newPassword: string
}

// DTO para registro completo de pastor desde cero (para convenciones)
export class PastorCompleteRegisterDto {
  @IsString()
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  nombre: string

  @IsString()
  @MinLength(2, { message: 'El apellido debe tener al menos 2 caracteres' })
  apellido: string

  @IsEmail({}, { message: 'El correo electrónico debe ser válido' })
  email: string

  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'La contraseña debe contener al menos una mayúscula, una minúscula y un número',
  })
  password: string

  @IsOptional()
  @IsString()
  sede?: string

  @IsOptional()
  @IsString()
  telefono?: string
}

// DTO para Google OAuth (futuro)
export class PastorGoogleAuthDto {
  @IsString()
  idToken: string
}
