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
} from '@nestjs/common';
import { DiagnosticosService } from '../services/diagnosticos.service';
import { CreateDiagnosticoDto } from '../dto/create-diagnostico.dto';
import { UpdateDiagnosticoDto } from '../dto/update-diagnostico.dto';

@Controller('diagnosticos')
export class DiagnosticosController {
  constructor(private readonly diagnosticosService: DiagnosticosService) { }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createDiagnosticoDto: CreateDiagnosticoDto) {
    return this.diagnosticosService.create(createDiagnosticoDto);
  }

  @Get()
  findAll() {
    return this.diagnosticosService.findAll();
  }

  @Get('historia-clinica/:idHistoriaClinica')
  findByHistoriaClinica(@Param('idHistoriaClinica') idHistoriaClinica: string) {
    return this.diagnosticosService.findByHistoriaClinica(+idHistoriaClinica);
  }

  @Get('medico/:idMedico')
  findByMedico(@Param('idMedico') idMedico: string) {
    return this.diagnosticosService.findByMedico(+idMedico);
  }

  @Get('stats/:idMedico')
  async getStats(@Param('idMedico') idMedico: string) {
    return this.diagnosticosService.getStatsByMedico(+idMedico);
  }

  @Get('stats/paciente/:idPaciente')
  async getStatsByPaciente(@Param('idPaciente') idPaciente: string) {
    return this.diagnosticosService.getStatsByPaciente(+idPaciente);
  }


  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.diagnosticosService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateDiagnosticoDto: UpdateDiagnosticoDto,
  ) {
    return this.diagnosticosService.update(+id, updateDiagnosticoDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.diagnosticosService.remove(+id);
  }
}
