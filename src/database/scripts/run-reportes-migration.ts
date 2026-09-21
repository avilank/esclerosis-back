import { config } from 'dotenv';
import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';
import { DataSource } from 'typeorm';

/**
 * Script de arranque del esquema. Vive en `database/scripts/` y NO en
 * `database/migrations/`: el glob de `migrations` en typeorm.config.ts importa
 * todos los `.ts` de esa carpeta, y este archivo se ejecuta al importarse
 * (tiene un `main()` de nivel superior y un `process.exit`). Estando ahi, la
 * suite e2e disparaba la migracion completa como efecto colateral.
 */
config({ path: resolve(__dirname, '../../../.env') });

/** Los .sql siguen en database/migrations/. */
const SQL_DIR = resolve(__dirname, '../migrations');

const host = process.env.DB_HOST || 'localhost';
const port = parseInt(process.env.DB_PORT || '5432', 10);
const username = process.env.DB_USERNAME || 'postgres';
const password = process.env.DB_PASSWORD || '';
const database = process.env.DB_NAME || 'clinica-bd';

function assertSafeDbName(name: string): string {
  if (!/^[A-Za-z0-9_-]+$/.test(name)) {
    throw new Error(`Nombre de base inválido: ${name}`);
  }
  return name;
}

function createConnection(dbName: string): DataSource {
  return new DataSource({
    type: 'postgres',
    host,
    port,
    username,
    password,
    database: dbName,
  });
}

async function ensureDatabase(): Promise<void> {
  const dbName = assertSafeDbName(database);
  const admin = createConnection('postgres');
  await admin.initialize();
  try {
    const exists: unknown[] = await admin.query(
      'SELECT 1 FROM pg_database WHERE datname = $1',
      [dbName],
    );
    if (exists.length === 0) {
      await admin.query(`CREATE DATABASE "${dbName}"`);
      console.log(`Base "${dbName}" creada.`);
    } else {
      console.log(`Base "${dbName}" ya existe.`);
    }
  } finally {
    await admin.destroy();
  }
}

async function runSqlFile(fileName: string, label: string): Promise<void> {
  const sqlPath = resolve(SQL_DIR, fileName);
  if (!existsSync(sqlPath)) {
    throw new Error(`No se encontró ${sqlPath}`);
  }

  const sql = readFileSync(sqlPath, 'utf8');
  const client = createConnection(database);
  await client.initialize();
  try {
    await client.query(sql);
    console.log(`${label} en`, database);
  } finally {
    await client.destroy();
  }
}

async function main() {
  console.log(
    `Migrando esquema completo a ${username}@${host}:${port}/${database}`,
  );
  await ensureDatabase();
  await runSqlFile(
    'create_clinica_bd_schema.sql',
    'Tablas operativas (usuarios, roles, clínica) creadas/verificadas',
  );
  await runSqlFile(
    'create_reportes_tables.sql',
    'Tablas de reportes (Dim/Hecho) creadas/verificadas',
  );
}

main().catch((error: unknown) => {
  const mensaje = error instanceof Error ? error.message : String(error);
  console.error('Error migrando el esquema:', mensaje);
  process.exit(1);
});
