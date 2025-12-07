// import { DataSource } from 'typeorm';
// import { seedDatabase } from './seed';
// import { config } from 'dotenv';
// import databaseConfig from '../../config/database.config';
// import { DataSourceOptions } from 'typeorm/browser';

// config();

// const dataSource = new DataSource(databaseConfig() as DataSourceOptions);

// async function runSeed() {
//   try {
//     console.log('🔌 Conectando a la base de datos...');
//     await dataSource.initialize();
//     console.log('✅ Conexión establecida');

//     await seedDatabase(dataSource);

//     console.log('✅ Seeders ejecutados correctamente');
//     await dataSource.destroy();
//     process.exit(0);
//   } catch (error) {
//     console.error('❌ Error ejecutando seeders:', error);
//     await dataSource.destroy();
//     process.exit(1);
//   }
// }

// // runSeed();

