import { createSeedDataSource } from './seed-data-source';
import { seedIndicadoresClinicos } from './indicadores-clinicos.seed';
import { seedTratamientos } from './tratamientos.seed';
import { seedUsuarios } from './usuarios.seed';

async function runSeed() {
  const dataSource = createSeedDataSource();

  try {
    console.log('🔌 Conectando y sincronizando schema...');
    await dataSource.initialize();
    console.log('✅ Base lista\n');

    // Orden fijo: catálogos primero, luego usuarios demo
    await seedIndicadoresClinicos(dataSource);
    await seedTratamientos(dataSource);
    await seedUsuarios(dataSource);

    console.log('\n✅ Seed completo (indicadores + tratamientos + usuarios)');
    await dataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error ejecutando seeders:', error);
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
    process.exit(1);
  }
}

runSeed();
