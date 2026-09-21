import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePacienteDto } from './dto/create-paciente.dto';
import { UpdatePacienteDto } from './dto/update-paciente.dto';
import { CreatePacienteConUsuarioDto } from './dto/create-paciente-con-usuario.dto';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { Paciente } from './entities/paciente.entity';
import { DataSource, Repository } from 'typeorm';
import { Usuario } from '../usuarios/entities/usuario.entity';
import { Rol } from '../auth/roles/entities/role.entity';
import { HistoriaClinica } from '../historias-clinicas/entities/historias-clinica.entity';
import { ROL_PACIENTE } from 'src/common/constants/roles.constant';
import * as bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

@Injectable()
export class PacientesService {
  constructor(
    @InjectRepository(Paciente)
    private readonly pacienteRepository: Repository<Paciente>,
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    @InjectRepository(Rol)
    private readonly rolRepository: Repository<Rol>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Alta completa de un paciente: usuario (rol `paciente`) + ficha + historia
   * clínica, en UNA transacción.
   *
   * Es la vía de la secretaria. A diferencia de `UsuariosService.create` (que
   * compensa con borrados manuales si algo falla), acá si cualquier paso falla
   * no queda nada a medias.
   */
  async createConUsuario(dto: CreatePacienteConUsuarioDto) {
    const rolPaciente = await this.rolRepository.findOne({
      where: { nombre: ROL_PACIENTE },
    });
    if (!rolPaciente) {
      throw new NotFoundException(
        `Rol "${ROL_PACIENTE}" no encontrado. Ejecutá "npm run seed".`,
      );
    }

    const emailEnUso = await this.usuarioRepository.findOne({
      where: { email: dto.email },
    });
    if (emailEnUso) throw new ConflictException('Email ya en uso');

    const usernameEnUso = await this.usuarioRepository.findOne({
      where: { username: dto.username },
    });
    if (usernameEnUso) throw new ConflictException('Username ya en uso');

    const dniEnUso = await this.pacienteRepository.findOne({
      where: { dniPaciente: dto.dniPaciente },
    });
    if (dniEnUso) {
      throw new ConflictException('Ya existe un paciente con este DNI');
    }

    const hashed = await bcrypt.hash(dto.password, SALT_ROUNDS);

    const idUsuario = await this.dataSource.transaction(async (manager) => {
      const usuario = await manager.save(
        manager.create(Usuario, {
          username: dto.username,
          email: dto.email,
          password: hashed,
          estado: true,
          idRol: rolPaciente.idRol,
        }),
      );

      await manager.save(
        manager.create(Paciente, {
          idPaciente: usuario.idUsuario,
          dniPaciente: dto.dniPaciente,
          nombrePaciente: dto.nombrePaciente,
          edadPaciente: dto.edadPaciente,
          generoPaciente: dto.generoPaciente,
          direccionPaciente: dto.direccionPaciente,
          telefonoPaciente: dto.telefonoPaciente,
          fechaNacimiento: dto.fechaNacimiento,
        }),
      );

      await manager.save(
        manager.create(HistoriaClinica, {
          idPaciente: usuario.idUsuario,
          estado: 'activa',
        }),
      );

      return usuario.idUsuario;
    });

    // Se devuelve la ficha con la historia ya cargada: la app la usa para
    // agendar la cita sin una segunda consulta.
    return this.findOne(idUsuario);
  }

  async create(createPacienteDto: CreatePacienteDto) {
    const paciente = await this.pacienteRepository.findOne({
      where: { dniPaciente: createPacienteDto.dniPaciente, isActive: true },
    });
    if (paciente) {
      throw new BadRequestException('Paciente ya existe');
    }
    return await this.pacienteRepository.save(createPacienteDto);
  }

  async findAll() {
    return await this.pacienteRepository
      .createQueryBuilder('paciente')
      .leftJoinAndSelect('paciente.usuario', 'usuario')
      .leftJoinAndSelect(
        'paciente.historiaClinica',
        'historiaClinica',
        'historiaClinica.isActive = :isActive',
        { isActive: true },
      )
      .where('paciente.isActive = :isActive', { isActive: true })
      .getMany();
  }

  async findOne(id: number) {
    return await this.pacienteRepository
      .createQueryBuilder('paciente')
      .leftJoinAndSelect('paciente.usuario', 'usuario')
      .leftJoinAndSelect(
        'paciente.historiaClinica',
        'historiaClinica',
        'historiaClinica.isActive = :isActive',
        { isActive: true },
      )
      .where('paciente.idPaciente = :id AND paciente.isActive = :isActive', {
        id,
        isActive: true,
      })
      .getOne();
  }

  async update(id: number, updatePacienteDto: UpdatePacienteDto) {
    const paciente = await this.pacienteRepository.findOne({
      where: { idPaciente: id, isActive: true },
    });
    if (!paciente) {
      throw new BadRequestException('Paciente no encontrado');
    }
    return await this.pacienteRepository.save({
      ...paciente,
      ...updatePacienteDto,
    });
  }

  async remove(id: number) {
    const paciente = await this.pacienteRepository.findOne({
      where: { idPaciente: id, isActive: true },
    });
    if (!paciente) {
      throw new BadRequestException('Paciente no encontrado');
    }
    return await this.pacienteRepository.update(id, { isActive: false });
  }
}
