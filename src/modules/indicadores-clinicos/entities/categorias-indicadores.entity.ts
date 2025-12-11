import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
} from 'typeorm';
import { IndicadorClinico } from './indicadores-clinicos.entity';

@Entity('categoria_indicadores')
export class CategoriaIndicador {
  @PrimaryGeneratedColumn({ name: 'idTipoIndicador' })
  idTipoIndicador: number;

  @Column({ name: 'descripcion', length: 255 })
  descripcion: string;

  @Column({ type: 'boolean', default: false })
  bloqueado: boolean;


  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @OneToMany(() => IndicadorClinico, (indicadorClinico) => indicadorClinico.categoriaIndicador)
  indicadoresClinicos: IndicadorClinico[];
}
