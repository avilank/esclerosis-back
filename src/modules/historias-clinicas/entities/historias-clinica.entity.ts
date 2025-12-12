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

  @Column({
    name: 'fechaIngreso',
    type: 'date',
    default: () => "CURRENT_DATE AT TIME ZONE 'America/Lima'",
  })
  fechaIngreso: Date;

  @OneToOne(() => Paciente, (paciente) => paciente.historiaClinica)
  @JoinColumn({ name: 'idPaciente' })
  paciente: Paciente;

  @OneToMany(() => Diagnostico, (diagnostico) => diagnostico.historiaClinica)
  diagnosticos: Diagnostico[];
}
