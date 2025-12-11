import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('DimModeloIA')
export class DimModeloIA {
  @PrimaryGeneratedColumn({ name: 'Modelo_Id' })
  modeloId: number;

  @Column({ name: 'NombreModelo', length: 255 })
  nombreModelo: string;
}
