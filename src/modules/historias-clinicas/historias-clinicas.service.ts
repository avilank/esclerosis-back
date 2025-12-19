import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HistoriaClinica } from './entities/historias-clinica.entity';
import { Paciente } from '../pacientes/entities/paciente.entity';
import { Medico } from '../medicos/entities/medico.entity';
import { CreateHistoriasClinicaDto } from './dto/create-historias-clinica.dto';
import { UpdateHistoriasClinicaDto } from './dto/update-historias-clinica.dto';

@Injectable()
export class HistoriasClinicasService {
  constructor(
    @InjectRepository(HistoriaClinica)
    private readonly historiaClinicaRepository: Repository<HistoriaClinica>,
    @InjectRepository(Paciente)
    private readonly pacienteRepository: Repository<Paciente>,
    @InjectRepository(Medico)
    private readonly medicoRepository: Repository<Medico>,
  ) { }

  async create(
    createHistoriasClinicaDto: CreateHistoriasClinicaDto,
  ): Promise<HistoriaClinica> {
    // Verificar que el paciente existe
    const paciente = await this.pacienteRepository.findOne({
      where: { idPaciente: createHistoriasClinicaDto.idPaciente, isActive: true },
    });

    if (!paciente) {
      throw new NotFoundException(
        `Paciente con ID ${createHistoriasClinicaDto.idPaciente} no encontrado`,
      );
    }

    // Verificar si el paciente ya tiene una historia clínica
    const historiaExistente = await this.historiaClinicaRepository.findOne({
      where: { idPaciente: createHistoriasClinicaDto.idPaciente, isActive: true },
    });

    if (historiaExistente) {
      throw new ConflictException(
        'Este paciente ya tiene una historia clínica asociada',
      );
    }

    const historiaClinica = this.historiaClinicaRepository.create({
      ...createHistoriasClinicaDto,
      estado: createHistoriasClinicaDto.estado || 'activa',
    });

    const saved = await this.historiaClinicaRepository.save(historiaClinica);

    // Retornar con las relaciones cargadas
    const historiaClinicaConRelaciones = await this.historiaClinicaRepository.findOne({
      where: { idHistoriaClinica: saved.idHistoriaClinica },
      relations: ['paciente', 'diagnosticos'],
    });

    if (!historiaClinicaConRelaciones) {
      throw new NotFoundException(
        `Error al crear la historia clínica con ID ${saved.idHistoriaClinica}`,
      );
    }

    return historiaClinicaConRelaciones;
  }

  async findAll(): Promise<HistoriaClinica[]> {
    return await this.historiaClinicaRepository.find({
      where: { isActive: true },
      relations: ['paciente', 'diagnosticos'],
      order: { idHistoriaClinica: 'DESC' },
    });
  }

  async findOne(id: number): Promise<HistoriaClinica> {
    const historiaClinica = await this.historiaClinicaRepository.findOne({
      where: { idHistoriaClinica: id, isActive: true },
      relations: ['paciente', 'diagnosticos', 'diagnosticos.medico'],
    });

    if (!historiaClinica) {
      throw new NotFoundException(
        `Historia clínica con ID ${id} no encontrada`,
      );
    }

    return historiaClinica;
  }

  async findByPaciente(idPaciente: number): Promise<HistoriaClinica | null> {
    return await this.historiaClinicaRepository.findOne({
      where: { idPaciente, isActive: true },
      relations: ['paciente', 'diagnosticos', 'diagnosticos.medico'],
    });
  }

