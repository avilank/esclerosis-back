import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
} from 'typeorm';
import { PermisoRol } from './permiso-rol.entity';

@Entity('permisos')
export class Permiso {
  @PrimaryGeneratedColumn({ name: 'idPermiso' })
  idPermiso: number;

  @Column({ name: 'nombre', length: 100, unique: true })
  nombre: string;

  @Column({ name: 'descripcion', length: 500, nullable: true })
  descripcion: string;

  @OneToMany(() => PermisoRol, (permisoRol) => permisoRol.permiso)
  permisosRoles: PermisoRol[];
}
