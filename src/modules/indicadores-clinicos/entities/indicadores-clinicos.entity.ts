import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CategoriaIndicador } from './categorias-indicadores.entity';
import { DiagnosticoIndicadorClinico } from 'src/modules/models/models';
import { IndicadorUnidad } from 'src/common/enums/indicador-unidad.enum';

@Entity('indicadores_clinicos')
export class IndicadorClinico {
  @PrimaryGeneratedColumn({ name: 'idIndicador' })
  idIndicador: number;

  @Column({ name: 'nombre', length: 255 })
  nombre: string;

  @Column({ name: 'descripcion', length: 255 })
  descripcion: string;

  @Column({ type: 'enum', enum: IndicadorUnidad })
  unidad: IndicadorUnidad;

  @Column({ type: 'boolean', default: false })
  bloqueado: boolean;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @ManyToOne(
    () => CategoriaIndicador,
    (categoriaIndicador) => categoriaIndicador.indicadoresClinicos,
  )
  @JoinColumn({ name: 'idCategoriaIndicador' })
  categoriaIndicador: CategoriaIndicador;

  @OneToMany(
    () => DiagnosticoIndicadorClinico,
    (diagnosticoIndicadorClinico) =>
      diagnosticoIndicadorClinico.indicadorClinico,
  )
  indicadoresClinicosDiagnostico: DiagnosticoIndicadorClinico[];

  @CreateDateColumn({ name: 'createdAt', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updatedAt', type: 'timestamp' })
  updatedAt: Date;
}
