import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SedesService } from './services/sedes.service';
import { SedesController } from './controllers/sedes.controller';
import { Sede } from './entities/sede.entity';
import { Medico } from '../medicos/entities/medico.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Sede, Medico])],
  controllers: [SedesController],
  providers: [SedesService],
  exports: [SedesService],
})
export class SedesModule {}
