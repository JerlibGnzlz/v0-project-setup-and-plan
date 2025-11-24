import { Controller, Post, UseGuards, Get, Request, Body, Patch } from "@nestjs/common"
import { AuthService } from "./auth.service"
import { LoginDto, RegisterDto } from "./dto/auth.dto"
import { RequestPasswordResetDto, ResetPasswordDto } from "./dto/password-reset.dto"
import { JwtAuthGuard } from "./guards/jwt-auth.guard"

@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) { }

  @Post("register")
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto)
  }

  @Post("login")
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto)
  }

  @UseGuards(JwtAuthGuard)
  @Get("me")
  async getProfile(@Request() req) {
    return {
      id: req.user.id,
      email: req.user.email,
      nombre: req.user.nombre,
      rol: req.user.rol,
    }
  }

  @Post("forgot-password")
  async requestPasswordReset(@Body() dto: RequestPasswordResetDto) {
    return this.authService.requestPasswordReset(dto)
  }

  @Post("reset-password")
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto)
  }

  @UseGuards(JwtAuthGuard)
  @Patch("change-password")
  async changePassword(@Request() req, @Body() body: { oldPassword: string; newPassword: string }) {
    return this.authService.changePassword(req.user.id, body.oldPassword, body.newPassword)
  }
}
