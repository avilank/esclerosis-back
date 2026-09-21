import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Not, Repository } from 'typeorm';
import { Cita, EstadoCita } from '../entities/cita.entity';
import { Paciente } from '../../pacientes/entities/paciente.entity';
import { Medico } from '../../medicos/entities/medico.entity';
import { Sede } from '../../sedes/entities/sede.entity';
import { HistoriaClinica } from '../../historias-clinicas/entities/historias-clinica.entity';
import { CreateCitaDto } from '../dto/create-cita.dto';
import { UpdateCitaDto } from '../dto/update-cita.dto';
import { EstadoManualCita } from '../dto/cambiar-estado-cita.dto';

/** Estados que ocupan el horario del médico/paciente. */
const ESTADOS_OCUPAN_AGENDA: EstadoCita[] = ['programada', 'atendida'];

export interface FiltrosCita {
  fecha?: string;
  idMedico?: number;
  idPaciente?: number;
  estado?: EstadoCita;
}

@Injectable()
export class CitasService {
  constructor(
    @InjectRepository(Cita)
    private readonly citaRepo: Repository<Cita>,
    @InjectRepository(Paciente)
    private readonly pacienteRepo: Repository<Paciente>,
    @InjectRepository(Medico)
    private readonly medicoRepo: Repository<Medico>,
    @InjectRepository(Sede)
    private readonly sedeRepo: Repository<Sede>,
    @InjectRepository(HistoriaClinica)
    private readonly historiaRepo: Repository<HistoriaClinica>,
  ) {}

  /** `'09:00:00'` -> `'09:00'`. La columna `time` se hidrata con segundos. */
  private normalizarHora(cita: Cita): Cita {
    if (cita?.horaCita && cita.horaCita.length > 5) {
      cita.horaCita = cita.horaCita.substring(0, 5);
    }
    return cita;
  }

  private normalizarHoras(citas: Cita[]): Cita[] {
    return citas.map((cita) => this.normalizarHora(cita));
  }

  /** Fecha de hoy del servidor, como 'YYYY-MM-DD' (zona local, no UTC). */
  hoy(): string {
    const ahora = new Date();
    const mes = `${ahora.getMonth() + 1}`.padStart(2, '0');
    const dia = `${ahora.getDate()}`.padStart(2, '0');
    return `${ahora.getFullYear()}-${mes}-${dia}`;
  }

  private queryBase() {
    return this.citaRepo
      .createQueryBuilder('cita')
      .leftJoinAndSelect('cita.paciente', 'paciente')
      .leftJoinAndSelect('cita.medico', 'medico')
      .leftJoinAndSelect('medico.area', 'medicoArea')
      .leftJoinAndSelect('medico.sede', 'medicoSede')
      .leftJoinAndSelect('cita.sede', 'sede')
      .leftJoinAndSelect('cita.creador', 'creador')
      .leftJoinAndSelect('cita.diagnostico', 'diagnostico')
      .where('cita.isActive = :isActive', { isActive: true });
  }

  /**
   * 409 si el médico o el paciente ya tienen otra cita viva en el mismo
   * `fechaCita` + `horaCita`.
   */
  private async assertSinChoque(
    idMedico: number,
    idPaciente: number,
    fechaCita: string,
    horaCita: string,
    excluirIdCita?: number,
  ): Promise<void> {
    const base = {
      fechaCita,
      horaCita,
      isActive: true,
      estado: In(ESTADOS_OCUPAN_AGENDA),
      ...(excluirIdCita ? { idCita: Not(excluirIdCita) } : {}),
    };

    const choqueMedico = await this.citaRepo.findOne({
      where: { ...base, idMedico },
    });
    if (choqueMedico) {
      throw new ConflictException(
        `El médico ya tiene una cita el ${fechaCita} a las ${horaCita}`,
      );
    }

    const choquePaciente = await this.citaRepo.findOne({
      where: { ...base, idPaciente },
    });
    if (choquePaciente) {
      throw new ConflictException(
        `El paciente ya tiene una cita el ${fechaCita} a las ${horaCita}`,
      );
    }
  }

  private async resolvePaciente(idPaciente: number): Promise<Paciente> {
    const paciente = await this.pacienteRepo.findOne({
      where: { idPaciente, isActive: true },
    });
    if (!paciente) {
      throw new NotFoundException(`Paciente ${idPaciente} no encontrado`);
    }

    const historia = await this.historiaRepo.findOne({
      where: { idPaciente, isActive: true },
    });
    if (!historia) {
      throw new BadRequestException(
        `El paciente ${idPaciente} no tiene una historia clínica activa`,
      );
    }
    return paciente;
  }

  private async resolveMedico(idMedico: number): Promise<Medico> {
    const medico = await this.medicoRepo.findOne({
      where: { idMedico, isActive: true },
      relations: ['sede'],
    });
    if (!medico) {
      throw new NotFoundException(`Médico ${idMedico} no encontrado`);
    }
    return medico;
  }

  private async resolveSede(
    idSede: number | undefined,
    medico: Medico,
  ): Promise<number | null> {
    if (idSede == null) {
      // Por defecto, la sede donde atiende el médico.
      return medico.sede?.idSede ?? null;
    }
    const sede = await this.sedeRepo.findOne({
      where: { idSede, isActive: true },
    });
    if (!sede) {
      throw new BadRequestException(`Sede ${idSede} no encontrada`);
    }
    return sede.idSede;
  }

