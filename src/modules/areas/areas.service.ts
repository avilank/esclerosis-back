import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAreaDto } from './dto/create-area.dto';
import { UpdateAreaDto } from './dto/update-area.dto';
import { Area } from './entities/area.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class AreasService {
  constructor(
    @InjectRepository(Area)
    private areaRepository: Repository<Area>,
  ) { }
  create(createAreaDto: CreateAreaDto) {
    const area = this.areaRepository.create(createAreaDto);
    return this.areaRepository.save(area);
  }

  async findAll() {
    const areas = await this.areaRepository.find();
    return areas;

  }

  async findOne(id: number) {
    const area = await this.areaRepository.findOne({ where: { idArea: id } });
    if (!area) {
      throw new NotFoundException('Area not found');
    }
    return area;
  }

  async update(id: number, updateAreaDto: UpdateAreaDto) {
    const area = await this.areaRepository.findOne({ where: { idArea: id } });
    if (!area) {
      throw new NotFoundException('Area not found');
    }
    this.areaRepository.update(id, updateAreaDto);
    return this.areaRepository.save(area);
  }

  async remove(id: number) {
    const area = await this.areaRepository.findOne({ where: { idArea: id } });
    if (!area) {
      throw new NotFoundException('Area not found');
    }
    return this.areaRepository.delete(area);
  }
}
