import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateMedicoDto } from './dto/create-medico.dto';
import { UpdateMedicoDto } from './dto/update-medico.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Medico } from './entities/medico.entity';
import { Area } from '../areas/entities/area.entity';
import { Sede } from '../sedes/entities/sede.entity';

@Injectable()
export class MedicosService {

  constructor(
    @InjectRepository(Medico)
    private readonly medicoRepository: Repository<Medico>,

    @InjectRepository(Area)
    private readonly areaRepository: Repository<Area>,

    @InjectRepository(Sede)
    private readonly sedeRepository: Repository<Sede>,

  ) { }

  async create(createMedicoDto: CreateMedicoDto) {
    const area = await this.areaRepository.findOne({ where: { idArea: createMedicoDto.idArea, isActive: true } });
    const sede = await this.sedeRepository.findOne({ where: { idSede: createMedicoDto.idSede, isActive: true } });

    if (!area || !sede) {
      throw new BadRequestException('Area o sede no encontrada');
    }

    return await this.medicoRepository.save({
      ...createMedicoDto,
      area,
      sede,
    });
  }

  async findAll() {
    return await this.medicoRepository.find({
      where: { isActive: true },
      relations: ['area', 'sede', 'usuario']
    });
  }

  async findOne(id: number) {
    return await this.medicoRepository.findOne({
      where: { idMedico: id, isActive: true },
      relations: ['area', 'sede', 'usuario']
    });
  }

  async update(id: number, updateMedicoDto: UpdateMedicoDto) {
    const medico = await this.medicoRepository.findOne({ where: { idMedico: id, isActive: true } });
    if (!medico) {
      throw new BadRequestException('Medico no encontrado');
    }
    return await this.medicoRepository.save({
      ...medico,
      ...updateMedicoDto,
    });
  }

  async remove(id: number) {
    const medico = await this.medicoRepository.findOne({ where: { idMedico: id, isActive: true } });
    if (!medico) {
      throw new BadRequestException('Medico no encontrado');
    }
    return await this.medicoRepository.update(id, { isActive: false });
  }
}
