import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecetasService } from './recetas.service';
import { RecetasController } from './recetas.controller';
import { Receta } from './entities/receta.entity';
import { Diagnostico } from '../diagnosticos/entities/diagnostico.entity';
import { Tratamiento } from '../tratamientos/entities/tratamiento.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Receta, Diagnostico, Tratamiento])],
  controllers: [RecetasController],
  providers: [RecetasService],
  exports: [RecetasService],
})
export class RecetasModule {}
