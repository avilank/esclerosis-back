import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('DimIndicadoresClinicos')
export class DimIndicadorClinico {
  @PrimaryGeneratedColumn({ name: 'Indicador_Id' })
  indicadorId: number;

  @Column({ name: 'NombreIndicador', length: 255 })
  nombreIndicador: string;

  @Column({ name: 'CategoriaIndicador', length: 255, nullable: true })
  categoriaIndicador: string;

  @Column({ name: 'ValorIndicador', type: 'float', nullable: true })
  valorIndicador: number;
}
