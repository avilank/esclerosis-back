import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DiagnosticosService } from './diagnosticos.service';
import { DiagnosticosController } from './diagnosticos.controller';
import { Diagnostico } from './entities/diagnostico.entity';
import { IndicadorClinicoDiagnostico } from '../indicadores-clinicos/entities/indicador-clinico-diagnostico.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Diagnostico, IndicadorClinicoDiagnostico])],
  controllers: [DiagnosticosController],
  providers: [DiagnosticosService],
  exports: [DiagnosticosService],
})
export class DiagnosticosModule {}
