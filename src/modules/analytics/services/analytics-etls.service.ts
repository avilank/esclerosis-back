import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { Paciente } from '../../pacientes/entities/paciente.entity';
import { Medico } from '../../medicos/entities/medico.entity';
import { Sede } from '../../sedes/entities/sede.entity';
import { Receta } from '../../recetas/entities/receta.entity';
import { DimPaciente } from '../../../entities/esclerosisd/dim-paciente.entity';
import { DimMedico } from '../../../entities/esclerosisd/dim-medico.entity';
import { DimOrganizacion } from '../../../entities/esclerosisd/dim-organizacion.entity';
import { DimTiempo } from '../../../entities/esclerosisd/dim-tiempo.entity';
import { DimModeloIA } from '../../../entities/esclerosisd/dim-modelo-ia.entity';
import { DimIndicadorClinico } from '../../../entities/esclerosisd/dim-indicador.entity';
import { HechoRecetas } from '../../../entities/esclerosisd/hechos/hecho-recetas.entity';
import { HechoIndicador } from '../../../entities/esclerosisd/hechos/hecho-indicador.entity';
import { HechoPacientesEM } from '../../../entities/esclerosisd/hechos/hecho-pacientes-em.entity';
import { HechoPacientesAtendidos } from '../../../entities/esclerosisd/hechos/hecho-pacientes-atendidos.entity';
import { partesDeFecha } from '../../../common/utils/fecha';

@Injectable()
export class AnalyticsEtlsService {
  constructor(
    @InjectRepository(Paciente)
    private readonly pacienteRepo: Repository<Paciente>,
    @InjectRepository(Medico)
    private readonly medicoRepo: Repository<Medico>,
    @InjectRepository(Sede)
    private readonly sedeRepo: Repository<Sede>,
    @InjectRepository(Receta)
    private readonly recetaRepo: Repository<Receta>,
    @InjectRepository(DimPaciente)
    private readonly dimPacienteRepo: Repository<DimPaciente>,
    @InjectRepository(DimMedico)
    private readonly dimMedicoRepo: Repository<DimMedico>,
    @InjectRepository(DimOrganizacion)
    private readonly dimOrganizacionRepo: Repository<DimOrganizacion>,
    @InjectRepository(DimTiempo)
    private readonly dimTiempoRepo: Repository<DimTiempo>,
    @InjectRepository(DimModeloIA)
    private readonly dimModeloRepo: Repository<DimModeloIA>,
    @InjectRepository(DimIndicadorClinico)
    private readonly dimIndicadorRepo: Repository<DimIndicadorClinico>,
    @InjectRepository(HechoRecetas)
    private readonly hechoRecetasRepo: Repository<HechoRecetas>,
    @InjectRepository(HechoIndicador)
    private readonly hechoIndicadorRepo: Repository<HechoIndicador>,
    @InjectRepository(HechoPacientesEM)
    private readonly hechoPacientesEmRepo: Repository<HechoPacientesEM>,
    @InjectRepository(HechoPacientesAtendidos)
    private readonly hechoPacientesAtendidosRepo: Repository<HechoPacientesAtendidos>,
  ) {}

  async cargarDimPacientes(): Promise<void> {
    const pacientes = await this.pacienteRepo.find();

    for (const p of pacientes) {
      const existente = await this.dimPacienteRepo.findOne({
        where: { numDocumento: p.dniPaciente },
      });

      if (!existente) {
        const dim = this.dimPacienteRepo.create({
          numDocumento: p.dniPaciente,
          nombre: p.nombrePaciente,
          genero: p.generoPaciente,
        });
        await this.dimPacienteRepo.save(dim);
      }
    }
  }

  async cargarDimMedicos(): Promise<void> {
    const medicos = await this.medicoRepo.find({ relations: ['area', 'sede'] });

    for (const m of medicos) {
      const existente = await this.dimMedicoRepo.findOne({
        where: { nombre: m.nombre },
      });

      if (!existente) {
        const dim = this.dimMedicoRepo.create({
          nombre: m.nombre,
          area: m.area?.descripcion,
        });
        await this.dimMedicoRepo.save(dim);
      }
    }
  }

  async cargarDimOrganizacion(): Promise<void> {
    const sedes = await this.sedeRepo.find();

    for (const s of sedes) {
      const existente = await this.dimOrganizacionRepo.findOne({
        where: { nombreSede: s.nombre },
      });

      if (!existente) {
        const dim = this.dimOrganizacionRepo.create({
          nombreSede: s.nombre,
          direccion: s.direccion,
        });
        await this.dimOrganizacionRepo.save(dim);
      }
    }
  }

