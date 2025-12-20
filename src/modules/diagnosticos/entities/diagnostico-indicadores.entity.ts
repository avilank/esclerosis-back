import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Diagnostico } from './diagnostico.entity';
import { IndicadorClinico } from 'src/modules/models/models';

@Unique(['diagnostico', 'indicadorClinico'])
@Entity('diagnostico_indicador_clinico')
export class DiagnosticoIndicadorClinico {
  @PrimaryGeneratedColumn({ name: 'idDiagnosticoIndicador' })
  idDiagnosticoIndicadorClinico: number;

  @Column({ type: 'varchar', length: 255 })
  valor: string;

  @Column({ name: 'fechaMedicion', type: 'date' })
  fechaMedicion: Date;

  @ManyToOne(
    () => Diagnostico,
    (diagnostico) => diagnostico.IndicadoresClinicos,
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
