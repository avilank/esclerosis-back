import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { DimIndicadorClinico } from '../dim-indicador.entity';
import { DimPaciente } from '../dim-paciente.entity';
import { DimTiempo } from '../dim-tiempo.entity';
import { DimOrganizacion } from '../dim-organizacion.entity';

@Entity('HechoPacientesAtendidos')
export class HechoPacientesAtendidos {
  @PrimaryGeneratedColumn({ name: 'HechoPacienteAtendido_Id' })
  hechoPacienteAtendidoId: number;

  @ManyToOne(() => DimIndicadorClinico)
  indicador: DimIndicadorClinico;

  @ManyToOne(() => DimPaciente)
  paciente: DimPaciente;

  @ManyToOne(() => DimTiempo)
  tiempo: DimTiempo;

  @ManyToOne(() => DimOrganizacion)
  organizacion: DimOrganizacion;

  @Column({ name: 'CantidadPacientesAtendidos', type: 'int' })
  cantidadPacientesAtendidos: number;
}
