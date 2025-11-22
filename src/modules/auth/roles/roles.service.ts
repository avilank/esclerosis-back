import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rol } from './entities/role.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Rol)
    private readonly rolRepository: Repository<Rol>,
  ) {}

  async create(createRoleDto: CreateRoleDto): Promise<Rol> {
    // Verificar si el rol ya existe
    const rolExistente = await this.rolRepository.findOne({
      where: { nombre: createRoleDto.nombre },
    });

    if (rolExistente) {
      throw new ConflictException(
        `Ya existe un rol con el nombre "${createRoleDto.nombre}"`,
      );
    }

    const rol = this.rolRepository.create(createRoleDto);
    return await this.rolRepository.save(rol);
  }

  async findAll(): Promise<Rol[]> {
    return await this.rolRepository.find({
      relations: ['permisosRoles', 'permisosRoles.permiso'],
      order: { idRol: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Rol> {
    const rol = await this.rolRepository.findOne({
      where: { idRol: id },
      relations: ['permisosRoles', 'permisosRoles.permiso', 'usuarios'],
    });

    if (!rol) {
      throw new NotFoundException(`Rol con ID ${id} no encontrado`);
    }

    return rol;
  }

  async update(id: number, updateRoleDto: UpdateRoleDto): Promise<Rol> {
    const rol = await this.findOne(id);

    // Si se actualiza el nombre, verificar que no exista otro con ese nombre
    if (updateRoleDto.nombre && updateRoleDto.nombre !== rol.nombre) {
      const rolExistente = await this.rolRepository.findOne({
        where: { nombre: updateRoleDto.nombre },
      });

      if (rolExistente) {
        throw new ConflictException(
          `Ya existe un rol con el nombre "${updateRoleDto.nombre}"`,
        );
      }
    }

    Object.assign(rol, updateRoleDto);
    return await this.rolRepository.save(rol);
  }

  async remove(id: number): Promise<void> {
    const rol = await this.findOne(id);
    await this.rolRepository.remove(rol);
  }
}
