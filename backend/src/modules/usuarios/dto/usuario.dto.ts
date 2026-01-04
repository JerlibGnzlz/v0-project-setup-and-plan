import { IsEmail, IsString, IsEnum, IsOptional, MinLength, Matches, IsBoolean } from 'class-validator'
import { UserRole } from '@prisma/client'

export class CreateUsuarioDto {
  @IsEmail({}, { message: 'El email debe ser válido' })
  email!: string

  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password!: string

  @IsString()
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  nombre!: string

  @IsEnum(UserRole, { message: 'El rol debe ser ADMIN, EDITOR o VIEWER' })
  rol!: UserRole
}

export class UpdateUsuarioDto {
  @IsOptional()
  @IsEmail({}, { message: 'El email debe ser válido' })
  email?: string

  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  nombre?: string

  @IsOptional()
  @IsEnum(UserRole, { message: 'El rol debe ser ADMIN, EDITOR o VIEWER' })
  rol?: UserRole

  @IsOptional()
  @IsString()
  avatar?: string

  @IsOptional()
  @IsBoolean()
  activo?: boolean
}

export class ChangePasswordDto {
  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/, {
    message:
      'La contraseña debe contener al menos una mayúscula, una minúscula, un número y un carácter especial (!@#$%^&*)',
  })
  newPassword!: string
}

export class AdminResetPasswordDto {
  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  newPassword!: string
}

