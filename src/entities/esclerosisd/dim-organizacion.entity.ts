import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('DimOrganizacion')
export class DimOrganizacion {
  @PrimaryGeneratedColumn({ name: 'Organizacion_Id' })
  organizacionId: number;

  @Column({ name: 'NombreSede', length: 255 })
  nombreSede: string;

  @Column({ name: 'direccion', length: 500, nullable: true })
  direccion: string;
}
