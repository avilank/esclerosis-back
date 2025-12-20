import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Usuario } from 'src/modules/usuarios/entities/usuario.entity';
import { Rol } from 'src/modules/auth/roles/entities/role.entity';
import { Repository } from 'typeorm';
import { LoginDto, RegisterDto } from '../dto';
import { BcryptUtils } from 'src/common/utils/bcrypt';
import { JwtUtil } from 'src/common/utils/jwt';
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Usuario)
    private usuarioRepository: Repository<Usuario>,
    private jwtUtil: JwtUtil,
    @InjectRepository(Rol)
    private rolRepository: Repository<Rol>,
  ) {}

  async login(loginDto: LoginDto) {
    const usuario = await this.usuarioRepository.findOne({
      where: { email: loginDto.email, estado: true },
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
    const payload = {
      id: usuario.idUsuario,
      email: usuario.email,
      username: usuario.username,
      rol: usuario.rol?.nombre || '',
    };
    const token = await this.jwtUtil.generateToken(payload);

    return { token, user: payload };
  }
  async register(registerDto: RegisterDto) {
    const usuario = await this.usuarioRepository.findOne({
      where: { email: registerDto.email },
    });
    if (usuario) {
      throw new BadRequestException('El email ya está registrado');
    }
    const hashedPassword = await BcryptUtils.hashPassword(registerDto.password);
    const newUsuario = this.usuarioRepository.create({
      ...registerDto,
      username: registerDto.username,
      password: hashedPassword,
    });
    const rol = await this.rolRepository.findOne({
      where: { nombre: 'paciente' },
    });
    if (!rol) {
      throw new NotFoundException('Rol no encontrado');
    }
    newUsuario.idRol = rol.idRol;
    const savedUsuario = await this.usuarioRepository.save(newUsuario);
    const payload = {
      id: savedUsuario.idUsuario,
      email: savedUsuario.email,
      username: savedUsuario.username,
      rol: savedUsuario.rol?.nombre || '',
    };
    const token = await this.jwtUtil.generateToken(payload);
    return {
      id: savedUsuario.idUsuario,
      email: savedUsuario.email,
      dni: '',
      rol: savedUsuario.rol?.nombre || '',
      token: token,
    };
  }
}
