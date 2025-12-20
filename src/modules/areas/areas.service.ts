import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateAreaDto } from './dto/create-area.dto';
import { UpdateAreaDto } from './dto/update-area.dto';
import { Area } from './entities/area.entity';
import { Medico } from '../medicos/entities/medico.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class AreasService {
  constructor(
    @InjectRepository(Area)
    private areaRepository: Repository<Area>,
    @InjectRepository(Medico)
    private medicoRepository: Repository<Medico>,
  ) { }
  create(createAreaDto: CreateAreaDto) {
    const area = this.areaRepository.create(createAreaDto);
    return this.areaRepository.save(area);
  }

  async findAll() {
    const areas = await this.areaRepository.find({
      where: { isActive: true },
    });
    return areas;
  }

  async findOne(id: number) {
    const area = await this.areaRepository.findOne({ 
      where: { idArea: id, isActive: true } 
    });
    if (!area) {
      throw new NotFoundException('Area not found');
    }
    return area;
  }

  async update(id: number, updateAreaDto: UpdateAreaDto) {
    const area = await this.areaRepository.findOne({ 
      where: { idArea: id, isActive: true } 
    });
    if (!area) {
      throw new NotFoundException('Area not found');
    }
    Object.assign(area, updateAreaDto);
    return this.areaRepository.save(area);
  }

  async remove(id: number) {
    const area = await this.areaRepository.findOne({ 
      where: { idArea: id, isActive: true } 
    });
    if (!area) {
      throw new NotFoundException('Area not found');
    }

    // Verificar si hay médicos activos asociados a esta área
    const medicosAsociados = await this.medicoRepository
      .createQueryBuilder('medico')
      .where('medico.idArea = :idArea', { idArea: id })
      .andWhere('medico.isActive = :isActive', { isActive: true })
      .getMany();

    if (medicosAsociados.length > 0) {
      throw new BadRequestException('No se puede borrar porque hay médicos asociados');
    }

    // Borrado lógico
    await this.areaRepository.update(id, { isActive: false });
    return { 
      message: 'Area eliminada lógicamente',
      deleted: true 
    };
  }
}
