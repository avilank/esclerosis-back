import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateMedicoDto } from './dto/create-medico.dto';
import { UpdateMedicoDto } from './dto/update-medico.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Medico } from './entities/medico.entity';
import { Area } from '../areas/entities/area.entity';
import { Sede } from '../sedes/entities/sede.entity';
import { Usuario } from '../usuarios/entities/usuario.entity';

@Injectable()
export class MedicosService {

  constructor(
    @InjectRepository(Medico)
    private readonly medicoRepository: Repository<Medico>,
    
    @InjectRepository(Area)
    private readonly areaRepository: Repository<Area>,
    
    @InjectRepository(Sede)
    private readonly sedeRepository: Repository<Sede>,
    
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,

  ) {}

  async create(createMedicoDto: CreateMedicoDto) {
    const area = await this.areaRepository.findOneBy({ idArea: createMedicoDto.idArea });
    const sede = await this.sedeRepository.findOneBy({ idSede: createMedicoDto.idSede });
    const usuario = await this.usuarioRepository.findOneBy({ idUsuario: createMedicoDto.idUsuario });

    if (!area || !sede || !usuario) {
      throw new BadRequestException('Area, sede o usuario no encontrado');
    }

    return await this.medicoRepository.save({
      ...createMedicoDto,
      area,
      sede,
      usuario,
    });
  }

  async findAll() {
    return await this.medicoRepository.find();
  }

  async findOne(id: number) {
    return await this.medicoRepository.findOneBy({ idMedico: id });
  }

  async update(id: number, updateMedicoDto: UpdateMedicoDto) {
    const medico = await this.medicoRepository.findOneBy({ idMedico: id });
    if (!medico) {
      throw new BadRequestException('Medico no encontrado');
    }
    return await this.medicoRepository.save({
      ...medico,
      ...updateMedicoDto,
    });
  }

  async remove(id: number) {
    const medico = await this.medicoRepository.findOneBy({ idMedico: id });
    if (!medico) {
      throw new BadRequestException('Medico no encontrado');
    }
    return await this.medicoRepository.delete(id);
  }
}
