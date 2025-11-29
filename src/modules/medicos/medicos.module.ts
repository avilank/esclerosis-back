import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MedicosService } from './medicos.service';
import { MedicosController } from './medicos.controller';
import { Medico } from './entities/medico.entity';
import { Area } from '../areas/entities/area.entity';
import { Sede } from '../sedes/entities/sede.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Medico, Area, Sede])],
  controllers: [MedicosController],
  providers: [MedicosService],
  exports: [MedicosService],
})
export class MedicosModule {}
