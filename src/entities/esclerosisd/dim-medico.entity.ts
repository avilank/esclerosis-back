import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('DimMedico')
export class DimMedico {
  @PrimaryGeneratedColumn({ name: 'Medico_Id' })
  medicoId: number;

  @Column({ name: 'Nombre', length: 255 })
  nombre: string;

  @Column({ name: 'area', length: 255, nullable: true })
  area: string;
}
