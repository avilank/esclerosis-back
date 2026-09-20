import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

/** Datos que se firman en el token (sin `iat`/`exp`, que los pone jsonwebtoken). */
type JwtClaims = Pick<JwtPayload, 'id' | 'email' | 'username' | 'rol'>;

@Injectable()
export class JwtUtil {
  constructor(private readonly jwtService: JwtService) {}

  generateToken(payload: JwtClaims): Promise<string> {
    return this.jwtService.signAsync(payload);
  }

  verifyToken(token: string): Promise<JwtPayload> {
    return this.jwtService.verifyAsync<JwtPayload>(token);
  }

  decodeToken(token: string): JwtPayload | null {
    return this.jwtService.decode<JwtPayload | null>(token);
  }
}