  async update(
    id: number,
    updateHistoriasClinicaDto: UpdateHistoriasClinicaDto,
  ): Promise<HistoriaClinica> {
    const historiaClinica = await this.findOne(id);

    // Si se actualiza el paciente, verificar que existe
    if (updateHistoriasClinicaDto.idPaciente) {
      const paciente = await this.pacienteRepository.findOne({
        where: { idPaciente: updateHistoriasClinicaDto.idPaciente, isActive: true },
      });

      if (!paciente) {
        throw new NotFoundException(
          `Paciente con ID ${updateHistoriasClinicaDto.idPaciente} no encontrado`,
        );
      }

      // Verificar que no exista otra historia clínica para ese paciente
      const historiaExistente = await this.historiaClinicaRepository.findOne({
        where: {
          idPaciente: updateHistoriasClinicaDto.idPaciente,
          isActive: true,
        },
      });

      if (historiaExistente && historiaExistente.idHistoriaClinica !== id) {
        throw new ConflictException(
          'Ya existe una historia clínica para este paciente',
        );
      }
    }

    // Convertir fecha si viene como string
    if (updateHistoriasClinicaDto.fechaIngreso) {
      updateHistoriasClinicaDto.fechaIngreso = new Date(
        updateHistoriasClinicaDto.fechaIngreso,
      ) as any;
    }

    Object.assign(historiaClinica, updateHistoriasClinicaDto);
    const saved = await this.historiaClinicaRepository.save(historiaClinica);

    return await this.findOne(saved.idHistoriaClinica);
  }

  async remove(id: number): Promise<void> {
    const historiaClinica = await this.findOne(id);
    await this.historiaClinicaRepository.update(id, { isActive: false });
  }

  //Adicionales
  //Busqueda de historias clinicas por nombre o dni del paciente
  async search(term: string): Promise<HistoriaClinica[]> {
    const clean = term?.trim();

    // Evitar búsquedas con 1 o 2 letras
    if (!clean || clean.length < 3) return [];
    const searchTerm = `%${clean}%`;
    return await this.historiaClinicaRepository
      .createQueryBuilder('hc')
      .leftJoinAndSelect('hc.paciente', 'paciente')
      .leftJoinAndSelect('hc.diagnosticos', 'diagnosticos')
      .where(
        '(paciente.nombrePaciente ILIKE :term OR paciente.dniPaciente ILIKE :term)',
        { term: searchTerm }
      )
      .andWhere('hc.isActive = :isActive', { isActive: true })
      .orderBy('hc.idHistoriaClinica', 'DESC')
      .getMany();
  }

  async findMedicoHistoriaClinica(idMedico: number): Promise<HistoriaClinica[]> {

    const medico = await this.medicoRepository.findOne({
      where: { idMedico, isActive: true },
    });

    if (!medico) {
      throw new NotFoundException(
        `Médico con ID ${idMedico} no encontrado`,
      );
    }

    return await this.historiaClinicaRepository
      .createQueryBuilder('hc')
      .leftJoinAndSelect('hc.paciente', 'paciente')
      .leftJoinAndSelect('hc.diagnosticos', 'diagnosticos')
      .leftJoinAndSelect('diagnosticos.medico', 'medico')
      .where('diagnosticos.idMedico = :idMedico', { idMedico })
      .andWhere('hc.isActive = :isActive', { isActive: true })
      .orderBy('hc.idHistoriaClinica', 'DESC')
      .getMany();
  }

  // Búsqueda de historias clínicas por nombre o dni del paciente, filtradas por médico
  async searchByMedico(term: string, idMedico: number): Promise<HistoriaClinica[]> {
    const clean = term?.trim();

    // Evitar búsquedas con 1 o 2 letras
    if (!clean || clean.length < 3) return [];

    // Verificar que el médico existe
    const medico = await this.medicoRepository.findOne({
      where: { idMedico, isActive: true },
    });

    if (!medico) {
      throw new NotFoundException(
        `Médico con ID ${idMedico} no encontrado`,
      );
    }

    const searchTerm = `%${clean}%`;

    return await this.historiaClinicaRepository
      .createQueryBuilder('hc')
      .leftJoinAndSelect('hc.paciente', 'paciente')
      .leftJoinAndSelect('hc.diagnosticos', 'diagnosticos')
      .leftJoinAndSelect('diagnosticos.medico', 'medico')
      .where(
        '(paciente.nombrePaciente ILIKE :term OR paciente.dniPaciente ILIKE :term)',
        { term: searchTerm }
      )
      .andWhere('diagnosticos.idMedico = :idMedico', { idMedico })
      .andWhere('hc.isActive = :isActive', { isActive: true })
      .orderBy('hc.idHistoriaClinica', 'DESC')
      .getMany();
  }

}
