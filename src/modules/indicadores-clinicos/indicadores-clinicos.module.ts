import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IndicadoresClinicosService, CategoriasIndicadoresService } from './services';
import { IndicadoresClinicosController, CategoriasIndicadoresController } from './controllers';
import { IndicadorClinico } from './entities/indicadores-clinico.entity';

@Module({
  imports: [TypeOrmModule.forFeature([IndicadorClinico])],
  controllers: [IndicadoresClinicosController, CategoriasIndicadoresController],
  providers: [IndicadoresClinicosService, CategoriasIndicadoresService],
  exports: [IndicadoresClinicosService, CategoriasIndicadoresService],
})
export class IndicadoresClinicosModule { }
