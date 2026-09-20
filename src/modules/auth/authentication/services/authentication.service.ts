import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Usuario } from 'src/modules/usuarios/entities/usuario.entity';
import { Rol } from 'src/modules/auth/roles/entities/role.entity';
import { Paciente } from 'src/modules/pacientes/entities/paciente.entity';
import { HistoriaClinica } from 'src/modules/historias-clinicas/entities/historias-clinica.entity';
import { LoginDto, RegisterDto } from '../dto';
import { BcryptUtils } from 'src/common/utils/bcrypt';
import { JwtUtil } from 'src/common/utils/jwt';
import { ROL_PACIENTE } from 'src/common/constants/roles.constant';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Usuario)
    private usuarioRepository: Repository<Usuario>,
    private jwtUtil: JwtUtil,
    @InjectRepository(Rol)
    private rolRepository: Repository<Rol>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async login(loginDto: LoginDto) {
    // `password` es `select: false` en la entidad, asi que hay que pedirlo
    // explicitamente solo aca.
    const usuario = await this.usuarioRepository
      .createQueryBuilder('usuario')
      .leftJoinAndSelect('usuario.rol', 'rol')
      .addSelect('usuario.password')
      .where('usuario.email = :email AND usuario.estado = :estado', {
        email: loginDto.email,
        estado: true,
      })
      .getOne();

    // 401 (no 404) y mensaje generico: no revelamos si el email existe.
    if (!usuario) {
      throw new UnauthorizedException('Usuario o contraseña incorrectos');
    }

    const isPasswordValid = await BcryptUtils.comparePassword(
      loginDto.password,
      usuario.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Usuario o contraseña incorrectos');
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

  /**
   * Auto-registro: siempre crea un usuario con rol `paciente`, y ademas su
   * ficha de `paciente` y su `historia_clinica`, igual que
   * `UsuariosService.create`. Antes solo creaba la fila de `usuario`, con lo
   * cual la cuenta entraba a la app pero su historia clinica nunca existia.
   */
  async register(registerDto: RegisterDto) {
    const existente = await this.usuarioRepository.findOne({
      where: { email: registerDto.email },
    });
    if (existente) {
      throw new BadRequestException('El email ya está registrado');
    }

    const usernameEnUso = await this.usuarioRepository.findOne({
      where: { username: registerDto.username },
    });
    if (usernameEnUso) {
      throw new BadRequestException('El nombre de usuario ya está en uso');
    }

    const rol = await this.rolRepository.findOne({
      where: { nombre: ROL_PACIENTE },
    });
    if (!rol) {
      throw new NotFoundException(
        `Rol "${ROL_PACIENTE}" no encontrado. Ejecutá "npm run seed".`,
      );
    }

    const hashedPassword = await BcryptUtils.hashPassword(registerDto.password);

    // Transaccion: sin esto, un fallo al crear paciente/historia dejaba un
    // usuario huerfano sin historia clinica.
    const savedUsuario = await this.dataSource.transaction(async (manager) => {
      const usuario = manager.create(Usuario, {
        username: registerDto.username,
        email: registerDto.email,
        password: hashedPassword,
        estado: true,
        idRol: rol.idRol,
      });
      const guardado = await manager.save(usuario);

      await manager.save(
        manager.create(Paciente, {
          idPaciente: guardado.idUsuario,
          // Los datos clinicos se completan luego desde el modulo de usuarios;
          // el DNI se deja con un placeholder unico para respetar el UNIQUE.
          dniPaciente: `PENDIENTE-${guardado.idUsuario}`,
          nombrePaciente: registerDto.username,
          edadPaciente: 0,
          generoPaciente: 'No especificado',
          fechaNacimiento: new Date().toISOString().substring(0, 10),
        }),
      );

      await manager.save(
        manager.create(HistoriaClinica, {
          idPaciente: guardado.idUsuario,
          estado: 'activa',
        }),
      );

      return guardado;
    });

    const payload = {
      id: savedUsuario.idUsuario,
      email: savedUsuario.email,
      username: savedUsuario.username,
      // Antes se leia `savedUsuario.rol`, que no venia cargado: el token se
      // firmaba con rol vacio.
      rol: rol.nombre,
    };
    const token = await this.jwtUtil.generateToken(payload);

    return { token, user: payload };
  }
}
