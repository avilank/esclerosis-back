import { BadRequestException, Injectable } from '@nestjs/common';
import * as dto from '../dto/index';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IndicadorClinicoDiagnostico } from '../entities/indicador-clinico-diagnostico.entity';
import { Diagnostico } from 'src/modules/diagnosticos/entities/diagnostico.entity';
import { IndicadorClinico } from '../entities/indicadores-clinicos.entity';
@Injectable()
export class IndicadoresClinicoDiagnosticoService {
    constructor(
        @InjectRepository(IndicadorClinicoDiagnostico)
        private readonly indicadorClinicoDiagnosticoRepository: Repository<IndicadorClinicoDiagnostico>,
        @InjectRepository(Diagnostico)
        private readonly diagnosticoRepository: Repository<Diagnostico>,
        @InjectRepository(IndicadorClinico)
        private readonly indicadorClinicoRepository: Repository<IndicadorClinico>,
    ) {}

  async create(createIndicadoresClinicoDiagnosticoDto: dto.CreateIndicadoresClinicosDiagnosticoDto) {
      const { idDiagnostico, idIndicador } = createIndicadoresClinicoDiagnosticoDto;
    
      const diagnostico = await this.diagnosticoRepository.findOneBy({ idDiagnostico });
      if (!diagnostico) {
        throw new BadRequestException('Diagnóstico no encontrado');
      }
    
      const indicadorClinico = await this.indicadorClinicoRepository.findOneBy({ idIndicador });
      if (!indicadorClinico) {
        throw new BadRequestException('Indicador clínico no encontrado');
      }
    
      const existeRelacion = await this.indicadorClinicoDiagnosticoRepository.findOne({
        where: {
          diagnostico: { idDiagnostico },
          indicadorClinico: { idIndicador },
        },
      });
    
      if (existeRelacion) {
        throw new BadRequestException(
          `El diagnóstico ${idDiagnostico} ya tiene asignado el indicador ${idIndicador}`,
        );
      }
    
      return this.indicadorClinicoDiagnosticoRepository.save({
        ...createIndicadoresClinicoDiagnosticoDto,
        diagnostico,
        indicadorClinico,
      });
  }
    
  async findAll() {
    return await this.indicadorClinicoDiagnosticoRepository.find({
      relations: {
        diagnostico: true,
        indicadorClinico: true,
      },
    });
  }

  async findOne(id: number) {
    const indicadorClinicoDiagnostico = await this.indicadorClinicoDiagnosticoRepository.findOne({
      where: { idDiagnosticoClinico: id },
      relations: ['diagnostico', 'indicadorClinico'],
    });
    if (!indicadorClinicoDiagnostico) {
      throw new BadRequestException('Indicador clinico diagnostico no encontrado');
    }
    return indicadorClinicoDiagnostico;
  }

  async update(id: number, updateIndicadoresClinicoDiagnosticoDto: dto.UpdateIndicadoresClinicosDiagnosticoDto) {
    const indicadorClinicoDiagnostico = await this.indicadorClinicoDiagnosticoRepository.findOneBy({ idDiagnosticoClinico: id });
    if (!indicadorClinicoDiagnostico) {
      throw new BadRequestException('Indicador clinico diagnostico no encontrado');
    }
    return this.indicadorClinicoDiagnosticoRepository.save({
      ...indicadorClinicoDiagnostico,
      ...updateIndicadoresClinicoDiagnosticoDto,
    });
  }

  async remove(id: number) {
    const indicadorClinicoDiagnostico = await this.indicadorClinicoDiagnosticoRepository.findOneBy({ idDiagnosticoClinico: id });
    if (!indicadorClinicoDiagnostico) {
      throw new BadRequestException('Indicador clinico diagnostico no encontrado');
    }
    return this.indicadorClinicoDiagnosticoRepository.delete(id);
  }
}
