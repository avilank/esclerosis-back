import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { DiagnosticoIndicadoresService } from '../services/diagnostico-indicadores.service';
import { CreateDiagnosticoIndicadoresDto } from '../dto/diagnostico-indicadores/create-diagnostico-indicadores.dto';
import { UpdateDiagnosticoIndicadoresDto } from '../dto/diagnostico-indicadores/update-diagnostico-indicadores.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { ROL_ADMIN, ROL_MEDICO } from 'src/common/constants/roles.constant';

// Registro de valores clinicos: lo hace el medico al diagnosticar.
@Roles(ROL_ADMIN, ROL_MEDICO)
@Controller('diagnostico-indicadores')
export class DiagnosticoIndicadoresController {
  constructor(
    private readonly diagnosticoIndicadoresService: DiagnosticoIndicadoresService,
  ) {}

  @Post()
  create(
    @Body() createDiagnosticoIndicadoresDto: CreateDiagnosticoIndicadoresDto,
  ) {
    return this.diagnosticoIndicadoresService.create(
      createDiagnosticoIndicadoresDto,
    );
  }

  @Get()
  findAll() {
    return this.diagnosticoIndicadoresService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.diagnosticoIndicadoresService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDiagnosticoIndicadoresDto: UpdateDiagnosticoIndicadoresDto,
  ) {
    return this.diagnosticoIndicadoresService.update(
      id,
      updateDiagnosticoIndicadoresDto,
    );
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.diagnosticoIndicadoresService.remove(id);
  }
}