  async cargarDimTiempoDesdeDiagnosticosYRecetas(): Promise<void> {
    const recetas = await this.recetaRepo.find();

    // `fechaReceta` es una columna `date`: llega como string 'YYYY-MM-DD'.
    // Tratarla como `Date` (`.toISOString()`) lanzaba
    // "TypeError: r.fechaReceta.toISOString is not a function" y tumbaba todo
    // el ETL en cuanto habia una receta.
    const fechasUnicas = new Set<string>();
    for (const r of recetas) {
      const partes = partesDeFecha(r.fechaReceta);
      if (partes) fechasUnicas.add(String(partes.fechaId));
    }

    for (const key of fechasUnicas) {
      const fechaId = Number.parseInt(key, 10);
      const existente = await this.dimTiempoRepo.findOne({
        where: { fechaId },
      });
      if (existente) continue;

      const anio = Math.floor(fechaId / 10000);
      const mes = Math.floor((fechaId % 10000) / 100);
      const dia = fechaId % 100;
      await this.dimTiempoRepo.save(
        this.dimTiempoRepo.create({
          fechaId,
          anio,
          trimestre: Math.floor((mes - 1) / 3) + 1,
          mes,
          dia,
        }),
      );
    }
  }

  async cargarDimModeloIA(): Promise<void> {
    const recetas = await this.recetaRepo.find();

    const modelos = new Set<string>();
    for (const r of recetas) {
      if (r.Modelo_IA) {
        modelos.add(r.Modelo_IA);
      }
    }

    for (const nombre of modelos) {
      const existente = await this.dimModeloRepo.findOne({
        where: { nombreModelo: nombre },
      });

      if (!existente) {
        const dim = this.dimModeloRepo.create({ nombreModelo: nombre });
        await this.dimModeloRepo.save(dim);
      }
    }
  }

  /**
   * Recarga `HechoRecetas` desde cero. Limpia la tabla primero a proposito: es
   * una carga completa, no incremental. Sin ese `delete`, cada llamada a
   * `POST /analytics/etl/hechos` (o `/todo`) agregaba otra fila por receta y el
   * reporte de dominancia de IA contaba los mismos datos varias veces.
   */
  async cargarHechoRecetas(): Promise<void> {
    // `clear()` usa TRUNCATE y falla si hay FKs apuntando a la tabla; `delete`
    // con un filtro siempre-verdadero es equivalente para este caso.
    await this.hechoRecetasRepo.createQueryBuilder().delete().execute();

    const recetas = await this.recetaRepo.find({
      relations: [
        'diagnostico',
        'diagnostico.medico',
        'diagnostico.medico.sede',
      ],
    });

    for (const r of recetas) {
      // Misma columna `date` -> string: se descompone sin pasar por `Date`.
      const partes = partesDeFecha(r.fechaReceta);
      if (!partes) continue;
      const { anio, mes, dia, trimestre, fechaId } = partes;

      let dimTiempo = await this.dimTiempoRepo.findOne({
        where: { fechaId },
      });
      if (!dimTiempo) {
        dimTiempo = this.dimTiempoRepo.create({
          fechaId,
          anio,
          mes,
          dia,
          trimestre,
        });
        dimTiempo = await this.dimTiempoRepo.save(dimTiempo);
      }

      let dimModelo = await this.dimModeloRepo.findOne({
        where: { nombreModelo: r.Modelo_IA },
      });
      if (!dimModelo && r.Modelo_IA) {
        dimModelo = await this.dimModeloRepo.save(
          this.dimModeloRepo.create({ nombreModelo: r.Modelo_IA }),
        );
      }

      const sedeNombre = r.diagnostico?.medico?.sede?.nombre;
      let dimOrg: DimOrganizacion | null = null;
      if (sedeNombre) {
        dimOrg = await this.dimOrganizacionRepo.findOne({
          where: { nombreSede: sedeNombre },
        });
        if (!dimOrg) {
          dimOrg = await this.dimOrganizacionRepo.save(
            this.dimOrganizacionRepo.create({ nombreSede: sedeNombre }),
          );
        }
      }

      const medicoNombre = r.diagnostico?.medico?.nombre;
      let dimMedico: DimMedico | null = null;
      if (medicoNombre) {
        dimMedico = await this.dimMedicoRepo.findOne({
          where: { nombre: medicoNombre },
        });
        if (!dimMedico) {
          dimMedico = await this.dimMedicoRepo.save(
            this.dimMedicoRepo.create({
              nombre: medicoNombre,
              area: r.diagnostico?.medico?.area?.descripcion,
            }),
          );
        }
      }

      const hechoData: DeepPartial<HechoRecetas> = {
        modelo: dimModelo ?? undefined,
        tiempo: dimTiempo,
        organizacion: dimOrg ?? undefined,
        medico: dimMedico ?? undefined,
        cantidadRecetasGeneradasCopilot: r.Modelo_IA === 'Copilot' ? 1 : 0,
        cantidadRecetasGeneradasDeepseek: r.Modelo_IA === 'Deepseek' ? 1 : 0,
      };

      const hecho = this.hechoRecetasRepo.create(hechoData);

      await this.hechoRecetasRepo.save(hecho);
    }
  }

