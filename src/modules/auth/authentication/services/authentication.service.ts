import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Usuario } from 'src/modules/usuarios/entities/usuario.entity';
import { Repository } from 'typeorm';
import { LoginDto } from '../dto/login.dto';
import { BcryptUtils } from 'src/common/utils/bcrypt';
import { JwtUtil } from 'src/common/utils/jwt';
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Usuario)
    private usuarioRepository: Repository<Usuario>,
    private jwtUtil: JwtUtil,
  ) { }

  async login(loginDto: LoginDto) {
    const usuario = await this.usuarioRepository.findOne({
      where: { email: loginDto.email },
      relations: ['rol'],
    });

    if (!usuario) {
      throw new NotFoundException('Usuario o contraseña incorrectos');
    }

    const isPasswordValid = await BcryptUtils.comparePassword(
      loginDto.password,
      usuario.password,
    );

    if (!isPasswordValid) {
      throw new NotFoundException('Usuario o contraseña incorrectos');
    }

    const token = await this.jwtUtil.generateToken({
      id: usuario.idUsuario,
      email: usuario.email,
      dni: '',
      rol: usuario.rol?.nombre || '',
    });

    return { token };
  }
}
