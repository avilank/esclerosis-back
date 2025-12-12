import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HistoriasClinicasService } from './historias-clinicas.service';
import { HistoriasClinicasController } from './historias-clinicas.controller';
import { HistoriaClinica } from './entities/historias-clinica.entity';
import { Paciente } from '../pacientes/entities/paciente.entity';
import { Medico } from '../medicos/entities/medico.entity';

@Module({
  imports: [TypeOrmModule.forFeature([HistoriaClinica, Paciente, Medico])],
  controllers: [HistoriasClinicasController],
  providers: [HistoriasClinicasService],
  exports: [HistoriasClinicasService],
})
export class HistoriasClinicasModule {}
