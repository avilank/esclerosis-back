import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permiso } from '../entities/permiso.entity';
import { PermisoRol } from '../entities/permiso-rol.entity';
import { CreatePermisoDto } from '../dto/permiso/create-permiso.dto';
import { UpdatePermisoDto } from '../dto/permiso/update-permiso.dto';
import { CreatePermisoRolDto } from '../dto/permiso-rol/create-permiso-rol.dto';

@Injectable()
export class PermisosService {
  constructor(
    @InjectRepository(Permiso)
    private readonly permisoRepository: Repository<Permiso>,
    @InjectRepository(PermisoRol)
    private readonly permisoRolRepository: Repository<PermisoRol>,
  ) { }

  // CRUD de Permisos
  async create(createPermisoDto: CreatePermisoDto): Promise<Permiso> {
    // Verificar si el permiso ya existe
    const permisoExistente = await this.permisoRepository.findOne({
      where: { nombre: createPermisoDto.nombre },
    });

    if (permisoExistente) {
      throw new ConflictException(
        `Ya existe un permiso con el nombre "${createPermisoDto.nombre}"`,
      );
    }

    const permiso = this.permisoRepository.create(createPermisoDto);
    return await this.permisoRepository.save(permiso);
  }

  async findAll(): Promise<Permiso[]> {
    return await this.permisoRepository.find({
      relations: ['permisosRoles', 'permisosRoles.rol'],
      order: { idPermiso: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Permiso> {
    const permiso = await this.permisoRepository.findOne({
      where: { idPermiso: id },
      relations: ['permisosRoles', 'permisosRoles.rol'],
    });

    if (!permiso) {
      throw new NotFoundException(`Permiso con ID ${id} no encontrado`);
    }

    return permiso;
  }

  async update(
    id: number,
    updatePermisoDto: UpdatePermisoDto,
  ): Promise<Permiso> {
    const permiso = await this.findOne(id);

    // Si se actualiza el nombre, verificar que no exista otro con ese nombre
    if (updatePermisoDto.nombre && updatePermisoDto.nombre !== permiso.nombre) {
      const permisoExistente = await this.permisoRepository.findOne({
        where: { nombre: updatePermisoDto.nombre },
      });

      if (permisoExistente) {
        throw new ConflictException(
          `Ya existe un permiso con el nombre "${updatePermisoDto.nombre}"`,
        );
      }
    }

    Object.assign(permiso, updatePermisoDto);
    return await this.permisoRepository.save(permiso);
  }

  async remove(id: number): Promise<void> {
    const permiso = await this.findOne(id);
    await this.permisoRepository.remove(permiso);
  }

  // CRUD de PermisoRol (Asignación de permisos a roles)
  async asignarPermisoARol(
    createPermisoRolDto: CreatePermisoRolDto,
  ): Promise<PermisoRol> {
    // Verificar si la asignación ya existe
    const permisoRolExistente = await this.permisoRolRepository.findOne({
      where: {
        idRol: createPermisoRolDto.idRol,
        idPermiso: createPermisoRolDto.idPermiso,
      },
      relations: ['rol', 'permiso'],
    });

    if (permisoRolExistente) {
      throw new ConflictException(
        'Este permiso ya está asignado a este rol',
      );
    }

    const permisoRol = this.permisoRolRepository.create(createPermisoRolDto);
    return await this.permisoRolRepository.save(permisoRol);
  }

  async findAllPermisosRoles(): Promise<PermisoRol[]> {
    return await this.permisoRolRepository.find({
      relations: ['rol', 'permiso'],
      order: { idRol: 'ASC', idPermiso: 'ASC' },
    });
  }

  async findPermisosPorRol(idRol: number): Promise<PermisoRol[]> {
    return await this.permisoRolRepository.find({
      where: { idRol },
      relations: ['permiso'],
      order: { idPermiso: 'ASC' },
    });
  }

  async findRolesPorPermiso(idPermiso: number): Promise<PermisoRol[]> {
    return await this.permisoRolRepository.find({
      where: { idPermiso },
      relations: ['rol'],
      order: { idRol: 'ASC' },
    });
  }

  async eliminarPermisoDeRol(idRol: number, idPermiso: number): Promise<void> {
    const permisoRol = await this.permisoRolRepository.findOne({
      where: {
        idRol,
        idPermiso,
      },
    });

    if (!permisoRol) {
      throw new NotFoundException(
        'La asignación de permiso a rol no existe',
      );
    }

    await this.permisoRolRepository.remove(permisoRol);
  }
}
