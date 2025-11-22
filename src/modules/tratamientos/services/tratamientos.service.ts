import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTratamientoDto } from '../dto/tratamiento/create-tratamiento.dto';
import { UpdateTratamientoDto } from '../dto/tratamiento/update-tratamiento.dto';
import { Tratamiento } from '../entities/tratamiento.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class TratamientosService {
  constructor(
    @InjectRepository(Tratamiento)
    private readonly tratamientoRepo: Repository<Tratamiento>,
  ) {}

  async create(createTratamientoDto: CreateTratamientoDto) {
    const tratamiento = this.tratamientoRepo.create(createTratamientoDto);
    return await this.tratamientoRepo.save(tratamiento);
  }

  findAll() {
    return this.tratamientoRepo.find();
  }

  async findOne(id: number) {
    const tratamiento = await this.tratamientoRepo.findOneBy({ idTratamiento: id });
    if (!tratamiento) throw new NotFoundException(`Tratamiento ${id} no encontrado`);
    return tratamiento;
  }

  async update(id: number, updateTratamientoDto: UpdateTratamientoDto) {
    const tratamiento = await this.findOne(id);
    Object.assign(tratamiento, updateTratamientoDto);
    return this.tratamientoRepo.save(tratamiento);
  }

  async remove(id: number) {
    const tratamiento = await this.findOne(id);
    await this.tratamientoRepo.remove(tratamiento);
    return { deleted: true };
  }
}
