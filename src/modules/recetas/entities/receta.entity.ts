import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import { Diagnostico } from '../../diagnosticos/entities/diagnostico.entity';
import { Tratamiento } from '../../tratamientos/entities/tratamiento.entity';

@Entity('receta')
export class Receta {
  @PrimaryGeneratedColumn({ name: 'idReceta' })
  idReceta: number;

  @Column({ name: 'Modelo_IA', length: 255, nullable: true })
  Modelo_IA: string;

  @Column({ name: 'fechaReceta', type: 'date' })
  fechaReceta: Date;

  @OneToOne(() => Diagnostico, (diagnostico) => diagnostico.recetas) 
  @JoinColumn({ name: 'idDiagnostico' })
  diagnostico: Diagnostico;

  @ManyToOne(() => Tratamiento, (tratamiento) => tratamiento.recetas)
  @JoinColumn({ name: 'idTratamiento' })
  tratamiento: Tratamiento;
}
