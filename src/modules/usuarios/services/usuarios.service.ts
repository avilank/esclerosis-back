import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { CreateUsuarioDto } from '../dto/usuario/create-usuario.dto';
import { UpdateUsuarioDto } from '../dto/usuario/update-usuario.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { Usuario } from '../entities/usuario.entity';
import { Rol } from '../../auth/roles/entities/role.entity';
import { Paciente } from '../../pacientes/entities/paciente.entity';
import { Medico } from '../../medicos/entities/medico.entity';
import { HistoriaClinica } from '../../historias-clinicas/entities/historias-clinica.entity';
import { Area } from '../../areas/entities/area.entity';
import { Sede } from '../../sedes/entities/sede.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepo: Repository<Usuario>,
    @InjectRepository(Rol)
    private readonly rolRepo: Repository<Rol>,
    @InjectRepository(Paciente)
    private readonly pacienteRepo: Repository<Paciente>,
    @InjectRepository(Medico)
    private readonly medicoRepo: Repository<Medico>,
    @InjectRepository(HistoriaClinica)
    private readonly historiaClinicaRepo: Repository<HistoriaClinica>,
    @InjectRepository(Area)
    private readonly areaRepo: Repository<Area>,
    @InjectRepository(Sede)
    private readonly sedeRepo: Repository<Sede>,
  ) {}

  private async checkUniqueUsernameEmail(username?: string, email?: string, excludeId?: number) {
    if (!username && !email) return;
    
    // Verificar username
    if (username) {
      const existingByUsername = await this.usuarioRepo.findOne({ 
        where: { username } 
      });
      if (existingByUsername && existingByUsername.idUsuario !== excludeId) {
        throw new ConflictException('Username ya en uso');
      }
    }
    
    // Verificar email
    if (email) {
      const existingByEmail = await this.usuarioRepo.findOne({ 
        where: { email } 
      });
      if (existingByEmail && existingByEmail.idUsuario !== excludeId) {
        throw new ConflictException('Email ya en uso');
      }
    }
  }

  private async validateRolIfPresent(idRol?: number) {
    if (idRol == null) return null;
    const rol = await this.rolRepo.findOneBy({ idRol });
    if (!rol) throw new BadRequestException(`Rol ${idRol} no existe`);
    return rol;
  }

  //Crear usuario desde historia clinica
  async createUsuario(createUsuarioDto: CreateUsuarioDto) {
    await this.checkUniqueUsernameEmail(createUsuarioDto.username, createUsuarioDto.email);
    
    // Validar y obtener el rol
    let rol: Rol | null = null;
    if (createUsuarioDto.idRol) {
      rol = await this.validateRolIfPresent(createUsuarioDto.idRol);
    }

    // hash password
    const saltRounds = 10;
    const hashed = await bcrypt.hash(createUsuarioDto.password, saltRounds);

    
    const usuario = this.usuarioRepo.create({
      username: createUsuarioDto.username,
      email: createUsuarioDto.email,
      password: hashed,
      estado: createUsuarioDto.estado ?? true,
      idRol: createUsuarioDto.idRol,
    });
    const usuarioGuardado = await this.usuarioRepo.save(usuario);

    return await this.usuarioRepo.findOne({
      where: { idUsuario: usuarioGuardado.idUsuario },
      relations: ['rol'],
    });
  }

  async create(createUsuarioDto: CreateUsuarioDto) {
    await this.checkUniqueUsernameEmail(createUsuarioDto.username, createUsuarioDto.email);
    
    // Validar y obtener el rol
    let rol: Rol | null = null;
    if (createUsuarioDto.idRol) {
      rol = await this.validateRolIfPresent(createUsuarioDto.idRol);
    }

    // hash password
    const saltRounds = 10;
    const hashed = await bcrypt.hash(createUsuarioDto.password, saltRounds);

    // Crear usuario
    const usuario = this.usuarioRepo.create({
      username: createUsuarioDto.username,
      email: createUsuarioDto.email,
      password: hashed,
      estado: createUsuarioDto.estado ?? true,
      idRol: createUsuarioDto.idRol,
    });
    const usuarioGuardado = await this.usuarioRepo.save(usuario);

    if (rol && rol.nombre.toLowerCase() === 'paciente') {
      if (!createUsuarioDto.dniPaciente || !createUsuarioDto.nombrePaciente || 
          !createUsuarioDto.edadPaciente || !createUsuarioDto.generoPaciente || 
          !createUsuarioDto.fechaNacimiento) {
        await this.usuarioRepo.remove(usuarioGuardado);
        throw new BadRequestException('Para crear un usuario paciente se requieren: dniPaciente, nombrePaciente, edadPaciente, generoPaciente y fechaNacimiento');
      }

      // Verificar que no exista un paciente con el mismo DNI
      const pacienteExistente = await this.pacienteRepo.findOne({
        where: { dniPaciente: createUsuarioDto.dniPaciente },
      });
      if (pacienteExistente) {
        await this.usuarioRepo.remove(usuarioGuardado);
        throw new ConflictException('Ya existe un paciente con este DNI');
      }

      // Crear paciente
      const paciente = this.pacienteRepo.create({
        idPaciente: usuarioGuardado.idUsuario,
        dniPaciente: createUsuarioDto.dniPaciente,
        nombrePaciente: createUsuarioDto.nombrePaciente,
        edadPaciente: createUsuarioDto.edadPaciente,
        generoPaciente: createUsuarioDto.generoPaciente,
        direccionPaciente: createUsuarioDto.direccionPaciente,
        telefonoPaciente: createUsuarioDto.telefonoPaciente,
        fechaNacimiento: createUsuarioDto.fechaNacimiento,
      });
      await this.pacienteRepo.save(paciente);

      // Crear historia clínica
      const historiaClinica = this.historiaClinicaRepo.create({
        idPaciente: usuarioGuardado.idUsuario,
        estado: 'activa',
      });
      await this.historiaClinicaRepo.save(historiaClinica);
    }

    // Si el rol es "Médico", crear médico
    if (rol && (rol.nombre.toLowerCase() === 'médico' || rol.nombre.toLowerCase() === 'medico')) {
      // Validar que se proporcionaron los datos del médico
      if (!createUsuarioDto.nombreMedico || !createUsuarioDto.idArea || !createUsuarioDto.idSede) {
        // Si falta algún dato requerido, eliminar el usuario creado y lanzar error
        await this.usuarioRepo.remove(usuarioGuardado);
        throw new BadRequestException('Para crear un usuario médico se requieren: nombreMedico, idArea e idSede');
      }

      // Validar que el área y la sede existen
      const area = await this.areaRepo.findOneBy({ idArea: createUsuarioDto.idArea });
      const sede = await this.sedeRepo.findOneBy({ idSede: createUsuarioDto.idSede });

      if (!area || !sede) {
        await this.usuarioRepo.remove(usuarioGuardado);
        throw new BadRequestException('Área o sede no encontrada');
      }

      // Crear médico
      const medico = this.medicoRepo.create({
        idMedico: usuarioGuardado.idUsuario,
        nombre: createUsuarioDto.nombreMedico,
        genero: createUsuarioDto.generoMedico,
        area: area,
        sede: sede,
      });
      await this.medicoRepo.save(medico);
    }

    // Retornar usuario con relaciones cargadas
    return await this.usuarioRepo.findOne({
      where: { idUsuario: usuarioGuardado.idUsuario },
      relations: ['rol', 'paciente', 'medico'],
    });
  }

  findAll() {
    return this.usuarioRepo.find({ 
      where: { estado: true },
      relations: ['rol'] 
    });
  }

  async findOne(id: number) {
    const usuario = await this.usuarioRepo.findOne({
      where: { idUsuario: id, estado: true },
      relations: ['rol', 'paciente', 'medico'],
    });
    if (!usuario) throw new NotFoundException(`Usuario ${id} no encontrado`);
    return usuario;
  }

  async update(id: number, updateUsuarioDto: UpdateUsuarioDto) {
    const usuario = await this.usuarioRepo.findOne({
      where: { idUsuario: id, estado: true },
      relations: ['rol', 'paciente', 'medico'],
    });
    
    if (!usuario) {
      throw new NotFoundException(`Usuario ${id} no encontrado`);
    }

    // check uniqueness if username/email provided
    await this.checkUniqueUsernameEmail(updateUsuarioDto.username, updateUsuarioDto.email, id);

    // Validar que no se intente cambiar el rol si ya tiene uno asignado
    if ((updateUsuarioDto as any).idRol !== undefined && usuario.idRol !== null) {
      if ((updateUsuarioDto as any).idRol !== usuario.idRol) {
        throw new BadRequestException('No se puede cambiar el rol de un usuario');
      }
    }

    // Obtener rol actual
    const rolActual = usuario.rol;
    const nombreRolActual = rolActual?.nombre?.toLowerCase() || '';
    const esPaciente = nombreRolActual === 'paciente';
    const esMedico = nombreRolActual === 'médico' || nombreRolActual === 'medico';

    // hash password if updated
    if (updateUsuarioDto.password) {
      const saltRounds = 10;
      (updateUsuarioDto as any).password = await bcrypt.hash(updateUsuarioDto.password, saltRounds);
    }

    // Actualizar datos básicos del usuario (sin cambiar el rol)
    Object.assign(usuario, {
      username: updateUsuarioDto.username ?? usuario.username,
      email: updateUsuarioDto.email ?? usuario.email,
      password: (updateUsuarioDto as any).password ?? usuario.password,
      estado: updateUsuarioDto.estado ?? usuario.estado,
      // No se actualiza idRol si ya tiene uno asignado
    });
    const usuarioActualizado = await this.usuarioRepo.save(usuario);

    // Si el usuario es "Paciente", actualizar datos del paciente
    if (esPaciente) {
      if (!usuario.paciente) {
        // Si no tiene paciente pero es rol paciente, crear paciente e historia clínica
        if (!updateUsuarioDto.dniPaciente || !updateUsuarioDto.nombrePaciente || 
            !updateUsuarioDto.edadPaciente || !updateUsuarioDto.generoPaciente || 
            !updateUsuarioDto.fechaNacimiento) {
          throw new BadRequestException('Para crear un paciente se requieren: dniPaciente, nombrePaciente, edadPaciente, generoPaciente y fechaNacimiento');
        }

        // Verificar que no exista un paciente con el mismo DNI
        const pacienteExistente = await this.pacienteRepo.findOne({
          where: { dniPaciente: updateUsuarioDto.dniPaciente },
        });
        if (pacienteExistente) {
          throw new ConflictException('Ya existe un paciente con este DNI');
        }

        const paciente = this.pacienteRepo.create({
          idPaciente: usuarioActualizado.idUsuario,
          dniPaciente: updateUsuarioDto.dniPaciente,
          nombrePaciente: updateUsuarioDto.nombrePaciente,
          edadPaciente: updateUsuarioDto.edadPaciente,
          generoPaciente: updateUsuarioDto.generoPaciente,
          direccionPaciente: updateUsuarioDto.direccionPaciente,
          telefonoPaciente: updateUsuarioDto.telefonoPaciente,
          fechaNacimiento: updateUsuarioDto.fechaNacimiento,
        });
        await this.pacienteRepo.save(paciente);

        // Crear historia clínica si no existe
        const historiaExistente = await this.historiaClinicaRepo.findOne({
          where: { idPaciente: usuarioActualizado.idUsuario },
        });
        if (!historiaExistente) {
          const historiaClinica = this.historiaClinicaRepo.create({
            idPaciente: usuarioActualizado.idUsuario,
            estado: 'activa',
          });
          await this.historiaClinicaRepo.save(historiaClinica);
        }
      } else {
        // Actualizar paciente existente
        const pacienteActualizado = {
          dniPaciente: updateUsuarioDto.dniPaciente ?? usuario.paciente.dniPaciente,
          nombrePaciente: updateUsuarioDto.nombrePaciente ?? usuario.paciente.nombrePaciente,
          edadPaciente: updateUsuarioDto.edadPaciente ?? usuario.paciente.edadPaciente,
          generoPaciente: updateUsuarioDto.generoPaciente ?? usuario.paciente.generoPaciente,
          direccionPaciente: updateUsuarioDto.direccionPaciente ?? usuario.paciente.direccionPaciente,
          telefonoPaciente: updateUsuarioDto.telefonoPaciente ?? usuario.paciente.telefonoPaciente,
          fechaNacimiento: updateUsuarioDto.fechaNacimiento ?? usuario.paciente.fechaNacimiento,
        };

        // Verificar DNI único si se está actualizando
        if (updateUsuarioDto.dniPaciente && updateUsuarioDto.dniPaciente !== usuario.paciente.dniPaciente) {
          const pacienteExistente = await this.pacienteRepo.findOne({
            where: { dniPaciente: updateUsuarioDto.dniPaciente },
          });
          if (pacienteExistente) {
            throw new ConflictException('Ya existe un paciente con este DNI');
          }
        }

        Object.assign(usuario.paciente, pacienteActualizado);
        await this.pacienteRepo.save(usuario.paciente);
      }
    }

    // Si el usuario es "Médico", actualizar datos del médico
    if (esMedico) {
      if (!usuario.medico) {
        // Si no tiene médico pero es rol médico, crear médico
        if (!updateUsuarioDto.nombreMedico || !updateUsuarioDto.idArea || !updateUsuarioDto.idSede) {
          throw new BadRequestException('Para crear un médico se requieren: nombreMedico, idArea e idSede');
        }

        // Validar que el área y la sede existen
        const area = await this.areaRepo.findOneBy({ idArea: updateUsuarioDto.idArea });
        const sede = await this.sedeRepo.findOneBy({ idSede: updateUsuarioDto.idSede });

        if (!area || !sede) {
          throw new BadRequestException('Área o sede no encontrada');
        }

        const medico = this.medicoRepo.create({
          idMedico: usuarioActualizado.idUsuario,
          nombre: updateUsuarioDto.nombreMedico,
          genero: updateUsuarioDto.generoMedico,
          area: area,
          sede: sede,
        });
        await this.medicoRepo.save(medico);
      } else {
        // Actualizar médico existente
        const areaId = updateUsuarioDto.idArea ?? usuario.medico.area?.idArea;
        const sedeId = updateUsuarioDto.idSede ?? usuario.medico.sede?.idSede;

        const area = await this.areaRepo.findOneBy({ idArea: areaId });
        const sede = await this.sedeRepo.findOneBy({ idSede: sedeId });

        if (!area || !sede) {
          throw new BadRequestException('Área o sede no encontrada');
        }

        Object.assign(usuario.medico, {
          nombre: updateUsuarioDto.nombreMedico ?? usuario.medico.nombre,
          genero: updateUsuarioDto.generoMedico ?? usuario.medico.genero,
          area: area,
          sede: sede,
        });
        await this.medicoRepo.save(usuario.medico);
      }
    }

    // Retornar usuario con relaciones cargadas
    return await this.usuarioRepo.findOne({
      where: { idUsuario: usuarioActualizado.idUsuario, estado: true },
      relations: ['rol', 'paciente', 'medico'],
    });
  }

  async remove(id: number) {
    const usuario = await this.usuarioRepo.findOne({
      where: { idUsuario: id, estado: true },
      relations: ['rol', 'paciente', 'medico'],
    });
    
    if (!usuario) {
      throw new NotFoundException(`Usuario ${id} no encontrado`);
    }

    // Obtener el rol para determinar el tipo de usuario
    const nombreRol = usuario.rol?.nombre?.toLowerCase() || '';
    const esMedico = nombreRol === 'médico' || nombreRol === 'medico';
    const esPaciente = nombreRol === 'paciente';

    // Borrado lógico del usuario
    await this.usuarioRepo.update(id, { estado: false });

    // Si es médico, ocultar los datos del médico
    if (esMedico && usuario.medico) {
      await this.medicoRepo.update(usuario.medico.idMedico, { isActive: false });
    }

    // Si es paciente, ocultar los datos del paciente y la historia clínica
    if (esPaciente && usuario.paciente) {
      // Ocultar paciente
      await this.pacienteRepo.update(usuario.paciente.idPaciente, { isActive: false });
      
      // Ocultar historia clínica
      const historiaClinica = await this.historiaClinicaRepo.findOne({
        where: { idPaciente: usuario.paciente.idPaciente },
      });
      if (historiaClinica) {
        await this.historiaClinicaRepo.update(historiaClinica.idHistoriaClinica, { 
          isActive: false,
          estado: 'inactiva',
        });
      }
    }

    return { 
      message: 'Usuario eliminado lógicamente',
      deleted: true 
    };
  }
}