  async cargarDimensiones(): Promise<void> {
    await this.cargarDimPacientes();
    await this.cargarDimMedicos();
    await this.cargarDimOrganizacion();
    await this.cargarDimTiempoDesdeDiagnosticosYRecetas();
    await this.cargarDimModeloIA();
  }

  async cargarTodo(): Promise<void> {
    await this.cargarDimensiones();
    await this.cargarHechoRecetas();
  }

  /** `cargarHechoRecetas` ya limpia la tabla; se mantiene por compatibilidad. */
  async reloadHechoRecetas(): Promise<{ status: string }> {
    await this.cargarHechoRecetas();
    return { status: 'ok' };
  }

  // Hechos - lecturas

  async getHechoRecetas(): Promise<HechoRecetas[]> {
    return this.hechoRecetasRepo.find({
      relations: ['modelo', 'tiempo', 'organizacion', 'medico'],
    });
  }

  async getHechoIndicadores(): Promise<HechoIndicador[]> {
    return this.hechoIndicadorRepo.find({
      relations: ['indicador', 'paciente', 'tiempo', 'medico', 'organizacion'],
    });
  }

  async getHechoPacientesEm(): Promise<HechoPacientesEM[]> {
    return this.hechoPacientesEmRepo.find({
      relations: ['modelo', 'paciente', 'tiempo', 'medico', 'organizacion'],
    });
  }

  async getHechoPacientesAtendidos(): Promise<HechoPacientesAtendidos[]> {
    return this.hechoPacientesAtendidosRepo.find({
      relations: ['indicador', 'medico', 'tiempo', 'organizacion'],
    });
  }

  // Dimensiones - lecturas

  async getDimPacientes(): Promise<DimPaciente[]> {
    return this.dimPacienteRepo.find();
  }

  async getDimMedicos(): Promise<DimMedico[]> {
    return this.dimMedicoRepo.find();
  }

  async getDimOrganizaciones(): Promise<DimOrganizacion[]> {
    return this.dimOrganizacionRepo.find();
  }

  async getDimTiempos(): Promise<DimTiempo[]> {
    return this.dimTiempoRepo.find();
  }

  async getDimModelosIa(): Promise<DimModeloIA[]> {
    return this.dimModeloRepo.find();
  }

  async getDimIndicadoresClinicos(): Promise<DimIndicadorClinico[]> {
    return this.dimIndicadorRepo.find();
  }

  // Hechos - creacion

  async createHechoReceta(
    data: DeepPartial<HechoRecetas>,
  ): Promise<HechoRecetas> {
    const entity = this.hechoRecetasRepo.create(data);
    return this.hechoRecetasRepo.save(entity);
  }

  async createHechoIndicador(
    data: DeepPartial<HechoIndicador>,
  ): Promise<HechoIndicador> {
    const entity = this.hechoIndicadorRepo.create(data);
    return this.hechoIndicadorRepo.save(entity);
  }

  async createHechoPacientesEm(
    data: DeepPartial<HechoPacientesEM>,
  ): Promise<HechoPacientesEM> {
    const entity = this.hechoPacientesEmRepo.create(data);
    return this.hechoPacientesEmRepo.save(entity);
  }

  async createHechoPacientesAtendidos(
    data: DeepPartial<HechoPacientesAtendidos>,
  ): Promise<HechoPacientesAtendidos> {
    const entity = this.hechoPacientesAtendidosRepo.create(data);
    return this.hechoPacientesAtendidosRepo.save(entity);
  }

  // Dimensiones - creacion

  async createDimPaciente(
    data: DeepPartial<DimPaciente>,
  ): Promise<DimPaciente> {
    const entity = this.dimPacienteRepo.create(data);
    return this.dimPacienteRepo.save(entity);
  }

  async createDimMedico(data: DeepPartial<DimMedico>): Promise<DimMedico> {
    const entity = this.dimMedicoRepo.create(data);
    return this.dimMedicoRepo.save(entity);
  }

  async createDimOrganizacion(
    data: DeepPartial<DimOrganizacion>,
  ): Promise<DimOrganizacion> {
    const entity = this.dimOrganizacionRepo.create(data);
    return this.dimOrganizacionRepo.save(entity);
  }

  async createDimTiempo(data: DeepPartial<DimTiempo>): Promise<DimTiempo> {
    const entity = this.dimTiempoRepo.create(data);
    return this.dimTiempoRepo.save(entity);
  }

  async createDimModeloIa(
    data: DeepPartial<DimModeloIA>,
  ): Promise<DimModeloIA> {
    const entity = this.dimModeloRepo.create(data);
    return this.dimModeloRepo.save(entity);
  }

  async createDimIndicadorClinico(
    data: DeepPartial<DimIndicadorClinico>,
  ): Promise<DimIndicadorClinico> {
    const entity = this.dimIndicadorRepo.create(data);
    return this.dimIndicadorRepo.save(entity);
  }
}
