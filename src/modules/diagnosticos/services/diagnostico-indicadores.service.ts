import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateDiagnosticoIndicadoresDto } from '../dto/diagnostico-indicadores/create-diagnostico-indicadores.dto';
import { UpdateDiagnosticoIndicadoresDto } from '../dto/diagnostico-indicadores/update-diagnostico-indicadores.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DiagnosticoIndicadorClinico } from '../entities/diagnostico-indicadores.entity';
import { Diagnostico } from 'src/modules/diagnosticos/entities/diagnostico.entity';
import { IndicadorClinico } from 'src/modules/models/models';
@Injectable()
export class DiagnosticoIndicadoresService {
  constructor(
    @InjectRepository(DiagnosticoIndicadorClinico)
    private readonly diagnosticoIndicadorClinicoRepository: Repository<DiagnosticoIndicadorClinico>,
    @InjectRepository(Diagnostico)
    private readonly diagnosticoRepository: Repository<Diagnostico>,
    @InjectRepository(IndicadorClinico)
    private readonly indicadorClinicoRepository: Repository<IndicadorClinico>,
  ) {}

  async create(
    createIndicadoresClinicoDiagnosticoDto: CreateDiagnosticoIndicadoresDto,
  ) {
    const { idDiagnostico, idIndicador } =
      createIndicadoresClinicoDiagnosticoDto;

    const diagnostico = await this.diagnosticoRepository.findOneBy({
      idDiagnostico,
    });
    if (!diagnostico) {
      throw new BadRequestException('Diagnóstico no encontrado');
    }

    const indicadorClinico = await this.indicadorClinicoRepository.findOneBy({
      idIndicador,
    });
    if (!indicadorClinico) {
      throw new BadRequestException('Indicador clínico no encontrado');
    }

    const existeRelacion =
      await this.diagnosticoIndicadorClinicoRepository.findOne({
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

    return this.diagnosticoIndicadorClinicoRepository.save({
      ...createIndicadoresClinicoDiagnosticoDto,
      diagnostico,
      indicadorClinico,
    });
  }

  async findAll() {
    return await this.diagnosticoIndicadorClinicoRepository
      .createQueryBuilder('diagnosticoIndicador')
      .leftJoinAndSelect(
        'diagnosticoIndicador.diagnostico',
        'diagnostico',
        'diagnostico.isActive = :isActive',
        { isActive: true },
      )
      .leftJoinAndSelect(
        'diagnosticoIndicador.indicadorClinico',
        'indicadorClinico',
        'indicadorClinico.isActive = :isActive',
        { isActive: true },
      )
      .getMany();
  }

  async findOne(id: number) {
    const indicadorClinicoDiagnostico =
      await this.diagnosticoIndicadorClinicoRepository
        .createQueryBuilder('diagnosticoIndicador')
        .leftJoinAndSelect(
          'diagnosticoIndicador.diagnostico',
          'diagnostico',
          'diagnostico.isActive = :isActive',
          { isActive: true },
        )
        .leftJoinAndSelect(
          'diagnosticoIndicador.indicadorClinico',
          'indicadorClinico',
          'indicadorClinico.isActive = :isActive',
          { isActive: true },
        )
        .where('diagnosticoIndicador.idDiagnosticoIndicadorClinico = :id', {
          id,
        })
        .getOne();
    if (!indicadorClinicoDiagnostico) {
      throw new BadRequestException(
        'Indicador clinico diagnostico no encontrado',
      );
    }
    return indicadorClinicoDiagnostico;
  }

  async update(
    id: number,
    updateIndicadoresClinicoDiagnosticoDto: UpdateDiagnosticoIndicadoresDto,
  ) {
    const indicadorClinicoDiagnostico =
      await this.diagnosticoIndicadorClinicoRepository.findOneBy({
        idDiagnosticoIndicadorClinico: id,
      });
    if (!indicadorClinicoDiagnostico) {
      throw new BadRequestException(
        'Indicador clinico diagnostico no encontrado',
      );
    }
    return this.diagnosticoIndicadorClinicoRepository.save({
      ...indicadorClinicoDiagnostico,
      ...updateIndicadoresClinicoDiagnosticoDto,
    });
  }

  async remove(id: number) {
    const indicadorClinicoDiagnostico =
      await this.diagnosticoIndicadorClinicoRepository.findOneBy({
        idDiagnosticoIndicadorClinico: id,
      });
    if (!indicadorClinicoDiagnostico) {
      throw new BadRequestException(
        'Indicador clinico diagnostico no encontrado',
      );
    }
    return this.diagnosticoIndicadorClinicoRepository.delete(id);
  }
}
