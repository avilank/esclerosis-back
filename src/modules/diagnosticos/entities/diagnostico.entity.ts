import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { HistoriaClinica } from '../../historias-clinicas/entities/historias-clinica.entity';
import { Medico } from '../../medicos/entities/medico.entity';
import { Receta } from '../../recetas/entities/receta.entity';
import { DiagnosticoIndicadorClinico } from './diagnostico-indicadores.entity';
import { Cita } from '../../citas/entities/cita.entity';

@Entity('diagnostico')
export class Diagnostico {
  @PrimaryGeneratedColumn({ name: 'idDiagnostico' })
  idDiagnostico: number;

  @Column({ name: 'idhistoriaClinica' })
  idhistoriaClinica: number;

  @Column({ name: 'idMedico' })
  idMedico: number;

  /**
   * Las columnas `date` de Postgres las devuelve TypeORM como string
   * ('YYYY-MM-DD'), no como Date. Declararlo `Date` invitaba a llamar metodos
   * de Date sobre un string (error en tiempo de ejecucion).
   */
  @Column({ name: 'fechaDiagnostico', type: 'date' })
  fechaDiagnostico: string;

  @Column({ name: 'estadoSalud', length: 100 })
  estadoSalud: string;

  @Column({ name: 'gradoEnfermedad', length: 100 })
  gradoEnfermedad: string;

  @Column({ name: 'observaciones', type: 'text', nullable: true })
  observaciones: string;

  @Column({ name: 'es_diagnostico_inicial', type: 'boolean', default: false })
  es_diagnostico_inicial: boolean;

  @Column({ name: 'isActive', type: 'boolean', default: true })
  isActive: boolean;

  /**
   * Cita que originó el diagnóstico. Opcional: los diagnósticos anteriores al
   * módulo de citas (y los que crea el admin a mano) quedan en `null`.
   * Un índice único parcial garantiza una sola cita por diagnóstico.
   */
  @Column({ name: 'idCita', type: 'int', nullable: true })
  idCita: number | null;

  @ManyToOne(
    () => HistoriaClinica,
    (historiaClinica) => historiaClinica.diagnosticos,
  )
  @JoinColumn({ name: 'idhistoriaClinica' })
  historiaClinica: HistoriaClinica;

  @ManyToOne(() => Medico, (medico) => medico.diagnosticos)
  @JoinColumn({ name: 'idMedico' })
  medico: Medico;

  @OneToOne(() => Cita, (cita) => cita.diagnostico)
  @JoinColumn({ name: 'idCita' })
  cita: Cita | null;

  @OneToMany(() => Receta, (receta) => receta.diagnostico)
  recetas: Receta[];

  @OneToMany(
    () => DiagnosticoIndicadorClinico,
    (diagnosticoIndicadorClinico) => diagnosticoIndicadorClinico.diagnostico,
  )
  IndicadoresClinicos: DiagnosticoIndicadorClinico[];

  @CreateDateColumn({ name: 'createdAt', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updatedAt', type: 'timestamp' })
  updatedAt: Date;
}
