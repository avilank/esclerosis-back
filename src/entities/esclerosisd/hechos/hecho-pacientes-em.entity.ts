import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { DimModeloIA } from '../dim-modelo-ia.entity';
import { DimPaciente } from '../dim-paciente.entity';
import { DimTiempo } from '../dim-tiempo.entity';
import { DimMedico } from '../dim-medico.entity';
import { DimOrganizacion } from '../dim-organizacion.entity';

@Entity('HechoPacientesEM')
export class HechoPacientesEM {
  @PrimaryGeneratedColumn({ name: 'HechoPacienteEM_Id' })
  hechoPacienteEmId: number;

  @ManyToOne(() => DimModeloIA)
  modelo: DimModeloIA;

  @ManyToOne(() => DimPaciente)
  paciente: DimPaciente;

  @ManyToOne(() => DimTiempo)
  tiempo: DimTiempo;

  @ManyToOne(() => DimMedico)
  medico: DimMedico;

  @ManyToOne(() => DimOrganizacion)
  organizacion: DimOrganizacion;

  @Column({ name: 'CantidadPacientesDiagnosticadosEM', type: 'int' })
  cantidadPacientesDiagnosticadosEm: number;
}
