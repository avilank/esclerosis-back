import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Diagnostico } from '../../diagnosticos/entities/diagnostico.entity';
import { IndicadorClinico } from './indicadores-clinico.entity';

@Entity('indicadores_clinicos_diagnostico')
export class IndicadorClinicoDiagnostico {
  @PrimaryColumn({ name: 'idDiagnostico' })
  idDiagnostico: number;

  @PrimaryColumn({ name: 'idIndicador' })
  idIndicador: number;

  @Column({ name: 'valor', type: 'varchar', length: 255, nullable: true })
  valor: string;

  @Column({ name: 'fechaMedicion', type: 'date', nullable: true })
  fechaMedicion: Date;

  @ManyToOne(
    () => Diagnostico,
    (diagnostico) => diagnostico.indicadoresClinicosDiagnostico,
  )
  @JoinColumn({ name: 'idDiagnostico' })
  diagnostico: Diagnostico;

  @ManyToOne(
    () => IndicadorClinico,
    (indicadorClinico) => indicadorClinico.indicadoresClinicosDiagnostico,
  )
  @JoinColumn({ name: 'idIndicador' })
  indicadorClinico: IndicadorClinico;
}

