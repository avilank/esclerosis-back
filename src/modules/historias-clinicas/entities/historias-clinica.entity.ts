import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Paciente } from '../../pacientes/entities/paciente.entity';
import { Diagnostico } from '../../diagnosticos/entities/diagnostico.entity';

@Entity('historia_clinica')
export class HistoriaClinica {
  @PrimaryGeneratedColumn({ name: 'idHistoriaClinica' })
  idHistoriaClinica: number;

  @Column({ name: 'idPaciente', unique: true })
  idPaciente: number;

  @Column({ name: 'estado', length: 50, default: 'activa' })
  estado: string;

  /**
   * Columna `date`: TypeORM la hidrata como string 'YYYY-MM-DD', no como Date.
   * Declararla `Date` invitaba a llamarle metodos de Date y reventar en runtime
   * (ver common/utils/fecha.ts).
   */
  @Column({
    name: 'fechaIngreso',
    type: 'date',
    default: () => 'CURRENT_DATE',
  })
  fechaIngreso: string;

  @Column({ name: 'isActive', type: 'boolean', default: true })
  isActive: boolean;

  @OneToOne(() => Paciente, (paciente) => paciente.historiaClinica)
  @JoinColumn({ name: 'idPaciente' })
  paciente: Paciente;

  @OneToMany(() => Diagnostico, (diagnostico) => diagnostico.historiaClinica)
  diagnosticos: Diagnostico[];
}
