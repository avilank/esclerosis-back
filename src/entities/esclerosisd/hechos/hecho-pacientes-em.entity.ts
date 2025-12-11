import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { DimModeloIA } from '../dim-modelo-ia.entity';
import { DimIndicadorClinico } from '../dim-indicador.entity';
import { DimPaciente } from '../dim-paciente.entity';
import { DimMedico } from '../dim-medico.entity';
import { DimOrganizacion } from '../dim-organizacion.entity';

@Entity('HechoPacientesEM')
export class HechoPacientesEM {
  @PrimaryGeneratedColumn({ name: 'HechoPacienteEM_Id' })
  hechoPacienteEmId: number;

  @ManyToOne(() => DimModeloIA)
  modelo: DimModeloIA;

  @ManyToOne(() => DimIndicadorClinico)
  indicador: DimIndicadorClinico;

  @ManyToOne(() => DimPaciente)
  paciente: DimPaciente;

  @ManyToOne(() => DimMedico)
  medico: DimMedico;

  @ManyToOne(() => DimOrganizacion)
  organizacion: DimOrganizacion;

  @Column({ name: 'CantidadPacientesDiagnosticadosEM', type: 'int' })
  cantidadPacientesDiagnosticadosEm: number;
}
