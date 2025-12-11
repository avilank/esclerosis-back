import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('DimPaciente')
export class DimPaciente {
  @PrimaryGeneratedColumn({ name: 'Paciente_Id' })
  pacienteId: number;

  @Column({ name: 'NumDocumento', length: 50 })
  numDocumento: string;

  @Column({ name: 'nombre', length: 255 })
  nombre: string;

  @Column({ name: 'genero', length: 20, nullable: true })
  genero: string;
}
