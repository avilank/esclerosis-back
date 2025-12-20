import { BadRequestException, Injectable } from '@nestjs/common';
import { CreatePacienteDto } from './dto/create-paciente.dto';
import { UpdatePacienteDto } from './dto/update-paciente.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Paciente } from './entities/paciente.entity';
import { Repository } from 'typeorm';
import { Usuario } from '../usuarios/entities/usuario.entity';

@Injectable()
export class PacientesService {
  constructor(
    @InjectRepository(Paciente)
    private readonly pacienteRepository: Repository<Paciente>,
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
  ) { }

  async create(createPacienteDto: CreatePacienteDto) {
    const paciente = await this.pacienteRepository.findOne({ where: { dniPaciente: createPacienteDto.dniPaciente, isActive: true } });
    if (paciente) {
      throw new BadRequestException('Paciente ya existe');
    }
    return await this.pacienteRepository.save(createPacienteDto);
  }

  async findAll() {
    // Filtrar pacientes activos y que su usuario también esté activo
    return await this.pacienteRepository
      .createQueryBuilder('paciente')
      .leftJoinAndSelect('paciente.usuario', 'usuario')
      .leftJoinAndSelect('paciente.historiaClinica', 'historiaClinica')
      .where('paciente.isActive = :isActive', { isActive: true })
      .andWhere('usuario.estado = :estado', { estado: true })
      .getMany();
  }

  async findOne(id: number) {
    const paciente = await this.pacienteRepository
      .createQueryBuilder('paciente')
      .leftJoinAndSelect('paciente.usuario', 'usuario')
      .leftJoinAndSelect('paciente.historiaClinica', 'historiaClinica')
      .where('paciente.idPaciente = :id', { id })
      .andWhere('paciente.isActive = :isActive', { isActive: true })
      .andWhere('usuario.estado = :estado', { estado: true })
      .getOne();
    
    if (!paciente) {
      throw new BadRequestException('Paciente no encontrado');
    }
    
    return paciente;
  }

  async update(id: number, updatePacienteDto: UpdatePacienteDto) {
    const paciente = await this.pacienteRepository.findOne({ where: { idPaciente: id, isActive: true } });
    if (!paciente) {
      throw new BadRequestException('Paciente no encontrado');
    }
    return await this.pacienteRepository.save({
      ...paciente,
      ...updatePacienteDto,
    });
  }

  async remove(id: number) {
    const paciente = await this.pacienteRepository.findOne({ where: { idPaciente: id, isActive: true } });
    if (!paciente) {
      throw new BadRequestException('Paciente no encontrado');
    }
    return await this.pacienteRepository.update(id, { isActive: false });
  }
}
