import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IndicadoresClinicosService, CategoriasIndicadoresService } from './services';
import { IndicadoresClinicosController, CategoriasIndicadoresController } from './controllers';
import { IndicadorClinico } from './entities/indicadores-clinico.entity';
import { CategoriaIndicador } from './entities/categorias-indicadores.entity';
import { IndicadorClinicoDiagnostico } from './entities/indicador-clinico-diagnostico.entity';

@Module({
  imports: [TypeOrmModule.forFeature([IndicadorClinico, CategoriaIndicador, IndicadorClinicoDiagnostico])],
  controllers: [IndicadoresClinicosController, CategoriasIndicadoresController],
  providers: [IndicadoresClinicosService, CategoriasIndicadoresService],
  exports: [IndicadoresClinicosService, CategoriasIndicadoresService],
})
export class IndicadoresClinicosModule { }
