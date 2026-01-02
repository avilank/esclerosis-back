import { Injectable, NotFoundException } from '@nestjs/common';
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

  async create(
    createDiagnosticoDto: CreateDiagnosticoDto,
  ): Promise<Diagnostico> {
    // Verificar que la historia clínica existe
    const historiaClinica = await this.historiaClinicaRepository.findOne({
      where: {
        idHistoriaClinica: createDiagnosticoDto.idhistoriaClinica,
        isActive: true,
      },
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
    return await this.diagnosticoRepository
      .createQueryBuilder('diagnostico')
      .leftJoinAndSelect('diagnostico.historiaClinica', 'historiaClinica')
      .leftJoinAndSelect('historiaClinica.paciente', 'paciente')
      .leftJoinAndSelect(
        'diagnostico.medico',
        'medico',
      
      )
      .leftJoinAndSelect(
        'diagnostico.recetas',
        'recetas',
        'recetas.isActive = :isActive',
        { isActive: true },
      )
      .leftJoinAndSelect(
        'recetas.tratamiento',
        'tratamiento',
        'tratamiento.isActive = :isActive',
        { isActive: true },
      )
      .leftJoinAndSelect(
        'diagnostico.IndicadoresClinicos',
        'indicadoresClinicos',
      )
      .leftJoinAndSelect(
        'indicadoresClinicos.indicadorClinico',
        'indicadorClinico',
        'indicadorClinico.isActive = :isActive',
        { isActive: true },
      )
      .leftJoinAndSelect(
        'indicadorClinico.categoriaIndicador',
        'categoriaIndicador',
      )
      .where('diagnostico.isActive = :isActive', { isActive: true })
      .orderBy('diagnostico.fechaDiagnostico', 'DESC')
      .getMany();
  }

  async findOne(id: number): Promise<Diagnostico> {
    const diagnostico = await this.diagnosticoRepository
      .createQueryBuilder('diagnostico')
      .leftJoinAndSelect('diagnostico.historiaClinica', 'historiaClinica')
      .leftJoinAndSelect('historiaClinica.paciente', 'paciente')
      .leftJoinAndSelect(
        'diagnostico.medico',
        'medico'
      )
      .leftJoinAndSelect(
        'diagnostico.recetas',
        'recetas',
        'recetas.isActive = :isActive',
        { isActive: true },
      )
      .leftJoinAndSelect(
        'recetas.tratamiento',
        'tratamiento',
        'tratamiento.isActive = :isActive',
        { isActive: true },
      )
      .leftJoinAndSelect(
        'diagnostico.IndicadoresClinicos',
        'indicadoresClinicos',
      )
      .leftJoinAndSelect(
        'indicadoresClinicos.indicadorClinico',
        'indicadorClinico',
        'indicadorClinico.isActive = :isActive',
        { isActive: true },
      )
      .leftJoinAndSelect(
        'indicadorClinico.categoriaIndicador',
        'categoriaIndicador',
      )
      .where(
        'diagnostico.idDiagnostico = :id AND diagnostico.isActive = :isActive',
        { id, isActive: true },
      )
      .getOne();

    if (!diagnostico) {
      throw new NotFoundException(`Diagnóstico con ID ${id} no encontrado`);
    }

    return diagnostico;
  }

  async findByHistoriaClinica(
    idHistoriaClinica: number,
  ): Promise<Diagnostico[]> {
    return await this.diagnosticoRepository
      .createQueryBuilder('diagnostico')
      .leftJoinAndSelect(
        'diagnostico.medico',
        'medico',
        'medico.isActive = :isActive',
        { isActive: true },
      )
      .leftJoinAndSelect(
        'diagnostico.recetas',
        'recetas',
        'recetas.isActive = :isActive',
        { isActive: true },
      )
      .leftJoinAndSelect(
        'recetas.tratamiento',
        'tratamiento',
        'tratamiento.isActive = :isActive',
        { isActive: true },
      )
      .leftJoinAndSelect(
        'diagnostico.IndicadoresClinicos',
        'indicadoresClinicos',
      )
      .leftJoinAndSelect(
        'indicadoresClinicos.indicadorClinico',
        'indicadorClinico',
        'indicadorClinico.isActive = :isActive',
        { isActive: true },
      )
      .leftJoinAndSelect(
        'indicadorClinico.categoriaIndicador',
        'categoriaIndicador',
      )
      .where(
        'diagnostico.idhistoriaClinica = :idHistoriaClinica AND diagnostico.isActive = :isActive',
        { idHistoriaClinica, isActive: true },
      )
      .orderBy('diagnostico.fechaDiagnostico', 'DESC')
      .getMany();
  }

  async findByMedico(idMedico: number): Promise<Diagnostico[]> {
    return await this.diagnosticoRepository
      .createQueryBuilder('diagnostico')
      .leftJoinAndSelect('diagnostico.historiaClinica', 'historiaClinica')
      .leftJoinAndSelect('historiaClinica.paciente', 'paciente')
      .leftJoinAndSelect(
        'diagnostico.recetas',
        'recetas',
        'recetas.isActive = :isActive',
        { isActive: true },
      )
      .leftJoinAndSelect(
        'recetas.tratamiento',
        'tratamiento',
        'tratamiento.isActive = :isActive',
        { isActive: true },
      )
      .leftJoinAndSelect(
        'diagnostico.IndicadoresClinicos',
        'indicadoresClinicos',
      )
      .leftJoinAndSelect(
        'indicadoresClinicos.indicadorClinico',
        'indicadorClinico',
        'indicadorClinico.isActive = :isActive',
        { isActive: true },
      )
      .leftJoinAndSelect(
        'indicadorClinico.categoriaIndicador',
        'categoriaIndicador',
      )
      .where(
        'diagnostico.idMedico = :idMedico AND diagnostico.isActive = :isActive',
        { idMedico, isActive: true },
      )
      .orderBy('diagnostico.fechaDiagnostico', 'DESC')
      .getMany();
  }

  async getStatsByMedico(idMedico: number) {
    // Traer diagnósticos igual que findByMedico
    const diagnosticos = await this.diagnosticoRepository
      .createQueryBuilder('diagnostico')
      .leftJoinAndSelect('diagnostico.historiaClinica', 'historiaClinica')
      .leftJoinAndSelect('historiaClinica.paciente', 'paciente')
      .leftJoinAndSelect(
        'diagnostico.recetas',
        'recetas',
        'recetas.isActive = :isActive',
        { isActive: true },
      )
      .leftJoinAndSelect(
        'recetas.tratamiento',
        'tratamiento',
        'tratamiento.isActive = :isActive',
        { isActive: true },
      )
      .leftJoinAndSelect(
        'diagnostico.IndicadoresClinicos',
        'indicadoresClinicos',
      )
      .leftJoinAndSelect(
        'indicadoresClinicos.indicadorClinico',
        'indicadorClinico',
        'indicadorClinico.isActive = :isActive',
        { isActive: true },
      )
      .where(
        'diagnostico.idMedico = :idMedico AND diagnostico.isActive = :isActive',
        { idMedico, isActive: true },
      )
      .orderBy('diagnostico.fechaDiagnostico', 'DESC')
      .getMany();

    // Todos los diagnósticos del médico
    const total = diagnosticos.length;

    // Obtener el último diagnóstico de cada paciente
    const ultimosDiagnosticosPorPaciente = new Map<number, Diagnostico>();

    for (const diagnostico of diagnosticos) {
      if (diagnostico.historiaClinica?.paciente?.idPaciente) {
        const idPaciente = diagnostico.historiaClinica.paciente.idPaciente;

        // Si no existe un diagnóstico para este paciente, o si este es más reciente
        if (!ultimosDiagnosticosPorPaciente.has(idPaciente)) {
          ultimosDiagnosticosPorPaciente.set(idPaciente, diagnostico);
        }
      }
    }

    // Convertir el Map a un array de últimos diagnósticos
    const ultimosDiagnosticos = Array.from(ultimosDiagnosticosPorPaciente.values());

    // Diagnósticos críticos basados en el último diagnóstico de cada paciente
    const criticos = ultimosDiagnosticos.filter(
      (d) => d.estadoSalud === 'crítico',
    ).length;

    // Diagnósticos controlados basados en el último diagnóstico de cada paciente
    const controlados = ultimosDiagnosticos.filter(
      (d) => d.estadoSalud !== 'crítico',
    ).length;

    // Diagnósticos iniciales
    const iniciales = diagnosticos.filter(
      (d) => d.es_diagnostico_inicial,
    ).length;

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
    const diagnosticos = await this.diagnosticoRepository
      .createQueryBuilder('diagnostico')
      .leftJoinAndSelect(
        'diagnostico.recetas',
        'recetas',
        'recetas.isActive = :isActive',
        { isActive: true },
      )
      .leftJoinAndSelect(
        'recetas.tratamiento',
        'tratamiento',
        'tratamiento.isActive = :isActive',
        { isActive: true },
      )
      .leftJoinAndSelect(
        'diagnostico.medico',
        'medico',
        'medico.isActive = :isActive',
        { isActive: true },
      )
      .where(
        'diagnostico.idhistoriaClinica = :idHistoriaClinica AND diagnostico.isActive = :isActive',
        {
          idHistoriaClinica: historiaClinica.idHistoriaClinica,
          isActive: true,
        },
      )
      .orderBy('diagnostico.fechaDiagnostico', 'DESC')
      .getMany();

    // Total de diagnósticos
    const totalDiagnosticos = diagnosticos.length;

    // Obtener la última receta según fecha de todas las recetas del paciente
    // Recopilar todas las recetas de todos los diagnósticos
    const todasLasRecetas: Array<{ receta: any; fechaReceta: Date }> = [];

    for (const diagnostico of diagnosticos) {
      const diagnosticoCompleto = await this.diagnosticoRepository
        .createQueryBuilder('diagnostico')
        .leftJoinAndSelect(
          'diagnostico.recetas',
          'recetas',
          'recetas.isActive = :isActive',
          { isActive: true },
        )
        .leftJoinAndSelect(
          'recetas.tratamiento',
          'tratamiento',
          'tratamiento.isActive = :isActive',
          { isActive: true },
        )
        .where(
          'diagnostico.idDiagnostico = :idDiagnostico AND diagnostico.isActive = :isActive',
          {
            idDiagnostico: diagnostico.idDiagnostico,
            isActive: true,
          },
        )
        .getOne();

      if (
        diagnosticoCompleto?.recetas &&
        diagnosticoCompleto.recetas.length > 0
      ) {
        diagnosticoCompleto.recetas.forEach((receta) => {
          todasLasRecetas.push({
            receta,
            fechaReceta:
              receta.fechaReceta instanceof Date
                ? receta.fechaReceta
                : new Date(receta.fechaReceta),
          });
        });
      }
    }

    // Ordenar todas las recetas por fecha descendente y tomar la primera
    todasLasRecetas.sort(
      (a, b) => b.fechaReceta.getTime() - a.fechaReceta.getTime(),
    );

    let tratamientoActual: {
      nombre: string;
      contenido: string;
      fechaReceta: string;
    } | null = null;

    if (todasLasRecetas.length > 0) {
      const ultimaReceta = todasLasRecetas[0].receta;

      if (ultimaReceta?.tratamiento) {
        tratamientoActual = {
          nombre: ultimaReceta.tratamiento.nombre,
          contenido: ultimaReceta.contenido || '',
          fechaReceta:
            ultimaReceta.fechaReceta instanceof Date
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
        where: {
          idHistoriaClinica: updateDiagnosticoDto.idhistoriaClinica,
          isActive: true,
        },
      });

      if (!historiaClinica) {
        throw new NotFoundException(
          `Historia clínica con ID ${updateDiagnosticoDto.idhistoriaClinica} no encontrada`,
        );
      }
    }

    // Si se actualiza el médico, verificar que existe y está activo
    if (updateDiagnosticoDto.idMedico !== undefined) {
      const medico = await this.medicoRepository.findOne({
        where: { idMedico: updateDiagnosticoDto.idMedico, isActive: true },
      });

      if (!medico) {
        throw new NotFoundException(
          `Médico con ID ${updateDiagnosticoDto.idMedico} no encontrado o no está activo`,
        );
      }
    }

    // Preparar objeto de actualización para usar update directamente
    const updateData: Partial<Diagnostico> = {};
    
    if (updateDiagnosticoDto.idhistoriaClinica !== undefined) {
      updateData.idhistoriaClinica = updateDiagnosticoDto.idhistoriaClinica;
    }
    
    if (updateDiagnosticoDto.idMedico !== undefined) {
      updateData.idMedico = updateDiagnosticoDto.idMedico;
    }
    
    if (updateDiagnosticoDto.fechaDiagnostico !== undefined) {
      updateData.fechaDiagnostico = updateDiagnosticoDto.fechaDiagnostico;
    }
    
    if (updateDiagnosticoDto.estadoSalud !== undefined) {
      updateData.estadoSalud = updateDiagnosticoDto.estadoSalud;
    }
    
    if (updateDiagnosticoDto.gradoEnfermedad !== undefined) {
      updateData.gradoEnfermedad = updateDiagnosticoDto.gradoEnfermedad;
    }
    
    if (updateDiagnosticoDto.observaciones !== undefined) {
      updateData.observaciones = updateDiagnosticoDto.observaciones;
    }
    
    if (updateDiagnosticoDto.es_diagnostico_inicial !== undefined) {
      updateData.es_diagnostico_inicial = updateDiagnosticoDto.es_diagnostico_inicial;
    }
    
    // Usar update para forzar la actualización en la base de datos
    await this.diagnosticoRepository.update(id, updateData);

    // Retornar el diagnóstico actualizado con todas las relaciones
    return await this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const diagnostico = await this.findOne(id);
    await this.diagnosticoRepository.update(id, { isActive: false });
  }
}
