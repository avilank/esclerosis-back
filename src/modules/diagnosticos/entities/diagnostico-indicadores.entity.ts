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

  /**
   * Columna `date`: TypeORM la hidrata como string 'YYYY-MM-DD', no como Date.
   * Declararla `Date` invitaba a llamarle metodos de Date y reventar en runtime
   * (ver common/utils/fecha.ts).
   */
  @Column({ name: 'fechaMedicion', type: 'date' })
  fechaMedicion: string;

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
