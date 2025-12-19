import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateSedeDto } from '../dto/sede/create-sede.dto';
import { UpdateSedeDto } from '../dto/sede/update-sede.dto';
import { Sede } from '../entities/sede.entity';

@Injectable()
export class SedesService {
  constructor(
    @InjectRepository(Sede)
    private readonly sedeRepo: Repository<Sede>,
  ) { }

  async create(createSedeDto: CreateSedeDto) {
    const sede = this.sedeRepo.create(createSedeDto);
    return await this.sedeRepo.save(sede);
  }

  findAll() {
    return this.sedeRepo.find({ where: { isActive: true } });
  }

  async findOne(id: number) {
    // usar la propiedad real de la entidad: idSede
    const sede = await this.sedeRepo.findOne({ where: { idSede: id, isActive: true } });
    if (!sede) throw new NotFoundException(`Sede ${id} no encontrada`);
    return sede;
  }

  async update(id: number, updateSedeDto: UpdateSedeDto) {
    const sede = await this.findOne(id);
    Object.assign(sede, updateSedeDto);
    return this.sedeRepo.save(sede);
  }

  async remove(id: number) {
    const sede = await this.findOne(id);
    await this.sedeRepo.update(id, { isActive: false });
    return { deleted: true };
  }
}
