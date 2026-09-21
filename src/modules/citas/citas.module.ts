import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cita } from './entities/cita.entity';
import { Paciente } from '../pacientes/entities/paciente.entity';
import { Medico } from '../medicos/entities/medico.entity';
import { Sede } from '../sedes/entities/sede.entity';
import { HistoriaClinica } from '../historias-clinicas/entities/historias-clinica.entity';
import { CitasService } from './services/citas.service';
import { CitasController } from './controllers/citas.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Cita, Paciente, Medico, Sede, HistoriaClinica]),
  ],
  controllers: [CitasController],
  providers: [CitasService],
  exports: [CitasService],
})
export class CitasModule {}
