import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Diagnostico } from '../../diagnosticos/entities/diagnostico.entity';
import { Tratamiento } from '../../tratamientos/entities/tratamiento.entity';

@Entity('receta')
export class Receta {
  @PrimaryGeneratedColumn({ name: 'idReceta' })
  idReceta: number;

  @Column({ name: 'Modelo_IA', length: 255 })
  Modelo_IA: string;

  /**
   * Columna `date`: TypeORM la hidrata como string 'YYYY-MM-DD', no como Date.
   * Declararla `Date` invitaba a llamarle metodos de Date y reventar en runtime
   * (ver common/utils/fecha.ts).
   */
  @Column({ name: 'fechaReceta', type: 'date' })
  fechaReceta: string;

  @OneToOne(() => Diagnostico, (diagnostico) => diagnostico.recetas)
  @JoinColumn({ name: 'idDiagnostico' })
  diagnostico: Diagnostico;

  @ManyToOne(() => Tratamiento, (tratamiento) => tratamiento.recetas, {
    nullable: false,
  })
  @JoinColumn({ name: 'idTratamiento' })
  tratamiento: Tratamiento;

  @Column({ name: 'contenido', type: 'text', nullable: true })
  contenido: string;

  @Column({ name: 'sustentacion', type: 'text', nullable: true })
  sustentacion: string;

  @Column({ name: 'isActive', type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'createdAt', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updatedAt', type: 'timestamp' })
  updatedAt: Date;
}
