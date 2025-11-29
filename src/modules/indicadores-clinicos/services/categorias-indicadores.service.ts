import { UpdateCategoriasIndicadoreDto } from './../dto/categoria-indicadores/update-categorias-indicadores.dto';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import * as dto from '../dto/index';
import { InjectRepository } from '@nestjs/typeorm';
import { CategoriaIndicador } from '../entities/categorias-indicadores.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CategoriasIndicadoresService {
  constructor(
    @InjectRepository(CategoriaIndicador)
    private readonly categoriaIndicadorRepository: Repository<CategoriaIndicador>,
  ) {}

  async create(createCategoriasIndicadoreDto: dto.CreateCategoriasIndicadoresDto) {
    const categoriaIndicador = this.categoriaIndicadorRepository.create(createCategoriasIndicadoreDto);
    return await this.categoriaIndicadorRepository.save(categoriaIndicador);
  }

  async findAll() {
    return await this.categoriaIndicadorRepository.find();
  }

  async findOne(id: number) {
    return await this.categoriaIndicadorRepository.findOne({ where: { idTipoIndicador: id } });
  }

  async update(id: number, UpdateCategoriasIndicadoreDto: UpdateCategoriasIndicadoreDto) {
    const categoriaIndicador = await this.categoriaIndicadorRepository.findOneBy({ idTipoIndicador: id });
    if (!categoriaIndicador) {
      throw new BadRequestException('Categoria indicador no encontrada');
    }
    return await this.categoriaIndicadorRepository.save({
      ...categoriaIndicador,
      ...UpdateCategoriasIndicadoreDto,
    });
  }

  async remove(id: number) {
    const categoriaIndicador = await this.categoriaIndicadorRepository.findOne({ where: { idTipoIndicador: id } });
    if (!categoriaIndicador) {
      throw new NotFoundException('Categoria indicador no encontrada');
    }
    return await this.categoriaIndicadorRepository.delete(id);
  }
}
