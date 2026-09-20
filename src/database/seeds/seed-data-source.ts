import { config } from 'dotenv';
import { DataSource, DataSourceOptions } from 'typeorm';
import databaseConfig from '../../config/database.config';
import { CategoriaIndicador } from 'src/modules/indicadores-clinicos/entities/categorias-indicadores.entity';
import { IndicadorClinico } from 'src/modules/indicadores-clinicos/entities/indicadores-clinicos.entity';
import { DiagnosticoIndicadorClinico } from 'src/modules/models/models';
import { Diagnostico } from 'src/modules/diagnosticos/entities/diagnostico.entity';
import { HistoriaClinica } from 'src/modules/historias-clinicas/entities/historias-clinica.entity';
import { Rol } from 'src/modules/auth/roles/entities/role.entity';
import { Usuario } from 'src/modules/usuarios/entities/usuario.entity';
import { Paciente } from 'src/modules/pacientes/entities/paciente.entity';
import { Medico } from 'src/modules/medicos/entities/medico.entity';
import { Area } from 'src/modules/areas/entities/area.entity';
import { Sede } from 'src/modules/sedes/entities/sede.entity';
import { Receta } from 'src/modules/recetas/entities/receta.entity';
import { Permiso } from 'src/modules/auth/permisos/entities/permiso.entity';
import { PermisoRol } from 'src/modules/auth/permisos/entities/permiso-rol.entity';
import { Tratamiento } from 'src/modules/tratamientos/entities/tratamiento.entity';
import { DimPaciente } from 'src/entities/esclerosisd/dim-paciente.entity';
import { DimMedico } from 'src/entities/esclerosisd/dim-medico.entity';
import { DimOrganizacion } from 'src/entities/esclerosisd/dim-organizacion.entity';
import { DimTiempo } from 'src/entities/esclerosisd/dim-tiempo.entity';
import { DimModeloIA } from 'src/entities/esclerosisd/dim-modelo-ia.entity';
import { DimIndicadorClinico } from 'src/entities/esclerosisd/dim-indicador.entity';
import { HechoRecetas } from 'src/entities/esclerosisd/hechos/hecho-recetas.entity';
import { HechoIndicador } from 'src/entities/esclerosisd/hechos/hecho-indicador.entity';
import { HechoPacientesEM } from 'src/entities/esclerosisd/hechos/hecho-pacientes-em.entity';
import { HechoPacientesAtendidos } from 'src/entities/esclerosisd/hechos/hecho-pacientes-atendidos.entity';

config();

const baseConfig = databaseConfig() as DataSourceOptions;

/** DataSource para seeds: crea el schema si aún no existe (synchronize). */
export function createSeedDataSource() {
  return new DataSource({
    ...baseConfig,
    synchronize: true,
    entities: [
      CategoriaIndicador,
      IndicadorClinico,
      Diagnostico,
      DiagnosticoIndicadorClinico,
      HistoriaClinica,
      Receta,
      Rol,
      Usuario,
      Paciente,
      Medico,
      Area,
      Sede,
      Permiso,
      PermisoRol,
      Tratamiento,
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
  });
}
