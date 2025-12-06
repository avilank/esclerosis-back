import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DiagnosticosService } from './services/diagnosticos.service';
import { DiagnosticosController } from './controllers/diagnosticos.controller';
import { Diagnostico } from './entities/diagnostico.entity';
import { DiagnosticoIndicadorClinico } from './entities/diagnostico-indicadores.entity';
import { HistoriaClinica } from '../historias-clinicas/entities/historias-clinica.entity';
import { Medico } from '../medicos/entities/medico.entity';
import { IndicadorClinico } from '../indicadores-clinicos/entities/indicadores-clinicos.entity';
import { DiagnosticoIndicadoresController } from './controllers/diagnostico-indicadores.controller';
import { DiagnosticoIndicadoresService } from './services/diagnostico-indicadores.service';

@Module({
  imports: [TypeOrmModule.forFeature([Diagnostico, DiagnosticoIndicadorClinico, HistoriaClinica, Medico, IndicadorClinico])],
  controllers: [DiagnosticosController, DiagnosticoIndicadoresController],
  providers: [DiagnosticosService, DiagnosticoIndicadoresService],
  exports: [DiagnosticosService, DiagnosticoIndicadoresService],
})
export class DiagnosticosModule { }
