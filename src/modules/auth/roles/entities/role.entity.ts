import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Usuario } from '../../../usuarios/entities/usuario.entity';
import { PermisoRol } from '../../permisos/entities/permiso-rol.entity';
import { Permiso } from '../../permisos/entities/permiso.entity';

@Entity('rol')
export class Rol {
  @PrimaryGeneratedColumn({ name: 'idRol' })
  idRol: number;

  @Column({ name: 'nombre', length: 100, unique: true })
  nombre: string;

  @Column({ name: 'descripcion', length: 500, nullable: true })
  descripcion: string;

  @OneToMany(() => Usuario, (usuario) => usuario.rol)
  usuarios: Usuario[];

  @OneToMany(() => PermisoRol, (permisoRol) => permisoRol.rol)
  permisosRoles: PermisoRol[];
}
