import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { CreateUsuarioDto } from '../dto/usuario/create-usuario.dto';
import { UpdateUsuarioDto } from '../dto/usuario/update-usuario.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { Usuario } from '../entities/usuario.entity';
import { Rol } from '../../auth/roles/entities/role.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepo: Repository<Usuario>,
    @InjectRepository(Rol)
    private readonly rolRepo: Repository<Rol>,
  ) {}

  private async checkUniqueUsernameEmail(username?: string, email?: string, excludeId?: number) {
    if (!username && !email) return;
    const where: FindOptionsWhere<Usuario>[] = [];
    if (username) where.push({ username });
    if (email) where.push({ email });
    const existing = await this.usuarioRepo.findOne({ where });
    if (existing && existing.idUsuario !== excludeId) {
      if (existing.username === username) throw new ConflictException('Username ya en uso');
      if (existing.email === email) throw new ConflictException('Email ya en uso');
      throw new ConflictException('Username o email ya en uso');
    }
  }

  private async validateRolIfPresent(idRol?: number) {
    if (idRol == null) return null;
    const rol = await this.rolRepo.findOneBy({ idRol });
    if (!rol) throw new BadRequestException(`Rol ${idRol} no existe`);
    return rol;
  }

  async create(createUsuarioDto: CreateUsuarioDto) {
    await this.checkUniqueUsernameEmail(createUsuarioDto.username, createUsuarioDto.email);
    await this.validateRolIfPresent((createUsuarioDto as any).idRol);

    // hash password
    const saltRounds = 10;
    const hashed = await bcrypt.hash(createUsuarioDto.password, saltRounds);

    const usuario = this.usuarioRepo.create({
      ...createUsuarioDto,
      password: hashed,
    });
    return await this.usuarioRepo.save(usuario);
  }

  findAll() {
    return this.usuarioRepo.find({ relations: ['rol'] });
  }

  async findOne(id: number) {
    const usuario = await this.usuarioRepo.findOne({
      where: { idUsuario: id },
      relations: ['rol'],
    });
    if (!usuario) throw new NotFoundException(`Usuario ${id} no encontrado`);
    return usuario;
  }

  async update(id: number, updateUsuarioDto: UpdateUsuarioDto) {
    const usuario = await this.findOne(id);

    // check uniqueness if username/email provided
    await this.checkUniqueUsernameEmail(updateUsuarioDto.username, updateUsuarioDto.email, id);

    // validate rol if provided
    if ((updateUsuarioDto as any).idRol !== undefined) {
      await this.validateRolIfPresent((updateUsuarioDto as any).idRol);
    }

    // hash password if updated
    if (updateUsuarioDto.password) {
      const saltRounds = 10;
      (updateUsuarioDto as any).password = await bcrypt.hash(updateUsuarioDto.password, saltRounds);
    }

    Object.assign(usuario, updateUsuarioDto);
    return this.usuarioRepo.save(usuario);
  }

  async remove(id: number) {
    const usuario = await this.findOne(id);
    await this.usuarioRepo.remove(usuario);
    return { deleted: true };
  }
}
