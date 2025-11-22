import { AuthService } from "./auth.service";
import { LoginDto, RegisterDto } from "./dto/auth.dto";
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
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
    getProfile(req: any): Promise<any>;
}
