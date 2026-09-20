import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
  ForbiddenException,
} from '@nestjs/common';
import { DiagnosticosService } from '../services/diagnosticos.service';
import { CreateDiagnosticoDto } from '../dto/create-diagnostico.dto';
import { UpdateDiagnosticoDto } from '../dto/update-diagnostico.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import {
  ROL_ADMIN,
  ROL_MEDICO,
  ROL_PACIENTE,
} from 'src/common/constants/roles.constant';
import type { JwtPayload } from 'src/common/interfaces/jwt-payload.interface';
import {
  assertMedicoOwnsId,
  assertPacienteOwnsId,
  isPaciente,
} from 'src/common/utils/ownership';

@Roles(ROL_ADMIN, ROL_MEDICO)
@Controller('diagnosticos')
export class DiagnosticosController {
  constructor(private readonly diagnosticosService: DiagnosticosService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body() createDiagnosticoDto: CreateDiagnosticoDto,
    @CurrentUser() user: JwtPayload,
  ) {
    // Un medico solo firma diagnosticos a su propio nombre (el admin puede
    // registrarlos a nombre de cualquier medico).
    assertMedicoOwnsId(user, createDiagnosticoDto.idMedico);
    return this.diagnosticosService.create(createDiagnosticoDto);
  }

  @Get()
  findAll() {
    return this.diagnosticosService.findAll();
  }

  @Get('historia-clinica/:idHistoriaClinica')
  findByHistoriaClinica(
    @Param('idHistoriaClinica', ParseIntPipe) idHistoriaClinica: number,
  ) {
    return this.diagnosticosService.findByHistoriaClinica(idHistoriaClinica);
  }

  @Get('medico/:idMedico')
  findByMedico(
    @Param('idMedico', ParseIntPipe) idMedico: number,
    @CurrentUser() user: JwtPayload,
  ) {
    // Un medico solo lista sus propios diagnosticos.
    assertMedicoOwnsId(user, idMedico);
    return this.diagnosticosService.findByMedico(idMedico);
  }

  @Get('stats/:idMedico')
  getStats(
    @Param('idMedico', ParseIntPipe) idMedico: number,
    @CurrentUser() user: JwtPayload,
  ) {
    assertMedicoOwnsId(user, idMedico);
    return this.diagnosticosService.getStatsByMedico(idMedico);
  }

  @Roles(ROL_ADMIN, ROL_MEDICO, ROL_PACIENTE)
  @Get('stats/paciente/:idPaciente')
  getStatsByPaciente(
    @Param('idPaciente', ParseIntPipe) idPaciente: number,
    @CurrentUser() user: JwtPayload,
  ) {
    // Un paciente solo ve sus propias estadisticas.
    assertPacienteOwnsId(user, idPaciente);
    return this.diagnosticosService.getStatsByPaciente(idPaciente);
  }

  @Roles(ROL_ADMIN, ROL_MEDICO, ROL_PACIENTE)
  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JwtPayload,
  ) {
    const diagnostico = await this.diagnosticosService.findOne(id);
    // El paciente puede abrir el detalle solo si el diagnostico es suyo.
    if (
      isPaciente(user) &&
      diagnostico.historiaClinica?.idPaciente !== user.id
    ) {
      throw new ForbiddenException(
        'Solo puedes consultar tus propios diagnósticos',
      );
    }
    return diagnostico;
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDiagnosticoDto: UpdateDiagnosticoDto,
    @CurrentUser() user: JwtPayload,
  ) {
    // Un medico solo edita sus propios diagnosticos, y no puede reasignarlos a
    // otro medico.
    const actual = await this.diagnosticosService.findOne(id);
    assertMedicoOwnsId(user, actual.idMedico);
    if (updateDiagnosticoDto.idMedico !== undefined) {
      assertMedicoOwnsId(user, updateDiagnosticoDto.idMedico);
    }
    return this.diagnosticosService.update(id, updateDiagnosticoDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JwtPayload,
  ) {
    const actual = await this.diagnosticosService.findOne(id);
    assertMedicoOwnsId(user, actual.idMedico);
    return this.diagnosticosService.remove(id);
  }
}
