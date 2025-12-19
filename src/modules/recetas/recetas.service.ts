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
  ) { }
  async create(createRecetaDto: CreateRecetaDto) {
    const diagnostico = await this.diagnosticoRepository.findOne({ where: { idDiagnostico: createRecetaDto.idDiagnostico, isActive: true } });
    const tratamiento = await this.tratamientoRepository.findOne({ where: { idTratamiento: createRecetaDto.idTratamiento, isActive: true } });
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
    const diagnosticos = await this.diagnosticoRepository.find({ where: { isActive: true } });
    const tratamientos = await this.tratamientoRepository.find({ where: { isActive: true } });
    return await this.recetaRepository.find({
      where: { isActive: true },
      relations: {
        diagnostico: true,
        tratamiento: true,
      },
    });
  }

  async findOne(id: number) {
    const receta = await this.recetaRepository.findOne({
      where: { idReceta: id, isActive: true },
      relations: ['diagnostico', 'tratamiento'],
    });

    if (!receta) {
      throw new BadRequestException('Receta no encontrada');
    }

    return receta;
  }

  async update(id: number, updateRecetaDto: UpdateRecetaDto) {
    const receta = await this.recetaRepository.findOne({ where: { idReceta: id, isActive: true } });
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
    const receta = await this.recetaRepository.findOne({ where: { idReceta: id, isActive: true } });
    if (!receta) {
      throw new BadRequestException('Receta no encontrada');
    }
    return await this.recetaRepository.update(id, { isActive: false });
  }
}
