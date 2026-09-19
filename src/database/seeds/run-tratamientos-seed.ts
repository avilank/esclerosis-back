/**
 * Solo para re-cargar el catálogo DMT (borra recetas + tratamientos).
 * El onboarding normal usa `npm run seed` (incluye tratamientos).
 */
import { createSeedDataSource } from './seed-data-source';
import { seedTratamientos } from './tratamientos.seed';

async function run() {
  const dataSource = createSeedDataSource();

  try {
    console.log('🔌 Conectando...');
    await dataSource.initialize();
    await seedTratamientos(dataSource, { reset: true });
    console.log('✅ Catálogo de tratamientos reiniciado');
    await dataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
    process.exit(1);
  }
}

run();
