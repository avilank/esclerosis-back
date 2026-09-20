import { BadRequestException, Injectable } from '@nestjs/common';
import * as dto from '../dto/index';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IndicadorClinico } from '../entities/indicadores-clinicos.entity';
import { CategoriaIndicador } from '../entities/categorias-indicadores.entity';
@Injectable()
export class IndicadoresClinicosService {
  constructor(
    @InjectRepository(IndicadorClinico)
    private readonly indicadorClinicoRepository: Repository<IndicadorClinico>,
    @InjectRepository(CategoriaIndicador)
    private readonly categoriaIndicadorRepository: Repository<CategoriaIndicador>,
  ) {}

  async create(createIndicadoresClinicoDto: dto.CreateIndicadoresClinicoDto) {
    const { idCategoriaIndicador, ...data } = createIndicadoresClinicoDto;
    const categoriaIndicador =
      await this.categoriaIndicadorRepository.findOneBy({
        idTipoIndicador: idCategoriaIndicador,
        isActive: true,
      });
    if (!categoriaIndicador) {
      throw new BadRequestException(
        'Categoria de indicador no encontrada o inactiva',
      );
    }
    return await this.indicadorClinicoRepository.save({
      ...data,
      categoriaIndicador,
    });
  }

  async findAll() {
    return await this.indicadorClinicoRepository
      .createQueryBuilder('indicadorClinico')
      .leftJoinAndSelect(
        'indicadorClinico.categoriaIndicador',
        'categoriaIndicador',
      )
      .where('indicadorClinico.isActive = :isActive', { isActive: true })
      .getMany();
  }

  async findOne(id: number) {
    const indicadorClinico = await this.indicadorClinicoRepository
      .createQueryBuilder('indicadorClinico')
      .leftJoinAndSelect(
        'indicadorClinico.categoriaIndicador',
        'categoriaIndicador',
      )
      .where(
        'indicadorClinico.idIndicador = :id AND indicadorClinico.isActive = :isActive',
        { id, isActive: true },
      )
      .getOne();

    if (!indicadorClinico) {
      throw new BadRequestException('Indicador clinico no encontrado');
    }

    return indicadorClinico;
  }

  async update(
    id: number,
    updateIndicadoresClinicoDto: dto.UpdateIndicadoresClinicoDto,
  ) {
    const indicadorClinico = await this.indicadorClinicoRepository
      .createQueryBuilder('indicadorClinico')
      .leftJoinAndSelect(
        'indicadorClinico.categoriaIndicador',
        'categoriaIndicador',
      )
      .where(
        'indicadorClinico.idIndicador = :id AND indicadorClinico.isActive = :isActive',
        { id, isActive: true },
      )
      .getOne();
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
    } else {
      // Verificar que la categoría actual esté activa
      if (categoriaIndicador && !categoriaIndicador.isActive) {
        throw new BadRequestException('La categoría asociada está inactiva');
      }
    }

    if (!categoriaIndicador) {
      throw new BadRequestException(
        'Categoria de indicador no encontrada o inactiva',
      );
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
      isActive: true,
    });
    if (!indicadorClinico) {
      throw new BadRequestException('Indicador clinico no encontrado');
    }
    if (indicadorClinico.bloqueado) {
      throw new BadRequestException(
        `El indicador "${indicadorClinico.nombre}" está bloqueado y no se puede eliminar`,
      );
    }

    // Borrado lógico del indicador (sin afectar la categoría)
    indicadorClinico.isActive = false;
    return await this.indicadorClinicoRepository.save(indicadorClinico);
  }
}
