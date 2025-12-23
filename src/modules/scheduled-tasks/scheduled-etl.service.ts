import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ScheduledEtlService {
    private readonly logger = new Logger(ScheduledEtlService.name);
    private readonly dbHost: string;
    private readonly dbPort: number;
    private readonly dbName: string;
    private readonly dbUsername: string;
    private readonly dbPassword: string;
    private readonly dblinkName = 'esclerosis_conn';

    constructor(
        @InjectDataSource()
        private readonly dataSource: DataSource, // Conexión a base transaccional (esclerosis_db)
        @InjectDataSource('esclerosisdConnection')
        private readonly esclerosisdDataSource: DataSource, // Conexión a data warehouse (esclerosisd)
        private readonly configService: ConfigService,
    ) {
        // Obtener configuración de la base transaccional para dblink
        this.dbHost = this.configService.get<string>('database.host') || 'localhost';
        this.dbPort = this.configService.get<number>('database.port') || 5432;
        this.dbName = this.configService.get<string>('database.database') || 'esclerosis_db';
        this.dbUsername = this.configService.get<string>('database.username') || 'postgres';
        this.dbPassword = this.configService.get<string>('database.password') || '';
    }

    @Cron(CronExpression.EVERY_DAY_AT_2AM)
    async ejecutarEtlDiario() {
        this.logger.log('═══════════════════════════════════════════════════════════');
        this.logger.log('🚀 Iniciando ETL diario...');
        this.logger.log(`📅 Fecha/Hora: ${new Date().toISOString()}`);
        const inicio = Date.now();

        try {
            // Configurar dblink al inicio
            this.logger.log('📌 Paso 1/10: Configurando conexión dblink...');
            await this.configurarDblink();

            // Ejecutar MERGE statements en orden
            this.logger.log('📌 Paso 2/10: Procesando dimensiones...');
            await this.mergeDimOrganizacion();
            await this.mergeDimTiempo();
            await this.mergeDimMedico();
            await this.mergeDimModeloIA();
            await this.mergeDimPaciente();

            // Limpiar y reinsertar hechos
            this.logger.log('📌 Paso 3/10: Procesando tablas de hechos...');
            await this.insertarHechoPacientesAtendidos();
            await this.insertarHechoRecetas();
            await this.insertarHechoPacientesEM();
            await this.insertarHechoIndicador();

            // Desconectar dblink al final
            this.logger.log('📌 Paso 4/10: Desconectando dblink...');
            await this.desconectarDblink();

            const duracion = Date.now() - inicio;
            const duracionSegundos = (duracion / 1000).toFixed(2);
            this.logger.log('═══════════════════════════════════════════════════════════');
            this.logger.log(`✅ ETL diario completado exitosamente en ${duracion}ms (${duracionSegundos}s)`);
            this.logger.log('═══════════════════════════════════════════════════════════');
        } catch (error) {
            const duracion = Date.now() - inicio;
            this.logger.error('═══════════════════════════════════════════════════════════');
            this.logger.error(`❌ Error ejecutando ETL diario después de ${duracion}ms`);
            this.logger.error(`📝 Mensaje: ${error.message}`);
            this.logger.error(`📍 Stack: ${error.stack}`);
            this.logger.error('═══════════════════════════════════════════════════════════');
            await this.desconectarDblink().catch(() => {
                // Ignorar error al desconectar
            });
            throw error;
        }
    }

    private async configurarDblink(): Promise<void> {
        const inicio = Date.now();
        this.logger.log(`   🔌 Configurando dblink hacia base transaccional...`);
        this.logger.log(`   📍 Host: ${this.dbHost}:${this.dbPort}`);
        this.logger.log(`   🗄️  Base de datos: ${this.dbName}`);
        this.logger.log(`   👤 Usuario: ${this.dbUsername}`);

        const connectionString = `host=${this.dbHost} port=${this.dbPort} dbname=${this.dbName} user=${this.dbUsername} password=${this.dbPassword}`;

        // Desconectar si existe
        try {
            await this.esclerosisdDataSource.query(
                `SELECT dblink_disconnect('${this.dblinkName}')`,
            );
            this.logger.log(`   ✓ Conexión anterior desconectada`);
        } catch (error) {
            this.logger.log(`   ℹ️  No había conexión previa que desconectar`);
        }

        // Conectar
        try {
            await this.esclerosisdDataSource.query(
                `SELECT dblink_connect('${this.dblinkName}', '${connectionString}')`,
            );
            const duracion = Date.now() - inicio;
            this.logger.log(`   ✅ dblink configurado correctamente (${duracion}ms)`);
        } catch (error) {
            this.logger.error(`   ❌ Error configurando dblink: ${error.message}`);
            throw error;
        }
    }

    private async desconectarDblink(): Promise<void> {
        try {
            await this.esclerosisdDataSource.query(
                `SELECT dblink_disconnect('${this.dblinkName}')`,
            );
            this.logger.log(`   ✅ dblink desconectado correctamente`);
        } catch (error) {
            this.logger.warn(`   ⚠️  Error al desconectar dblink: ${error.message}`);
        }
    }

    private async mergeDimOrganizacion() {
        const inicio = Date.now();
        this.logger.log('   🔄 Ejecutando MERGE DimOrganizacion...');

        const query = `
      INSERT INTO "DimOrganizacion" ("Organizacion_Id", "NombreSede", direccion)
      SELECT
          s."idSede" AS "Organizacion_Id",
          s.nombre AS "NombreSede",
          s.direccion
      FROM dblink('${this.dblinkName}', 
        'SELECT "idSede", nombre, direccion FROM sede'
      ) AS s("idSede" INTEGER, nombre VARCHAR(255), direccion VARCHAR(500))
      ON CONFLICT ("Organizacion_Id")
      DO UPDATE SET
          "NombreSede" = EXCLUDED."NombreSede",
          direccion = EXCLUDED.direccion;
    `;

        try {
            const result = await this.esclerosisdDataSource.query(query);
            const duracion = Date.now() - inicio;
            this.logger.log(`   ✅ MERGE DimOrganizacion completado (${duracion}ms)`);
            this.logger.debug(`   📊 Resultado: ${JSON.stringify(result)}`);
        } catch (error) {
            const duracion = Date.now() - inicio;
            this.logger.error(`   ❌ Error en MERGE DimOrganizacion después de ${duracion}ms: ${error.message}`);
            throw error;
        }
    }

    private async mergeDimTiempo() {
        const inicio = Date.now();
        this.logger.log('   🔄 Ejecutando MERGE DimTiempo...');
        this.logger.log('   📅 Obteniendo fechas de: diagnostico, receta, historia_clinica, diagnostico_indicador_clinico');

        const query = `
      INSERT INTO "DimTiempo" ("Fecha_Id", anio, trimestre, mes, dia)
      SELECT DISTINCT
          TO_CHAR(fecha, 'YYYYMMDD')::INT AS "Fecha_Id",
          EXTRACT(YEAR FROM fecha)::INT AS anio,
          EXTRACT(QUARTER FROM fecha)::INT AS trimestre,
          EXTRACT(MONTH FROM fecha)::INT AS mes,
          EXTRACT(DAY FROM fecha)::INT AS dia
      FROM (
          SELECT "fechaDiagnostico"::DATE AS fecha FROM dblink('${this.dblinkName}', 'SELECT "fechaDiagnostico" FROM diagnostico') AS d("fechaDiagnostico" DATE)
          UNION
          SELECT "fechaReceta"::DATE AS fecha FROM dblink('${this.dblinkName}', 'SELECT "fechaReceta" FROM receta') AS r("fechaReceta" DATE)
          UNION
          SELECT "fechaIngreso"::DATE AS fecha FROM dblink('${this.dblinkName}', 'SELECT "fechaIngreso" FROM historia_clinica') AS hc("fechaIngreso" DATE)
          UNION
          SELECT "fechaMedicion"::DATE AS fecha FROM dblink('${this.dblinkName}', 'SELECT "fechaMedicion" FROM diagnostico_indicador_clinico') AS dic("fechaMedicion" DATE)
      ) f
      WHERE fecha IS NOT NULL
      ON CONFLICT ("Fecha_Id")
      DO NOTHING;
    `;

        try {
            const result = await this.esclerosisdDataSource.query(query);
            const duracion = Date.now() - inicio;
            this.logger.log(`   ✅ MERGE DimTiempo completado (${duracion}ms)`);
            this.logger.debug(`   📊 Resultado: ${JSON.stringify(result)}`);
        } catch (error) {
            const duracion = Date.now() - inicio;
            this.logger.error(`   ❌ Error en MERGE DimTiempo después de ${duracion}ms: ${error.message}`);
            throw error;
        }
    }

    private async mergeDimMedico() {
        const inicio = Date.now();
        this.logger.log('   🔄 Ejecutando MERGE DimMedico...');
        this.logger.log('   👨‍⚕️ Obteniendo datos de: medico + area');

        const query = `
      INSERT INTO "DimMedico" ("Medico_Id", "Nombre", area)
      SELECT
          "idMedico" AS "Medico_Id",
          nombre AS "Nombre",
          COALESCE(area_descripcion, '') AS area
      FROM dblink('${this.dblinkName}', 
        'SELECT m."idMedico", m.nombre, a.descripcion AS area_descripcion
         FROM medico m 
         LEFT JOIN area a ON m."idArea" = a."idArea"'
      ) AS m("idMedico" INTEGER, nombre VARCHAR(255), area_descripcion VARCHAR(255))
      ON CONFLICT ("Medico_Id")
      DO UPDATE SET
          "Nombre" = EXCLUDED."Nombre",
          area = EXCLUDED.area;
    `;

        try {
            const result = await this.esclerosisdDataSource.query(query);
            const duracion = Date.now() - inicio;
            this.logger.log(`   ✅ MERGE DimMedico completado (${duracion}ms)`);
            this.logger.debug(`   📊 Resultado: ${JSON.stringify(result)}`);
        } catch (error) {
            const duracion = Date.now() - inicio;
            this.logger.error(`   ❌ Error en MERGE DimMedico después de ${duracion}ms: ${error.message}`);
            throw error;
        }
    }

    private async mergeDimModeloIA() {
        const inicio = Date.now();
        this.logger.log('   🔄 Ejecutando MERGE DimModeloIA...');
        this.logger.log('   🤖 Obteniendo modelos IA únicos de: receta');

        const query = `
      INSERT INTO "DimModeloIA" ("NombreModelo")
      SELECT DISTINCT
          "Modelo_IA" AS "NombreModelo"
      FROM dblink('${this.dblinkName}', 
        'SELECT DISTINCT "Modelo_IA" FROM receta WHERE "Modelo_IA" IS NOT NULL'
      ) AS r("Modelo_IA" VARCHAR(255))
      ON CONFLICT ("NombreModelo")
      DO NOTHING;
    `;

        try {
            const result = await this.esclerosisdDataSource.query(query);
            const duracion = Date.now() - inicio;
            this.logger.log(`   ✅ MERGE DimModeloIA completado (${duracion}ms)`);
            this.logger.debug(`   📊 Resultado: ${JSON.stringify(result)}`);
        } catch (error) {
            const duracion = Date.now() - inicio;
            this.logger.error(`   ❌ Error en MERGE DimModeloIA después de ${duracion}ms: ${error.message}`);
            throw error;
        }
    }

    private async mergeDimPaciente() {
        const inicio = Date.now();
        this.logger.log('   🔄 Ejecutando MERGE DimPaciente...');
        this.logger.log('   👥 Obteniendo datos de: paciente');

        const query = `
      INSERT INTO "DimPaciente" ("Paciente_Id", "NumDocumento", nombre, genero)
      SELECT
          p."idPaciente" AS "Paciente_Id",
          p."dniPaciente" AS "NumDocumento",
          p."nombrePaciente" AS nombre,
          p."generoPaciente" AS genero
      FROM dblink('${this.dblinkName}', 
        'SELECT "idPaciente", "dniPaciente", "nombrePaciente", "generoPaciente" FROM paciente'
      ) AS p("idPaciente" INTEGER, "dniPaciente" VARCHAR(20), "nombrePaciente" VARCHAR(255), "generoPaciente" VARCHAR(20))
      ON CONFLICT ("Paciente_Id")
      DO UPDATE SET
          "NumDocumento" = EXCLUDED."NumDocumento",
          nombre = EXCLUDED.nombre,
          genero = EXCLUDED.genero;
    `;

        try {
            const result = await this.esclerosisdDataSource.query(query);
            const duracion = Date.now() - inicio;
            this.logger.log(`   ✅ MERGE DimPaciente completado (${duracion}ms)`);
            this.logger.debug(`   📊 Resultado: ${JSON.stringify(result)}`);
        } catch (error) {
            const duracion = Date.now() - inicio;
            this.logger.error(`   ❌ Error en MERGE DimPaciente después de ${duracion}ms: ${error.message}`);
            throw error;
        }
    }

    private async insertarHechoPacientesAtendidos() {
        const inicio = Date.now();
        this.logger.log('   🔄 Insertando HechoPacientesAtendidos...');
        this.logger.log('   🧹 Limpiando tabla de hechos...');

        try {
            // Primero limpiar la tabla de hechos
            await this.esclerosisdDataSource.query(
                'TRUNCATE TABLE "HechoPacientesAtendidos" RESTART IDENTITY CASCADE;',
            );
            this.logger.log('   ✓ Tabla truncada');

            // Esta query es compleja y requiere datos de ambas bases
            const query = `
      INSERT INTO "HechoPacientesAtendidos"
      ("indicadorIndicadorId", "pacientePacienteId", "tiempoFechaId", 
       "organizacionOrganizacionId", "CantidadPacientesAtendidos")
      SELECT 
          dind."Indicador_Id" AS "indicadorIndicadorId",
          dp."Paciente_Id" AS "pacientePacienteId",
          dt."Fecha_Id" AS "tiempoFechaId",
          dorg."Organizacion_Id" AS "organizacionOrganizacionId",
          COUNT(DISTINCT datos."idPaciente") AS "CantidadPacientesAtendidos"
      FROM dblink('${this.dblinkName}', 
        'SELECT hc."idPaciente", d."idDiagnostico", dic."idIndicador", 
                d."fechaDiagnostico", m."idSede"
         FROM historia_clinica hc
         INNER JOIN diagnostico d ON d."idhistoriaClinica" = hc."idHistoriaClinica"
         INNER JOIN diagnostico_indicador_clinico dic ON dic."idDiagnostico" = d."idDiagnostico"
         INNER JOIN medico m ON m."idMedico" = d."idMedico"'
      ) AS datos("idPaciente" INTEGER, "idDiagnostico" INTEGER, "idIndicador" INTEGER, 
                 "fechaDiagnostico" DATE, "idSede" INTEGER)
      INNER JOIN "DimPaciente" dp ON dp."Paciente_Id" = datos."idPaciente"
      INNER JOIN "DimIndicadoresClinicos" dind ON dind."Indicador_Id" = datos."idIndicador"
      INNER JOIN "DimTiempo" dt ON dt."Fecha_Id" = TO_CHAR(datos."fechaDiagnostico", 'YYYYMMDD')::INTEGER
      INNER JOIN "DimOrganizacion" dorg ON dorg."Organizacion_Id" = datos."idSede"
      GROUP BY 
          dind."Indicador_Id", dp."Paciente_Id", dt."Fecha_Id", dorg."Organizacion_Id";
    `;

            this.logger.log('   📊 Ejecutando INSERT con JOINs complejos...');
            const result = await this.esclerosisdDataSource.query(query);
            const duracion = Date.now() - inicio;
            this.logger.log(`   ✅ HechoPacientesAtendidos insertado (${duracion}ms)`);
            this.logger.debug(`   📊 Resultado: ${JSON.stringify(result)}`);
        } catch (error) {
            const duracion = Date.now() - inicio;
            this.logger.error(`   ❌ Error insertando HechoPacientesAtendidos después de ${duracion}ms: ${error.message}`);
            throw error;
        }
    }

    private async insertarHechoRecetas() {
        const inicio = Date.now();
        this.logger.log('   🔄 Insertando HechoRecetas...');
        this.logger.log('   🧹 Limpiando tabla de hechos...');

        try {
            // Primero limpiar la tabla de hechos
            await this.esclerosisdDataSource.query(
                'TRUNCATE TABLE "HechoRecetas" RESTART IDENTITY CASCADE;',
            );
            this.logger.log('   ✓ Tabla truncada');

            const query = `
      INSERT INTO "HechoRecetas"
      ("modeloModeloId", "tiempoFechaId", "organizacionOrganizacionId", 
       "CantidadRecetasGeneradasCopilot", "CantidadRecetasGeneradasDeepseek")
      SELECT 
          dmi."Modelo_Id" AS "modeloModeloId",
          dt."Fecha_Id" AS "tiempoFechaId",
          dorg."Organizacion_Id" AS "organizacionOrganizacionId",
          SUM(CASE WHEN datos."Modelo_IA" LIKE '%Copilot%' THEN 1 ELSE 0 END) AS "CantidadRecetasGeneradasCopilot",
          SUM(CASE WHEN datos."Modelo_IA" LIKE '%Deepseek%' THEN 1 ELSE 0 END) AS "CantidadRecetasGeneradasDeepseek"
      FROM dblink('${this.dblinkName}', 
        'SELECT r."Modelo_IA", r."fechaReceta", m."idSede"
         FROM receta r
         INNER JOIN diagnostico d ON d."idDiagnostico" = r."idDiagnostico"
         INNER JOIN medico m ON m."idMedico" = d."idMedico"'
      ) AS datos("Modelo_IA" VARCHAR(255), "fechaReceta" DATE, "idSede" INTEGER)
      INNER JOIN "DimModeloIA" dmi ON dmi."NombreModelo" = datos."Modelo_IA"
      INNER JOIN "DimTiempo" dt ON dt."Fecha_Id" = TO_CHAR(datos."fechaReceta", 'YYYYMMDD')::INTEGER
      INNER JOIN "DimOrganizacion" dorg ON dorg."Organizacion_Id" = datos."idSede"
      GROUP BY 
          dmi."Modelo_Id", dt."Fecha_Id", dorg."Organizacion_Id";
    `;

            this.logger.log('   📊 Ejecutando INSERT con agregaciones (Copilot/Deepseek)...');
            const result = await this.esclerosisdDataSource.query(query);
            const duracion = Date.now() - inicio;
            this.logger.log(`   ✅ HechoRecetas insertado (${duracion}ms)`);
            this.logger.debug(`   📊 Resultado: ${JSON.stringify(result)}`);
        } catch (error) {
            const duracion = Date.now() - inicio;
            this.logger.error(`   ❌ Error insertando HechoRecetas después de ${duracion}ms: ${error.message}`);
            throw error;
        }
    }

    private async insertarHechoPacientesEM() {
        const inicio = Date.now();
        this.logger.log('   🔄 Insertando HechoPacientesEM...');
        this.logger.log('   🧹 Limpiando tabla de hechos...');

        try {
            // Primero limpiar la tabla de hechos
            await this.esclerosisdDataSource.query(
                'TRUNCATE TABLE "HechoPacientesEM" RESTART IDENTITY CASCADE;',
            );
            this.logger.log('   ✓ Tabla truncada');
            this.logger.log('   🔍 Filtrando por: es_diagnostico_inicial = TRUE');

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
          COUNT(DISTINCT datos."idPaciente") AS "CantidadPacientesDiagnosticadosEM"
      FROM dblink('${this.dblinkName}', 
        'SELECT d."idDiagnostico", hc."idPaciente", d."idMedico", r."Modelo_IA", 
                d."fechaDiagnostico", m."idSede"
         FROM diagnostico d
         INNER JOIN historia_clinica hc ON hc."idHistoriaClinica" = d."idhistoriaClinica"
         INNER JOIN receta r ON r."idDiagnostico" = d."idDiagnostico"
         INNER JOIN medico m ON m."idMedico" = d."idMedico"
         WHERE d.es_diagnostico_inicial = TRUE'
      ) AS datos("idDiagnostico" INTEGER, "idPaciente" INTEGER, "idMedico" INTEGER, 
                 "Modelo_IA" VARCHAR(255), "fechaDiagnostico" DATE, "idSede" INTEGER)
      INNER JOIN "DimPaciente" dp ON dp."Paciente_Id" = datos."idPaciente"
      INNER JOIN "DimMedico" dmed ON dmed."Medico_Id" = datos."idMedico"
      INNER JOIN "DimModeloIA" dmi ON dmi."NombreModelo" = datos."Modelo_IA"
      INNER JOIN "DimOrganizacion" dorg ON dorg."Organizacion_Id" = datos."idSede"
      INNER JOIN "DimTiempo" dt ON dt."Fecha_Id" = TO_CHAR(datos."fechaDiagnostico", 'YYYYMMDD')::INTEGER
      GROUP BY 
          dmi."Modelo_Id", dt."Fecha_Id", dp."Paciente_Id", dmed."Medico_Id", dorg."Organizacion_Id";
    `;

            this.logger.log('   📊 Ejecutando INSERT con múltiples JOINs...');
            const result = await this.esclerosisdDataSource.query(query);
            const duracion = Date.now() - inicio;
            this.logger.log(`   ✅ HechoPacientesEM insertado (${duracion}ms)`);
            this.logger.debug(`   📊 Resultado: ${JSON.stringify(result)}`);
        } catch (error) {
            const duracion = Date.now() - inicio;
            this.logger.error(`   ❌ Error insertando HechoPacientesEM después de ${duracion}ms: ${error.message}`);
            throw error;
        }
    }

    private async insertarHechoIndicador() {
        const inicio = Date.now();
        this.logger.log('   🔄 Insertando HechoIndicador...');
        this.logger.log('   🧹 Limpiando tabla de hechos...');

        try {
            // Primero limpiar la tabla de hechos
            await this.esclerosisdDataSource.query(
                'TRUNCATE TABLE "HechoIndicador" RESTART IDENTITY CASCADE;',
            );
            this.logger.log('   ✓ Tabla truncada');
            this.logger.log('   🔍 Filtrando valores numéricos válidos y calculando promedios/mínimos...');

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
          AVG(CAST(datos.valor AS DOUBLE PRECISION)) AS "ValorPromedioIndicador",
          MIN(CAST(datos.valor AS DOUBLE PRECISION)) AS "ValorInicialIndicador"
      FROM dblink('${this.dblinkName}', 
        'SELECT dic."idIndicador", dic.valor, dic."fechaMedicion", d."idDiagnostico", 
                hc."idPaciente", d."idMedico", m."idSede"
         FROM diagnostico_indicador_clinico dic
         INNER JOIN diagnostico d ON d."idDiagnostico" = dic."idDiagnostico"
         INNER JOIN historia_clinica hc ON hc."idHistoriaClinica" = d."idhistoriaClinica"
         INNER JOIN receta r ON r."idDiagnostico" = d."idDiagnostico"
         INNER JOIN medico m ON m."idMedico" = d."idMedico"
         WHERE dic.valor IS NOT NULL AND dic.valor ~ ''^[0-9]+\\.?[0-9]*$'''
      ) AS datos("idIndicador" INTEGER, valor VARCHAR(255), "fechaMedicion" DATE, 
                 "idDiagnostico" INTEGER, "idPaciente" INTEGER, "idMedico" INTEGER, "idSede" INTEGER)
      INNER JOIN "DimPaciente" dp ON dp."Paciente_Id" = datos."idPaciente"
      INNER JOIN "DimMedico" dmed ON dmed."Medico_Id" = datos."idMedico"
      INNER JOIN "DimIndicadoresClinicos" dind ON dind."Indicador_Id" = datos."idIndicador"
      INNER JOIN "DimTiempo" dt ON dt."Fecha_Id" = TO_CHAR(datos."fechaMedicion", 'YYYYMMDD')::INTEGER
      INNER JOIN "DimOrganizacion" dorg ON dorg."Organizacion_Id" = datos."idSede"
      GROUP BY 
          dind."Indicador_Id", dp."Paciente_Id", dt."Fecha_Id", 
          dmed."Medico_Id", dorg."Organizacion_Id";
    `;

            this.logger.log('   📊 Ejecutando INSERT con funciones agregadas (AVG, MIN)...');
            const result = await this.esclerosisdDataSource.query(query);
            const duracion = Date.now() - inicio;
            this.logger.log(`   ✅ HechoIndicador insertado (${duracion}ms)`);
            this.logger.debug(`   📊 Resultado: ${JSON.stringify(result)}`);
        } catch (error) {
            const duracion = Date.now() - inicio;
            this.logger.error(`   ❌ Error insertando HechoIndicador después de ${duracion}ms: ${error.message}`);
            throw error;
        }
    }
}
