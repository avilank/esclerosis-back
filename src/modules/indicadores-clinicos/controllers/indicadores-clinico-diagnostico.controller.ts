import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { IndicadoresClinicoDiagnosticoService } from '../services';
import * as dto from '../dto/index';

@Controller('indicadores-clinico-diagnostico')
export class IndicadoresClinicoDiagnosticoController {
  constructor(private readonly indicadoresClinicoDiagnosticoService: IndicadoresClinicoDiagnosticoService) {}

  @Post()
  create(@Body() createIndicadoresClinicoDiagnosticoDto: dto.CreateIndicadoresClinicosDiagnosticoDto) {
    return this.indicadoresClinicoDiagnosticoService.create(createIndicadoresClinicoDiagnosticoDto);
  }

  @Get()
  findAll() {
    return this.indicadoresClinicoDiagnosticoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.indicadoresClinicoDiagnosticoService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateIndicadoresClinicoDiagnosticoDto: dto.UpdateIndicadoresClinicosDiagnosticoDto) {
    return this.indicadoresClinicoDiagnosticoService.update(+id, updateIndicadoresClinicoDiagnosticoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.indicadoresClinicoDiagnosticoService.remove(+id);
  }
}