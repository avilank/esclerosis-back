import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Diagnostico } from '../../diagnosticos/entities/diagnostico.entity';
import { Tratamiento } from '../../tratamientos/entities/tratamiento.entity';

@Entity('receta')
export class Receta {
  @PrimaryGeneratedColumn({ name: 'idReceta' })
  idReceta: number;

  @Column({ name: 'idDiagnostico' })
  idDiagnostico: number;

  @Column({ name: 'idTratamiento', nullable: true })
  idTratamiento: number;

  @Column({ name: 'Modelo_IA', length: 255, nullable: true })
  Modelo_IA: string;

  @Column({ name: 'fechaReceta', type: 'date' })
  fechaReceta: Date;

  @Column({ name: 'instrucciones', type: 'text', nullable: true })
  instrucciones: string;

  @ManyToOne(() => Diagnostico, (diagnostico) => diagnostico.recetas)
  @JoinColumn({ name: 'idDiagnostico' })
  diagnostico: Diagnostico;

  @ManyToOne(() => Tratamiento, (tratamiento) => tratamiento.recetas)
  @JoinColumn({ name: 'idTratamiento' })
  tratamiento: Tratamiento;
}
