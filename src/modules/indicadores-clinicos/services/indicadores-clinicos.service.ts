import { BadRequestException, Injectable } from '@nestjs/common';
import * as dto from '../dto/index';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IndicadorClinico } from '../entities/indicadores-clinicos.entity';
import { CategoriaIndicador } from '../entities/categorias-indicadores.entity';
import { NotFoundException } from '@nestjs/common';
@Injectable()
export class IndicadoresClinicosService {
  constructor(
    @InjectRepository(IndicadorClinico)
    private readonly indicadorClinicoRepository: Repository<IndicadorClinico>,
    @InjectRepository(CategoriaIndicador)
    private readonly categoriaIndicadorRepository: Repository<CategoriaIndicador>,

  ) { }

  async create(createIndicadoresClinicoDto: dto.CreateIndicadoresClinicoDto) {
    const { idCategoriaIndicador, ...data } = createIndicadoresClinicoDto;
    const categoriaIndicador =
      await this.categoriaIndicadorRepository.findOneBy({
        idTipoIndicador: idCategoriaIndicador,
        isActive: true,
      });
    if (!categoriaIndicador) {
      throw new BadRequestException('Categoria de indicador no encontrada o inactiva');
    }
    return await this.indicadorClinicoRepository.save({
      ...data,
      categoriaIndicador,
    });
  }

  async findAll() {
    return await this.indicadorClinicoRepository.find({
      where: { isActive: true },
      relations: {
        categoriaIndicador: true,
      },
    });
  }

  async findOne(id: number) {
    const indicadorClinico = await this.indicadorClinicoRepository.findOne({
      where: { idIndicador: id, isActive: true },
      relations: ['categoriaIndicador'],
    });

    if (!indicadorClinico) {
      throw new BadRequestException('Indicador clinico no encontrado');
    }

    return indicadorClinico;
  }

  async update(
    id: number,
    updateIndicadoresClinicoDto: dto.UpdateIndicadoresClinicoDto,
  ) {
    const indicadorClinico = await this.indicadorClinicoRepository.findOne({
      where: { idIndicador: id, isActive: true },
      relations: ['categoriaIndicador'],
    });
    if (!indicadorClinico) {
      throw new BadRequestException('Indicador clinico no encontrado');
    }

    let categoriaIndicador: CategoriaIndicador | null =
      indicadorClinico.categoriaIndicador;
    if (updateIndicadoresClinicoDto.idCategoriaIndicador !== undefined) {
      categoriaIndicador = await this.categoriaIndicadorRepository.findOneBy({
        idTipoIndicador: updateIndicadoresClinicoDto.idCategoriaIndicador,
        isActive: true,
      });
    }

    if (!categoriaIndicador) {
      throw new BadRequestException('Categoria de indicador no encontrada o inactiva');
    }

    const { idCategoriaIndicador, ...data } = updateIndicadoresClinicoDto;
    return this.indicadorClinicoRepository.save({
      ...indicadorClinico,
      ...data,
      categoriaIndicador,
    });
  }

  async remove(id: number) {
    const indicadorClinico = await this.indicadorClinicoRepository.findOneBy({ 
      idIndicador: id,
      isActive: true 
    });
    if (!indicadorClinico) {
      throw new BadRequestException('Indicador clinico no encontrado');
    }
    
    // Borrado lógico del indicador (sin afectar la categoría)
    indicadorClinico.isActive = false;
    return await this.indicadorClinicoRepository.save(indicadorClinico);
  }
}
