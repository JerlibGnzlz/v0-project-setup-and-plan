import { Controller, Post, UseGuards, Get, Request, Body } from "@nestjs/common"
import { AuthService } from "./auth.service"
import { LoginDto, RegisterDto, RefreshTokenDto, RegisterDeviceDto } from "./dto/auth.dto"
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

  // Endpoint para mobile: login con refresh token
  @Post("login/mobile")
  async loginMobile(@Body() dto: LoginDto) {
    return this.authService.loginMobile(dto)
  }

  // Endpoint para refresh token (mobile)
  @Post("refresh")
  async refreshToken(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshAccessToken(dto.refreshToken)
  }

  // Endpoint para registrar dispositivo (notificaciones push)
  @UseGuards(JwtAuthGuard)
  @Post("device/register")
  async registerDevice(@Request() req, @Body() dto: RegisterDeviceDto) {
    return this.authService.registerDevice(req.user.id, dto)
  }

  @UseGuards(JwtAuthGuard)
  @Get("me")
  async getProfile(@Request() req) {
    return {
      id: req.user.id,
      email: req.user.email,
      nombre: req.user.nombre,
      rol: req.user.rol,
      avatar: req.user.avatar,
    }
  }
}
