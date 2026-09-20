import { Body, Controller, Get, Post } from '@nestjs/common';
import { AnalyticsEtlsService } from '../services/analytics-etls.service';
import { Roles } from 'src/common/decorators/roles.decorator';
import {
  ROL_ADMIN,
  ROL_MEDICO,
  ROL_PACIENTE,
} from 'src/common/constants/roles.constant';

/**
 * Reportes (dimensiones y hechos en la misma base operativa). Las LECTURAS
 * las consume la pantalla de reportes de los tres roles; las ESCRITURAS
 * (disparar el ETL, insertar hechos o dimensiones a mano) quedan reservadas
 * al admin.
 *
 * Pendiente: los GET devuelven los hechos de todos los pacientes y el filtrado
 * por paciente se hace en el cliente. Acotarlo requiere rediseñar estos
 * endpoints por rol (fuera del alcance de este cambio).
 */
@Roles(ROL_ADMIN, ROL_MEDICO, ROL_PACIENTE)
@Controller('analytics/etl')
export class AnalyticsController {
  constructor(private readonly analyticsEtlsService: AnalyticsEtlsService) {}

  @Roles(ROL_ADMIN)
  @Post('dimensiones')
  async cargarDimensiones(): Promise<{ status: string }> {
    await this.analyticsEtlsService.cargarDimensiones();
    return { status: 'ok' };
  }

  @Roles(ROL_ADMIN)
  @Post('hechos')
  async cargarHechos(): Promise<{ status: string }> {
    await this.analyticsEtlsService.cargarHechoRecetas();
    return { status: 'ok' };
  }

  @Roles(ROL_ADMIN)
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

  @Roles(ROL_ADMIN)
  @Post('hechos/recetas')
  createHechoReceta(@Body() body: any) {
    return this.analyticsEtlsService.createHechoReceta(body);
  }

  @Roles(ROL_ADMIN)
  @Post('hechos/recetas/reload')
  reloadHechoRecetas() {
    return this.analyticsEtlsService.reloadHechoRecetas();
  }

  @Roles(ROL_ADMIN)
  @Post('hechos/indicadores')
  createHechoIndicador(@Body() body: any) {
    return this.analyticsEtlsService.createHechoIndicador(body);
  }

  @Roles(ROL_ADMIN)
  @Post('hechos/pacientes-em')
  createHechoPacientesEm(@Body() body: any) {
    return this.analyticsEtlsService.createHechoPacientesEm(body);
  }

  @Roles(ROL_ADMIN)
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

  @Roles(ROL_ADMIN)
  @Post('dimensiones/pacientes')
  createDimPaciente(@Body() body: any) {
    return this.analyticsEtlsService.createDimPaciente(body);
  }

  @Roles(ROL_ADMIN)
  @Post('dimensiones/medicos')
  createDimMedico(@Body() body: any) {
    return this.analyticsEtlsService.createDimMedico(body);
  }

  @Roles(ROL_ADMIN)
  @Post('dimensiones/organizaciones')
  createDimOrganizacion(@Body() body: any) {
    return this.analyticsEtlsService.createDimOrganizacion(body);
  }

  @Roles(ROL_ADMIN)
  @Post('dimensiones/tiempos')
  createDimTiempo(@Body() body: any) {
    return this.analyticsEtlsService.createDimTiempo(body);
  }

  @Roles(ROL_ADMIN)
  @Post('dimensiones/modelos-ia')
  createDimModeloIa(@Body() body: any) {
    return this.analyticsEtlsService.createDimModeloIa(body);
  }

  @Roles(ROL_ADMIN)
  @Post('dimensiones/indicadores-clinicos')
  createDimIndicadorClinico(@Body() body: any) {
    return this.analyticsEtlsService.createDimIndicadorClinico(body);
  }
}
