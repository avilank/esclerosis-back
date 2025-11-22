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
    const diagnostico = await this.diagnosticoRepository.findOneBy({ idDiagnostico: createRecetaDto.idDiagnostico });
    const tratamiento = await this.tratamientoRepository.findOneBy({ idTratamiento: createRecetaDto.idTratamiento });
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
    const diagnosticos = await this.diagnosticoRepository.find();
    const tratamientos = await this.tratamientoRepository.find();
    return await this.recetaRepository.find({
      relations: {
        diagnostico: true,
        tratamiento: true,
      },
    });
  }

  async findOne(id: number) {
    const receta = await this.recetaRepository.findOne({
        where: { idReceta: id },
        relations: ['diagnostico', 'tratamiento'],
      });
    
      if (!receta) {
        throw new BadRequestException('Receta no encontrada');
      }
    
      return receta;
  }

  update(id: number, updateRecetaDto: UpdateRecetaDto) {
    return `This action updates a #${id} receta`;
  }

  async remove(id: number) {
    const receta = await this.recetaRepository.findOneBy({ idReceta: id });
    if (!receta) {
      throw new BadRequestException('Receta no encontrada');
    }
    return await this.recetaRepository.delete(id);
  }
}
