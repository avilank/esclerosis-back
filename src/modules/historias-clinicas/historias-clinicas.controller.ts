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
} from '@nestjs/common';
import { HistoriasClinicasService } from './historias-clinicas.service';
import { CreateHistoriasClinicaDto } from './dto/create-historias-clinica.dto';
import { UpdateHistoriasClinicaDto } from './dto/update-historias-clinica.dto';

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

  @Get()
  findAll() {
    return this.historiasClinicasService.findAll();
  }

  @Get('paciente/:idPaciente')
  findByPaciente(@Param('idPaciente') idPaciente: string) {
    return this.historiasClinicasService.findByPaciente(+idPaciente);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.historiasClinicasService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateHistoriasClinicaDto: UpdateHistoriasClinicaDto,
  ) {
    return this.historiasClinicasService.update(+id, updateHistoriasClinicaDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.historiasClinicasService.remove(+id);
  }
}
