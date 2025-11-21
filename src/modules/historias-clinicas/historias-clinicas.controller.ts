import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { HistoriasClinicasService } from './historias-clinicas.service';
import { CreateHistoriasClinicaDto } from './dto/create-historias-clinica.dto';
import { UpdateHistoriasClinicaDto } from './dto/update-historias-clinica.dto';

@Controller('historias-clinicas')
export class HistoriasClinicasController {
  constructor(private readonly historiasClinicasService: HistoriasClinicasService) {}

  @Post()
  create(@Body() createHistoriasClinicaDto: CreateHistoriasClinicaDto) {
    return this.historiasClinicasService.create(createHistoriasClinicaDto);
  }

  @Get()
  findAll() {
    return this.historiasClinicasService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.historiasClinicasService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateHistoriasClinicaDto: UpdateHistoriasClinicaDto) {
    return this.historiasClinicasService.update(+id, updateHistoriasClinicaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.historiasClinicasService.remove(+id);
  }
}
