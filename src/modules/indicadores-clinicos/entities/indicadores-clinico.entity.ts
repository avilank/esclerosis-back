import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { CategoriaIndicador } from './categorias-indicadores.entity';
import { IndicadorClinicoDiagnostico } from './indicador-clinico-diagnostico.entity';

@Entity('indicadores_clinicos')
export class IndicadorClinico {
  @PrimaryGeneratedColumn({ name: 'idIndicador' })
  idIndicador: number;

  @Column({ name: 'idCategoriaIndicador', nullable: true })
  idCategoriaIndicador: number;

  @Column({ name: 'nombre', length: 255 })
  nombre: string;

  @Column({ name: 'unidad', length: 50, nullable: true })
  unidad: string;

  @Column({ name: 'descripcion', type: 'text', nullable: true })
  descripcion: string;

  @ManyToOne(
    () => CategoriaIndicador,
    (categoriaIndicador) => categoriaIndicador.indicadoresClinicos,
  )
  @JoinColumn({ name: 'idCategoriaIndicador' })
  categoriaIndicador: CategoriaIndicador;

  @OneToMany(
    () => IndicadorClinicoDiagnostico,
    (indicadorClinicoDiagnostico) => indicadorClinicoDiagnostico.indicadorClinico,
  )
  indicadoresClinicosDiagnostico: IndicadorClinicoDiagnostico[];
}
