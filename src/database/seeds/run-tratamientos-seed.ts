import { config } from 'dotenv';
import { DataSource, DataSourceOptions } from 'typeorm';
import databaseConfig from '../../config/database.config';
import { seedTratamientos } from './tratamientos.seed';
import { Tratamiento } from 'src/modules/tratamientos/entities/tratamiento.entity';
import { Receta } from 'src/modules/recetas/entities/receta.entity';
import { Diagnostico } from 'src/modules/diagnosticos/entities/diagnostico.entity';
import { HistoriaClinica } from 'src/modules/historias-clinicas/entities/historias-clinica.entity';
import { Medico } from 'src/modules/medicos/entities/medico.entity';
import { Paciente } from 'src/modules/pacientes/entities/paciente.entity';
import { CategoriaIndicador } from 'src/modules/indicadores-clinicos/entities/categorias-indicadores.entity';
import { IndicadorClinico } from 'src/modules/indicadores-clinicos/entities/indicadores-clinicos.entity';
import { DiagnosticoIndicadorClinico } from 'src/modules/models/models';
import { Area } from 'src/modules/areas/entities/area.entity';
import { Sede } from 'src/modules/sedes/entities/sede.entity';
import { Usuario } from 'src/modules/usuarios/entities/usuario.entity';
import { Rol } from 'src/modules/auth/roles/entities/role.entity';
import { Permiso } from 'src/modules/auth/permisos/entities/permiso.entity';
import { PermisoRol } from 'src/modules/auth/permisos/entities/permiso-rol.entity';

config();

const baseConfig = databaseConfig() as DataSourceOptions;
const dataSource = new DataSource({
  ...baseConfig,
  entities: [
    Tratamiento,
    Receta,
    Diagnostico,
    HistoriaClinica,
    Medico,
    Paciente,
    CategoriaIndicador,
    IndicadorClinico,
    DiagnosticoIndicadorClinico,
    Area,
    Sede,
    Usuario,
    Rol,
    Permiso,
    PermisoRol,
  ],
});

async function runSeed() {
  try {
    console.log('🔌 Conectando a la base de datos...');
    await dataSource.initialize();
    console.log('✅ Conexión establecida');

    await seedTratamientos(dataSource, { reset: true });

    console.log('✅ Seed de tratamientos ejecutado correctamente');
    await dataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error ejecutando seed de tratamientos:', error);
    await dataSource.destroy();
    process.exit(1);
  }
}

runSeed();
