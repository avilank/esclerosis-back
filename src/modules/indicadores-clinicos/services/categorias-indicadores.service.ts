import { UpdateCategoriasIndicadoreDto } from './../dto/categoria-indicadores/update-categorias-indicadores.dto';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as dto from '../dto/index';
import { InjectRepository } from '@nestjs/typeorm';
import { CategoriaIndicador } from '../entities/categorias-indicadores.entity';
import { IndicadorClinico } from '../entities/indicadores-clinicos.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CategoriasIndicadoresService {
  constructor(
    @InjectRepository(CategoriaIndicador)
    private readonly categoriaIndicadorRepository: Repository<CategoriaIndicador>,
    @InjectRepository(IndicadorClinico)
    private readonly indicadorClinicoRepository: Repository<IndicadorClinico>,
  ) {}

  async create(
    createCategoriasIndicadoreDto: dto.CreateCategoriasIndicadoresDto,
  ) {
    const categoriaIndicador = this.categoriaIndicadorRepository.create(
      createCategoriasIndicadoreDto,
    );
    return await this.categoriaIndicadorRepository.save(categoriaIndicador);
  }

  async findAll() {
    return await this.categoriaIndicadorRepository.find({
      where: { isActive: true },
    });
  }

  async findOne(id: number) {
    return await this.categoriaIndicadorRepository.findOne({
      where: { idTipoIndicador: id },
    });
  }

  async update(
    id: number,
    UpdateCategoriasIndicadoreDto: UpdateCategoriasIndicadoreDto,
  ) {
    const categoriaIndicador =
      await this.categoriaIndicadorRepository.findOneBy({
        idTipoIndicador: id,
      });
    if (!categoriaIndicador) {
      throw new BadRequestException('Categoria indicador no encontrada');
    }
    return await this.categoriaIndicadorRepository.save({
      ...categoriaIndicador,
      ...UpdateCategoriasIndicadoreDto,
    });
  }

  async remove(id: number) {
    const categoriaIndicador = await this.categoriaIndicadorRepository.findOne({
      where: { idTipoIndicador: id },
    });
    if (!categoriaIndicador) {
      throw new NotFoundException('Categoria indicador no encontrada');
    }

    // Borrado lógico de todos los indicadores que pertenecen a esta categoría
    await this.indicadorClinicoRepository
      .createQueryBuilder()
      .update(IndicadorClinico)
      .set({ isActive: false })
      .where('idCategoriaIndicador = :id', { id })
      .andWhere('isActive = :isActive', { isActive: true })
      .execute();

    // Borrado lógico de la categoría
    await this.categoriaIndicadorRepository.update(id, { isActive: false });

    return { 
      message: 'Categoria indicador y sus indicadores asociados han sido eliminados lógicamente',
      deleted: true 
    };
  }
}
