import { Entity, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Rol } from '../../roles/entities/role.entity';
import { Permiso } from './permiso.entity';

@Entity('permisos_rol')
export class PermisoRol {
  @PrimaryColumn({ name: 'idRol' })
  idRol: number;

  @PrimaryColumn({ name: 'idPermiso' })
  idPermiso: number;

  @ManyToOne(() => Rol, (rol) => rol.permisosRoles)
  @JoinColumn({ name: 'idRol' })
  rol: Rol;

  @ManyToOne(() => Permiso, (permiso) => permiso.permisosRoles)
  @JoinColumn({ name: 'idPermiso' })
  permiso: Permiso;
}
