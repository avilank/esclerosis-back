import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';

/**
 * ETL de reportes sobre la misma base operativa (`clinica-bd`).
 * Ya no usa dblink ni una segunda base dimensional.
 */
@Injectable()
export class ScheduledEtlService implements OnModuleInit {
  private readonly logger = new Logger(ScheduledEtlService.name);

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  async onModuleInit() {
    this.logger.log('Módulo ScheduledEtlService inicializado');
    this.logger.log('Ejecutando ETL al iniciar el servidor...');

    try {
      await this.ejecutarEtlDiario();
    } catch (error) {
      this.logger.error(
        `Error ejecutando ETL al iniciar servidor: ${error.message}. El servidor continuará iniciando normalmente.`,
      );
      this.logger.debug(error.stack);
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async ejecutarEtlDiario() {
    this.logger.log('Iniciando ETL diario...');
    this.logger.log(`Fecha/Hora: ${new Date().toISOString()}`);
    const inicio = Date.now();

    try {
      this.logger.log('Procesando dimensiones...');
      await this.mergeDimOrganizacion();
      await this.mergeDimTiempo();
      await this.mergeDimMedico();
      await this.mergeDimModeloIA();
      await this.mergeDimPaciente();
      await this.mergeDimIndicadoresClinicos();

      this.logger.log('Procesando tablas de hechos...');
      await this.insertarHechoPacientesAtendidos();
      await this.insertarHechoRecetas();
      await this.insertarHechoPacientesEM();
      await this.insertarHechoIndicador();

      const duracion = Date.now() - inicio;
      this.logger.log(
        `ETL diario completado en ${duracion}ms (${(duracion / 1000).toFixed(2)}s)`,
      );
    } catch (error) {
      const duracion = Date.now() - inicio;
      this.logger.error(
        `Error ejecutando ETL diario después de ${duracion}ms: ${error.message}`,
      );
      this.logger.error(error.stack);
      throw error;
    }
  }

  private async mergeDimOrganizacion() {
    const inicio = Date.now();
    this.logger.log('MERGE DimOrganizacion...');

    const query = `
      INSERT INTO "DimOrganizacion" ("Organizacion_Id", "NombreSede", direccion)
      SELECT
          s."idSede" AS "Organizacion_Id",
          s.nombre AS "NombreSede",
          s.direccion
      FROM sede s
      ON CONFLICT ("Organizacion_Id")
      DO UPDATE SET
          "NombreSede" = EXCLUDED."NombreSede",
          direccion = EXCLUDED.direccion;
    `;

    try {
      await this.dataSource.query(query);
      this.logger.log(`MERGE DimOrganizacion ok (${Date.now() - inicio}ms)`);
    } catch (error) {
      this.logger.error(
        `Error en MERGE DimOrganizacion: ${error.message}`,
      );
      throw error;
    }
  }

  private async mergeDimTiempo() {
    const inicio = Date.now();
    this.logger.log('MERGE DimTiempo...');

    const query = `
      INSERT INTO "DimTiempo" ("Fecha_Id", anio, trimestre, mes, dia)
      SELECT DISTINCT
          TO_CHAR(fecha, 'YYYYMMDD')::INT AS "Fecha_Id",
          EXTRACT(YEAR FROM fecha)::INT AS anio,
          EXTRACT(QUARTER FROM fecha)::INT AS trimestre,
          EXTRACT(MONTH FROM fecha)::INT AS mes,
          EXTRACT(DAY FROM fecha)::INT AS dia
      FROM (
          SELECT "fechaDiagnostico"::DATE AS fecha FROM diagnostico
          UNION
          SELECT "fechaReceta"::DATE AS fecha FROM receta
          UNION
          SELECT "fechaIngreso"::DATE AS fecha FROM historia_clinica
          UNION
          SELECT "fechaMedicion"::DATE AS fecha FROM diagnostico_indicador_clinico
      ) f
      WHERE fecha IS NOT NULL
      ON CONFLICT ("Fecha_Id")
      DO NOTHING;
    `;

    try {
      await this.dataSource.query(query);
      this.logger.log(`MERGE DimTiempo ok (${Date.now() - inicio}ms)`);
    } catch (error) {
      this.logger.error(`Error en MERGE DimTiempo: ${error.message}`);
      throw error;
    }
  }

  private async mergeDimMedico() {
    const inicio = Date.now();
    this.logger.log('MERGE DimMedico...');

    const query = `
      INSERT INTO "DimMedico" ("Medico_Id", "Nombre", area)
      SELECT
          m."idMedico" AS "Medico_Id",
          m.nombre AS "Nombre",
          COALESCE(a.descripcion, '') AS area
      FROM medico m
      LEFT JOIN area a ON m."idArea" = a."idArea"
      ON CONFLICT ("Medico_Id")
      DO UPDATE SET
          "Nombre" = EXCLUDED."Nombre",
          area = EXCLUDED.area;
    `;

    try {
      await this.dataSource.query(query);
      this.logger.log(`MERGE DimMedico ok (${Date.now() - inicio}ms)`);
    } catch (error) {
      this.logger.error(`Error en MERGE DimMedico: ${error.message}`);
      throw error;
    }
  }

  private async mergeDimModeloIA() {
    const inicio = Date.now();
    this.logger.log('MERGE DimModeloIA...');

    const query = `
      INSERT INTO "DimModeloIA" ("NombreModelo")
      SELECT DISTINCT
          "Modelo_IA" AS "NombreModelo"
      FROM receta
      WHERE "Modelo_IA" IS NOT NULL
      ON CONFLICT ("NombreModelo")
      DO NOTHING;
    `;

    try {
      await this.dataSource.query(query);
      this.logger.log(`MERGE DimModeloIA ok (${Date.now() - inicio}ms)`);
    } catch (error) {
      this.logger.error(`Error en MERGE DimModeloIA: ${error.message}`);
      throw error;
    }
  }

  private async mergeDimPaciente() {
    const inicio = Date.now();
    this.logger.log('MERGE DimPaciente...');

    const query = `
      INSERT INTO "DimPaciente" ("Paciente_Id", "NumDocumento", nombre, genero)
      SELECT
          p."idPaciente" AS "Paciente_Id",
          p."dniPaciente" AS "NumDocumento",
          p."nombrePaciente" AS nombre,
          p."generoPaciente" AS genero
      FROM paciente p
      ON CONFLICT ("Paciente_Id")
      DO UPDATE SET
          "NumDocumento" = EXCLUDED."NumDocumento",
          nombre = EXCLUDED.nombre,
          genero = EXCLUDED.genero;
    `;

    try {
      await this.dataSource.query(query);
      this.logger.log(`MERGE DimPaciente ok (${Date.now() - inicio}ms)`);
    } catch (error) {
      this.logger.error(`Error en MERGE DimPaciente: ${error.message}`);
      throw error;
    }
  }

  private async mergeDimIndicadoresClinicos() {
    const inicio = Date.now();
    this.logger.log('MERGE DimIndicadoresClinicos...');

    const query = `
      INSERT INTO "DimIndicadoresClinicos"
      ("Indicador_Id", "NombreIndicador", "CategoriaIndicador", "ValorIndicador")
      SELECT
          ic."idIndicador" AS "Indicador_Id",
          ic.nombre AS "NombreIndicador",
          ci.descripcion AS "CategoriaIndicador",
          CASE
              WHEN ultimo.valor IS NOT NULL AND ultimo.valor ~ '^[0-9]+\\.?[0-9]*$'
              THEN CAST(ultimo.valor AS DOUBLE PRECISION)
              ELSE NULL
          END AS "ValorIndicador"
      FROM indicadores_clinicos ic
      LEFT JOIN categoria_indicadores ci ON ic."idCategoriaIndicador" = ci."idTipoIndicador"
      LEFT JOIN LATERAL (
          SELECT dic.valor
          FROM diagnostico_indicador_clinico dic
          WHERE dic."idIndicador" = ic."idIndicador"
            AND dic.valor IS NOT NULL
            AND dic.valor ~ '^[0-9]+\\.?[0-9]*$'
          ORDER BY dic."fechaMedicion" DESC
          LIMIT 1
      ) ultimo ON TRUE
      WHERE ic."isActive" = true
        AND ic.bloqueado = false
        AND ic.unidad::text = 'numero'
      ON CONFLICT ("Indicador_Id")
      DO UPDATE SET
          "NombreIndicador" = EXCLUDED."NombreIndicador",
          "CategoriaIndicador" = EXCLUDED."CategoriaIndicador",
          "ValorIndicador" = EXCLUDED."ValorIndicador";
    `;

    try {
      await this.dataSource.query(query);
      this.logger.log(
        `MERGE DimIndicadoresClinicos ok (${Date.now() - inicio}ms)`,
      );
    } catch (error) {
      this.logger.error(
        `Error en MERGE DimIndicadoresClinicos: ${error.message}`,
      );
      throw error;
    }
  }

  private async insertarHechoPacientesAtendidos() {
    const inicio = Date.now();
    this.logger.log('Insertando HechoPacientesAtendidos...');

    try {
      await this.dataSource.query(
        'TRUNCATE TABLE "HechoPacientesAtendidos" RESTART IDENTITY CASCADE;',
      );

      const query = `
      INSERT INTO "HechoPacientesAtendidos"
      ("indicadorIndicadorId", "medicoMedicoId", "tiempoFechaId",
       "organizacionOrganizacionId", "CantidadPacientesAtendidos")
      SELECT
          dind."Indicador_Id" AS "indicadorIndicadorId",
          dmed."Medico_Id" AS "medicoMedicoId",
          dt."Fecha_Id" AS "tiempoFechaId",
          dorg."Organizacion_Id" AS "organizacionOrganizacionId",
          COUNT(DISTINCT hc."idPaciente") AS "CantidadPacientesAtendidos"
      FROM historia_clinica hc
      INNER JOIN diagnostico d ON d."idhistoriaClinica" = hc."idHistoriaClinica"
      INNER JOIN diagnostico_indicador_clinico dic ON dic."idDiagnostico" = d."idDiagnostico"
      INNER JOIN medico m ON m."idMedico" = d."idMedico"
      INNER JOIN "DimIndicadoresClinicos" dind ON dind."Indicador_Id" = dic."idIndicador"
      INNER JOIN "DimMedico" dmed ON dmed."Medico_Id" = d."idMedico"
      INNER JOIN "DimTiempo" dt ON dt."Fecha_Id" = TO_CHAR(d."fechaDiagnostico", 'YYYYMMDD')::INTEGER
      INNER JOIN "DimOrganizacion" dorg ON dorg."Organizacion_Id" = m."idSede"
      GROUP BY
          dind."Indicador_Id", dmed."Medico_Id", dt."Fecha_Id", dorg."Organizacion_Id";
    `;

      await this.dataSource.query(query);
      this.logger.log(
        `HechoPacientesAtendidos ok (${Date.now() - inicio}ms)`,
      );
    } catch (error) {
      this.logger.error(
        `Error insertando HechoPacientesAtendidos: ${error.message}`,
      );
      throw error;
    }
  }

  private async insertarHechoRecetas() {
    const inicio = Date.now();
    this.logger.log('Insertando HechoRecetas...');

    try {
      await this.dataSource.query(
        'TRUNCATE TABLE "HechoRecetas" RESTART IDENTITY CASCADE;',
      );

      const query = `
      INSERT INTO "HechoRecetas"
      ("modeloModeloId", "tiempoFechaId", "organizacionOrganizacionId",
       "medicoMedicoId", "CantidadRecetasGeneradasCopilot", "CantidadRecetasGeneradasDeepseek")
      SELECT
          dmi."Modelo_Id" AS "modeloModeloId",
          dt."Fecha_Id" AS "tiempoFechaId",
          dorg."Organizacion_Id" AS "organizacionOrganizacionId",
          dmed."Medico_Id" AS "medicoMedicoId",
          SUM(CASE WHEN r."Modelo_IA" LIKE '%Copilot%' THEN 1 ELSE 0 END) AS "CantidadRecetasGeneradasCopilot",
          SUM(CASE WHEN r."Modelo_IA" LIKE '%Deepseek%' THEN 1 ELSE 0 END) AS "CantidadRecetasGeneradasDeepseek"
      FROM receta r
      INNER JOIN diagnostico d ON d."idDiagnostico" = r."idDiagnostico"
      INNER JOIN medico m ON m."idMedico" = d."idMedico"
      INNER JOIN "DimModeloIA" dmi ON dmi."NombreModelo" = r."Modelo_IA"
      INNER JOIN "DimTiempo" dt ON dt."Fecha_Id" = TO_CHAR(r."fechaReceta", 'YYYYMMDD')::INTEGER
      INNER JOIN "DimOrganizacion" dorg ON dorg."Organizacion_Id" = m."idSede"
      INNER JOIN "DimMedico" dmed ON dmed."Medico_Id" = m."idMedico"
      GROUP BY
          dmi."Modelo_Id", dt."Fecha_Id", dorg."Organizacion_Id", dmed."Medico_Id";
    `;

      await this.dataSource.query(query);
      this.logger.log(`HechoRecetas ok (${Date.now() - inicio}ms)`);
    } catch (error) {
      this.logger.error(`Error insertando HechoRecetas: ${error.message}`);
      throw error;
    }
  }

  private async insertarHechoPacientesEM() {
    const inicio = Date.now();
    this.logger.log('Insertando HechoPacientesEM...');

    try {
      await this.dataSource.query(
        'TRUNCATE TABLE "HechoPacientesEM" RESTART IDENTITY CASCADE;',
      );

      const query = `
      INSERT INTO "HechoPacientesEM"
      ("modeloModeloId", "tiempoFechaId", "pacientePacienteId",
       "medicoMedicoId", "organizacionOrganizacionId", "CantidadPacientesDiagnosticadosEM")
      SELECT
          dmi."Modelo_Id" AS "modeloModeloId",
          dt."Fecha_Id" AS "tiempoFechaId",
          dp."Paciente_Id" AS "pacientePacienteId",
          dmed."Medico_Id" AS "medicoMedicoId",
          dorg."Organizacion_Id" AS "organizacionOrganizacionId",
          COUNT(DISTINCT hc."idPaciente") AS "CantidadPacientesDiagnosticadosEM"
      FROM diagnostico d
      INNER JOIN historia_clinica hc ON hc."idHistoriaClinica" = d."idhistoriaClinica"
      INNER JOIN receta r ON r."idDiagnostico" = d."idDiagnostico"
      INNER JOIN medico m ON m."idMedico" = d."idMedico"
      INNER JOIN "DimPaciente" dp ON dp."Paciente_Id" = hc."idPaciente"
      INNER JOIN "DimMedico" dmed ON dmed."Medico_Id" = d."idMedico"
      INNER JOIN "DimModeloIA" dmi ON dmi."NombreModelo" = r."Modelo_IA"
      INNER JOIN "DimOrganizacion" dorg ON dorg."Organizacion_Id" = m."idSede"
      INNER JOIN "DimTiempo" dt ON dt."Fecha_Id" = TO_CHAR(d."fechaDiagnostico", 'YYYYMMDD')::INTEGER
      WHERE d.es_diagnostico_inicial = TRUE
      GROUP BY
          dmi."Modelo_Id", dt."Fecha_Id", dp."Paciente_Id", dmed."Medico_Id", dorg."Organizacion_Id";
    `;

      await this.dataSource.query(query);
      this.logger.log(`HechoPacientesEM ok (${Date.now() - inicio}ms)`);
    } catch (error) {
      this.logger.error(
        `Error insertando HechoPacientesEM: ${error.message}`,
      );
      throw error;
    }
  }

  private async insertarHechoIndicador() {
    const inicio = Date.now();
    this.logger.log('Insertando HechoIndicador...');

    try {
      await this.dataSource.query(
        'TRUNCATE TABLE "HechoIndicador" RESTART IDENTITY CASCADE;',
      );

      const query = `
      INSERT INTO "HechoIndicador"
      ("indicadorIndicadorId", "pacientePacienteId", "tiempoFechaId",
       "medicoMedicoId", "organizacionOrganizacionId", "ValorPromedioIndicador", "ValorInicialIndicador")
      SELECT
          dind."Indicador_Id" AS "indicadorIndicadorId",
          dp."Paciente_Id" AS "pacientePacienteId",
          dt."Fecha_Id" AS "tiempoFechaId",
          dmed."Medico_Id" AS "medicoMedicoId",
          dorg."Organizacion_Id" AS "organizacionOrganizacionId",
          AVG(CAST(dic.valor AS DOUBLE PRECISION)) AS "ValorPromedioIndicador",
          MIN(CAST(dic.valor AS DOUBLE PRECISION)) AS "ValorInicialIndicador"
      FROM diagnostico_indicador_clinico dic
      INNER JOIN diagnostico d ON d."idDiagnostico" = dic."idDiagnostico"
      INNER JOIN historia_clinica hc ON hc."idHistoriaClinica" = d."idhistoriaClinica"
      INNER JOIN receta r ON r."idDiagnostico" = d."idDiagnostico"
      INNER JOIN medico m ON m."idMedico" = d."idMedico"
      INNER JOIN "DimPaciente" dp ON dp."Paciente_Id" = hc."idPaciente"
      INNER JOIN "DimMedico" dmed ON dmed."Medico_Id" = d."idMedico"
      INNER JOIN "DimIndicadoresClinicos" dind ON dind."Indicador_Id" = dic."idIndicador"
      INNER JOIN "DimTiempo" dt ON dt."Fecha_Id" = TO_CHAR(dic."fechaMedicion", 'YYYYMMDD')::INTEGER
      INNER JOIN "DimOrganizacion" dorg ON dorg."Organizacion_Id" = m."idSede"
      WHERE dic.valor IS NOT NULL AND dic.valor ~ '^[0-9]+\\.?[0-9]*$'
      GROUP BY
          dind."Indicador_Id", dp."Paciente_Id", dt."Fecha_Id",
          dmed."Medico_Id", dorg."Organizacion_Id";
    `;

      await this.dataSource.query(query);
      this.logger.log(`HechoIndicador ok (${Date.now() - inicio}ms)`);
    } catch (error) {
      this.logger.error(`Error insertando HechoIndicador: ${error.message}`);
      throw error;
    }
  }
}
