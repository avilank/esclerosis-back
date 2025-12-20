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
  ) {}

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
