import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './services/authentication.service';
import { AuthController } from './controllers/authentication.controller';
import { Usuario } from '../../usuarios/entities/usuario.entity';
import { JwtUtil } from '../../../common/utils/jwt';
import { jwtConfig } from '../../../config/jwt.config';
import { Rol } from '../roles/entities/role.entity';
@Module({
  imports: [
    TypeOrmModule.forFeature([Usuario, Rol]),
    JwtModule.registerAsync(jwtConfig),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtUtil],
  exports: [AuthService],
})
export class AuthenticationModule { }

