import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
} from 'typeorm';
import { Medico } from '../../medicos/entities/medico.entity';

@Entity('area')
export class Area {
  @PrimaryGeneratedColumn({ name: 'idArea' })
  idArea: number;

  @Column({ name: 'descripcion', length: 255 })
  descripcion: string;

  @Column({ name: 'isActive', type: 'boolean', default: true })
  isActive: boolean;

  @OneToMany(() => Medico, (medico) => medico.area)
  medicos: Medico[];
}
