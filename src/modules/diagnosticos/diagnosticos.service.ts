import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Diagnostico } from './entities/diagnostico.entity';
import { HistoriaClinica } from '../historias-clinicas/entities/historias-clinica.entity';
import { Medico } from '../medicos/entities/medico.entity';
import { CreateDiagnosticoDto } from './dto/create-diagnostico.dto';
import { UpdateDiagnosticoDto } from './dto/update-diagnostico.dto';

@Injectable()
export class DiagnosticosService {
  constructor(
    @InjectRepository(Diagnostico)
    private readonly diagnosticoRepository: Repository<Diagnostico>,
    @InjectRepository(HistoriaClinica)
    private readonly historiaClinicaRepository: Repository<HistoriaClinica>,
    @InjectRepository(Medico)
    private readonly medicoRepository: Repository<Medico>,
  ) { }

  async create(createDiagnosticoDto: CreateDiagnosticoDto): Promise<Diagnostico> {
    // Verificar que la historia clínica existe
    const historiaClinica = await this.historiaClinicaRepository.findOne({
      where: { idHistoriaClinica: createDiagnosticoDto.idhistoriaClinica },
    });

    if (!historiaClinica) {
      throw new NotFoundException(
        `Historia clínica con ID ${createDiagnosticoDto.idhistoriaClinica} no encontrada`,
      );
    }

    // Verificar que el médico existe
    const medico = await this.medicoRepository.findOne({
      where: { idMedico: createDiagnosticoDto.idMedico },
    });

    if (!medico) {
      throw new NotFoundException(
        `Médico con ID ${createDiagnosticoDto.idMedico} no encontrado`,
      );
    }

    const diagnostico = this.diagnosticoRepository.create({
      ...createDiagnosticoDto,
      fechaDiagnostico: new Date(createDiagnosticoDto.fechaDiagnostico),
      es_diagnostico_inicial:
        createDiagnosticoDto.es_diagnostico_inicial || false,
    });

    const saved = await this.diagnosticoRepository.save(diagnostico);

    // Retornar con las relaciones cargadas
    const diagnosticoConRelaciones = await this.diagnosticoRepository.findOne({
      where: { idDiagnostico: saved.idDiagnostico },
      relations: ['historiaClinica', 'medico', 'recetas', 'indicadoresClinicosDiagnostico'],
    });

    if (!diagnosticoConRelaciones) {
      throw new NotFoundException(
        `Error al crear el diagnóstico con ID ${saved.idDiagnostico}`,
      );
    }

    return diagnosticoConRelaciones;
  }

  async findAll(): Promise<Diagnostico[]> {
    return await this.diagnosticoRepository.find({
      relations: ['historiaClinica', 'medico', 'recetas'],
      order: { fechaDiagnostico: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Diagnostico> {
    const diagnostico = await this.diagnosticoRepository.findOne({
      where: { idDiagnostico: id },
      relations: [
        'historiaClinica',
        'historiaClinica.paciente',
        'medico',
        'recetas',
        'indicadoresClinicosDiagnostico',
        'indicadoresClinicosDiagnostico.indicadorClinico',
      ],
    });

    if (!diagnostico) {
      throw new NotFoundException(`Diagnóstico con ID ${id} no encontrado`);
    }

    return diagnostico;
  }

  async findByHistoriaClinica(idHistoriaClinica: number): Promise<Diagnostico[]> {
    return await this.diagnosticoRepository.find({
      where: { idhistoriaClinica: idHistoriaClinica },
      relations: ['medico', 'recetas'],
      order: { fechaDiagnostico: 'DESC' },
    });
  }

  async findByMedico(idMedico: number): Promise<Diagnostico[]> {
    return await this.diagnosticoRepository.find({
      where: { idMedico },
      relations: ['historiaClinica', 'historiaClinica.paciente'],
      order: { fechaDiagnostico: 'DESC' },
    });
  }

  async getStatsByMedico(idMedico: number) {
    // Traer diagnósticos igual que findByMedico
    const diagnosticos = await this.diagnosticoRepository.find({
      where: { idMedico },
      relations: ['historiaClinica', 'historiaClinica.paciente'],
      order: { fechaDiagnostico: 'DESC' },
    });
  
    // Todos los diagnósticos del médico
    const total = diagnosticos.length;
  
    // Diagnósticos críticos
    const criticos = diagnosticos.filter(d => d.estadoSalud === 'critico').length;

    // Diagnósticos críticos
    const controlados = diagnosticos.filter(d => d.estadoSalud !== 'critico').length;
  
    // Diagnósticos iniciales
    const iniciales = diagnosticos.filter(d => d.es_diagnostico_inicial).length;
  
    return {
      total,
      criticos,
      controlados,
      iniciales,
      diagnosticos, // opcional: para ver todo en consola
    };
  }
  

  
  

  async update(
    id: number,
    updateDiagnosticoDto: UpdateDiagnosticoDto,
  ): Promise<Diagnostico> {
    const diagnostico = await this.findOne(id);

    // Si se actualiza la historia clínica, verificar que existe
    if (updateDiagnosticoDto.idhistoriaClinica) {
      const historiaClinica = await this.historiaClinicaRepository.findOne({
        where: { idHistoriaClinica: updateDiagnosticoDto.idhistoriaClinica },
      });

      if (!historiaClinica) {
        throw new NotFoundException(
          `Historia clínica con ID ${updateDiagnosticoDto.idhistoriaClinica} no encontrada`,
        );
      }
    }

    // Si se actualiza el médico, verificar que existe
    if (updateDiagnosticoDto.idMedico) {
      const medico = await this.medicoRepository.findOne({
        where: { idMedico: updateDiagnosticoDto.idMedico },
      });

      if (!medico) {
        throw new NotFoundException(
          `Médico con ID ${updateDiagnosticoDto.idMedico} no encontrado`,
        );
      }
    }

    // Convertir fecha si viene como string
    if (updateDiagnosticoDto.fechaDiagnostico) {
      updateDiagnosticoDto.fechaDiagnostico = new Date(
        updateDiagnosticoDto.fechaDiagnostico,
      ) as any;
    }

    Object.assign(diagnostico, updateDiagnosticoDto);
    const saved = await this.diagnosticoRepository.save(diagnostico);

    return await this.findOne(saved.idDiagnostico);
  }

  async remove(id: number): Promise<void> {
    const diagnostico = await this.findOne(id);
    await this.diagnosticoRepository.remove(diagnostico);
  }
}
