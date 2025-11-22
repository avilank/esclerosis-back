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
import { Diagnostico } from '../../diagnosticos/entities/diagnostico.entity';

@Entity('medico')
export class Medico {
  @PrimaryGeneratedColumn({ name: 'idMedico' })
  idMedico: number;

  @Column({ name: 'nombre', length: 255 })
  nombre: string;

  @Column({ name: 'genero', length: 20, nullable: true })
  genero: string;

  @Column({ name: 'idDiagnostico', nullable: true })
  idDiagnostico: number;

  @Column({ name: 'idArea', nullable: true })
  idArea: number;

  @Column({ name: 'idSede', nullable: true })
  idSede: number;

  @Column({ name: 'idUsuario', nullable: true, unique: true })
  idUsuario: number;

  @ManyToOne(() => Area, (area) => area.medicos) 
  @JoinColumn({ name: 'idArea' })
  area: Area;

  @ManyToOne(() => Sede, (sede) => sede.medicos) 
  @JoinColumn({ name: 'idSede' })
  sede: Sede;

  @OneToOne(() => Usuario, (usuario) => usuario.medico, { nullable: true }) 
  @JoinColumn({ name: 'idUsuario' })
  usuario: Usuario;

  @OneToMany(() => Diagnostico, (diagnostico) => diagnostico.medico) 
  diagnosticos: Diagnostico[]; 
}
