import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "../../prisma/prisma.service";
import { LoginDto, RegisterDto } from "./dto/auth.dto";
export declare class AuthService {
    private prisma;
    private jwtService;
    constructor(prisma: PrismaService, jwtService: JwtService);
    register(dto: RegisterDto): Promise<{
        user: {
            id: string;
            email: string;
            name: string;
            role: import(".prisma/client").$Enums.UserRole;
        };
        token: string;
    }>;
    login(dto: LoginDto): Promise<{
        user: {
            id: string;
            email: string;
            name: string;
            role: import(".prisma/client").$Enums.UserRole;
        };
        token: string;
    }>;
    private generateToken;
    validateUser(userId: string): Promise<{
        email: string;
        id: string;
        nombre: string;
        rol: import(".prisma/client").$Enums.UserRole;
    }>;
}
