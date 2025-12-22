import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  OneToOne,
  JoinColumn,
  PrimaryColumn,
} from 'typeorm';
import { Area } from '../../areas/entities/area.entity';
import { Sede } from '../../sedes/entities/sede.entity';
import { Usuario } from '../../usuarios/entities/usuario.entity';
import { Diagnostico } from '../../diagnosticos/entities/diagnostico.entity';

@Entity('medico')
export class Medico {
  @PrimaryColumn({ type: 'int' })
  idMedico: number;

  @Column({ name: 'nombre', length: 255 })
  nombre: string;

  @Column({ name: 'genero', length: 20})
  genero: string;

  @Column({ name: 'isActive', type: 'boolean', default: true })
  isActive: boolean;

  @ManyToOne(() => Area, (area) => area.idArea, { eager: true })
  @JoinColumn({ name: 'idArea' })
  area: Area;

  @ManyToOne(() => Sede, (sede) => sede.idSede, { eager: true })
  @JoinColumn({ name: 'idSede' })
  sede: Sede;

  @OneToOne(() => Usuario, (usuario) => usuario.idUsuario, { eager: true })
  @JoinColumn({ name: 'idMedico' })
  usuario: Usuario;

  @OneToMany(() => Diagnostico, (diagnostico) => diagnostico.medico)
  diagnosticos: Diagnostico[];
}
