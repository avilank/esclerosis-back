import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  JoinColumn,
} from 'typeorm';
import { DimIndicadorClinico } from '../dim-indicador.entity';
import { DimMedico } from '../dim-medico.entity';
import { DimTiempo } from '../dim-tiempo.entity';
import { DimOrganizacion } from '../dim-organizacion.entity';

@Entity('HechoPacientesAtendidos')
export class HechoPacientesAtendidos {
  @PrimaryGeneratedColumn({ name: 'HechoPacienteAtendido_Id' })
  hechoPacienteAtendidoId: number;

  @ManyToOne(() => DimIndicadorClinico)
  @JoinColumn({ name: 'indicadorIndicadorId' })
  indicador: DimIndicadorClinico;

  @ManyToOne(() => DimMedico)
  @JoinColumn({ name: 'medicoMedicoId' })
  medico: DimMedico;

  @ManyToOne(() => DimTiempo)
  @JoinColumn({ name: 'tiempoFechaId' })
  tiempo: DimTiempo;

  @ManyToOne(() => DimOrganizacion)
  @JoinColumn({ name: 'organizacionOrganizacionId' })
  organizacion: DimOrganizacion;

  @Column({ name: 'CantidadPacientesAtendidos', type: 'int' })
  cantidadPacientesAtendidos: number;
}
