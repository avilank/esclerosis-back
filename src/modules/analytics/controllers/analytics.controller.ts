import { Body, Controller, Get, Post } from '@nestjs/common';
import { AnalyticsEtlsService } from '../services/analytics-etls.service';

@Controller('analytics/etl')
export class AnalyticsController {
  constructor(private readonly analyticsEtlsService: AnalyticsEtlsService) {}

  @Post('dimensiones')
  async cargarDimensiones(): Promise<{ status: string }> {
    await this.analyticsEtlsService.cargarDimensiones();
    return { status: 'ok' };
  }

  @Post('hechos')
  async cargarHechos(): Promise<{ status: string }> {
    await this.analyticsEtlsService.cargarHechoRecetas();
    return { status: 'ok' };
  }

  @Post('todo')
  async cargarTodo(): Promise<{ status: string }> {
    await this.analyticsEtlsService.cargarTodo();
    return { status: 'ok' };
  }

  // Hechos - GET

  @Get('hechos/recetas')
  getHechoRecetas() {
    return this.analyticsEtlsService.getHechoRecetas();
  }

  @Get('hechos/indicadores')
  getHechoIndicadores() {
    return this.analyticsEtlsService.getHechoIndicadores();
  }

  @Get('hechos/pacientes-em')
  getHechoPacientesEm() {
    return this.analyticsEtlsService.getHechoPacientesEm();
  }

  @Get('hechos/pacientes-atendidos')
  getHechoPacientesAtendidos() {
    return this.analyticsEtlsService.getHechoPacientesAtendidos();
  }

  // Hechos - POST

  @Post('hechos/recetas')
  createHechoReceta(@Body() body: any) {
    return this.analyticsEtlsService.createHechoReceta(body);
  }

  @Post('hechos/recetas/reload')
  reloadHechoRecetas() {
    return this.analyticsEtlsService.reloadHechoRecetas();
  }

  @Post('hechos/indicadores')
  createHechoIndicador(@Body() body: any) {
    return this.analyticsEtlsService.createHechoIndicador(body);
  }

  @Post('hechos/pacientes-em')
  createHechoPacientesEm(@Body() body: any) {
    return this.analyticsEtlsService.createHechoPacientesEm(body);
  }

  @Post('hechos/pacientes-atendidos')
  createHechoPacientesAtendidos(@Body() body: any) {
    return this.analyticsEtlsService.createHechoPacientesAtendidos(body);
  }

  // Dimensiones - GET

  @Get('dimensiones/pacientes')
  getDimPacientes() {
    return this.analyticsEtlsService.getDimPacientes();
  }

  @Get('dimensiones/medicos')
  getDimMedicos() {
    return this.analyticsEtlsService.getDimMedicos();
  }

  @Get('dimensiones/organizaciones')
  getDimOrganizaciones() {
    return this.analyticsEtlsService.getDimOrganizaciones();
  }

  @Get('dimensiones/tiempos')
  getDimTiempos() {
    return this.analyticsEtlsService.getDimTiempos();
  }

  @Get('dimensiones/modelos-ia')
  getDimModelosIa() {
    return this.analyticsEtlsService.getDimModelosIa();
  }

  @Get('dimensiones/indicadores-clinicos')
  getDimIndicadoresClinicos() {
    return this.analyticsEtlsService.getDimIndicadoresClinicos();
  }

  // Dimensiones - POST

  @Post('dimensiones/pacientes')
  createDimPaciente(@Body() body: any) {
    return this.analyticsEtlsService.createDimPaciente(body);
  }

  @Post('dimensiones/medicos')
  createDimMedico(@Body() body: any) {
    return this.analyticsEtlsService.createDimMedico(body);
  }

  @Post('dimensiones/organizaciones')
  createDimOrganizacion(@Body() body: any) {
    return this.analyticsEtlsService.createDimOrganizacion(body);
  }

  @Post('dimensiones/tiempos')
  createDimTiempo(@Body() body: any) {
    return this.analyticsEtlsService.createDimTiempo(body);
  }

  @Post('dimensiones/modelos-ia')
  createDimModeloIa(@Body() body: any) {
    return this.analyticsEtlsService.createDimModeloIa(body);
  }

  @Post('dimensiones/indicadores-clinicos')
  createDimIndicadorClinico(@Body() body: any) {
    return this.analyticsEtlsService.createDimIndicadorClinico(body);
  }
}
