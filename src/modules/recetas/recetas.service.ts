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
    const diagnostico = await this.diagnosticoRepository.findOne({
      where: { idDiagnostico: createRecetaDto.idDiagnostico, isActive: true },
    });
    const tratamiento = await this.tratamientoRepository.findOne({
      where: { idTratamiento: createRecetaDto.idTratamiento, isActive: true },
    });
    if (!diagnostico || !tratamiento) {
      throw new BadRequestException('Diagnostico o tratamiento no encontrado');
    }

    // La relacion receta-diagnostico es 1 a 1 (UNIQUE en receta.idDiagnostico):
    // avisamos con un 400 claro en vez de dejar explotar el constraint.
    const yaExiste = await this.recetaRepository.findOne({
      where: { diagnostico: { idDiagnostico: createRecetaDto.idDiagnostico } },
      relations: ['diagnostico'],
    });
    if (yaExiste) {
      throw new BadRequestException(
        'Este diagnóstico ya tiene una receta registrada',
      );
    }

    // Solo los campos propios de la entidad: `idDiagnostico`/`idTratamiento`
    // son join columns y las relaciones se asignan aparte.
    return this.recetaRepository.save({
      Modelo_IA: createRecetaDto.Modelo_IA,
      fechaReceta: createRecetaDto.fechaReceta,
      contenido: createRecetaDto.contenido,
      sustentacion: createRecetaDto.sustentacion,
      isActive: createRecetaDto.isActive ?? true,
      diagnostico,
      tratamiento,
    });
  }

  async findAll() {
    return await this.recetaRepository
      .createQueryBuilder('receta')
      .leftJoinAndSelect(
        'receta.diagnostico',
        'diagnostico',
        'diagnostico.isActive = :isActive',
        { isActive: true },
      )
      .leftJoinAndSelect(
        'receta.tratamiento',
        'tratamiento',
        'tratamiento.isActive = :isActive',
        { isActive: true },
      )
      .where('receta.isActive = :isActive', { isActive: true })
      .getMany();
  }

  async findOne(id: number) {
    const receta = await this.recetaRepository
      .createQueryBuilder('receta')
      .leftJoinAndSelect(
        'receta.diagnostico',
        'diagnostico',
        'diagnostico.isActive = :isActive',
        { isActive: true },
      )
      .leftJoinAndSelect(
        'receta.tratamiento',
        'tratamiento',
        'tratamiento.isActive = :isActive',
        { isActive: true },
      )
      .where('receta.idReceta = :id AND receta.isActive = :isActive', {
        id,
        isActive: true,
      })
      .getOne();

    if (!receta) {
      throw new BadRequestException('Receta no encontrada');
    }

    return receta;
  }

  async update(id: number, updateRecetaDto: UpdateRecetaDto) {
    const receta = await this.recetaRepository.findOne({
      where: { idReceta: id, isActive: true },
      relations: ['diagnostico', 'tratamiento'],
    });
    if (!receta) {
      throw new BadRequestException('Receta no encontrada');
    }

    // `idDiagnostico`/`idTratamiento` no son columnas de la entidad, son las
    // join columns de las relaciones. Spreading el DTO tal cual hacia que
    // TypeORM las descartara y el PATCH respondiera 200 sin cambiar nada:
    // hay que asignar la relacion.
    if (updateRecetaDto.idTratamiento !== undefined) {
      const tratamiento = await this.tratamientoRepository.findOne({
        where: { idTratamiento: updateRecetaDto.idTratamiento, isActive: true },
      });
      if (!tratamiento) {
        throw new BadRequestException('Tratamiento no encontrado');
      }
      receta.tratamiento = tratamiento;
    }

    if (updateRecetaDto.idDiagnostico !== undefined) {
      const diagnostico = await this.diagnosticoRepository.findOne({
        where: { idDiagnostico: updateRecetaDto.idDiagnostico, isActive: true },
      });
      if (!diagnostico) {
        throw new BadRequestException('Diagnostico no encontrado');
      }
      receta.diagnostico = diagnostico;
    }

    if (updateRecetaDto.Modelo_IA !== undefined) {
      receta.Modelo_IA = updateRecetaDto.Modelo_IA;
    }
    if (updateRecetaDto.fechaReceta !== undefined) {
      receta.fechaReceta = updateRecetaDto.fechaReceta as unknown as Date;
    }
    if (updateRecetaDto.contenido !== undefined) {
      receta.contenido = updateRecetaDto.contenido;
    }
    if (updateRecetaDto.sustentacion !== undefined) {
      receta.sustentacion = updateRecetaDto.sustentacion;
    }
    if (updateRecetaDto.isActive !== undefined) {
      receta.isActive = updateRecetaDto.isActive;
    }

    return this.recetaRepository.save(receta);
  }

  async remove(id: number) {
    const receta = await this.recetaRepository.findOne({
      where: { idReceta: id, isActive: true },
    });
    if (!receta) {
      throw new BadRequestException('Receta no encontrada');
    }
    return await this.recetaRepository.update(id, { isActive: false });
  }
}
