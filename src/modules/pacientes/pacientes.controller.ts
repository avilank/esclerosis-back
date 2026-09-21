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
} from '@nestjs/common';
import { PacientesService } from './pacientes.service';
import { CreatePacienteDto } from './dto/create-paciente.dto';
import { UpdatePacienteDto } from './dto/update-paciente.dto';
import { CreatePacienteConUsuarioDto } from './dto/create-paciente-con-usuario.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { ROL_ADMIN, ROL_SECRETARIA } from 'src/common/constants/roles.constant';

/**
 * La secretaria puede LEER el padrón y dar de alta pacientes completos
 * (`POST /con-usuario`). La escritura de la ficha suelta (POST / PATCH /
 * DELETE) sigue siendo de admin.
 */
@Roles(ROL_ADMIN, ROL_SECRETARIA)
@Controller('pacientes')
export class PacientesController {
  constructor(private readonly pacientesService: PacientesService) {}

  /**
   * Alta completa: usuario con rol paciente + ficha + historia clínica, en una
   * transacción. Es la vía de la secretaria; `POST /usuarios` (que permite
   * crear admins y médicos) sigue cerrado para ella.
   *
   * Va antes de `POST /` para no competir en el enrutado.
   */
  @Post('con-usuario')
  @HttpCode(HttpStatus.CREATED)
  createConUsuario(@Body() dto: CreatePacienteConUsuarioDto) {
    return this.pacientesService.createConUsuario(dto);
  }

  @Roles(ROL_ADMIN)
  @Post()
  create(@Body() createPacienteDto: CreatePacienteDto) {
    return this.pacientesService.create(createPacienteDto);
  }

  @Get()
  findAll() {
    return this.pacientesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.pacientesService.findOne(id);
  }

  @Roles(ROL_ADMIN)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePacienteDto: UpdatePacienteDto,
  ) {
    return this.pacientesService.update(id, updatePacienteDto);
  }

  @Roles(ROL_ADMIN)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.pacientesService.remove(id);
  }
}
