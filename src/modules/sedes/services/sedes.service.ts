import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateSedeDto } from '../dto/sede/create-sede.dto';
import { UpdateSedeDto } from '../dto/sede/update-sede.dto';
import { Sede } from '../entities/sede.entity';
import { Medico } from '../../medicos/entities/medico.entity';

@Injectable()
export class SedesService {
  constructor(
    @InjectRepository(Sede)
    private readonly sedeRepo: Repository<Sede>,
    @InjectRepository(Medico)
    private readonly medicoRepo: Repository<Medico>,
  ) {}

  async create(createSedeDto: CreateSedeDto) {
    const sede = this.sedeRepo.create(createSedeDto);
    return await this.sedeRepo.save(sede);
  }

  findAll() {
    return this.sedeRepo.find({
      where: { isActive: true },
    });
  }

  async findOne(id: number) {
    // usar la propiedad real de la entidad: idSede
    const sede = await this.sedeRepo.findOneBy({ idSede: id, isActive: true });
    if (!sede) throw new NotFoundException(`Sede ${id} no encontrada`);
    return sede;
  }

  async update(id: number, updateSedeDto: UpdateSedeDto) {
    const sede = await this.sedeRepo.findOneBy({ idSede: id, isActive: true });
    if (!sede) {
      throw new NotFoundException(`Sede ${id} no encontrada`);
    }
    Object.assign(sede, updateSedeDto);
    return this.sedeRepo.save(sede);
  }

  async remove(id: number) {
    const sede = await this.sedeRepo.findOneBy({ idSede: id, isActive: true });
    if (!sede) {
      throw new NotFoundException(`Sede ${id} no encontrada`);
    }

    // Verificar si hay médicos activos asociados a esta sede
    const medicosAsociados = await this.medicoRepo
      .createQueryBuilder('medico')
      .where('medico.idSede = :idSede', { idSede: id })
      .andWhere('medico.isActive = :isActive', { isActive: true })
      .getMany();

    if (medicosAsociados.length > 0) {
      throw new BadRequestException('No se puede borrar porque hay médicos asociados');
    }

    // Borrado lógico
    await this.sedeRepo.update(id, { isActive: false });
    return { 
      message: 'Sede eliminada lógicamente',
      deleted: true 
    };
  }
}