  async create(dto: CreateCitaDto, idUsuarioCreador: number): Promise<Cita> {
    await this.resolvePaciente(dto.idPaciente);
    const medico = await this.resolveMedico(dto.idMedico);
    const idSede = await this.resolveSede(dto.idSede, medico);

    await this.assertSinChoque(
      dto.idMedico,
      dto.idPaciente,
      dto.fechaCita,
      dto.horaCita,
    );

    const cita = this.citaRepo.create({
      idPaciente: dto.idPaciente,
      idMedico: dto.idMedico,
      idSede,
      fechaCita: dto.fechaCita,
      horaCita: dto.horaCita,
      estado: 'programada',
      motivo: dto.motivo ?? null,
      observaciones: dto.observaciones ?? null,
      idUsuarioCreador,
      isActive: true,
    });
    const guardada = await this.citaRepo.save(cita);
    return this.findOne(guardada.idCita);
  }

  async findAll(filtros: FiltrosCita = {}): Promise<Cita[]> {
    const query = this.queryBase();

    if (filtros.fecha) {
      query.andWhere('cita.fechaCita = :fecha', { fecha: filtros.fecha });
    }
    if (filtros.idMedico != null) {
      query.andWhere('cita.idMedico = :idMedico', {
        idMedico: filtros.idMedico,
      });
    }
    if (filtros.idPaciente != null) {
      query.andWhere('cita.idPaciente = :idPaciente', {
        idPaciente: filtros.idPaciente,
      });
    }
    if (filtros.estado) {
      query.andWhere('cita.estado = :estado', { estado: filtros.estado });
    }

    const citas = await query
      .orderBy('cita.fechaCita', 'DESC')
      .addOrderBy('cita.horaCita', 'ASC')
      .getMany();
    return this.normalizarHoras(citas);
  }

  async findOne(idCita: number): Promise<Cita> {
    const cita = await this.queryBase()
      .andWhere('cita.idCita = :idCita', { idCita })
      .getOne();
    if (!cita) {
      throw new NotFoundException(`Cita ${idCita} no encontrada`);
    }
    return this.normalizarHora(cita);
  }

  async update(idCita: number, dto: UpdateCitaDto): Promise<Cita> {
    const cita = await this.findOne(idCita);

    const mueveAgenda =
      dto.fechaCita !== undefined ||
      dto.horaCita !== undefined ||
      dto.idMedico !== undefined ||
      dto.idPaciente !== undefined;

    if (mueveAgenda && cita.estado !== 'programada') {
      throw new ConflictException(
        `Solo se puede reprogramar una cita en estado "programada" (está "${cita.estado}")`,
      );
    }

    const idPaciente = dto.idPaciente ?? cita.idPaciente;
    const idMedico = dto.idMedico ?? cita.idMedico;
    const fechaCita = dto.fechaCita ?? cita.fechaCita;
    const horaCita = dto.horaCita ?? cita.horaCita;

    if (dto.idPaciente !== undefined) await this.resolvePaciente(idPaciente);
    const medico =
      dto.idMedico !== undefined || dto.idSede !== undefined
        ? await this.resolveMedico(idMedico)
        : null;

    if (mueveAgenda) {
      await this.assertSinChoque(
        idMedico,
        idPaciente,
        fechaCita,
        horaCita,
        idCita,
      );
    }

    const cambios: Partial<Cita> = {
      idPaciente,
      idMedico,
      fechaCita,
      horaCita,
    };
    if (dto.idSede !== undefined && medico) {
      cambios.idSede = await this.resolveSede(dto.idSede, medico);
    }
    if (dto.motivo !== undefined) cambios.motivo = dto.motivo;
    if (dto.observaciones !== undefined) {
      cambios.observaciones = dto.observaciones;
    }

    await this.citaRepo.update(idCita, cambios);
    return this.findOne(idCita);
  }

  /**
   * Transiciones válidas: solo desde `programada`. `atendida` se setea aparte,
   * desde `DiagnosticosService.create`.
   */
  async cambiarEstado(idCita: number, estado: EstadoManualCita): Promise<Cita> {
    const cita = await this.findOne(idCita);
    if (cita.estado !== 'programada') {
      throw new ConflictException(
        `No se puede pasar a "${estado}" una cita en estado "${cita.estado}"`,
      );
    }
    await this.citaRepo.update(idCita, { estado });
    return this.findOne(idCita);
  }

  /** Marca la cita como atendida. La llama el módulo de diagnósticos. */
  async marcarAtendida(idCita: number): Promise<void> {
    await this.citaRepo.update(idCita, { estado: 'atendida' });
  }

  async remove(idCita: number): Promise<{ message: string; deleted: boolean }> {
    const cita = await this.findOne(idCita);
    if (cita.estado !== 'programada') {
      throw new ConflictException(
        `Solo se puede eliminar una cita en estado "programada" (está "${cita.estado}")`,
      );
    }
    // Soft delete, como el resto del proyecto.
    await this.citaRepo.update(idCita, {
      isActive: false,
      estado: 'cancelada',
    });
    return { message: 'Cita eliminada lógicamente', deleted: true };
  }
}
