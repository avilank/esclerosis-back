import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Area } from '../../areas/entities/area.entity';
import { Sede } from '../../sedes/entities/sede.entity';
import { Usuario } from '../../usuarios/entities/usuario.entity';


@Entity('medico')
export class Medico {
  @PrimaryGeneratedColumn({ name: 'idMedico' })
  idMedico: number;

  @Column({ name: 'nombre', length: 255 })
  nombre: string;

  @Column({ name: 'genero', length: 20, nullable: true })
  genero: string;

  @ManyToOne(() => Area, (area) => area.idArea, { eager: true })
  area: Area;

  @ManyToOne(() => Sede, (sede) => sede.idSede, { eager: true })
  sede: Sede;

  @OneToOne(() => Usuario, (usuario) => usuario.idUsuario, { eager: true })
  usuario: Usuario;

}
