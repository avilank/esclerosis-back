import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CitasService, FiltrosCita } from '../services/citas.service';
import { CreateCitaDto } from '../dto/create-cita.dto';
import { UpdateCitaDto } from '../dto/update-cita.dto';
import { CambiarEstadoCitaDto } from '../dto/cambiar-estado-cita.dto';
import type { EstadoCita } from '../entities/cita.entity';
import { Roles } from 'src/common/decorators/roles.decorator';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import {
  normalizeRol,
  ROL_ADMIN,
  ROL_MEDICO,
  ROL_PACIENTE,
  ROL_SECRETARIA,
} from 'src/common/constants/roles.constant';
import type { JwtPayload } from 'src/common/interfaces/jwt-payload.interface';
import {
  assertMedicoOwnsId,
  assertPacienteOwnsId,
  isPaciente,
} from 'src/common/utils/ownership';

function esMedico(user: JwtPayload): boolean {
  return normalizeRol(user?.rol) === ROL_MEDICO;
}

/**
 * Agenda de citas. Las crea y administra la secretaria (o el admin); el médico
 * consulta las suyas y marca ausencias; el paciente solo ve las propias.
 */
@Roles(ROL_ADMIN, ROL_SECRETARIA)
@Controller('citas')
export class CitasController {
  constructor(private readonly citasService: CitasService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateCitaDto, @CurrentUser() user: JwtPayload) {
    return this.citasService.create(dto, user.id);
  }

  /**
   * Los filtros de médico y paciente no son opcionales para esos roles: se
   * fuerzan al id del token para que nadie liste la agenda de otro.
   */
  @Roles(ROL_ADMIN, ROL_SECRETARIA, ROL_MEDICO, ROL_PACIENTE)
  @Get()
  findAll(
    @CurrentUser() user: JwtPayload,
    @Query('fecha') fecha?: string,
    @Query('idMedico') idMedico?: string,
    @Query('idPaciente') idPaciente?: string,
    @Query('estado') estado?: EstadoCita,
  ) {
    const filtros: FiltrosCita = { fecha, estado };

    if (esMedico(user)) {
      filtros.idMedico = user.id;
    } else if (idMedico) {
      filtros.idMedico = Number.parseInt(idMedico, 10);
    }

    if (isPaciente(user)) {
      filtros.idPaciente = user.id;
    } else if (idPaciente) {
      filtros.idPaciente = Number.parseInt(idPaciente, 10);
    }

    return this.citasService.findAll(filtros);
  }

  /** Atajo de la agenda del día. El médico solo ve las suyas. */
  @Roles(ROL_ADMIN, ROL_SECRETARIA, ROL_MEDICO)
  @Get('hoy')
  findHoy(
    @CurrentUser() user: JwtPayload,
    @Query('idMedico') idMedico?: string,
  ) {
    const filtros: FiltrosCita = { fecha: this.citasService.hoy() };
    if (esMedico(user)) {
      filtros.idMedico = user.id;
    } else if (idMedico) {
      filtros.idMedico = Number.parseInt(idMedico, 10);
    }
    return this.citasService.findAll(filtros);
  }

  @Roles(ROL_ADMIN, ROL_SECRETARIA, ROL_MEDICO, ROL_PACIENTE)
  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JwtPayload,
  ) {
    const cita = await this.citasService.findOne(id);
    assertPacienteOwnsId(user, cita.idPaciente);
    assertMedicoOwnsId(user, cita.idMedico);
    return cita;
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateCitaDto) {
    return this.citasService.update(id, dto);
  }

  /**
   * El médico solo puede marcar `no_asistio` sobre una cita propia; cancelar y
   * reprogramar es cosa de la secretaria.
   */
  @Roles(ROL_ADMIN, ROL_SECRETARIA, ROL_MEDICO)
  @Patch(':id/estado')
  async cambiarEstado(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CambiarEstadoCitaDto,
    @CurrentUser() user: JwtPayload,
  ) {
    if (esMedico(user)) {
      const cita = await this.citasService.findOne(id);
      assertMedicoOwnsId(user, cita.idMedico);
      if (dto.estado !== 'no_asistio') {
        throw new ForbiddenException(
          'Un médico solo puede marcar la cita como "no_asistio"',
        );
      }
    }
    return this.citasService.cambiarEstado(id, dto.estado);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.citasService.remove(id);
  }
}
