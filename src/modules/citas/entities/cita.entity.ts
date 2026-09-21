import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Paciente } from '../../pacientes/entities/paciente.entity';
import { Medico } from '../../medicos/entities/medico.entity';
import { Sede } from '../../sedes/entities/sede.entity';
import { Usuario } from '../../usuarios/entities/usuario.entity';
import { Diagnostico } from '../../diagnosticos/entities/diagnostico.entity';

/** Estados posibles de una cita. `atendida` solo la setea el diagnóstico. */
export const ESTADOS_CITA = [
  'programada',
  'atendida',
  'cancelada',
  'no_asistio',
] as const;

export type EstadoCita = (typeof ESTADOS_CITA)[number];

@Index('IDX_cita_medico_fecha', ['idMedico', 'fechaCita'])
@Index('IDX_cita_paciente_fecha', ['idPaciente', 'fechaCita'])
@Index('IDX_cita_estado_fecha', ['estado', 'fechaCita'])
@Entity('cita')
export class Cita {
  @PrimaryGeneratedColumn({ name: 'idCita' })
  idCita: number;

  @Column({ name: 'idPaciente' })
  idPaciente: number;

  @Column({ name: 'idMedico' })
  idMedico: number;

  // `type` explicito: con `number | null` el tipo reflejado es `Object` y
  // TypeORM aborta con DataTypeNotSupportedError.
  @Column({ name: 'idSede', type: 'int', nullable: true })
  idSede: number | null;

  /**
   * Columna `date`: TypeORM la hidrata como string 'YYYY-MM-DD', no como Date
   * (ver common/utils/fecha.ts).
   */
  @Column({ name: 'fechaCita', type: 'date' })
  fechaCita: string;

  /** Columna `time`: llega como 'HH:mm:ss'. El servicio la normaliza a 'HH:mm'. */
  @Column({ name: 'horaCita', type: 'time' })
  horaCita: string;

  // Idem: `EstadoCita` es una union de literales, no `String`.
  @Column({
    name: 'estado',
    type: 'varchar',
    length: 20,
    default: 'programada',
  })
  estado: EstadoCita;

  @Column({ name: 'motivo', type: 'text', nullable: true })
  motivo: string | null;

  @Column({ name: 'observaciones', type: 'text', nullable: true })
  observaciones: string | null;

  /** Quién agendó la cita (secretaria o admin). */
  @Column({ name: 'idUsuarioCreador' })
  idUsuarioCreador: number;

  @Column({ name: 'isActive', type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'createdAt', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updatedAt', type: 'timestamp' })
  updatedAt: Date;

  @ManyToOne(() => Paciente)
  @JoinColumn({ name: 'idPaciente' })
  paciente: Paciente;

  @ManyToOne(() => Medico)
  @JoinColumn({ name: 'idMedico' })
  medico: Medico;

  @ManyToOne(() => Sede)
  @JoinColumn({ name: 'idSede' })
  sede: Sede | null;

  @ManyToOne(() => Usuario)
  @JoinColumn({ name: 'idUsuarioCreador' })
  creador: Usuario;

  /** Diagnóstico que resultó de atender la cita (si ya se atendió). */
  @OneToOne(() => Diagnostico, (diagnostico) => diagnostico.cita)
  diagnostico: Diagnostico | null;
}
