import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { DiagnosticoIndicadoresService } from '../services/diagnostico-indicadores.service';
import { CreateDiagnosticoIndicadoresDto } from '../dto/diagnostico-indicadores/create-diagnostico-indicadores.dto';
import { UpdateDiagnosticoIndicadoresDto } from '../dto/diagnostico-indicadores/update-diagnostico-indicadores.dto';

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
  findOne(@Param('id') id: string) {
    return this.diagnosticoIndicadoresService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateDiagnosticoIndicadoresDto: UpdateDiagnosticoIndicadoresDto,
  ) {
    return this.diagnosticoIndicadoresService.update(
      +id,
      updateDiagnosticoIndicadoresDto,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.diagnosticoIndicadoresService.remove(+id);
  }
}
