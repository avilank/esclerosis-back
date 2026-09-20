import { registerAs } from '@nestjs/config';

/**
 * `synchronize` deja que TypeORM altere el esquema solo. Es lo que usa el flujo
 * de desarrollo (`npm run seed` crea las tablas), pero en produccion tiene que
 * estar apagado para no perder datos: se controla con `DB_SYNCHRONIZE` y por
 * defecto queda apagado cuando `NODE_ENV=production`.
 */
export function shouldSynchronize(): boolean {
  const flag = process.env.DB_SYNCHRONIZE?.trim().toLowerCase();
  if (flag === 'true') return true;
  if (flag === 'false') return false;
  return process.env.NODE_ENV !== 'production';
}

export default registerAs('database', () => ({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'clinica-bd',
  synchronize: shouldSynchronize(),
  autoLoadEntities: true,
}));
