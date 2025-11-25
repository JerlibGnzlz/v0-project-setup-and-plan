import { IsEmail, IsString, MinLength } from "class-validator"

export class RequestPasswordResetDto {
  @IsEmail()
  email: string
}

export class ResetPasswordDto {
  @IsString()
  token: string

  @IsString()
  @MinLength(6, { message: "La contraseña debe tener al menos 6 caracteres" })
  password: string
}

