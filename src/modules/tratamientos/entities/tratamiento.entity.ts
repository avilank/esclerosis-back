import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
} from 'typeorm';
import { Receta } from '../../recetas/entities/receta.entity';

@Entity('tratamiento')
export class Tratamiento {
  @PrimaryGeneratedColumn({ name: 'idTratamiento' })
  idTratamiento: number;

  @Column({ name: 'nombre', length: 255 })
  nombre: string;

  @OneToMany(() => Receta, (receta) => receta.tratamiento)
  recetas: Receta[];
}
