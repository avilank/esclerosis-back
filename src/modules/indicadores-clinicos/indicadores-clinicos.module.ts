import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IndicadoresClinicosService } from './indicadores-clinicos.service';
import { IndicadoresClinicosController } from './indicadores-clinicos.controller';
import { IndicadorClinico } from './entities/indicadores-clinico.entity';

@Module({
  imports: [TypeOrmModule.forFeature([IndicadorClinico])],
  controllers: [IndicadoresClinicosController],
  providers: [IndicadoresClinicosService],
  exports: [IndicadoresClinicosService],
})
export class IndicadoresClinicosModule {}
