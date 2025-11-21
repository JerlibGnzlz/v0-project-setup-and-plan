import { Controller, Post, UseGuards, Get } from "@nestjs/common"
import type { AuthService } from "./auth.service"
import type { LoginDto, RegisterDto } from "./dto/auth.dto"
import { JwtAuthGuard } from "./guards/jwt-auth.guard"

@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post("register")
  async register(dto: RegisterDto) {
    return this.authService.register(dto)
  }

  @Post("login")
  async login(dto: LoginDto) {
    return this.authService.login(dto)
  }

  @UseGuards(JwtAuthGuard)
  @Get("me")
  async getProfile(req) {
    return req.user
  }
}
