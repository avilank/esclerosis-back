import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateRecetaDto } from './dto/create-receta.dto';
import { UpdateRecetaDto } from './dto/update-receta.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Receta } from './entities/receta.entity';
import { Diagnostico } from '../diagnosticos/entities/diagnostico.entity';
import { Tratamiento } from '../tratamientos/entities/tratamiento.entity';
import { Repository } from 'typeorm';

@Injectable()
export class RecetasService {
  constructor(
    @InjectRepository(Receta)
    private readonly recetaRepository: Repository<Receta>,
    @InjectRepository(Diagnostico)
    private readonly diagnosticoRepository: Repository<Diagnostico>,
    @InjectRepository(Tratamiento)
    private readonly tratamientoRepository: Repository<Tratamiento>,
  ) {}
  async create(createRecetaDto: CreateRecetaDto) {
    const diagnostico = await this.diagnosticoRepository.findOne({
      where: { idDiagnostico: createRecetaDto.idDiagnostico, isActive: true },
    });
    const tratamiento = await this.tratamientoRepository.findOne({
      where: { idTratamiento: createRecetaDto.idTratamiento, isActive: true },
    });
    if (!diagnostico || !tratamiento) {
      throw new BadRequestException('Diagnostico o tratamiento no encontrado');
    }
    return this.recetaRepository.save({
      ...createRecetaDto,
      diagnostico,
      tratamiento,
    });
  }

  async findAll() {
    return await this.recetaRepository
      .createQueryBuilder('receta')
      .leftJoinAndSelect(
        'receta.diagnostico',
        'diagnostico',
        'diagnostico.isActive = :isActive',
        { isActive: true },
      )
      .leftJoinAndSelect(
        'receta.tratamiento',
        'tratamiento',
        'tratamiento.isActive = :isActive',
        { isActive: true },
      )
      .where('receta.isActive = :isActive', { isActive: true })
      .getMany();
  }

  async findOne(id: number) {
    const receta = await this.recetaRepository
      .createQueryBuilder('receta')
      .leftJoinAndSelect(
        'receta.diagnostico',
        'diagnostico',
        'diagnostico.isActive = :isActive',
        { isActive: true },
      )
      .leftJoinAndSelect(
        'receta.tratamiento',
        'tratamiento',
        'tratamiento.isActive = :isActive',
        { isActive: true },
      )
      .where('receta.idReceta = :id AND receta.isActive = :isActive', {
        id,
        isActive: true,
      })
      .getOne();

    if (!receta) {
      throw new BadRequestException('Receta no encontrada');
    }

    return receta;
  }

  async update(id: number, updateRecetaDto: UpdateRecetaDto) {
    const receta = await this.recetaRepository.findOne({
      where: { idReceta: id, isActive: true },
    });
    if (!receta) {
      throw new BadRequestException('Receta no encontrada');
    }

    // Si se actualiza el tratamiento, verificar que existe
    if (updateRecetaDto.idTratamiento) {
      const tratamiento = await this.tratamientoRepository.findOne({
        where: { idTratamiento: updateRecetaDto.idTratamiento, isActive: true },
      });
      if (!tratamiento) {
        throw new BadRequestException('Tratamiento no encontrado');
      }
    }

    return this.recetaRepository.save({
      ...receta,
      ...updateRecetaDto,
    });
  }

  async remove(id: number) {
    const receta = await this.recetaRepository.findOne({
      where: { idReceta: id, isActive: true },
    });
    if (!receta) {
      throw new BadRequestException('Receta no encontrada');
    }
    return await this.recetaRepository.update(id, { isActive: false });
  }
}
