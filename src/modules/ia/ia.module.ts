import { Module } from '@nestjs/common';
import { IaController } from './ia.controller';
import { IaService } from './ia.service';
import { DiagnosticosModule } from '../diagnosticos/diagnosticos.module';
import { TratamientosModule } from '../tratamientos/tratamientos.module';

@Module({
  imports: [DiagnosticosModule, TratamientosModule],
  controllers: [IaController],
  providers: [IaService],
})
export class IaModule {}
