import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { DimModeloIA } from '../dim-modelo-ia.entity';
import { DimTiempo } from '../dim-tiempo.entity';
import { DimOrganizacion } from '../dim-organizacion.entity';

@Entity('HechoRecetas')
export class HechoRecetas {
  @PrimaryGeneratedColumn({ name: 'HechoReceta_Id' })
  hechoRecetaId: number;

  @ManyToOne(() => DimModeloIA)
  modelo: DimModeloIA;

  @ManyToOne(() => DimTiempo)
  tiempo: DimTiempo;

  @ManyToOne(() => DimOrganizacion)
  organizacion: DimOrganizacion;

  @Column({ name: 'CantidadRecetasGeneradasCopilot', type: 'int', default: 0 })
  cantidadRecetasGeneradasCopilot: number;

  @Column({ name: 'CantidadRecetasGeneradasDeepseek', type: 'int', default: 0 })
  cantidadRecetasGeneradasDeepseek: number;
}
