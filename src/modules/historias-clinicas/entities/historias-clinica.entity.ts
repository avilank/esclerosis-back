import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Paciente } from '../../pacientes/entities/paciente.entity';
import { Diagnostico } from '../../diagnosticos/entities/diagnostico.entity';

@Entity('historia_clinica')
export class HistoriaClinica {
  @PrimaryGeneratedColumn({ name: 'idHistoriaClinica' })
  idHistoriaClinica: number;

  @Column({ name: 'idPaciente' })
  idPaciente: number;

  @Column({ name: 'estado', length: 50, default: 'activa' })
  estado: string;

  @Column({ name: 'fechaIngreso', type: 'date' })
  fechaIngreso: Date;

  @ManyToOne(() => Paciente, (paciente) => paciente.historiasClinicas)
  @JoinColumn({ name: 'idPaciente' })
  paciente: Paciente;

  @OneToMany(() => Diagnostico, (diagnostico) => diagnostico.historiaClinica)
  diagnosticos: Diagnostico[];
}
