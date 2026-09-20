import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import { Rol } from '../../auth/roles/entities/role.entity';
import { Paciente } from '../../pacientes/entities/paciente.entity';
import { Medico } from '../../medicos/entities/medico.entity';

@Entity('usuario')
export class Usuario {
  @PrimaryGeneratedColumn({ name: 'idUsuario' })
  idUsuario: number;

  @Column({ name: 'username', length: 100, unique: true })
  username: string;

  @Column({ name: 'email', length: 255, unique: true })
  email: string;

  /**
   * `select: false` para que el hash NUNCA salga en un `find`/`findOne` ni en
   * los joins (`rol.usuarios`, `paciente.usuario`, `medico.usuario` son eager).
   * El unico lugar que lo necesita es el login, que lo pide con `addSelect`.
   */
  @Column({ name: 'password', length: 255, select: false })
  password: string;

  @Column({ name: 'estado', type: 'boolean', default: true })
  estado: boolean;

  @Column({ name: 'idRol', nullable: true })
  idRol: number;

  @ManyToOne(() => Rol, (rol) => rol.usuarios)
  @JoinColumn({ name: 'idRol' })
  rol: Rol;

  @OneToOne(() => Paciente, (paciente) => paciente.usuario, { nullable: true })
  paciente: Paciente;

  @OneToOne(() => Medico, (medico) => medico.usuario, { nullable: true })
  medico: Medico;
}
