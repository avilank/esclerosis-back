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
    const categoriaIndicador = await this.categoriaIndicadorRepository.findOneBy({ idTipoIndicador: createIndicadoresClinicoDto.idCategoriaIndicador });
    if (!categoriaIndicador) {
      throw new BadRequestException('Categoria de indicador no encontrada');
    }
    return this.indicadorClinicoRepository.save({
      ...createIndicadoresClinicoDto,
      categoriaIndicador,
    });
  }

  async findAll() {
    return await this.indicadorClinicoRepository.find({
      relations: {
        categoriaIndicador: true,
      },
    });
  }

  async findOne(id: number) {
    const indicadorClinico = await this.indicadorClinicoRepository.findOne({
      where: { idIndicador: id },
      relations: ['categoriaIndicador'],
    });

    if (!indicadorClinico) {
      throw new BadRequestException('Indicador clinico no encontrado');
    }

    return indicadorClinico;
  }

  async update(id: number, updateIndicadoresClinicoDto: dto.UpdateIndicadoresClinicoDto) {
    const indicadorClinico = await this.indicadorClinicoRepository.findOneBy({ idIndicador: id });
    if (!indicadorClinico) {
      throw new BadRequestException('Indicador clinico no encontrado');
    }
    return this.indicadorClinicoRepository.save({
      ...indicadorClinico,
      ...updateIndicadoresClinicoDto,
    });
  }

  async remove(id: number) {
    const indicadorClinico = await this.indicadorClinicoRepository.findOneBy({ idIndicador: id });
    if (!indicadorClinico) {
      throw new BadRequestException('Indicador clinico no encontrado');
    }
    return this.indicadorClinicoRepository.delete(id);
  }
}
