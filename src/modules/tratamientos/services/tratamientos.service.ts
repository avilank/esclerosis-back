import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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
    return this.tratamientoRepo.find({ where: { isActive: true } });
  }

  async findOne(id: number) {
    const tratamiento = await this.tratamientoRepo.findOne({
      where: { idTratamiento: id, isActive: true },
    });
    if (!tratamiento)
      throw new NotFoundException(`Tratamiento ${id} no encontrado`);
    return tratamiento;
  }

  async update(id: number, updateTratamientoDto: UpdateTratamientoDto) {
    const tratamiento = await this.findOne(id);
    this.assertNoBloqueado(tratamiento);
    Object.assign(tratamiento, updateTratamientoDto);
    return this.tratamientoRepo.save(tratamiento);
  }

  async remove(id: number) {
    const tratamiento = await this.findOne(id);
    this.assertNoBloqueado(tratamiento);
    await this.tratamientoRepo.update(id, { isActive: false });
    return { message: 'Tratamiento eliminado lógicamente', deleted: true };
  }

  /**
   * Los tratamientos del catalogo base (DMT sembrados con `bloqueado: true`)
   * no se pueden editar ni borrar: son los que usa el asistente de
   * prescripcion, y sin ellos responde 422 "No hay tratamientos activos".
   */
  private assertNoBloqueado(tratamiento: Tratamiento) {
    if (tratamiento.bloqueado) {
      throw new BadRequestException(
        `El tratamiento "${tratamiento.nombre}" es parte del catálogo base y no se puede modificar ni eliminar`,
      );
    }
  }
}
