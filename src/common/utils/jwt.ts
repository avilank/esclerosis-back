import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
interface JwtPayload {
    id: number;
    email: string;
    dni: string;
    rol: string;
}
@Injectable()
export class JwtUtil {
    constructor(private readonly jwtService: JwtService) { }

    async generateToken(payload: JwtPayload) {
        return this.jwtService.signAsync(payload);
    }

    async verifyToken(token: string) {
        return this.jwtService.verifyAsync(token);
    }

    async decodeToken(token: string) {
        return this.jwtService.decode(token);
    }
}
