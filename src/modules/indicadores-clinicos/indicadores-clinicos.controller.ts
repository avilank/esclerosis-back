import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { IndicadoresClinicosService } from './indicadores-clinicos.service';
import { CreateIndicadoresClinicoDto } from './dto/indicadores-clinicos/create-indicadores-clinico.dto';
import { UpdateIndicadoresClinicoDto } from './dto/indicadores-clinicos/update-indicadores-clinico.dto';

@Controller('indicadores-clinicos')
export class IndicadoresClinicosController {
  constructor(private readonly indicadoresClinicosService: IndicadoresClinicosService) {}

  @Post()
  create(@Body() createIndicadoresClinicoDto: CreateIndicadoresClinicoDto) {
    return this.indicadoresClinicosService.create(createIndicadoresClinicoDto);
  }

  @Get()
  findAll() {
    return this.indicadoresClinicosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.indicadoresClinicosService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateIndicadoresClinicoDto: UpdateIndicadoresClinicoDto) {
    return this.indicadoresClinicosService.update(+id, updateIndicadoresClinicoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.indicadoresClinicosService.remove(+id);
  }
}
