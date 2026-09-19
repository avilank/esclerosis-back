import { config } from 'dotenv';
import { DataSource, DataSourceOptions } from 'typeorm';
import databaseConfig from '../../config/database.config';
import { seedIndicadoresClinicos } from './indicadores-clinicos.seed';
import { seedTratamientos } from './tratamientos.seed';
import { seedUsuarios } from './usuarios.seed';
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

config();

const baseConfig = databaseConfig() as DataSourceOptions;
const dataSource = new DataSource({
  ...baseConfig,
  // autoLoadEntities no aplica en DataSource; se definen aquí
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
  ],
});

async function runSeed() {
  try {
    console.log('🔌 Conectando a la base de datos...');
    await dataSource.initialize();
    console.log('✅ Conexión establecida');

    // Ejecuta los seeders necesarios
    await seedIndicadoresClinicos(dataSource);
    await seedTratamientos(dataSource);
    await seedUsuarios(dataSource);

    console.log('✅ Seeders ejecutados correctamente');
    await dataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error ejecutando seeders:', error);
    await dataSource.destroy();
    process.exit(1);
  }
}

runSeed();
