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


  @Column({ name: 'nombre', length: 255 })
  nombre: string;

  @Column({ name: 'descripcion', length: 255 })
  descripcion: string;

  @Column({ name: 'unidad', length: 255 })
  unidad: string;

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
