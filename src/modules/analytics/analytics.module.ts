import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Paciente } from '../pacientes/entities/paciente.entity';
import { Medico } from '../medicos/entities/medico.entity';
import { Sede } from '../sedes/entities/sede.entity';
import { Receta } from '../recetas/entities/receta.entity';
import { DimPaciente } from '../../entities/esclerosisd/dim-paciente.entity';
import { DimMedico } from '../../entities/esclerosisd/dim-medico.entity';
import { DimOrganizacion } from '../../entities/esclerosisd/dim-organizacion.entity';
import { DimTiempo } from '../../entities/esclerosisd/dim-tiempo.entity';
import { DimModeloIA } from '../../entities/esclerosisd/dim-modelo-ia.entity';
import { DimIndicadorClinico } from '../../entities/esclerosisd/dim-indicador.entity';
import { HechoRecetas } from '../../entities/esclerosisd/hechos/hecho-recetas.entity';
import { HechoIndicador } from '../../entities/esclerosisd/hechos/hecho-indicador.entity';
import { HechoPacientesEM } from '../../entities/esclerosisd/hechos/hecho-pacientes-em.entity';
import { HechoPacientesAtendidos } from '../../entities/esclerosisd/hechos/hecho-pacientes-atendidos.entity';
import { AnalyticsEtlsService } from './services/analytics-etls.service';
import { AnalyticsController } from './controllers/analytics.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Paciente, Medico, Sede, Receta]),
    TypeOrmModule.forFeature(
      [
        DimPaciente,
        DimMedico,
        DimOrganizacion,
        DimTiempo,
        DimModeloIA,
        DimIndicadorClinico,
        HechoRecetas,
        HechoIndicador,
        HechoPacientesEM,
        HechoPacientesAtendidos,
      ],
      'esclerosisdConnection',
    ),
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsEtlsService],
  exports: [AnalyticsEtlsService],
})
export class AnalyticsModule {}
