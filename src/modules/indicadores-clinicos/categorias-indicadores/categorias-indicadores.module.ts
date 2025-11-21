import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoriasIndicadoresService } from './categorias-indicadores.service';
import { CategoriasIndicadoresController } from './categorias-indicadores.controller';
import { CategoriaIndicador } from './entities/categorias-indicadore.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CategoriaIndicador])],
  controllers: [CategoriasIndicadoresController],
  providers: [CategoriasIndicadoresService],
  exports: [CategoriasIndicadoresService],
})
export class CategoriasIndicadoresModule {}
