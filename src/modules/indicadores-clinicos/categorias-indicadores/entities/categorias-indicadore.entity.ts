import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
} from 'typeorm';
import { IndicadorClinico } from '../../entities/indicadores-clinico.entity';

@Entity('categoria_indicadores')
export class CategoriaIndicador {
  @PrimaryGeneratedColumn({ name: 'idTipoIndicador' })
  idTipoIndicador: number;

  @Column({ name: 'descripcion', length: 255 })
  descripcion: string;

  @OneToMany(
    () => IndicadorClinico,
    (indicadorClinico) => indicadorClinico.categoriaIndicador,
  )
  indicadoresClinicos: IndicadorClinico[];
}
