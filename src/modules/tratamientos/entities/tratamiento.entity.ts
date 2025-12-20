import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Receta } from '../../recetas/entities/receta.entity';

@Entity('tratamiento')
export class Tratamiento {
  @PrimaryGeneratedColumn({ name: 'idTratamiento' })
  idTratamiento: number;

  @Column({ name: 'nombre', length: 255 })
  nombre: string;
  @Column({ name: 'descripcion', length: 255 })
  descripcion: string;

  @Column({ name: 'bloqueado', type: 'boolean', default: false })
  bloqueado: boolean;

  @Column({ name: 'isActive', type: 'boolean', default: true })
  isActive: boolean;

  @OneToMany(() => Receta, (receta) => receta.tratamiento)
  recetas: Receta[];
}
