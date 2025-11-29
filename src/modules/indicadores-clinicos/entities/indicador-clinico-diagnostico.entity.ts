import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Diagnostico } from '../../diagnosticos/entities/diagnostico.entity';
import { IndicadorClinico } from './indicadores-clinicos.entity';


@Unique(['diagnostico', 'indicadorClinico'])
@Entity('indicadores_clinicos_diagnostico')
export class IndicadorClinicoDiagnostico {
  @PrimaryGeneratedColumn({ name: 'idDiagnosticoClinico' })
  idDiagnosticoClinico: number;

  @Column({ type: 'varchar', length: 255 })
  valor: string;

  @Column({ name: 'fechaMedicion', type: 'date' })
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

