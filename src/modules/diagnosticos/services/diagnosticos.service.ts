import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Diagnostico } from 'src/modules/models/models';
import { HistoriaClinica } from 'src/modules/models/models';
import { Medico } from 'src/modules/models/models';
import { CreateDiagnosticoDto } from '../dto/create-diagnostico.dto';
import { UpdateDiagnosticoDto } from '../dto/update-diagnostico.dto';

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
      where: { idHistoriaClinica: createDiagnosticoDto.idhistoriaClinica, isActive: true },
    });

    if (!historiaClinica) {
      throw new NotFoundException(
        `Historia clínica con ID ${createDiagnosticoDto.idhistoriaClinica} no encontrada`,
      );
    }

    // Verificar que el médico existe
    const medico = await this.medicoRepository.findOne({
      where: { idMedico: createDiagnosticoDto.idMedico, isActive: true },
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
      relations: [
        'historiaClinica',
        'historiaClinica.paciente',
        'medico',
        'recetas',
        'recetas.tratamiento',
        'IndicadoresClinicos',
        'IndicadoresClinicos.indicadorClinico',
        'IndicadoresClinicos.indicadorClinico.categoriaIndicador',
      ],
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
      where: { isActive: true },
      relations: [
        'historiaClinica',
        'historiaClinica.paciente',
        'medico',
        'recetas',
        'recetas.tratamiento',
        'IndicadoresClinicos',
        'IndicadoresClinicos.indicadorClinico',
        'IndicadoresClinicos.indicadorClinico.categoriaIndicador',
      ],
      order: { fechaDiagnostico: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Diagnostico> {
    const diagnostico = await this.diagnosticoRepository.findOne({
      where: { idDiagnostico: id, isActive: true },
      relations: [
        'historiaClinica',
        'historiaClinica.paciente',
        'medico',
        'recetas',
        'recetas.tratamiento',
        'IndicadoresClinicos',
        'IndicadoresClinicos.indicadorClinico',
        'IndicadoresClinicos.indicadorClinico.categoriaIndicador',
      ],
    });

    if (!diagnostico) {
      throw new NotFoundException(`Diagnóstico con ID ${id} no encontrado`);
    }

    return diagnostico;
  }

  async findByHistoriaClinica(idHistoriaClinica: number): Promise<Diagnostico[]> {
    return await this.diagnosticoRepository.find({
      where: { idhistoriaClinica: idHistoriaClinica, isActive: true },
      relations: [
        'medico',
        'recetas',
        'recetas.tratamiento',
        'IndicadoresClinicos',
        'IndicadoresClinicos.indicadorClinico',
        'IndicadoresClinicos.indicadorClinico.categoriaIndicador',
      ],
      order: { fechaDiagnostico: 'DESC' },
    });
  }

  async findByMedico(idMedico: number): Promise<Diagnostico[]> {
    return await this.diagnosticoRepository.find({
      where: { idMedico, isActive: true },
      relations: [
        'historiaClinica',
        'historiaClinica.paciente',
        'recetas',
        'recetas.tratamiento',
        'IndicadoresClinicos',
        'IndicadoresClinicos.indicadorClinico',
        'IndicadoresClinicos.indicadorClinico.categoriaIndicador',
      ],
      order: { fechaDiagnostico: 'DESC' },
    });
  }

  async getStatsByMedico(idMedico: number) {
    // Traer diagnósticos igual que findByMedico
    const diagnosticos = await this.diagnosticoRepository.find({
      where: { idMedico, isActive: true },
      relations: [
        'historiaClinica',
        'historiaClinica.paciente',
        'recetas',
        'recetas.tratamiento',
        'IndicadoresClinicos',
        'IndicadoresClinicos.indicadorClinico',
      ],
      order: { fechaDiagnostico: 'DESC' },
    });

    // Todos los diagnósticos del médico
    const total = diagnosticos.length;

    // Diagnósticos críticos
    const criticos = diagnosticos.filter(d => d.estadoSalud === 'crítico').length;

    // Diagnósticos críticos
    const controlados = diagnosticos.filter(d => d.estadoSalud !== 'crítico').length;

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

  async getStatsByPaciente(idPaciente: number) {
    // Buscar la historia clínica del paciente
    const historiaClinica = await this.historiaClinicaRepository.findOne({
      where: { idPaciente, isActive: true },
      relations: ['paciente'],
    });

    if (!historiaClinica) {
      return {
        totalDiagnosticos: 0,
        tratamientoActual: null,
      };
    }

    // Traer todos los diagnósticos del paciente ordenados por fecha descendente
    // Incluir recetas y tratamiento de cada receta
    const diagnosticos = await this.diagnosticoRepository.find({
      where: { idhistoriaClinica: historiaClinica.idHistoriaClinica, isActive: true },
      relations: [
        'recetas',
        'recetas.tratamiento',
        'medico',
      ],
      order: { fechaDiagnostico: 'DESC' },
    });

    // Total de diagnósticos
    const totalDiagnosticos = diagnosticos.length;

    // Obtener la última receta según fecha de todas las recetas del paciente
    // Recopilar todas las recetas de todos los diagnósticos
    const todasLasRecetas: Array<{ receta: any; fechaReceta: Date }> = [];

    for (const diagnostico of diagnosticos) {
      const diagnosticoCompleto = await this.diagnosticoRepository.findOne({
        where: { idDiagnostico: diagnostico.idDiagnostico, isActive: true },
        relations: [
          'recetas',
          'recetas.tratamiento',
        ],
      });

      if (diagnosticoCompleto?.recetas && diagnosticoCompleto.recetas.length > 0) {
        diagnosticoCompleto.recetas.forEach(receta => {
          todasLasRecetas.push({
            receta,
            fechaReceta: receta.fechaReceta instanceof Date
              ? receta.fechaReceta
              : new Date(receta.fechaReceta),
          });
        });
      }
    }

    // Ordenar todas las recetas por fecha descendente y tomar la primera
    todasLasRecetas.sort((a, b) =>
      b.fechaReceta.getTime() - a.fechaReceta.getTime()
    );

    let tratamientoActual: { nombre: string; contenido: string; fechaReceta: string } | null = null;

    if (todasLasRecetas.length > 0) {
      const ultimaReceta = todasLasRecetas[0].receta;

      if (ultimaReceta?.tratamiento) {
        tratamientoActual = {
          nombre: ultimaReceta.tratamiento.nombre,
          contenido: ultimaReceta.contenido || '',
          fechaReceta: ultimaReceta.fechaReceta instanceof Date
            ? ultimaReceta.fechaReceta.toISOString().split('T')[0]
            : new Date(ultimaReceta.fechaReceta).toISOString().split('T')[0],
        };
      }
    }

    return {
      totalDiagnosticos,
      tratamientoActual,
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
        where: { idHistoriaClinica: updateDiagnosticoDto.idhistoriaClinica, isActive: true },
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
        where: { idMedico: updateDiagnosticoDto.idMedico, isActive: true },
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
    await this.diagnosticoRepository.update(id, { isActive: false });
  }
}
