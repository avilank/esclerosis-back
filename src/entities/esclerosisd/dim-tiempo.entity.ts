import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('DimTiempo')
export class DimTiempo {
  @PrimaryColumn({ name: 'Fecha_Id', type: 'int' })
  fechaId: number;

  @Column({ name: 'anio', type: 'int' })
  anio: number;

  @Column({ name: 'trimestre', type: 'int' })
  trimestre: number;

  @Column({ name: 'mes', type: 'int' })
  mes: number;

  @Column({ name: 'dia', type: 'int' })
  dia: number;
}
