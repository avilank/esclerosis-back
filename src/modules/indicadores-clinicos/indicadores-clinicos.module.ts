import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IndicadoresClinicosController, CategoriasIndicadoresController, IndicadoresClinicoDiagnosticoController } from './controllers/index';
import { IndicadorClinico } from './entities/indicadores-clinicos.entity';
import { CategoriaIndicador } from './entities/categorias-indicadores.entity';
import { IndicadorClinicoDiagnostico } from './entities/indicador-clinico-diagnostico.entity';
import * as service from './services/index';
import { Diagnostico } from '../diagnosticos/entities/diagnostico.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ CategoriaIndicador, IndicadorClinico, IndicadorClinicoDiagnostico, Diagnostico])],
  controllers: [IndicadoresClinicosController, CategoriasIndicadoresController, IndicadoresClinicoDiagnosticoController],
  providers: [service.IndicadoresClinicosService, service.CategoriasIndicadoresService, service.IndicadoresClinicoDiagnosticoService],
  exports: [service.IndicadoresClinicosService, service.CategoriasIndicadoresService, service.IndicadoresClinicoDiagnosticoService],
})
export class IndicadoresClinicosModule { }
