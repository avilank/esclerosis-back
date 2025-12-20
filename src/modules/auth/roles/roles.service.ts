import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rol } from './entities/role.entity';
import { Usuario } from '../../usuarios/entities/usuario.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Rol)
    private readonly rolRepository: Repository<Rol>,
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
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
    return await this.rolRepository
      .createQueryBuilder('rol')
      .leftJoinAndSelect('rol.permisosRoles', 'permisosRoles')
      .leftJoinAndSelect('permisosRoles.permiso', 'permiso')
      .orderBy('rol.idRol', 'ASC')
      .getMany();
  }

  async findOne(id: number): Promise<Rol> {
    const rol = await this.rolRepository
      .createQueryBuilder('rol')
      .leftJoinAndSelect('rol.permisosRoles', 'permisosRoles')
      .leftJoinAndSelect('permisosRoles.permiso', 'permiso')
      .leftJoinAndSelect('rol.usuarios', 'usuarios')
      .where('rol.idRol = :id', { id })
      .getOne();

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

  async countUserRole(id: number): Promise<{ count: number }> {
    // Verificar que el rol existe
    const rol = await this.rolRepository.findOne({
      where: { idRol: id },
    });

    if (!rol) {
      throw new NotFoundException(`Rol con ID ${id} no encontrado`);
    }

    // Contar usuarios que tienen este rol
    const count = await this.usuarioRepository.count({
      where: { idRol: id },
    });

    return { count };
  }

  async remove(id: number): Promise<void> {
    const rol = await this.findOne(id);
    await this.rolRepository.remove(rol);
  }
}
