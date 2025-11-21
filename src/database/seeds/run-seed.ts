import { DataSource } from 'typeorm';
import { seedDatabase } from './seed';
import { config } from 'dotenv';

config();

const dataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 3306,
  username: process.env.DB_USERNAME || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'esclerosis_db',
  entities: [__dirname + '/../../**/*.entity{.ts,.js}'],
  synchronize: false,
  logging: true,
});

async function runSeed() {
  try {
    console.log('🔌 Conectando a la base de datos...');
    await dataSource.initialize();
    console.log('✅ Conexión establecida');

    await seedDatabase(dataSource);

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

