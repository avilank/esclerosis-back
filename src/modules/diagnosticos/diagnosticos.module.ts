import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DiagnosticosService } from './diagnosticos.service';
import { DiagnosticosController } from './diagnosticos.controller';
import { Diagnostico } from './entities/diagnostico.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Diagnostico])],
  controllers: [DiagnosticosController],
  providers: [DiagnosticosService],
  exports: [DiagnosticosService],
})
export class DiagnosticosModule {}
