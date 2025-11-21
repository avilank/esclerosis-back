import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
} from 'typeorm';
import { Medico } from '../../medicos/entities/medico.entity';

@Entity('sede')
export class Sede {
  @PrimaryGeneratedColumn({ name: 'idSede' })
  idSede: number;

  @Column({ name: 'nombre', length: 255 })
  nombre: string;

  @Column({ name: 'direccion', length: 500, nullable: true })
  direccion: string;

  @OneToMany(() => Medico, (medico) => medico.sede)
  medicos: Medico[];
}
