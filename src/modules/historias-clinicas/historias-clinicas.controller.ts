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
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { HistoriasClinicasService } from './historias-clinicas.service';
import { CreateHistoriasClinicaDto } from './dto/create-historias-clinica.dto';
import { UpdateHistoriasClinicaDto } from './dto/update-historias-clinica.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import {
  ROL_ADMIN,
  ROL_MEDICO,
  ROL_PACIENTE,
  ROL_SECRETARIA,
} from 'src/common/constants/roles.constant';
import type { JwtPayload } from 'src/common/interfaces/jwt-payload.interface';
import {
  assertMedicoOwnsId,
  assertPacienteOwnsId,
} from 'src/common/utils/ownership';

// La secretaria solo LEE (listado y búsqueda), para elegir el paciente al
// agendar. Crear/editar/borrar historias sigue siendo de admin y médico.
@Roles(ROL_ADMIN, ROL_MEDICO)
@Controller('historias-clinicas')
export class HistoriasClinicasController {
  constructor(
    private readonly historiasClinicasService: HistoriasClinicasService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createHistoriasClinicaDto: CreateHistoriasClinicaDto) {
    return this.historiasClinicasService.create(createHistoriasClinicaDto);
  }

  @Roles(ROL_ADMIN, ROL_MEDICO, ROL_SECRETARIA)
  @Get()
  findAll() {
    return this.historiasClinicasService.findAll();
  }

  @Roles(ROL_ADMIN, ROL_MEDICO, ROL_SECRETARIA)
  @Get('search')
  async search(@Query('q') q: string) {
    if (!q || q.trim() === '') {
      return [];
    }
    return this.historiasClinicasService.search(q.trim());
  }

  @Get('search/medico/:idMedico')
  async searchByMedico(
    @Param('idMedico', ParseIntPipe) idMedico: number,
    @Query('q') q: string,
    @CurrentUser() user: JwtPayload,
  ) {
    assertMedicoOwnsId(user, idMedico);
    if (!q || q.trim() === '') {
      return [];
    }
    return this.historiasClinicasService.searchByMedico(q.trim(), idMedico);
  }

  @Roles(ROL_ADMIN, ROL_MEDICO, ROL_PACIENTE)
  @Get('paciente/:idPaciente')
  findByPaciente(
    @Param('idPaciente', ParseIntPipe) idPaciente: number,
    @CurrentUser() user: JwtPayload,
  ) {
    // Sin este chequeo, un paciente leia la historia clinica de cualquier otro
    // cambiando el id de la URL.
    assertPacienteOwnsId(user, idPaciente);
    return this.historiasClinicasService.findByPaciente(idPaciente);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.historiasClinicasService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateHistoriasClinicaDto: UpdateHistoriasClinicaDto,
  ) {
    return this.historiasClinicasService.update(id, updateHistoriasClinicaDto);
  }

  @Roles(ROL_ADMIN)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.historiasClinicasService.remove(id);
  }

  @Get('medico/:idMedico')
  findMedicoHistoriaClinica(
    @Param('idMedico', ParseIntPipe) idMedico: number,
    @CurrentUser() user: JwtPayload,
  ) {
    assertMedicoOwnsId(user, idMedico);
    return this.historiasClinicasService.findMedicoHistoriaClinica(idMedico);
  }
}
