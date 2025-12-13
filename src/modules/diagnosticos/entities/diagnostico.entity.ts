import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { HistoriaClinica } from '../../historias-clinicas/entities/historias-clinica.entity';
import { Medico } from '../../medicos/entities/medico.entity';
import { Receta } from '../../recetas/entities/receta.entity';
import { DiagnosticoIndicadorClinico } from './diagnostico-indicadores.entity';

@Entity('diagnostico')
export class Diagnostico {
  @PrimaryGeneratedColumn({ name: 'idDiagnostico' })
  idDiagnostico: number;

  @Column({ name: 'idhistoriaClinica' })
  idhistoriaClinica: number;

  @Column({ name: 'idMedico' })
  idMedico: number;

  @Column({ name: 'fechaDiagnostico', type: 'date' })
  fechaDiagnostico: Date;

  @Column({ name: 'estadoSalud', length: 100, nullable: true })
  estadoSalud: string;

  @Column({ name: 'gradoEnfermedad', length: 100, nullable: true })
  gradoEnfermedad: string;

  @Column({ name: 'observaciones', type: 'text', nullable: true })
  observaciones: string;

  @Column({ name: 'es_diagnostico_inicial', type: 'boolean', default: false })
  es_diagnostico_inicial: boolean;

  @ManyToOne(
    () => HistoriaClinica,
    (historiaClinica) => historiaClinica.diagnosticos,
  )
  @JoinColumn({ name: 'idhistoriaClinica' })
  historiaClinica: HistoriaClinica;

  @ManyToOne(() => Medico, (medico) => medico.diagnosticos)
  @JoinColumn({ name: 'idMedico' })
  medico: Medico;

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
