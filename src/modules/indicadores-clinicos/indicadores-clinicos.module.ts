import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  IndicadoresClinicosController,
  CategoriasIndicadoresController,
} from './controllers/index';
import { IndicadorClinico } from './entities/indicadores-clinicos.entity';
import { CategoriaIndicador } from './entities/categorias-indicadores.entity';
import { DiagnosticoIndicadorClinico } from '../models/models';
import * as service from './services/index';
import { Diagnostico } from '../diagnosticos/entities/diagnostico.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CategoriaIndicador,
      IndicadorClinico,
      DiagnosticoIndicadorClinico,
      Diagnostico,
    ]),
  ],
  controllers: [IndicadoresClinicosController, CategoriasIndicadoresController],
  providers: [
    service.IndicadoresClinicosService,
    service.CategoriasIndicadoresService,
  ],
  exports: [
    service.IndicadoresClinicosService,
    service.CategoriasIndicadoresService,
  ],
})
export class IndicadoresClinicosModule {}
