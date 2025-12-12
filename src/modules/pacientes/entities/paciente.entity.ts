import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  PrimaryColumn,
} from 'typeorm';
import { HistoriaClinica } from '../../historias-clinicas/entities/historias-clinica.entity';
import { Usuario } from '../../usuarios/entities/usuario.entity';

@Entity('paciente')
export class Paciente {
  @PrimaryColumn({ type: 'int' })
  idPaciente: number;

  @Column({ name: 'dniPaciente', length: 20, unique: true })
  dniPaciente: string;

  @Column({ name: 'nombrePaciente', length: 255 })
  nombrePaciente: string;

  @Column({ name: 'edadPaciente', type: 'int' })
  edadPaciente: number;

  @Column({ name: 'generoPaciente', length: 20 })
  generoPaciente: string;

  @Column({ name: 'direccionPaciente', length: 500, nullable: true })
  direccionPaciente: string;

  @Column({ name: 'telefonoPaciente', length: 20, nullable: true })
  telefonoPaciente: string;

  @Column({ name: 'fechaNacimiento', type: 'date', 
  })
  fechaNacimiento: string;

  @OneToOne(() => Usuario, (usuario) => usuario.paciente, { eager: true })
  @JoinColumn({ name: 'idPaciente' })
  usuario: Usuario;

  @OneToOne(() => HistoriaClinica,(historiaClinica) => historiaClinica.paciente)
  historiaClinica: HistoriaClinica;

}
