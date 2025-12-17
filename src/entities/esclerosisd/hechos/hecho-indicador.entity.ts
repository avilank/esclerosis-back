import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { DimIndicadorClinico } from '../dim-indicador.entity';
import { DimPaciente } from '../dim-paciente.entity';
import { DimTiempo } from '../dim-tiempo.entity';
import { DimMedico } from '../dim-medico.entity';
import { DimOrganizacion } from '../dim-organizacion.entity';

@Entity('HechoIndicador')
export class HechoIndicador {
  @PrimaryGeneratedColumn({ name: 'HechoIndicador_Id' })
  hechoIndicadorId: number;

  @ManyToOne(() => DimIndicadorClinico)
  indicador: DimIndicadorClinico;

  @ManyToOne(() => DimPaciente)
  paciente: DimPaciente;

  @ManyToOne(() => DimTiempo)
  tiempo: DimTiempo;

  @ManyToOne(() => DimMedico)
  medico: DimMedico;

  @ManyToOne(() => DimOrganizacion)
  organizacion: DimOrganizacion;

  @Column({ name: 'ValorPromedioIndicador', type: 'float', nullable: true })
  valorPromedioIndicador: number;

  @Column({ name: 'ValorInicialIndicador', type: 'float', nullable: true })
  valorInicialIndicador: number;
}
